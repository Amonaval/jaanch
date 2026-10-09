import type { Answers, AssessmentResult, Domain, SafetyActionClass, SafetyDisposition } from './types';

export type M134RecommendationPriority = 'high'|'medium'|'low';
export type M134RecommendationCandidate = {
  id:string;
  domain:Exclude<Domain,'baseline'|'safety'>;
  title:string;
  actionClass:SafetyActionClass;
  priority:M134RecommendationPriority;
  baseDisposition?:SafetyDisposition;
  rationale:string;
  steps:string[];
  relatedFindingIds:string[];
  sourceIds:string[];
  maturity:'prototype';
  applicabilityPolicyId:string;
};

export const m134RecommendationGovernanceArtifacts = [
  { id:'REC-BP-RECHECK-001',maturity:'prototype' as const,sourceIds:['ESC-BP-2024'],applicabilityPolicyId:'APPL-BP-ADULT-NONPREG' },
  { id:'REC-LIPID-RISK-001',maturity:'prototype' as const,sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'],applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG' },
  { id:'REC-IRON-REVIEW-001',maturity:'prototype' as const,sourceIds:['WHO-ANAEMIA-2024','WHO-FERRITIN-2020'],applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG-18-65' },
  { id:'REC-THYROID-REVIEW-001',maturity:'prototype' as const,sourceIds:['NICE-THYROID-NG145'],applicabilityPolicyId:'APPL-THYROID-ADULT-NONPREG' },
];

function finding(result:AssessmentResult,id:string){return result.findings.find((item)=>item.id===id);}

export function m134RecommendationCandidates(_answers:Answers,result:AssessmentResult):M134RecommendationCandidate[]{
  const candidates:M134RecommendationCandidate[]=[];
  const bp=finding(result,'CV-BP-001');
  const lipids=finding(result,'CV-LIPID-001');
  const iron=finding(result,'NUT-IRON-001');
  const thyroid=finding(result,'MET-THYROID-001');

  if(bp&&['investigate','high_attention'].includes(bp.status)) candidates.push({
    id:'REC-BP-RECHECK-001',domain:'cardiovascular',title:'Confirm the blood-pressure signal with proper repeat measurements',actionClass:'monitoring',priority:bp.status==='high_attention'?'high':'medium',baseDisposition:bp.status==='high_attention'?'clinician_review':undefined,
    rationale:'A single elevated reading is clinically useful evidence but should not be converted into a diagnosis or medication change without confirmation and context.',
    steps:['Repeat blood pressure using correct cuff size and seated technique.','Record multiple readings rather than relying on one isolated value.','Discuss persistent or markedly high readings with a clinician; do not self-adjust prescription medicine.'],relatedFindingIds:[bp.id],sourceIds:['ESC-BP-2024'],maturity:'prototype',applicabilityPolicyId:'APPL-BP-ADULT-NONPREG',
  });

  if(lipids&&['investigate','high_attention'].includes(lipids.status)) candidates.push({
    id:'REC-LIPID-RISK-001',domain:'cardiovascular',title:'Review lipid results in full cardiovascular-risk context',actionClass:'monitoring',priority:lipids.status==='high_attention'?'high':'medium',baseDisposition:lipids.urgency==='clinician_review'?'clinician_review':undefined,
    rationale:'Current dyslipidemia guidance uses overall cardiovascular risk, treatment status and the pattern of atherogenic lipids rather than one universal target for every person.',
    steps:['Review LDL-C, triglycerides, treatment status, family history and other cardiovascular risks together.','Use clinician-guided PREVENT/ASCVD risk assessment when applicable.','Do not start, stop or change lipid-lowering medication based only on Jaanch.'],relatedFindingIds:[lipids.id],sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'],maturity:'prototype',applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG',
  });

  if(iron&&['investigate','high_attention'].includes(iron.status)) candidates.push({
    id:'REC-IRON-REVIEW-001',domain:'nutrition',title:'Review low haemoglobin or ferritin and identify the cause',actionClass:'monitoring',priority:iron.status==='high_attention'?'high':'medium',baseDisposition:'clinician_review',
    rationale:'Low haemoglobin and/or depleted iron stores require cause-oriented assessment. Jaanch does not assume dietary iron deficiency or prescribe an iron regimen automatically.',
    steps:['Review haemoglobin, ferritin, symptoms and relevant bleeding/diet/medical context with a clinician.','Complete missing blood evidence if clinically appropriate.','Avoid using Jaanch to choose a therapeutic iron dose or duration.'],relatedFindingIds:[iron.id],sourceIds:['WHO-ANAEMIA-2024','WHO-FERRITIN-2020'],maturity:'prototype',applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG-18-65',
  });

  if(thyroid&&thyroid.status==='investigate') candidates.push({
    id:'REC-THYROID-REVIEW-001',domain:'metabolic',title:'Confirm the thyroid signal with clinician-guided testing',actionClass:'monitoring',priority:'medium',baseDisposition:'clinician_review',
    rationale:'Marked TSH values need interpretation with repeat testing, FT4/FT3 when indicated, symptoms and treatment context rather than an app diagnosis.',
    steps:['Review the TSH result and laboratory reference range.','Use FT4 and, for low TSH where indicated, FT3 as part of clinician-guided confirmation.','Do not change thyroid medication autonomously.'],relatedFindingIds:[thyroid.id],sourceIds:['NICE-THYROID-NG145'],maturity:'prototype',applicabilityPolicyId:'APPL-THYROID-ADULT-NONPREG',
  });

  return candidates;
}
