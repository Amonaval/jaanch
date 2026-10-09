import { assess } from './engine';
import { createHap } from './hap';
import { buildRecommendationPlan } from './recommendations';
import type { Answers } from './types';

export type RecommendationVerificationResult = { id: string; passed: boolean; details?: string };
const check = (id:string, condition:boolean, details:string):RecommendationVerificationResult => ({ id, passed:condition, details:condition?undefined:details });

const base: Answers = { age:30, sex:'male', heightCm:175, weightKg:68, waistCm:80, diagnosedConditions:['none'], prescriptionMedications:false, supplementUse:false, medicationOrSupplementAllergy:false, diet:'mixed', activityDays:5, sleepHours:7.5, smoking:false, familyDiabetes:false, currentConcerns:['none'], recentLabs:false };

export function runRecommendationVerification(): RecommendationVerificationResult[] {
  const results: RecommendationVerificationResult[] = [];

  const lowSignal = buildRecommendationPlan(base, assess(base));
  results.push(check('recommendation-low-signal-suppression', lowSignal.recommendations.length===0, 'Expected low-signal baseline not to receive lab/action recommendations simply because optional evidence is unknown.'));

  const metabolicAnswers = { ...base, age:42, weightKg:86, waistCm:101, activityDays:1, familyDiabetes:true };
  const metabolicResult = assess(metabolicAnswers);
  const metabolic = buildRecommendationPlan(metabolicAnswers, metabolicResult);
  results.push(check('recommendation-metabolic-plan', metabolic.recommendations.some(x=>x.id==='REC-MET-ACTIVITY-001') && metabolic.recommendations.some(x=>x.id==='REC-MET-NUTRITION-001') && metabolic.recommendations.some(x=>x.id==='REC-MET-SCREEN-001'), 'Expected metabolic action, nutrition and evidence-resolution recommendations.'));
  results.push(check('recommendation-top-cap', metabolic.topRecommendationIds.length > 0 && metabolic.topRecommendationIds.length <= 5, 'Expected a bounded top action list.'));
  results.push(check('recommendation-source-governance', metabolic.recommendations.every(x=>x.sourceIds.length>0), 'Expected every recommendation to carry at least one registered clinical source reference.'));
  results.push(check('recommendation-no-medication-change', metabolic.recommendations.every(x=>x.actionClass!=='medication_change'), 'Expected v1 recommendation generation not to emit prescription medication changes.'));
  results.push(check('recommendation-hap-export', createHap(metabolicAnswers, metabolicResult, undefined, metabolic).recommendationPlan?.version==='RECOMMENDATIONS-1.0.0', 'Expected HAP-1.0 to retain the deterministic recommendation plan when supplied.'));

  const pregnantAnswers = { ...metabolicAnswers, sex:'female', reproductiveContext:'pregnant' };
  const pregnant = buildRecommendationPlan(pregnantAnswers, assess(pregnantAnswers));
  results.push(check('recommendation-pregnancy-gating', pregnant.recommendations.some(x=>x.id==='REC-MET-ACTIVITY-001' && x.disposition==='caution') && pregnant.recommendations.some(x=>x.id==='REC-MET-NUTRITION-001' && x.disposition==='caution'), 'Expected pregnancy safety gate to propagate into exercise and diet recommendations.'));

  const lowB12Answers = { ...base, diet:'vegetarian', currentConcerns:['fatigue'], recentLabs:true, b12:150 };
  const lowB12 = buildRecommendationPlan(lowB12Answers, assess(lowB12Answers));
  results.push(check('recommendation-b12-clinician-review', lowB12.recommendations.some(x=>x.id==='REC-B12-CLINICIAN-001' && x.disposition==='clinician_review'), 'Expected measured low B12 to create clinician-review treatment consideration, not self-treatment.'));

  const pregnantB12Answers = { ...lowB12Answers, sex:'female', reproductiveContext:'pregnant' };
  const pregnantB12 = buildRecommendationPlan(pregnantB12Answers, assess(pregnantB12Answers));
  results.push(check('recommendation-b12-pregnancy-block', pregnantB12.recommendations.some(x=>x.id==='REC-B12-CLINICIAN-001' && x.disposition==='blocked'), 'Expected therapeutic supplementation to be blocked from autonomous guidance in pregnancy context.'));

  const kidneyB12Answers = { ...lowB12Answers, diagnosedConditions:['kidney'], kidneyDiseaseSeverity:'stage4_5' };
  const kidneyB12 = buildRecommendationPlan(kidneyB12Answers, assess(kidneyB12Answers));
  results.push(check('recommendation-b12-kidney-block', kidneyB12.recommendations.some(x=>x.id==='REC-B12-CLINICIAN-001' && x.disposition==='blocked'), 'Expected advanced kidney disease safety context to block autonomous therapeutic supplementation.'));

  const urgentAnswers = { ...base, currentConcerns:['chestPain'], redFlagChestPain:true };
  const urgent = buildRecommendationPlan(urgentAnswers, assess(urgentAnswers));
  results.push(check('recommendation-urgent-suppression', Boolean(urgent.blockedReason) && urgent.recommendations.length===0, 'Expected urgent red flag to suppress routine recommendation planning.'));

  const sleepAnswers = { ...base, sleepHours:5.5, currentConcerns:['sleep'], snoring:true };
  const sleep = buildRecommendationPlan(sleepAnswers, assess(sleepAnswers));
  results.push(check('recommendation-sleep-review', sleep.recommendations.some(x=>x.id==='REC-SLEEP-ROUTINE-001') && sleep.recommendations.some(x=>x.id==='REC-SLEEP-REVIEW-001' && x.disposition==='clinician_review'), 'Expected sleep routine guidance plus clinician-led evaluation when screening signal is high.'));

  const repeatA = JSON.stringify(buildRecommendationPlan(metabolicAnswers, assess(metabolicAnswers)));
  const repeatB = JSON.stringify(buildRecommendationPlan(metabolicAnswers, assess(metabolicAnswers)));
  results.push(check('recommendation-deterministic-repeatability', repeatA===repeatB, 'Expected identical inputs to produce identical recommendation plans.'));

  return results;
}

export function assertRecommendationVerification(){
  const results=runRecommendationVerification(); const failed=results.filter(x=>!x.passed);
  if(failed.length) throw new Error(`Recommendation verification failed: ${failed.map(x=>`${x.id}: ${x.details}`).join(' | ')}`);
  return results;
}
