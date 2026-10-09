import { buildHealthIntelligenceBrief } from './healthBrief';
import { mockProfileBundles } from './mockProfiles';
import { runProfileBundle } from './profileBundle';
import { createSmartRecheckDraft } from './recheck';
import type { AssessmentSnapshot } from './longitudinal';

export type ConsumerValueVerificationResult={id:string;passed:boolean;details?:string};
const check=(id:string,condition:boolean,details:string):ConsumerValueVerificationResult=>({id,passed:condition,details:condition?undefined:details});
const run=(id:string)=>{
  const bundle=mockProfileBundles.find((item)=>item.id===id);
  if(!bundle)throw new Error(`Missing mock ${id}`);
  return runProfileBundle(bundle,'2026-10-09T12:00:00.000Z');
};
export function runConsumerValueVerification():ConsumerValueVerificationResult[]{
  const results:ConsumerValueVerificationResult[]=[];
  const briefs=mockProfileBundles.map((bundle)=>{const item=run(bundle.id);return{id:item.bundle.id,brief:buildHealthIntelligenceBrief(item.snapshot.assessment,item.snapshot.recommendationPlan),snapshot:item.snapshot};});
  results.push(check('brief-priority-cap',briefs.every((item)=>item.brief.priorities.length<=3),'Every brief must contain at most three consumer priorities.'));
  const low=briefs.find((item)=>item.id==='mock-low-risk-adult')!;
  results.push(check('brief-low-risk-stays-quiet',low.brief.priorities.length===0&&low.brief.tone==='positive'&&!low.brief.mostUsefulMissingEvidence,'Low-risk mock should not acquire filler priorities or an automatically promoted missing test.'));
  results.push(check('brief-low-risk-limited-reassurance',low.brief.summary.toLowerCase().includes('not a comprehensive health clearance'),'Low-risk copy must keep reassurance bounded.'));
  const cardio=briefs.find((item)=>item.id==='mock-cardiometabolic-lipids')!,cardioPriority=cardio.brief.priorities[0];
  results.push(check('brief-cardio-cluster',cardioPriority?.id==='cardiometabolic'&&['MET-001','CV-BP-001','CV-LIPID-001'].every((id)=>cardioPriority.findingIds.includes(id)),'Cardiometabolic mock should connect metabolic, BP and lipid findings into one top theme.'));
  results.push(check('brief-cardio-action',Boolean(cardioPriority?.nextAction)&&cardioPriority!.decisionChangingEvidence.length>0,'Cardiometabolic priority needs a concrete next action and decision-changing evidence.'));
  const nutrition=briefs.find((item)=>item.id==='mock-vegetarian-b12-iron')!,nutritionPriority=nutrition.brief.priorities[0];
  results.push(check('brief-b12-iron-joined',nutritionPriority?.id==='blood-nutrition'&&nutritionPriority.findingIds.includes('NUT-001')&&nutritionPriority.findingIds.includes('NUT-IRON-001'),'B12 + iron mock should be synthesized into one joined blood/nutrition priority.'));
  results.push(check('brief-b12-iron-no-dose',!JSON.stringify(nutritionPriority).toLowerCase().includes(' dose '),'Consumer synthesis must not introduce autonomous therapeutic dosing.'));
  const thyroid=briefs.find((item)=>item.id==='mock-thyroid-signal')!,thyroidPriority=thyroid.brief.priorities[0];
  results.push(check('brief-thyroid-dominant',thyroidPriority?.id==='thyroid'&&thyroidPriority.findingIds.includes('MET-THYROID-001'),'Marked TSH mock should make thyroid the dominant priority.'));
  results.push(check('brief-thyroid-no-autonomous-change',thyroidPriority?.canWait.toLowerCase().includes('do not change thyroid medicine'),'Thyroid brief should explicitly protect the medication-change boundary.'));
  const tg=briefs.find((item)=>item.id==='mock-severe-triglycerides')!,tgPriority=tg.brief.priorities[0];
  results.push(check('brief-severe-tg-dominant',tgPriority?.id==='cardiometabolic'&&tgPriority.title.toLowerCase().includes('triglycerides')&&tgPriority.statusLabel==='Prompt clinician review','TG >=1000 mock should make severe triglycerides the dominant visible prompt-review priority without inventing an emergency state.'));
  const thyroidDraft=createSmartRecheckDraft(thyroid.snapshot);
  results.push(check('smart-recheck-prefills-profile',thyroidDraft.answers.age===42&&thyroidDraft.stableSummary.medicationCount===1&&thyroidDraft.capturedContext.medications.length===1,'Smart recheck should preserve stable profile and medicine context.'));
  const b12=briefs.find((item)=>item.id==='mock-vegetarian-b12-iron')!,b12Draft=createSmartRecheckDraft(b12.snapshot);
  results.push(check('smart-recheck-preserves-raw-labs',b12Draft.labs.length===1&&b12Draft.labs[0]?.markerId==='vitamin_b12'&&!('normalizedValue' in b12Draft.labs[0]!),'Smart recheck should convert saved normalized labs back to raw runnable evidence rather than carrying derived eligibility state.'));
  const forged={...b12.snapshot,answers:{...b12.snapshot.answers,__m134_fake:123}} as AssessmentSnapshot,forgedDraft=createSmartRecheckDraft(forged);
  results.push(check('smart-recheck-strips-internal-evidence',!Object.keys(forgedDraft.answers).some((key)=>key.startsWith('__m134_')),'Smart recheck must not trust persisted/internal M13.4 materialization fields.'));
  const repeated=buildHealthIntelligenceBrief(cardio.snapshot.assessment,cardio.snapshot.recommendationPlan);
  results.push(check('brief-deterministic-repeatability',JSON.stringify(repeated)===JSON.stringify(cardio.brief),'Same deterministic assessment must produce the same Health Intelligence Brief.'));
  return results;
}
export function assertConsumerValueVerification(){const results=runConsumerValueVerification();const failed=results.filter((item)=>!item.passed);if(failed.length)throw new Error(`Consumer value verification failed: ${failed.map((item)=>`${item.id}: ${item.details}`).join(' | ')}`);return results;}
