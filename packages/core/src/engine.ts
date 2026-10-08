import type { Answers, AssessmentResult } from './types';
import { visibleQuestions } from './planner';
import { executeRules } from './ruleRegistry';
import { assessmentRules } from './rules';
import { buildTestPlan } from './testPriority';
import { investigationCatalog } from './testRegistry';
import { buildSafetyGate } from './safety';
import { buildClinicalGovernanceReport } from './clinicalSources';

export function assess(answers: Answers): AssessmentResult {
  const visible = visibleQuestions(answers);
  const answered = visible.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const execution = executeRules(assessmentRules, answers);
  const testPlan = buildTestPlan(execution.evidenceGraph, execution.findings, execution.redFlags);
  const safetyGate = buildSafetyGate(answers, execution.redFlags);
  const clinicalGovernance = buildClinicalGovernanceReport(assessmentRules, investigationCatalog);

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
    evidenceCompleteness: Math.round((answered / Math.max(visible.length, 1)) * 100),
    answered,
    available: visible.length,
    redFlags: execution.redFlags,
    ruleTrace: execution.trace,
  };
}
