import type { Answers, AssessmentResult } from './types';
import { visibleQuestions } from './planner';
import { executeRules } from './ruleRegistry';
import { assessmentRules } from './rules';
import { m134AssessmentRules } from './m134Rules';
import { buildTestPlan } from './testPriority';
import { investigationCatalog } from './testRegistry';
import { buildSafetyGate } from './safety';
import { buildClinicalGovernanceReport } from './clinicalSources';
import { normalizeAnswers, removeBareLabAnswers } from './answerNormalization';
import { recommendationGovernanceArtifacts } from './recommendations';
import { applicabilityPolicies } from './applicability';

const allAssessmentRules=[...assessmentRules,...m134AssessmentRules];

function assessInternal(answers: Answers, trustedLabAnswerIds: string[]): AssessmentResult {
  const labGuarded = removeBareLabAnswers(answers, trustedLabAnswerIds);
  const normalized = normalizeAnswers(labGuarded);
  const normalizedAnswers = normalized.answers;
  const visible = visibleQuestions(normalizedAnswers);
  const answered = visible.filter((q) => normalizedAnswers[q.id] !== undefined && normalizedAnswers[q.id] !== '').length;
  const execution = executeRules(allAssessmentRules, normalizedAnswers);
  const testPlan = buildTestPlan(execution.evidenceGraph, execution.findings, execution.redFlags, normalizedAnswers);
  const safetyGate = buildSafetyGate(normalizedAnswers, execution.redFlags);
  const clinicalGovernance = buildClinicalGovernanceReport(allAssessmentRules, investigationCatalog, recommendationGovernanceArtifacts, applicabilityPolicies);

  if (clinicalGovernance.registryErrors.length || clinicalGovernance.unresolvedSourceIds.length) {
    throw new Error(`Clinical governance invalid: ${[
      ...clinicalGovernance.registryErrors,
      ...clinicalGovernance.unresolvedSourceIds.map((id) => `Unresolved source id: ${id}`),
    ].join(' | ')}`);
  }

  return {
    findings: execution.findings,
    evidenceGraph: execution.evidenceGraph,
    testPlan,
    safetyGate,
    clinicalGovernance,
    inputValidation: normalized.report,
    evidenceCompleteness: Math.round((answered / Math.max(visible.length, 1)) * 100),
    answered,
    available: visible.length,
    redFlags: execution.redFlags,
    ruleTrace: execution.trace,
  };
}

/** Public assessment path: bare lab-number answers are never trusted as current lab evidence. */
export function assess(answers: Answers): AssessmentResult {
  return assessInternal(answers, []);
}

/** Internal M08 path used only after LabRecord normalization/verification/freshness eligibility. */
export function assessWithCanonicalLabEvidence(answers: Answers, trustedLabAnswerIds: string[]): AssessmentResult {
  return assessInternal(answers, trustedLabAnswerIds);
}
