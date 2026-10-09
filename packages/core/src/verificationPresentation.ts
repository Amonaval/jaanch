import { assess } from './engine';
import { buildHealthMapViewModel } from './healthMapView';
import { buildRecommendationPlan } from './recommendations';
import { buildConsumerResultViewModel } from './resultView';
import { addSnapshot, createAssessmentSnapshot, emptyLongitudinalHistory } from './longitudinal';
import type { Answers } from './types';

export type PresentationVerificationResult = { id: string; passed: boolean; details?: string };
const check = (id:string, condition:boolean, details:string):PresentationVerificationResult => ({id,passed:condition,details:condition?undefined:details});

const base: Answers = { age:30, sex:'male', heightCm:175, weightKg:68, waistCm:80, diagnosedConditions:['none'], prescriptionMedications:false, supplementUse:false, medicationOrSupplementAllergy:false, diet:'mixed', activityDays:5, sleepHours:7.5, smoking:false, familyDiabetes:false, currentConcerns:['none'], recentLabs:false };

export function runPresentationVerification(): PresentationVerificationResult[] {
  const results: PresentationVerificationResult[] = [];
  const highAnswers={ ...base, age:42, weightKg:86, waistCm:101, activityDays:1, familyDiabetes:true };
  const highResult=assess(highAnswers);
  const high = buildHealthMapViewModel(highResult);
  results.push(check('health-map-shared-priority-order', high.topPriorities[0]?.kind === 'finding' && high.topPriorities.some(item=>item.kind==='investigation'), 'Expected important finding before evidence-resolution test in top priorities.'));
  results.push(check('health-map-investigation-label', high.investigations.minimal.some(item=>item.priorityLabel==='High assessment priority'), 'Expected shared consumer wording for essential investigation tier.'));

  const highRecommendations=buildRecommendationPlan(highAnswers,highResult);
  const highConsumer=buildConsumerResultViewModel({result:highResult,recommendationPlan:highRecommendations,recordedContextCount:2});
  results.push(check('consumer-map-attention-hero', highConsumer.hero.status==='attention'&&highConsumer.hero.headline.toLowerCase().includes('attention'), 'Expected an actionable screening profile to lead with an attention-oriented consumer summary.'));
  results.push(check('consumer-map-action-first', highConsumer.actions.length>0&&Boolean(highConsumer.hero.nextBestAction), 'Expected a concrete next action in the consumer result model.'));
  results.push(check('consumer-map-known-vs-uncertain', highConsumer.supported.length>0&&highConsumer.uncertainty.length>0, 'Expected supported signals and uncertainty to be separated rather than flattened into one findings list.'));
  results.push(check('consumer-map-no-test-duplication-in-matters', highConsumer.mattersNow.every(item=>item.meta!=='Evidence gap')&&highConsumer.uncertainty.some(item=>item.id.startsWith('test:')), 'Expected investigations to stay in the uncertainty/next-evidence lane rather than duplicate inside What matters now.'));
  results.push(check('consumer-map-completeness-not-health-score', highConsumer.hero.evidenceDetail.includes('not overall health')&&highConsumer.stats.recordedContextCount===2, 'Expected evidence completeness to be explicitly distinguished from a health score and recorded context to stay visible.'));

  const urgentAnswers={ ...base, currentConcerns:['chestPain'], redFlagChestPain:true };
  const urgentResult=assess(urgentAnswers);
  const urgent = buildHealthMapViewModel(urgentResult);
  results.push(check('health-map-urgent-first', urgent.urgent && urgent.topPriorities[0]?.kind === 'urgent' && Boolean(urgent.investigations.blockedReason), 'Expected urgent signal first and routine investigation plan blocked.'));
  const urgentConsumer=buildConsumerResultViewModel({result:urgentResult,recommendationPlan:buildRecommendationPlan(urgentAnswers,urgentResult)});
  results.push(check('consumer-map-urgent-suppresses-routine-actions', urgentConsumer.hero.status==='urgent'&&urgentConsumer.actions.length===0&&urgentConsumer.hero.nextBestAction.length>0, 'Expected urgent result to suppress routine action-plan cards and lead with the red-flag next step.'));

  const pregnant = buildHealthMapViewModel(assess({ ...base, sex:'female', reproductiveContext:'pregnant' }));
  results.push(check('health-map-safety-restrictions', pregnant.safety.restrictions.some(item=>item.actionClass==='therapeutic_supplement' && item.disposition==='blocked'), 'Expected pregnancy safety restriction to be preserved by shared presentation model.'));

  const previousResult=assess(base);
  const previousRecommendations=buildRecommendationPlan(base,previousResult);
  const previous=createAssessmentSnapshot({answers:base,assessment:previousResult,recommendationPlan:previousRecommendations,capturedAt:'2026-09-01T00:00:00.000Z',id:'previous'});
  const current=createAssessmentSnapshot({answers:highAnswers,assessment:highResult,recommendationPlan:highRecommendations,capturedAt:'2026-10-09T00:00:00.000Z',id:'current'});
  const currentPreview=createAssessmentSnapshot({answers:highAnswers,assessment:highResult,recommendationPlan:highRecommendations,capturedAt:'2026-10-09T00:01:00.000Z',id:'current-preview'});
  const history=addSnapshot(emptyLongitudinalHistory(),previous);
  const withTrend=buildConsumerResultViewModel({result:highResult,recommendationPlan:highRecommendations,currentSnapshot:currentPreview,history});
  results.push(check('consumer-map-change-since-last-checkin',Boolean(withTrend.changes)&&withTrend.changes!.headline.length>0&&withTrend.changes!.evidenceDetail.length>0,'Expected the consumer result to summarize meaningful changes against the most recent saved check-in.'));
  const historyAfterSave=addSnapshot(history,current);
  const afterSave=buildConsumerResultViewModel({result:highResult,recommendationPlan:highRecommendations,currentSnapshot:currentPreview,history:historyAfterSave});
  results.push(check('consumer-map-change-baseline-survives-save',Boolean(afterSave.changes)&&afterSave.changes!.headline.includes('meaningful change'),'Expected saving the current check-in not to erase the useful comparison against the previous saved state.'));

  const repeatAnswers={ ...base, diet:'vegetarian', currentConcerns:['fatigue','tingling'] };
  const repeatResultA=assess(repeatAnswers);
  const repeatA = JSON.stringify(buildConsumerResultViewModel({result:repeatResultA,recommendationPlan:buildRecommendationPlan(repeatAnswers,repeatResultA)}));
  const repeatResultB=assess(repeatAnswers);
  const repeatB = JSON.stringify(buildConsumerResultViewModel({result:repeatResultB,recommendationPlan:buildRecommendationPlan(repeatAnswers,repeatResultB)}));
  results.push(check('health-map-deterministic-repeatability', repeatA===repeatB, 'Expected identical assessment result to generate identical consumer Health Map presentation.'));
  return results;
}

export function assertPresentationVerification(){
  const results=runPresentationVerification(); const failed=results.filter(x=>!x.passed);
  if(failed.length) throw new Error(`Presentation verification failed: ${failed.map(x=>`${x.id}: ${x.details}`).join(' | ')}`);
  return results;
}
