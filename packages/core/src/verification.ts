import { assess } from './engine';
import { assertEvidenceGraph } from './evidenceGraph';
import { getAssessmentPlan, SKIPPED_ANSWER } from './planner';
import { buildTestPlan } from './testPriority';
import { validateClinicalSourceIds, validateClinicalSourceRegistry } from './clinicalSources';
import { buildHealthMapViewModel } from './healthMapView';
import { buildLabReassessmentViewModel } from './labView';
import { normalizeLabRecords, reassessWithLabs } from './labs';
import { applicabilityPolicies, validateApplicabilityPolicies } from './applicability';
import type { Answers, EvidenceGraph, Finding, InvestigationDefinition, LabRecord, SafetyActionClass } from './types';

export type VerificationCaseResult = { id: string; passed: boolean; details?: string };

const base: Answers = {
  age:30, sex:'male', heightCm:175, weightKg:68, waistCm:80, diagnosedConditions:['none'], prescriptionMedications:false,
  supplementUse:false, medicationOrSupplementAllergy:false, diet:'mixed', activityDays:5, sleepHours:7.5, smoking:false,
  familyDiabetes:false, currentConcerns:['none'], recentLabs:false,
};

function stableResult(answers: Answers) {
  const value = assess(answers);
  return JSON.stringify({ findings:value.findings, evidenceGraph:value.evidenceGraph, redFlags:value.redFlags, testPlan:value.testPlan, safetyGate:value.safetyGate, clinicalGovernance:value.clinicalGovernance, inputValidation:value.inputValidation, ruleTrace:value.ruleTrace });
}
const check = (id:string, condition:boolean, details?:string):VerificationCaseResult => ({ id, passed:condition, details:condition?undefined:details });
const disposition = (result:ReturnType<typeof assess>, actionClass:SafetyActionClass) => result.safetyGate.decisions.find((item)=>item.actionClass===actionClass)?.disposition;

export function runCoreVerification(): VerificationCaseResult[] {
  const results: VerificationCaseResult[] = [];

  const low = assess(base);
  results.push(check('healthy-low-signal', low.findings.find((f)=>f.id==='MET-001')?.status==='monitor', 'Expected low-signal adult metabolic status to remain monitor.'));
  results.push(check('healthy-safety-default', !low.safetyGate.urgent && low.safetyGate.flags.length===0 && disposition(low,'medication_change')==='blocked', 'Expected default safety posture with medication changes blocked.'));

  const highMetabolicAnswers: Answers = { ...base, age:42, weightKg:86, waistCm:101, activityDays:1, familyDiabetes:true };
  const highMetabolic = assess(highMetabolicAnswers);
  results.push(check('high-metabolic-signal', highMetabolic.findings.find((f)=>f.id==='MET-001')?.status==='high_attention' && highMetabolic.testPlan.minimalSetIds.includes('LAB-HBA1C'), 'Expected adult nonpregnant metabolic finding and mapped glycemic investigation.'));

  const pregnantAnswers: Answers = { ...highMetabolicAnswers, sex:'female', reproductiveContext:'pregnant' };
  const pregnant = assess(pregnantAnswers);
  const pregnantMetTrace = pregnant.ruleTrace.find((trace)=>trace.id==='MET-SCREEN-001');
  results.push(check('applicability-pregnancy-suppresses-metabolic', !pregnant.findings.some((f)=>f.id==='MET-001') && pregnantMetTrace?.applicabilityStatus==='unsupported_context' && !pregnant.testPlan.recommendations.some((item)=>item.id==='LAB-HBA1C'), 'Expected pregnancy-inapplicable metabolic rule/test path to be suppressed upstream.'));

  const pediatric = assess({ ...base, age:12, sleepHours:5, diet:'vegetarian', currentConcerns:['fatigue','sleep'] });
  results.push(check('applicability-pediatric-suppresses-adult-rules', !pediatric.findings.some((f)=>['MET-001','NUT-001','SLP-001'].includes(f.id)) && pediatric.ruleTrace.filter((trace)=>['MET-SCREEN-001','NUT-B12-001','SLP-SCREEN-001'].includes(trace.id)).every((trace)=>trace.applicabilityStatus==='unsupported_context'), 'Expected adult prototype rules to be suppressed for pediatric context.'));

  const b12MissingAnswers: Answers = { ...base, diet:'vegetarian', currentConcerns:['fatigue','tingling'] };
  const b12Missing = assess(b12MissingAnswers);
  results.push(check('b12-missing-evidence', b12Missing.findings.find((f)=>f.id==='NUT-001')?.missingEvidenceIds.includes('nut.missing.b12')===true && b12Missing.testPlan.minimalSetIds.includes('LAB-B12'), 'Expected adult B12 evidence gap and investigation.'));

  const bareB12 = assess({ ...b12MissingAnswers, recentLabs:true, b12:150 });
  results.push(check('bare-b12-answer-cannot-bypass-lab-contract', bareB12.findings.find((f)=>f.id==='NUT-001')?.evidenceLevel!=='lab_informed' && bareB12.testPlan.recommendations.some((item)=>item.id==='LAB-B12'), 'Expected bare questionnaire B12 number to be ignored as clinical lab evidence.'));
  const bareA1c = assess({ ...highMetabolicAnswers, recentLabs:true, hba1c:8.2 });
  results.push(check('bare-hba1c-answer-cannot-bypass-lab-contract', bareA1c.findings.find((f)=>f.id==='MET-001')?.missingEvidenceIds.includes('met.missing.glycemic_marker')===true, 'Expected bare questionnaire HbA1c number not to resolve the evidence gap.'));
  results.push(check('questionnaire-no-raw-lab-fields', !getAssessmentPlan({ ...base, recentLabs:true }).questions.some((item)=>['hba1c','b12'].includes(item.question.id)), 'Expected lab values to be entered only through normalized lab workflow.'));

  const contradictory = assess({ ...base, diagnosedConditions:['none','kidney'], kidneyDiseaseSeverity:'stage4_5', currentConcerns:['none','fatigue'] });
  results.push(check('contradictory-multiselect-normalized', contradictory.inputValidation.issues.some((item)=>item.id==='exclusive-none:diagnosedConditions') && contradictory.inputValidation.issues.some((item)=>item.id==='exclusive-none:currentConcerns') && contradictory.safetyGate.flags.some((flag)=>flag.id==='advanced_kidney_disease'), 'Expected positive facts to win over contradictory none selections and remain visible to safety logic.'));

  const redFlag = assess({ ...base, currentConcerns:['chestPain'], redFlagChestPain:true });
  results.push(check('red-flag-interruption', redFlag.redFlags.length>0 && Boolean(redFlag.testPlan.blockedReason) && redFlag.safetyGate.urgent && redFlag.safetyGate.decisions.every((item)=>item.disposition==='blocked'), 'Expected urgent red flag to suppress normal planning.'));

  const advancedKidney = assess({ ...base, diagnosedConditions:['kidney'], kidneyDiseaseSeverity:'stage4_5' });
  results.push(check('advanced-kidney-safety-gate', advancedKidney.safetyGate.flags.some((flag)=>flag.id==='advanced_kidney_disease') && disposition(advancedKidney,'diet_guidance')==='clinician_review' && disposition(advancedKidney,'therapeutic_supplement')==='blocked', 'Expected advanced kidney safety restrictions.'));

  const skippedPlan = getAssessmentPlan({ ...base, waistCm:SKIPPED_ANSWER, familyDiabetes:SKIPPED_ANSWER });
  results.push(check('skipped-unknown-handling', skippedPlan.skipped>=2, 'Expected skip/unknown values to remain completed.'));
  results.push(check('investigation-alternative-dedup', highMetabolic.testPlan.minimalSetIds.includes('LAB-HBA1C') && !highMetabolic.testPlan.minimalSetIds.includes('LAB-FASTING-GLUCOSE'), 'Expected one glycemic alternative in minimal set.'));

  const customFinding: Finding = { id:'TEST-UNMAPPED', domain:'nutrition', title:'Unmapped test fixture', status:'investigate', urgency:'routine', confidence:'low', evidenceLevel:'insufficient', summary:'fixture', supportingEvidenceIds:[], contradictingEvidenceIds:[], missingEvidenceIds:['fixture.missing.unmapped'], actions:[] };
  const customGraph: EvidenceGraph = { nodes:[{ id:'fixture.missing.unmapped', domain:'nutrition', kind:'missing', sourceType:'missing', label:'Unmapped fixture', detail:'No catalog mapping exists.', strength:'moderate', provenance:{questionIds:[]} }], edges:[{ evidenceId:'fixture.missing.unmapped', findingId:'TEST-UNMAPPED', relation:'missing_for' }] };
  const emptyCatalog: InvestigationDefinition[] = [];
  const uncovered = buildTestPlan(customGraph,[customFinding],[],base,emptyCatalog);
  results.push(check('uncovered-missing-evidence', uncovered.uncoveredEvidenceIds.includes('fixture.missing.unmapped'), 'Expected unmapped evidence gap to remain explicit.'));

  let invariantFailed=false;
  try { assertEvidenceGraph({nodes:[],edges:[{evidenceId:'missing-node',findingId:'TEST-UNMAPPED',relation:'supports'}]},[customFinding]); } catch { invariantFailed=true; }
  results.push(check('graph-invariant-failure', invariantFailed, 'Expected dangling graph references to fail fast.'));

  results.push(check('clinical-source-registry-valid', validateClinicalSourceRegistry().length===0 && validateApplicabilityPolicies().length===0 && low.clinicalGovernance.unresolvedSourceIds.length===0 && low.ruleTrace.every((trace)=>trace.sourceIds.length>0), 'Expected clinical/applicability registries to be internally valid.'));
  results.push(check('governance-covers-recommendations-applicability', low.clinicalGovernance.prototypeRecommendationIds.length>0 && low.clinicalGovernance.prototypeApplicabilityPolicyIds.length===applicabilityPolicies.length && low.clinicalGovernance.productPolicyIds.includes('SAFETY-1.0.0'), 'Expected governance report to inventory recommendations, applicability policies and product safety policy.'));
  results.push(check('unknown-clinical-source-rejected', validateClinicalSourceIds(['UNKNOWN-SOURCE']).length>0, 'Expected unknown source IDs to fail governance validation.'));

  const asOf='2026-10-09T00:00:00.000Z';
  const recentB12:LabRecord={id:'lab-b12-recent',markerId:'vitamin_b12',value:150,unit:'pg/mL',collectedAt:'2026-10-01T00:00:00.000Z',source:'manual',verification:'user_confirmed'};
  const b12Reassessment=reassessWithLabs(b12MissingAnswers,[recentB12],asOf);
  const reassessedB12=b12Reassessment.after.findings.find((f)=>f.id==='NUT-001');
  const b12LabNode=b12Reassessment.after.evidenceGraph.nodes.find((node)=>node.id==='nut.obs.b12_low');
  results.push(check('canonical-lab-reassessment-applies', b12Reassessment.appliedLabRecordIds.includes(recentB12.id) && reassessedB12?.evidenceLevel==='lab_informed' && reassessedB12.status==='high_attention' && b12Reassessment.changes.resolvedInvestigationIds.includes('LAB-B12'), 'Expected eligible normalized LabRecord to drive reassessment.'));
  results.push(check('lab-provenance-attached', b12LabNode?.provenance.labRecordIds?.includes(recentB12.id)===true && b12LabNode.detail.includes('2026-10-01'), 'Expected lab evidence to retain source record/date.'));

  const normalB12:LabRecord={...recentB12,id:'lab-b12-normal',value:350};
  const contradictionReassessment=reassessWithLabs(b12MissingAnswers,[normalB12],asOf);
  results.push(check('canonical-b12-contradiction', contradictionReassessment.after.findings.find((f)=>f.id==='NUT-001')?.contradictingEvidenceIds.includes('nut.obs.b12_not_low_by_prototype_cutoff')===true && !contradictionReassessment.after.testPlan.recommendations.some((item)=>item.id==='LAB-B12'), 'Expected eligible measured B12 to resolve the gap and provide contradiction evidence.'));

  const staleB12:LabRecord={...recentB12,id:'lab-b12-stale',collectedAt:'2024-01-01T00:00:00.000Z'};
  const stale=reassessWithLabs(b12MissingAnswers,[staleB12],asOf);
  results.push(check('lab-stale-not-applied', stale.normalizedLabs[0]?.freshness==='stale' && stale.appliedLabRecordIds.length===0 && stale.after.testPlan.recommendations.some((item)=>item.id==='LAB-B12'), 'Expected stale lab to remain historical and not resolve current evidence.'));
  const unverified=reassessWithLabs(b12MissingAnswers,[{...recentB12,id:'lab-b12-unverified',verification:'unverified'}],asOf);
  results.push(check('lab-unverified-not-applied', !unverified.normalizedLabs[0]?.eligibleForAssessment && unverified.appliedLabRecordIds.length===0, 'Expected unverified lab not to affect findings.'));
  const futureNormalized=normalizeLabRecords([{...recentB12,id:'lab-b12-future',collectedAt:'2026-11-01T00:00:00.000Z'}],asOf)[0];
  results.push(check('lab-future-date-rejected', futureNormalized?.freshness==='future_invalid' && !futureNormalized.eligibleForAssessment, 'Expected future lab to be ineligible.'));

  const labView=buildLabReassessmentViewModel(b12Reassessment);
  results.push(check('lab-view-shared-semantics', labView.appliedCount===1 && labView.records[0]?.freshnessLabel==='Recent', 'Expected shared lab view semantics.'));
  const metabolicView=buildHealthMapViewModel(highMetabolic);
  results.push(check('health-map-priority-order', metabolicView.topPriorities[0]?.kind==='finding' && metabolicView.investigations.minimal[0]?.priorityLabel==='High assessment priority', 'Expected shared Health Map priority semantics.'));
  results.push(check('deterministic-repeatability', stableResult(highMetabolicAnswers)===stableResult(highMetabolicAnswers), 'Expected identical inputs to produce identical outputs.'));

  return results;
}

export function assertCoreVerification() {
  const results=runCoreVerification(); const failed=results.filter((item)=>!item.passed);
  if(failed.length) throw new Error(`Core verification failed: ${failed.map((item)=>`${item.id}: ${item.details ?? 'failed'}`).join(' | ')}`);
  return results;
}
