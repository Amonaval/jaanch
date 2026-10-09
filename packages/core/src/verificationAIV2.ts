import { mockProfileBundles } from './mockProfiles';
import { runProfileBundle } from './profileBundle';
import { type LongitudinalHistory } from './longitudinal';
import {
  AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION,
  buildAIReviewV2Packet,
  validateAIReviewV2Output,
  type AIReviewV2Output,
} from './aiReviewV2';

export type AIV2VerificationResult = { id: string; passed: boolean; details?: string };
const check = (id: string, passed: boolean, details: string): AIV2VerificationResult => ({ id, passed, details: passed ? undefined : details });
const AS_OF = '2026-10-09T12:00:00.000Z';

function historyFor(profileIndex = 3): LongitudinalHistory {
  const current = runProfileBundle(mockProfileBundles[profileIndex]!, AS_OF).snapshot;
  const previous = JSON.parse(JSON.stringify(current)) as typeof current;
  previous.id = `${current.id}-previous`;
  previous.capturedAt = '2026-08-09T12:00:00.000Z';
  previous.assessment.evidenceCompleteness = Math.max(0, current.assessment.evidenceCompleteness - 5);
  return { protocol: 'JAANCH-HISTORY-1.0', snapshots: [current, previous] };
}

function validOutput(packet: ReturnType<typeof buildAIReviewV2Packet>): AIReviewV2Output {
  return {
    schemaVersion: AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION,
    utility: { materialAddition: true, reason: 'The structured context adds one useful clinician-prep point.' },
    baseReview: {
      schemaVersion: 'AI-ASSESSMENT-1.0',
      overall: { summary: 'The deterministic assessment remains the source of truth.', highestPriority: 'clinician_review' },
      redFlags: [],
      domainAssessments: [],
      engineReview: { agreements: ['Deterministic boundaries preserved.'], disagreements: [], possibleMissingConsiderations: [] },
      safety: { treatmentAdviceGated: true, gatingReasons: ['Medication changes remain clinician-led.'] },
    },
    longitudinalSynthesis: {
      available: packet.longitudinal.available,
      summary: packet.longitudinal.available ? 'A previous deterministic comparison is available.' : 'No previous comparable check-in is available.',
      changesWorthAttention: [], stableSignals: [], uncertainChanges: [],
    },
    prioritizedEvidenceGaps: [], contradictions: [],
    clinicianPrep: { summary: 'Confirm the current evidence and clinical context.', questions: ['What additional confirmation is appropriate?'], evidenceToBring: [] },
  };
}

export function runAIReviewV2Verification(): AIV2VerificationResult[] {
  const results: AIV2VerificationResult[] = [];
  const history = historyFor();
  let consentBlocked = false;
  try { buildAIReviewV2Packet(history, { externalAIReviewConsent: false }); } catch { consentBlocked = true; }
  results.push(check('ai-v2-consent-required', consentBlocked, 'Expected explicit per-run consent before the contextual packet is built.'));

  const packet = buildAIReviewV2Packet(history, { externalAIReviewConsent: true });
  const serialized = JSON.stringify(packet);
  results.push(check('ai-v2-free-text-and-names-omitted', packet.minimization.freeTextShared === false && packet.minimization.medicationNamesShared === false && !serialized.includes('Thyroid medicine'), 'Expected medicine names and free text to stay out of the contextual packet.'));
  results.push(check('ai-v2-structured-categories-retained', packet.context.medicationCategories.includes('thyroid') && packet.context.familyHistoryCodes.includes('thyroid_autoimmune'), 'Expected bounded structured categories to be retained for contextual utility.'));
  results.push(check('ai-v2-longitudinal-summary-only', packet.longitudinal.available && packet.minimization.previousRawSnapshotShared === false && !('snapshots' in (packet.longitudinal as unknown as Record<string, unknown>)), 'Expected deterministic longitudinal deltas without the raw previous snapshot.'));
  results.push(check('ai-v2-evidence-completeness-delta', packet.longitudinal.evidenceCompletenessDelta === 5, 'Expected longitudinal deterministic evidence-completeness delta.'));

  const baseline = validOutput(packet);
  const validation = validateAIReviewV2Output(baseline, packet);
  results.push(check('ai-v2-valid-baseline', validation.valid, `Expected valid contextual output. ${[...validation.schemaErrors, ...validation.invariantErrors].join(' ')}`));

  const relatedId = packet.current.engineAssessment.findings[0]?.id ?? packet.current.evidence.facts[0]?.id;
  if (relatedId) {
    const noNoveltyButContradiction: AIReviewV2Output = { ...baseline, utility: { materialAddition: false, reason: 'Nothing material to add.' }, contradictions: [{ type: 'evidence_conflict', relatedIds: [relatedId], summary: 'Contradiction.', resolutionEvidence: [] }] };
    const noNoveltyValidation = validateAIReviewV2Output(noNoveltyButContradiction, packet);
    results.push(check('ai-v2-no-novelty-must-stay-quiet', !noNoveltyValidation.valid && noNoveltyValidation.invariantErrors.some((item) => item.includes('no material addition')), 'Expected materialAddition=false to prohibit contradiction/evidence-gap novelty.'));
  }

  const unknownId: AIReviewV2Output = { ...baseline, contradictions: [{ type: 'evidence_conflict', relatedIds: ['invented-evidence-id'], summary: 'Unsupported contradiction.', resolutionEvidence: [] }] };
  const unknownValidation = validateAIReviewV2Output(unknownId, packet);
  results.push(check('ai-v2-unknown-related-id-rejected', !unknownValidation.valid && unknownValidation.invariantErrors.some((item) => item.includes('unknown ID')), 'Expected contradiction references to remain traceable to supplied IDs.'));

  const singleHistory: LongitudinalHistory = { protocol: 'JAANCH-HISTORY-1.0', snapshots: [history.snapshots[0]!] };
  const singlePacket = buildAIReviewV2Packet(singleHistory, { externalAIReviewConsent: true });
  const inventedTrend: AIReviewV2Output = { ...validOutput(singlePacket), longitudinalSynthesis: { available: true, summary: 'Invented trend.', changesWorthAttention: ['Things worsened.'], stableSignals: [], uncertainChanges: [] } };
  const trendValidation = validateAIReviewV2Output(inventedTrend, singlePacket);
  results.push(check('ai-v2-cannot-invent-trend', !trendValidation.valid && trendValidation.invariantErrors.some((item) => item.includes('longitudinal')), 'Expected AI to be blocked from inventing trend claims without a prior comparison.'));
  return results;
}

export function assertAIReviewV2Verification() {
  const results = runAIReviewV2Verification();
  const failed = results.filter((item) => !item.passed);
  if (failed.length) throw new Error(`AI Review v2 verification failed: ${failed.map((item) => `${item.id}: ${item.details ?? 'failed'}`).join(' | ')}`);
  return results;
}
