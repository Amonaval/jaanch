import { assess } from './engine';
import { createHap } from './hap';
import { normalizeLabRecords, reassessWithLabs } from './labs';
import { buildRecommendationPlan } from './recommendations';
import {
  buildAIReviewPacket,
  decideAIUtilityGate,
  evaluateAIUtilityCase,
  type AIReviewOutput,
  validateAIReviewOutput,
} from './aiReview';
import type { Answers, LabRecord } from './types';

export type AIVerificationResult = { id: string; passed: boolean; details?: string };
const check = (id: string, passed: boolean, details: string): AIVerificationResult => ({ id, passed, details: passed ? undefined : details });

const base: Answers = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 68,
  waistCm: 80,
  diagnosedConditions: ['none'],
  prescriptionMedications: false,
  supplementUse: false,
  medicationOrSupplementAllergy: false,
  diet: 'mixed',
  activityDays: 5,
  sleepHours: 7.5,
  smoking: false,
  familyDiabetes: false,
  currentConcerns: ['none'],
  recentLabs: false,
};

function hapFor(answers: Answers) {
  const result = assess(answers);
  const recommendations = buildRecommendationPlan(answers, result);
  return createHap(answers, result, undefined, recommendations);
}

function output(overrides?: Partial<AIReviewOutput>): AIReviewOutput {
  return {
    schemaVersion: 'AI-ASSESSMENT-1.0',
    overall: { summary: 'No additional high-priority issue beyond the deterministic assessment.', highestPriority: 'routine' },
    redFlags: [],
    domainAssessments: [],
    engineReview: { agreements: ['Deterministic evidence states were preserved.'], disagreements: [], possibleMissingConsiderations: [] },
    safety: { treatmentAdviceGated: true, gatingReasons: ['Deterministic safety and applicability constraints remain authoritative.'] },
    ...overrides,
  };
}

export function runAIReviewVerification(): AIVerificationResult[] {
  const results: AIVerificationResult[] = [];

  let consentBlocked = false;
  try {
    buildAIReviewPacket(hapFor(base), { externalAIReviewConsent: false });
  } catch {
    consentBlocked = true;
  }
  results.push(check('ai-consent-required', consentBlocked, 'Expected external AI packet creation to require explicit opt-in consent.'));

  const packet = buildAIReviewPacket(hapFor(base), { externalAIReviewConsent: true });
  results.push(check('ai-packet-raw-answers-omitted', !('answers' in (packet as unknown as Record<string, unknown>)) && packet.minimization.rawAnswersShared === false && packet.minimization.omittedRawAnswerCount > 0, 'Expected raw questionnaire answers to be omitted from external AI packet.'));

  const labRecords: LabRecord[] = [
    { id: 'recent-b12', markerId: 'vitamin_b12', value: 180, unit: 'pg/mL', collectedAt: '2026-10-01T00:00:00.000Z', source: 'manual', verification: 'user_confirmed' },
    { id: 'stale-b12', markerId: 'vitamin_b12', value: 140, unit: 'pg/mL', collectedAt: '2024-01-01T00:00:00.000Z', source: 'manual', verification: 'user_confirmed' },
  ];
  const labAnswers = { ...base, diet: 'vegetarian', currentConcerns: ['fatigue'] };
  const reassessment = reassessWithLabs(labAnswers, labRecords, '2026-10-09T00:00:00.000Z');
  const labRecommendations = buildRecommendationPlan(labAnswers, reassessment.after);
  const labHap = createHap(labAnswers, reassessment.after, reassessment.normalizedLabs, labRecommendations);
  const labPacket = buildAIReviewPacket(labHap, { externalAIReviewConsent: true });
  results.push(check('ai-packet-only-eligible-labs', labPacket.labs.length === 1 && labPacket.labs[0]?.id === 'recent-b12' && labPacket.minimization.omittedIneligibleLabRecordCount === 1, 'Expected stale/ineligible lab records to be excluded from external AI packet.'));

  const safeValidation = validateAIReviewOutput(output(), packet);
  results.push(check('ai-schema-safe-output', safeValidation.valid, `Expected valid baseline AI output. ${[...safeValidation.schemaErrors, ...safeValidation.invariantErrors].join(' ')}`));

  const urgentAnswers = { ...base, currentConcerns: ['chestPain'], redFlagChestPain: true };
  const urgentPacket = buildAIReviewPacket(hapFor(urgentAnswers), { externalAIReviewConsent: true });
  const urgentViolation = validateAIReviewOutput(output(), urgentPacket);
  results.push(check('ai-cannot-downgrade-urgent', !urgentViolation.valid && urgentViolation.invariantErrors.some((error) => error.includes('urgent')), 'Expected routine AI output to be rejected when deterministic red flag is urgent.'));

  const childPacket = buildAIReviewPacket(hapFor({ ...base, age: 12 }), { externalAIReviewConsent: true });
  const unsupportedSelfCare = output({
    domainAssessments: [{
      domain: 'metabolic', assessment: 'Generic adult metabolic advice.', confidence: 'LOW', observedFacts: [], inferences: [], missingEvidence: [],
      recommendedActions: [{ action: 'Follow an adult metabolic program.', class: 'self_care', rationale: 'Generic advice.' }],
    }],
  });
  const unsupportedValidation = validateAIReviewOutput(unsupportedSelfCare, childPacket);
  results.push(check('ai-cannot-self-care-unsupported-domain', !unsupportedValidation.valid && unsupportedValidation.invariantErrors.some((error) => error.includes('unsupported domain')), 'Expected AI self-care guidance to be rejected for an unsupported pediatric domain.'));

  const metabolicAnswers = { ...base, age: 42, weightKg: 86, waistCm: 101, activityDays: 1, familyDiabetes: true };
  const metabolicPacket = buildAIReviewPacket(hapFor(metabolicAnswers), { externalAIReviewConsent: true });
  const usefulOutput = output({
    overall: { summary: 'The deterministic result is directionally reasonable, but one finding merits challenge.', highestPriority: 'priority' },
    engineReview: {
      agreements: ['The measured and questionnaire evidence supports screening.'],
      disagreements: [{ findingId: 'MET-001', enginePosition: 'High screening attention.', aiPosition: 'Screening concern is reasonable but the heuristic should not be interpreted as a disease estimate.', reason: 'The engine score is a prototype heuristic rather than a validated probability model.', resolutionEvidence: ['Measured glycemic marker'] }],
      possibleMissingConsiderations: [],
    },
  });
  const usefulCase = evaluateAIUtilityCase('useful-review', metabolicPacket, usefulOutput, { expectedUseful: true, requiredDisagreementFindingIds: ['MET-001'] });
  const neutralCase = evaluateAIUtilityCase('safe-no-novelty', packet, output(), { expectedUseful: false });
  const passGate = decideAIUtilityGate([usefulCase, neutralCase]);
  results.push(check('ai-utility-gate-continue', passGate.decision === 'continue_m11' && passGate.safetyPassed && passGate.expectationPassed, 'Expected curated safe incremental review to pass the utility gate.'));

  const paraphraseCase = evaluateAIUtilityCase('expected-useful-but-paraphrase', metabolicPacket, output(), { expectedUseful: true, requiredDisagreementFindingIds: ['MET-001'] });
  const deferGate = decideAIUtilityGate([paraphraseCase]);
  results.push(check('ai-utility-gate-defer-paraphrase', deferGate.decision === 'defer_m11', 'Expected paraphrase-only behavior to defer M11.'));

  const normalized = normalizeLabRecords(labRecords, '2026-10-09T00:00:00.000Z');
  results.push(check('ai-lab-fixture-sanity', normalized.some((item) => item.id === 'recent-b12' && item.eligibleForAssessment) && normalized.some((item) => item.id === 'stale-b12' && !item.eligibleForAssessment), 'Expected lab fixture to exercise eligible vs stale evidence.'));

  return results;
}

export function assertAIReviewVerification() {
  const results = runAIReviewVerification();
  const failed = results.filter((item) => !item.passed);
  if (failed.length) throw new Error(`AI review verification failed: ${failed.map((item) => `${item.id}: ${item.details ?? 'failed'}`).join(' | ')}`);
  return results;
}
