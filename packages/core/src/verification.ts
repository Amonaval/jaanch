import { assess } from './engine';
import { assertEvidenceGraph } from './evidenceGraph';
import { getAssessmentPlan, SKIPPED_ANSWER } from './planner';
import { buildTestPlan } from './testPriority';
import { validateClinicalSourceIds, validateClinicalSourceRegistry } from './clinicalSources';
import type { Answers, EvidenceGraph, Finding, InvestigationDefinition, SafetyActionClass } from './types';

export type VerificationCaseResult = { id: string; passed: boolean; details?: string };

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

function stableResult(answers: Answers) {
  const value = assess(answers);
  return JSON.stringify({
    findings: value.findings,
    evidenceGraph: value.evidenceGraph,
    redFlags: value.redFlags,
    testPlan: value.testPlan,
    safetyGate: value.safetyGate,
    clinicalGovernance: value.clinicalGovernance,
    ruleTrace: value.ruleTrace,
  });
}

function check(id: string, condition: boolean, details?: string): VerificationCaseResult {
  return { id, passed: condition, details: condition ? undefined : details };
}

function disposition(result: ReturnType<typeof assess>, actionClass: SafetyActionClass) {
  return result.safetyGate.decisions.find((item) => item.actionClass === actionClass)?.disposition;
}

export function runCoreVerification(): VerificationCaseResult[] {
  const results: VerificationCaseResult[] = [];

  const low = assess(base);
  results.push(check('healthy-low-signal', low.findings.find((f) => f.id === 'MET-001')?.status === 'monitor', 'Expected low-signal metabolic status to remain monitor.'));
  results.push(check('healthy-safety-default', !low.safetyGate.urgent && low.safetyGate.flags.length === 0 && disposition(low, 'routine_supplement') === 'allowed' && disposition(low, 'medication_change') === 'blocked', 'Expected no configured special-population gate while medication changes remain globally blocked.'));

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
  results.push(check('red-flag-interruption', redFlag.redFlags.length > 0 && Boolean(redFlag.testPlan.blockedReason) && redFlag.testPlan.recommendations.length === 0 && redFlag.safetyGate.urgent && redFlag.safetyGate.decisions.every((item) => item.disposition === 'blocked'), 'Expected urgent red flag to suppress routine test planning and all normal action classes.'));

  const pregnant = assess({ ...base, sex: 'female', reproductiveContext: 'pregnant' });
  results.push(check('pregnancy-safety-gate', pregnant.safetyGate.flags.some((flag) => flag.id === 'pregnancy_context') && disposition(pregnant, 'routine_supplement') === 'clinician_review' && disposition(pregnant, 'therapeutic_supplement') === 'blocked', 'Expected pregnancy context to gate supplement recommendations.'));

  const advancedKidney = assess({ ...base, diagnosedConditions: ['kidney'], kidneyDiseaseSeverity: 'stage4_5' });
  results.push(check('advanced-kidney-safety-gate', advancedKidney.safetyGate.flags.some((flag) => flag.id === 'advanced_kidney_disease') && disposition(advancedKidney, 'diet_guidance') === 'clinician_review' && disposition(advancedKidney, 'routine_supplement') === 'clinician_review' && disposition(advancedKidney, 'therapeutic_supplement') === 'blocked', 'Expected advanced kidney disease to require clinician review for diet/supplements and block therapeutic supplementation.'));

  const polypharmacy = assess({ ...base, prescriptionMedications: true, medicationCount: 6, medicationCategories: ['blood_pressure','thyroid','other'] });
  results.push(check('polypharmacy-safety-gate', polypharmacy.safetyGate.flags.some((flag) => flag.id === 'polypharmacy') && disposition(polypharmacy, 'routine_supplement') === 'clinician_review', 'Expected medication burden to gate routine supplement recommendations.'));

  const femalePlan = getAssessmentPlan({ ...base, sex: 'female' });
  const malePlan = getAssessmentPlan(base);
  results.push(check('conditional-master-safety-question', femalePlan.questions.some((item) => item.question.id === 'reproductiveContext') && !malePlan.questions.some((item) => item.question.id === 'reproductiveContext'), 'Expected reproductive context only when its master-question dependency is satisfied.'));

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

  results.push(check('clinical-source-registry-valid', validateClinicalSourceRegistry().length === 0 && low.clinicalGovernance.unresolvedSourceIds.length === 0 && low.ruleTrace.every((trace) => trace.sourceIds.length > 0), 'Expected all active rules/investigations to resolve to registered clinical source IDs.'));
  results.push(check('unknown-clinical-source-rejected', validateClinicalSourceIds(['UNKNOWN-SOURCE']).length > 0, 'Expected unknown source IDs to fail governance validation.'));

  const deterministicInput = { ...base, age: 42, weightKg: 86, waistCm: 101, activityDays: 1, familyDiabetes: true };
  results.push(check('deterministic-repeatability', stableResult(deterministicInput) === stableResult(deterministicInput), 'Expected identical inputs to produce identical deterministic core outputs.'));

  return results;
}

export function assertCoreVerification() {
  const results = runCoreVerification();
  const failed = results.filter((item) => !item.passed);
  if (failed.length) throw new Error(`Core verification failed: ${failed.map((item) => `${item.id}: ${item.details ?? 'failed'}`).join(' | ')}`);
  return results;
}
