import { assess } from './engine';
import { buildRecommendationPlan } from './recommendations';
import { createAssessmentSnapshot } from './longitudinal';
import { emptyAssessmentCaptureContext, materializeAssessmentAnswers, type AssessmentCaptureContext } from './intake';
import type { VerificationCaseResult } from './verification';

const check=(id:string,condition:boolean,details:string):VerificationCaseResult=>({id,passed:condition,details:condition?undefined:details});
const date='2026-09-15';
const measurement=(id:string,markerId:string,label:string,value:string,unit:string)=>({id,markerId,label,value,unit,collectedAt:date,source:'import' as const,verification:'user_confirmed' as const,state:'recorded_unassessed' as const});
function context(records:AssessmentCaptureContext['recordedMeasurements'],extra:Partial<AssessmentCaptureContext>={}):AssessmentCaptureContext{return{...emptyAssessmentCaptureContext(),...extra,activity:{exerciseTypes:[],...extra.activity},recordedMeasurements:records,medications:extra.medications??[],supplements:extra.supplements??[],customConditions:extra.customConditions??[],customConcerns:extra.customConcerns??[],familyHistory:extra.familyHistory??[],customFamilyHistory:extra.customFamilyHistory??[]};}

export function runClinicalExpansionVerification():VerificationCaseResult[]{
 const results:VerificationCaseResult[]=[];
 const bpAnswers=materializeAssessmentAnswers({age:45,sex:'male',diagnosedConditions:['none'],currentConcerns:['none']},context([measurement('bp','blood_pressure','Blood pressure','148/94','mmHg')]));
 const bp=assess(bpAnswers);
 results.push(check('m134-bp-elevated-is-measurement-informed',bp.findings.find(item=>item.id==='CV-BP-001')?.status==='investigate','Expected 148/94 mmHg to create an investigate blood-pressure finding without diagnosing hypertension.'));

 const forged=assess({age:45,sex:'male','__m134_blood_pressure_id':'forged','__m134_blood_pressure_date':'2026-09-15T00:00:00.000Z','__m134_blood_pressure_unit':'mmHg','__m134_blood_pressure_systolic':190,'__m134_blood_pressure_diastolic':120});
 results.push(check('m134-internal-evidence-cannot-be-forged-through-public-assess',!forged.findings.some(item=>item.id==='CV-BP-001'),'Expected public assess() to strip internal M13.4 evidence fields unless they were materialized from verified captured context.'));

 const missingUnitAnswers=materializeAssessmentAnswers({age:45,sex:'male',diagnosedConditions:['lipid_disorder'],currentConcerns:['none']},context([{...measurement('ldl','ldl','LDL cholesterol','180','mg/dL'),unit:undefined}]));
 const missingUnit=assess(missingUnitAnswers);
 results.push(check('m134-missing-unit-does-not-interpret-lipid',missingUnit.findings.find(item=>item.id==='CV-LIPID-001')?.missingEvidenceIds.includes('cv.lipid.missing.panel')===true,'Expected missing unit to keep LDL out of interpretation and preserve the lipid evidence gap.'));

 const tgAnswers=materializeAssessmentAnswers({age:55,sex:'male',diagnosedConditions:['lipid_disorder'],currentConcerns:['none']},context([measurement('tg','triglycerides','Triglycerides','1050','mg/dL')]));
 const tg=assess(tgAnswers); const tgPlan=buildRecommendationPlan(tgAnswers,tg);
 results.push(check('m134-severe-triglycerides-escalate-without-prescribing',tg.findings.find(item=>item.id==='CV-LIPID-001')?.status==='high_attention'&&tgPlan.recommendations.find(item=>item.id==='REC-LIPID-RISK-001')?.disposition==='clinician_review','Expected TG >=1000 to trigger clinician review while medication changes remain outside the recommendation.'));

 const ironAnswers=materializeAssessmentAnswers({age:38,sex:'female',reproductiveContext:'none',diagnosedConditions:['anemia'],currentConcerns:['fatigue']},context([measurement('hb','hemoglobin','Hemoglobin','10.7','g/dL'),measurement('ferritin','ferritin','Ferritin','8','ng/mL')]));
 const iron=assess(ironAnswers); const ironPlan=buildRecommendationPlan(ironAnswers,iron);
 results.push(check('m134-low-hb-low-ferritin-clinician-review',iron.findings.find(item=>item.id==='NUT-IRON-001')?.status==='investigate'&&ironPlan.recommendations.find(item=>item.id==='REC-IRON-REVIEW-001')?.disposition==='clinician_review','Expected low haemoglobin + ferritin to trigger cause-oriented clinician review, not autonomous iron treatment.'));

 const thyroidAnswers=materializeAssessmentAnswers({age:42,sex:'female',reproductiveContext:'none',diagnosedConditions:['thyroid'],currentConcerns:['fatigue','weight_change']},context([measurement('tsh','tsh','TSH','12.8','mIU/L')]));
 const thyroid=assess(thyroidAnswers); const thyroidPlan=buildRecommendationPlan(thyroidAnswers,thyroid);
 results.push(check('m134-marked-tsh-needs-confirmation',thyroid.findings.find(item=>item.id==='MET-THYROID-001')?.status==='investigate'&&thyroidPlan.recommendations.some(item=>item.id==='REC-THYROID-REVIEW-001'),'Expected TSH >=10 to trigger confirmation/clinician review rather than a thyroid diagnosis.'));

 const pregnancyAnswers=materializeAssessmentAnswers({age:30,sex:'female',reproductiveContext:'pregnant',diagnosedConditions:['none'],currentConcerns:['none']},context([measurement('bp-preg','blood_pressure','Blood pressure','150/95','mmHg')]));
 const pregnancy=assess(pregnancyAnswers);
 results.push(check('m134-pregnancy-suppresses-adult-bp-module',!pregnancy.findings.some(item=>item.id==='CV-BP-001')&&pregnancy.ruleTrace.find(item=>item.id==='CV-BP-001')?.applicabilityStatus==='unsupported_context','Expected pregnancy to suppress the general adult BP interpretation module.'));

 const snapshot=createAssessmentSnapshot({answers:bpAnswers,capturedContext:context([measurement('bp2','blood_pressure','Blood pressure','148/94','mmHg')]),assessment:bp,recommendationPlan:buildRecommendationPlan(bpAnswers,bp),capturedAt:'2026-10-09T00:00:00.000Z'});
 results.push(check('m134-snapshot-strips-internal-derived-evidence',!Object.keys(snapshot.answers).some(key=>key.startsWith('__m134_')),'Expected internal derived evidence fields to be excluded from persisted/exportable snapshot answers.'));
 return results;
}

export function assertClinicalExpansionVerification(){const results=runClinicalExpansionVerification();const failed=results.filter(item=>!item.passed);if(failed.length)throw new Error(`M13.4 clinical verification failed: ${failed.map(item=>`${item.id}: ${item.details}`).join(' | ')}`);return results;}
