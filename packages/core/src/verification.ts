import { assess } from './engine';
import { assertEvidenceGraph } from './evidenceGraph';
import { getAssessmentPlan, SKIPPED_ANSWER } from './planner';
import { buildTestPlan } from './testPriority';
import type { Answers, EvidenceGraph, Finding, InvestigationDefinition } from './types';

export type VerificationCaseResult = { id: string; passed: boolean; details?: string };

const base: Answers = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 68,
  waistCm: 80,
  diagnosedConditions: ['none'],
  diet: 'mixed',
  activityDays: 5,
  sleepHours: 7.5,
  smoking: false,
  familyDiabetes: false,
  currentConcerns: ['none'],
  recentLabs: false,
};

function stableResult(answers: Answers) {
  const value = assess(answers);
  return JSON.stringify({ findings: value.findings, evidenceGraph: value.evidenceGraph, redFlags: value.redFlags, testPlan: value.testPlan, ruleTrace: value.ruleTrace });
}

function check(id: string, condition: boolean, details?: string): VerificationCaseResult {
  return { id, passed: condition, details: condition ? undefined : details };
}

export function runCoreVerification(): VerificationCaseResult[] {
  const results: VerificationCaseResult[] = [];

  const low = assess(base);
  results.push(check('healthy-low-signal', low.findings.find((f) => f.id === 'MET-001')?.status === 'monitor', 'Expected low-signal metabolic status to remain monitor.'));

  const highMetabolic = assess({ ...base, age: 42, weightKg: 86, waistCm: 101, activityDays: 1, familyDiabetes: true });
  const highMet = highMetabolic.findings.find((f) => f.id === 'MET-001');
  results.push(check('high-metabolic-signal', highMet?.status === 'high_attention' && highMetabolic.testPlan.minimalSetIds.includes('LAB-HBA1C'), 'Expected high metabolic attention and HbA1c in minimal evidence-resolution set.'));

  const b12Missing = assess({ ...base, diet: 'vegetarian', currentConcerns: ['fatigue', 'tingling'] });
  const b12MissingFinding = b12Missing.findings.find((f) => f.id === 'NUT-001');
  results.push(check('b12-missing-evidence', b12MissingFinding?.missingEvidenceIds.includes('nut.missing.b12') === true && b12Missing.testPlan.minimalSetIds.includes('LAB-B12'), 'Expected missing B12 evidence and B12 investigation selection.'));

  const b12Low = assess({ ...base, diet: 'vegetarian', currentConcerns: ['fatigue'], recentLabs: true, b12: 150 });
  const b12LowFinding = b12Low.findings.find((f) => f.id === 'NUT-001');
  results.push(check('b12-measured-low', b12LowFinding?.status === 'high_attention' && b12LowFinding.evidenceLevel === 'lab_informed' && !b12LowFinding.missingEvidenceIds.length, 'Expected measured low B12 to be lab-informed without missing B12 evidence.'));

  const b12Contradiction = assess({ ...base, diet: 'vegetarian', currentConcerns: ['fatigue'], recentLabs: true, b12: 350 });
  const contradiction = b12Contradiction.findings.find((f) => f.id === 'NUT-001');
  results.push(check('b12-contradiction', contradiction?.contradictingEvidenceIds.includes('nut.obs.b12_not_low_by_prototype_cutoff') === true && !b12Contradiction.testPlan.recommendations.some((r) => r.id === 'LAB-B12'), 'Expected measured B12 to contradict questionnaire suspicion and suppress repeat B12 gap recommendation.'));

  const redFlag = assess({ ...base, currentConcerns: ['chestPain'], redFlagChestPain: true });
  results.push(check('red-flag-interruption', redFlag.redFlags.length > 0 && Boolean(redFlag.testPlan.blockedReason) && redFlag.testPlan.recommendations.length === 0, 'Expected urgent red flag to suppress routine test planning.'));

  const skippedAnswers: Answers = { ...base, waistCm: SKIPPED_ANSWER, familyDiabetes: SKIPPED_ANSWER };
  const skippedPlan = getAssessmentPlan(skippedAnswers);
  results.push(check('skipped-unknown-handling', skippedPlan.skipped >= 2 && skippedPlan.questions.find((q) => q.question.id === 'waistCm')?.answered === true, 'Expected skipped values to be counted as completed/unknown rather than repeatedly asked.'));

  const metabolicPlan = highMetabolic.testPlan;
  results.push(check('investigation-alternative-dedup', metabolicPlan.minimalSetIds.includes('LAB-HBA1C') && !metabolicPlan.minimalSetIds.includes('LAB-FASTING-GLUCOSE') && metabolicPlan.recommendations.some((r) => r.id === 'LAB-FASTING-GLUCOSE' && !r.selectedForMinimalSet), 'Expected only one glycemic alternative in minimal set while preserving the alternative.'));

  const customFinding: Finding = {
    id: 'TEST-UNMAPPED', domain: 'nutrition', title: 'Unmapped test fixture', status: 'investigate', urgency: 'routine', confidence: 'low', evidenceLevel: 'insufficient', summary: 'fixture',
    supportingEvidenceIds: [], contradictingEvidenceIds: [], missingEvidenceIds: ['fixture.missing.unmapped'], actions: [],
  };
  const customGraph: EvidenceGraph = { nodes: [{ id: 'fixture.missing.unmapped', domain: 'nutrition', kind: 'missing', sourceType: 'missing', label: 'Unmapped fixture', detail: 'No catalog mapping exists.', strength: 'moderate', provenance: { questionIds: [] } }], edges: [{ evidenceId: 'fixture.missing.unmapped', findingId: 'TEST-UNMAPPED', relation: 'missing_for' }] };
  const emptyCatalog: InvestigationDefinition[] = [];
  const uncovered = buildTestPlan(customGraph, [customFinding], [], emptyCatalog);
  results.push(check('uncovered-missing-evidence', uncovered.uncoveredEvidenceIds.includes('fixture.missing.unmapped'), 'Expected unmapped evidence gap to remain explicit.'));

  let invariantFailed = false;
  try {
    assertEvidenceGraph({ nodes: [], edges: [{ evidenceId: 'missing-node', findingId: 'TEST-UNMAPPED', relation: 'supports' }] }, [customFinding]);
  } catch {
    invariantFailed = true;
  }
  results.push(check('graph-invariant-failure', invariantFailed, 'Expected dangling graph references to fail fast.'));

  results.push(check('deterministic-repeatability', stableResult(highMetabolic.findings.length ? { ...base, age: 42, weightKg: 86, waistCm: 101, activityDays: 1, familyDiabetes: true } : base) === stableResult({ ...base, age: 42, weightKg: 86, waistCm: 101, activityDays: 1, familyDiabetes: true }), 'Expected identical inputs to produce identical deterministic core outputs.'));

  return results;
}

export function assertCoreVerification() {
  const results = runCoreVerification();
  const failed = results.filter((item) => !item.passed);
  if (failed.length) throw new Error(`Core verification failed: ${failed.map((item) => `${item.id}: ${item.details ?? 'failed'}`).join(' | ')}`);
  return results;
}
