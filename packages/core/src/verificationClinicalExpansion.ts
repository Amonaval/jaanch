import { assess } from './engine';
import { reassessWithLabs } from './labs';
import { buildRecommendationPlan } from './recommendations';
import { createReportProvenance, extractReportCandidatesFromText, confirmReportEvidenceCandidate } from './reportEvidence';
import { addProfileToHistory, decodeJaanchProfile, encodeJaanchProfile } from './profile';
import { getMockProfiles } from './mockProfiles';
import { emptyLongitudinalHistory } from './longitudinal';
import type { Answers, LabRecord } from './types';
import type { VerificationCaseResult } from './verification';

const check=(id:string,condition:boolean,details:string):VerificationCaseResult=>({id,passed:condition,details:condition?undefined:details});
const base:Answers={age:45,sex:'male',heightCm:175,weightKg:78,waistCm:90,diagnosedConditions:['none'],prescriptionMedications:false,supplementUse:false,medicationOrSupplementAllergy:false,diet:'mixed',sleepHours:7,smoking:false,currentConcerns:['none'],recentLabs:true};
const at='2026-10-09T00:00:00.000Z';
const lab=(id:string,markerId:LabRecord['markerId'],value:number,unit:string):LabRecord=>({id,markerId,value,unit,collectedAt:'2026-09-15T00:00:00.000Z',source:'import',verification:'user_confirmed'});

export function runClinicalExpansionVerification():VerificationCaseResult[]{
 const results:VerificationCaseResult[]=[];
 const bare=assess({...base,ldl:205,fastingGlucose:130,hemoglobin:9});
 results.push(check('m134-bare-expanded-labs-not-trusted',!bare.findings.some(f=>f.id==='CVD-LIPID-001')&&bare.findings.find(f=>f.id==='MET-001')?.missingEvidenceIds.includes('met.missing.glycemic_marker')===true,'Bare LDL/fasting-glucose/hemoglobin answer values must not bypass LabRecord eligibility.'));

 const fpg=reassessWithLabs(base,[lab('fpg','fasting_glucose',114,'mg/dL')],at);
 const fpgFinding=fpg.after.findings.find(f=>f.id==='MET-001');
 results.push(check('m134-fasting-glucose-closes-gap',fpg.appliedLabRecordIds.includes('fpg')&&fpgFinding?.status==='investigate'&&!fpgFinding.missingEvidenceIds.includes('met.missing.glycemic_marker'),'Eligible fasting glucose should resolve the glycemic evidence gap and surface intermediate glycemia.'));

 const diabetesRange=reassessWithLabs(base,[lab('fpg-high','fasting_glucose',132,'mg/dL')],at);
 const diabetesFinding=diabetesRange.after.findings.find(f=>f.id==='MET-001');
 const diabetesPlan=buildRecommendationPlan(base,diabetesRange.after);
 results.push(check('m134-diabetes-range-needs-clinician-review',diabetesFinding?.status==='high_attention'&&diabetesFinding.urgency==='clinician_review'&&diabetesPlan.clinicianReviewIds.includes('REC-MET-GLYCEMIC-REVIEW-001'),'Diabetes-range eligible evidence should trigger bounded clinician review, not an autonomous diagnosis.'));

 const lipid=reassessWithLabs(base,[lab('ldl-severe','ldl',205,'mg/dL'),lab('tg','triglycerides',170,'mg/dL')],at);
 const lipidFinding=lipid.after.findings.find(f=>f.id==='CVD-LIPID-001');
 const lipidPlan=buildRecommendationPlan(base,lipid.after);
 results.push(check('m134-severe-ldl-review',lipidFinding?.status==='high_attention'&&lipidFinding.urgency==='clinician_review'&&lipidPlan.clinicianReviewIds.includes('REC-LIPID-REVIEW-001'),'LDL >=190 mg/dL should surface clinician review without autonomous medication changes.'));

 const tg=reassessWithLabs(base,[lab('ldl','ldl',110,'mg/dL'),lab('tg-severe','triglycerides',1100,'mg/dL')],at);
 results.push(check('m134-severe-triglycerides-review',tg.after.findings.find(f=>f.id==='CVD-LIPID-001')?.urgency==='clinician_review','Triglycerides >=1000 mg/dL should surface high-attention clinician review.'));

 const ironBase:Answers={...base,sex:'female',reproductiveContext:'none',currentConcerns:['fatigue']};
 const iron=reassessWithLabs(ironBase,[lab('hgb','hemoglobin',10.8,'g/dL'),lab('ferritin','ferritin',9,'ng/mL')],at);
 const ironFinding=iron.after.findings.find(f=>f.id==='NUT-IRON-001');
 const ironPlan=buildRecommendationPlan(ironBase,iron.after);
 results.push(check('m134-anemia-iron-review',ironFinding?.status==='high_attention'&&ironFinding.urgency==='clinician_review'&&ironPlan.clinicianReviewIds.includes('REC-IRON-REVIEW-001')&&!ironPlan.recommendations.some(r=>r.actionClass==='therapeutic_supplement'&&r.relatedFindingIds.includes('NUT-IRON-001')),'Low hemoglobin/ferritin should trigger clinician review without an autonomous therapeutic iron regimen.'));

 const provenance=createReportProvenance({fileName:'boundary.txt',kind:'text',extractionMethod:'pasted_text',importedAt:at});
 const candidates=extractReportCandidatesFromText({text:'TSH: 8.2 mIU/L\nVitamin D (25-OH): 16 ng/mL\nLDL: 205 mg/dL',provenance,defaultCollectedAt:'2026-09-15T00:00:00.000Z'});
 const tsh=candidates.find(c=>c.markerId==='tsh'); const ldl=candidates.find(c=>c.markerId==='ldl');
 const tshConfirmed=tsh?confirmReportEvidenceCandidate(tsh):undefined; const ldlConfirmed=ldl?confirmReportEvidenceCandidate(ldl):undefined;
 results.push(check('m134-report-boundary-supported-vs-unassessed',Boolean(tshConfirmed?.recorded&&!tshConfirmed.lab&&ldlConfirmed?.lab&&!ldlConfirmed.recorded),'TSH/Vitamin D should remain recorded/unassessed while supported lipid markers can enter normal lab gates.'));

 const mocks=getMockProfiles(new Date(at));
 const roundtrip=decodeJaanchProfile(encodeJaanchProfile(mocks[1]));
 const imported=addProfileToHistory({history:emptyLongitudinalHistory(),profile:roundtrip,capturedAt:at,id:'roundtrip'});
 results.push(check('m134-profile-roundtrip-runs',roundtrip.id===mocks[1].id&&imported.history.snapshots.length===1&&imported.snapshot.assessment.findings.length>0,'Portable profile JSON should round-trip and run through the real shared assessment engine.'));

 let allMocksRun=true;
 for(const profile of mocks){try{const result=addProfileToHistory({history:emptyLongitudinalHistory(),profile,capturedAt:at,id:`fixture-${profile.id}`});if(!result.snapshot.assessment.findings.length) allMocksRun=false;}catch{allMocksRun=false;}}
 results.push(check('m134-all-mock-profiles-run',allMocksRun&&mocks.length>=6,`Expected at least six mock profiles to execute; got ${mocks.length}.`));
 return results;
}

export function assertClinicalExpansionVerification(){const results=runClinicalExpansionVerification();const failed=results.filter(item=>!item.passed);if(failed.length)throw new Error(`Clinical expansion verification failed: ${failed.map(item=>`${item.id}: ${item.details}`).join(' | ')}`);return results;}
