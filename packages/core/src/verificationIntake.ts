import { buildRecommendationPlan } from './recommendations';
import { assess } from './engine';
import {
  capturedContextSummary, cmToFeetInches, emptyAssessmentCaptureContext, feetInchesToCm, inchesToCm,
  materializeAssessmentAnswers, poundsToKg, recordedMeasurementCatalog,
  conditionCatalog, concernCatalog, familyHistoryCatalog, exerciseTypeCatalog,
} from './intake';
import { createAssessmentSnapshot, decodeLongitudinalHistory, encodeLongitudinalHistory, emptyLongitudinalHistory, addSnapshot } from './longitudinal';
import { createHap } from './hap';
import { createBlockNavigation, getAssessmentBlockPlan, goBackBlock, goForwardBlock, reconcileBlockNavigation } from './blockPlanner';
import type { Answers } from './types';
import type { VerificationCaseResult } from './verification';

const check=(id:string,condition:boolean,details:string):VerificationCaseResult=>({id,passed:condition,details:condition?undefined:details});
const base:Answers={age:37,sex:'male',heightCm:175,weightKg:70,waistCm:84,diagnosedConditions:['none'],prescriptionMedications:false,supplementUse:false,medicationOrSupplementAllergy:false,diet:'vegetarian',sleepHours:7,smoking:false,currentConcerns:['none'],recentLabs:false};

export function runIntakeVerification():VerificationCaseResult[]{
 const results:VerificationCaseResult[]=[];
 const converted=feetInchesToCm(5,10); const back=cmToFeetInches(converted);
 results.push(check('intake-height-unit-roundtrip',Math.abs(converted-177.8)<0.2&&back.feet===5&&back.inches===10,'Expected ft/in and cm conversion to be stable.'));
 results.push(check('intake-waist-inch-conversion',Math.abs(inchesToCm(36)-91.4)<0.2,'Expected inch-to-cm waist conversion.'));
 results.push(check('intake-weight-lb-conversion',Math.abs(poundsToKg(154)-69.9)<0.2,'Expected lb-to-kg conversion.'));

 const walker=emptyAssessmentCaptureContext(); walker.activity.walkingDaysPerWeek=6; walker.activity.walkingMinutesPerDay=45; walker.activity.exerciseDaysPerWeek=0;
 const walkingAnswers=materializeAssessmentAnswers(base,walker);
 results.push(check('intake-walking-counts-as-activity',walkingAnswers.activityDays===6,'Expected regular 30+ minute walking to contribute to the existing activity summary.'));

 const context=emptyAssessmentCaptureContext();
 context.customConditions=['Migraine']; context.customConcerns=['Persistent calf soreness'];
 context.medications=[{id:'med-1',name:'Atorvastatin',category:'lipid_lowering',purpose:'Cholesterol',state:'recorded_unassessed'}];
 context.recordedMeasurements=[{id:'vitd-1',markerId:'vitamin_d_25oh',label:'Vitamin D (25-OH)',value:'22',unit:'ng/mL',collectedAt:'2026-09-01',source:'manual',verification:'user_confirmed',state:'recorded_unassessed'}];
 const summary=capturedContextSummary(context);
 results.push(check('intake-manual-context-preserved',summary.some(item=>item.detail==='Migraine')&&summary.some(item=>item.title.includes('Atorvastatin'))&&summary.some(item=>item.title==='Vitamin D (25-OH)'),'Expected custom condition, named medicine and Vitamin D to remain first-class recorded context.'));
 const materialized=materializeAssessmentAnswers(base,context);
 results.push(check('intake-medication-materialization',materialized.prescriptionMedications===true&&materialized.medicationCount===1&&Array.isArray(materialized.medicationCategories)&&materialized.medicationCategories.includes('lipid_lowering'),'Expected named medicine capture to populate bounded safety context without inferring a diagnosis.'));

 const catalogueBreadth=conditionCatalog.length+concernCatalog.length+familyHistoryCatalog.length+exerciseTypeCatalog.length+recordedMeasurementCatalog.length;
 results.push(check('intake-catalogue-breadth',catalogueBreadth>=55,`Expected materially broader capture catalogue; got ${catalogueBreadth} choices.`));

 const sleepAnswers:Answers={...base,currentConcerns:['sleep']}; const sleepPlan=getAssessmentBlockPlan(sleepAnswers,emptyAssessmentCaptureContext());
 let nav=createBlockNavigation(sleepPlan);
 while(nav.currentBlockId!=='followup-sleep'){
   const move=goForwardBlock(nav,sleepPlan); if(move.complete)break; nav=move.state;
 }
 const sleepReached=nav.currentBlockId==='followup-sleep';
 nav=goBackBlock(nav,sleepPlan); const forwardAgain=goForwardBlock(nav,sleepPlan);
 results.push(check('block-navigation-back-forward-preserves-adaptive',sleepReached&&forwardAgain.state.currentBlockId==='followup-sleep','Expected Back then Forward to return to the same still-eligible adaptive block.'));

 const noSleepPlan=getAssessmentBlockPlan({...base,currentConcerns:['none']},emptyAssessmentCaptureContext());
 const reconciled=reconcileBlockNavigation(nav,noSleepPlan); const afterRemoval=goForwardBlock(reconciled,noSleepPlan);
 results.push(check('block-navigation-plan-change-drops-stale-forward',afterRemoval.state.currentBlockId!=='followup-sleep','Expected an invalidated adaptive block not to survive a plan-changing edit.'));

 const noChestPlan=getAssessmentBlockPlan({...base,currentConcerns:['none']},emptyAssessmentCaptureContext()); let chestNav=createBlockNavigation(noChestPlan);
 chestNav=goForwardBlock(chestNav,noChestPlan).state; chestNav=goForwardBlock(chestNav,noChestPlan).state;
 const chestPlan=getAssessmentBlockPlan({...base,currentConcerns:['chestPain']},emptyAssessmentCaptureContext());
 chestNav=reconcileBlockNavigation(chestNav,chestPlan); const chestNext=goForwardBlock(chestNav,chestPlan);
 results.push(check('block-navigation-new-safety-interrupts-next',chestNext.state.currentBlockId==='followup-safety','Expected newly activated safety follow-up to be the immediate next block.'));

 const assessment=assess(materialized); const recommendations=buildRecommendationPlan(materialized,assessment); const snapshot=createAssessmentSnapshot({answers:materialized,capturedContext:context,assessment,recommendationPlan:recommendations,capturedAt:'2026-10-09T00:00:00.000Z',id:'intake-fixture'});
 const history=addSnapshot(emptyLongitudinalHistory(),snapshot); const decoded=decodeLongitudinalHistory(encodeLongitudinalHistory(history));
 results.push(check('intake-custom-context-survives-history',decoded.snapshots[0]?.capturedContext?.customConditions.includes('Migraine')===true&&decoded.snapshots[0]?.capturedContext?.recordedMeasurements[0]?.markerId==='vitamin_d_25oh','Expected custom/manual facts to survive longitudinal serialization.'));
 const hap=createHap(materialized,assessment,[],recommendations,context);
 results.push(check('intake-hap-retains-rich-context',hap.capturedContext?.medications[0]?.name==='Atorvastatin'&&hap.capturedContext?.recordedMeasurements[0]?.markerId==='vitamin_d_25oh','Expected internal HAP to retain richer captured context for later policy-controlled review.'));
 return results;
}

export function assertIntakeVerification(){const results=runIntakeVerification();const failed=results.filter(item=>!item.passed);if(failed.length)throw new Error(`Intake verification failed: ${failed.map(item=>`${item.id}: ${item.details}`).join(' | ')}`);return results;}
