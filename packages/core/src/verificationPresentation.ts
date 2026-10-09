import { assess } from './engine';
import { buildHealthMapViewModel } from './healthMapView';
import type { Answers } from './types';

export type PresentationVerificationResult = { id: string; passed: boolean; details?: string };
const check = (id:string, condition:boolean, details:string):PresentationVerificationResult => ({id,passed:condition,details:condition?undefined:details});

const base: Answers = { age:30, sex:'male', heightCm:175, weightKg:68, waistCm:80, diagnosedConditions:['none'], prescriptionMedications:false, supplementUse:false, medicationOrSupplementAllergy:false, diet:'mixed', activityDays:5, sleepHours:7.5, smoking:false, familyDiabetes:false, currentConcerns:['none'], recentLabs:false };

export function runPresentationVerification(): PresentationVerificationResult[] {
  const results: PresentationVerificationResult[] = [];
  const high = buildHealthMapViewModel(assess({ ...base, age:42, weightKg:86, waistCm:101, activityDays:1, familyDiabetes:true }));
  results.push(check('health-map-shared-priority-order', high.topPriorities[0]?.kind === 'finding' && high.topPriorities.some(item=>item.kind==='investigation'), 'Expected important finding before evidence-resolution test in top priorities.'));
  results.push(check('health-map-investigation-label', high.investigations.minimal.some(item=>item.priorityLabel==='High assessment priority'), 'Expected shared consumer wording for essential investigation tier.'));
  const urgent = buildHealthMapViewModel(assess({ ...base, currentConcerns:['chestPain'], redFlagChestPain:true }));
  results.push(check('health-map-urgent-first', urgent.urgent && urgent.topPriorities[0]?.kind === 'urgent' && Boolean(urgent.investigations.blockedReason), 'Expected urgent signal first and routine investigation plan blocked.'));
  const pregnant = buildHealthMapViewModel(assess({ ...base, sex:'female', reproductiveContext:'pregnant' }));
  results.push(check('health-map-safety-restrictions', pregnant.safety.restrictions.some(item=>item.actionClass==='therapeutic_supplement' && item.disposition==='blocked'), 'Expected pregnancy safety restriction to be preserved by shared presentation model.'));
  const repeatA = JSON.stringify(buildHealthMapViewModel(assess({ ...base, diet:'vegetarian', currentConcerns:['fatigue','tingling'] })));
  const repeatB = JSON.stringify(buildHealthMapViewModel(assess({ ...base, diet:'vegetarian', currentConcerns:['fatigue','tingling'] })));
  results.push(check('health-map-deterministic-repeatability', repeatA===repeatB, 'Expected identical assessment result to generate identical Health Map presentation.'));
  return results;
}

export function assertPresentationVerification(){
  const results=runPresentationVerification(); const failed=results.filter(x=>!x.passed);
  if(failed.length) throw new Error(`Presentation verification failed: ${failed.map(x=>`${x.id}: ${x.details}`).join(' | ')}`);
  return results;
}
