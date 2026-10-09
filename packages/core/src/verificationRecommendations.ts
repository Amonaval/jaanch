import { assess } from './engine';
import { createHap } from './hap';
import { buildRecommendationPlan, recommendationGovernanceArtifacts } from './recommendations';
import { reassessWithLabs } from './labs';
import type { Answers, LabRecord } from './types';

export type RecommendationVerificationResult = { id: string; passed: boolean; details?: string };
const check = (id:string, condition:boolean, details:string):RecommendationVerificationResult => ({ id, passed:condition, details:condition?undefined:details });

const base: Answers = { age:30, sex:'male', heightCm:175, weightKg:68, waistCm:80, diagnosedConditions:['none'], prescriptionMedications:false, supplementUse:false, medicationOrSupplementAllergy:false, diet:'mixed', activityDays:5, sleepHours:7.5, smoking:false, familyDiabetes:false, currentConcerns:['none'], recentLabs:false };

export function runRecommendationVerification(): RecommendationVerificationResult[] {
  const results: RecommendationVerificationResult[] = [];

  const lowSignal = buildRecommendationPlan(base, assess(base));
  results.push(check('recommendation-low-signal-suppression', lowSignal.recommendations.length===0, 'Expected low-signal baseline not to receive action recommendations.'));

  const metabolicAnswers = { ...base, age:42, weightKg:86, waistCm:101, activityDays:1, familyDiabetes:true };
  const metabolicResult = assess(metabolicAnswers);
  const metabolic = buildRecommendationPlan(metabolicAnswers, metabolicResult);
  results.push(check('recommendation-metabolic-plan', metabolic.recommendations.some(x=>x.id==='REC-MET-ACTIVITY-001') && metabolic.recommendations.some(x=>x.id==='REC-MET-NUTRITION-001') && metabolic.recommendations.some(x=>x.id==='REC-MET-SCREEN-001'), 'Expected adult nonpregnant metabolic plan.'));
  results.push(check('recommendation-top-cap', metabolic.topRecommendationIds.length>0 && metabolic.topRecommendationIds.length<=5, 'Expected bounded top action list.'));
  results.push(check('recommendation-hap-export', createHap(metabolicAnswers, metabolicResult, undefined, metabolic).recommendationPlan?.version==='RECOMMENDATIONS-1.0.0', 'Expected HAP to retain deterministic recommendation plan.'));

  const pregnantAnswers = { ...metabolicAnswers, sex:'female', reproductiveContext:'pregnant' };
  const pregnantAssessment = assess(pregnantAnswers);
  const pregnant = buildRecommendationPlan(pregnantAnswers, pregnantAssessment);
  results.push(check('recommendation-pregnancy-applicability', !pregnantAssessment.findings.some(x=>x.id==='MET-001') && !pregnant.recommendations.some(x=>x.id.startsWith('REC-MET-')), 'Expected pregnancy-inapplicable metabolic rule to prevent downstream metabolic recommendations.'));

  const b12Base = { ...base, diet:'vegetarian', currentConcerns:['fatigue'] };
  const lowB12Record: LabRecord = { id:'verification-b12-low', markerId:'vitamin_b12', value:150, unit:'pg/mL', collectedAt:'2026-10-01T00:00:00.000Z', source:'manual', verification:'user_confirmed' };
  const lowB12Assessment = reassessWithLabs(b12Base,[lowB12Record],'2026-10-09T00:00:00.000Z').after;
  const lowB12 = buildRecommendationPlan(b12Base, lowB12Assessment);
  results.push(check('recommendation-b12-clinician-review', lowB12.recommendations.some(x=>x.id==='REC-B12-CLINICIAN-001' && x.disposition==='clinician_review'), 'Expected eligible measured low B12 to create clinician-review treatment consideration.'));

  const advancedKidneyAnswers = { ...b12Base, diagnosedConditions:['kidney'], kidneyDiseaseSeverity:'stage4_5' };
  const advancedKidneyAssessment = reassessWithLabs(advancedKidneyAnswers,[lowB12Record],'2026-10-09T00:00:00.000Z').after;
  const kidneyPlan = buildRecommendationPlan(advancedKidneyAnswers, advancedKidneyAssessment);
  results.push(check('recommendation-b12-kidney-block', kidneyPlan.recommendations.some(x=>x.id==='REC-B12-CLINICIAN-001' && x.disposition==='blocked'), 'Expected advanced kidney safety gate to block autonomous therapeutic supplement path.'));

  const urgentAnswers = { ...base, currentConcerns:['chestPain'], redFlagChestPain:true };
  const urgent = buildRecommendationPlan(urgentAnswers, assess(urgentAnswers));
  results.push(check('recommendation-urgent-suppression', Boolean(urgent.blockedReason) && urgent.recommendations.length===0, 'Expected urgent red flag to suppress routine recommendation planning.'));

  const sleepAnswers = { ...base, sleepHours:5.5, currentConcerns:['sleep'], snoring:true };
  const sleep = buildRecommendationPlan(sleepAnswers, assess(sleepAnswers));
  results.push(check('recommendation-sleep-review', sleep.recommendations.some(x=>x.id==='REC-SLEEP-ROUTINE-001') && sleep.recommendations.some(x=>x.id==='REC-SLEEP-REVIEW-001' && x.disposition==='clinician_review'), 'Expected adult sleep routine guidance plus clinician-led evaluation.'));

  const pediatricAnswers = { ...base, age:12, sleepHours:5.5, currentConcerns:['sleep'], snoring:true };
  const pediatricAssessment = assess(pediatricAnswers);
  const pediatric = buildRecommendationPlan(pediatricAnswers, pediatricAssessment);
  results.push(check('recommendation-pediatric-suppression', pediatric.recommendations.length===0 && !pediatricAssessment.findings.some(x=>x.id==='SLP-001'), 'Expected adult recommendation paths to be absent for pediatric context.'));

  results.push(check('recommendation-governance-catalog', recommendationGovernanceArtifacts.every(item=>item.sourceIds.length>0 && item.applicabilityPolicyId.length>0), 'Expected every recommendation artifact to carry source and applicability governance.'));
  results.push(check('recommendation-no-medication-change', [...metabolic.recommendations,...lowB12.recommendations,...sleep.recommendations].every(item=>item.actionClass!=='medication_change'), 'Expected v1 never to emit prescription medication changes.'));

  const repeatA=JSON.stringify(buildRecommendationPlan(metabolicAnswers,assess(metabolicAnswers)));
  const repeatB=JSON.stringify(buildRecommendationPlan(metabolicAnswers,assess(metabolicAnswers)));
  results.push(check('recommendation-deterministic-repeatability', repeatA===repeatB, 'Expected identical inputs to produce identical recommendation plans.'));

  return results;
}

export function assertRecommendationVerification(){
  const results=runRecommendationVerification(); const failed=results.filter(x=>!x.passed);
  if(failed.length) throw new Error(`Recommendation verification failed: ${failed.map(x=>`${x.id}: ${x.details}`).join(' | ')}`);
  return results;
}
