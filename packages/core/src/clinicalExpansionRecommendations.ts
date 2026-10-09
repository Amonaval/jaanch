import type { Answers, AssessmentResult, Domain, SafetyActionClass, SafetyDisposition } from './types';

export type ClinicalExpansionRecommendationPriority = 'high' | 'medium' | 'low';
export type ClinicalExpansionRecommendationMaturity = 'prototype' | 'reviewed' | 'approved';
export type ClinicalExpansionRecommendationCandidate = {
  id:string;
  domain:Exclude<Domain,'baseline'|'safety'>;
  title:string;
  actionClass:SafetyActionClass;
  priority:ClinicalExpansionRecommendationPriority;
  rationale:string;
  steps:string[];
  relatedFindingIds:string[];
  sourceIds:string[];
  maturity:ClinicalExpansionRecommendationMaturity;
  applicabilityPolicyId:string;
  baseDisposition?:SafetyDisposition;
};

const finding=(result:AssessmentResult,id:string)=>result.findings.find((item)=>item.id===id);

export const clinicalExpansionRecommendationGovernanceArtifacts = [
  {id:'REC-MET-GLYCEMIC-REVIEW-001',maturity:'prototype' as const,sourceIds:['ADA-2026-DIAGNOSIS'],applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG'},
  {id:'REC-LIPID-REVIEW-001',maturity:'prototype' as const,sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'],applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG'},
  {id:'REC-IRON-REVIEW-001',maturity:'prototype' as const,sourceIds:['WHO-ANEMIA-2024','WHO-FERRITIN-2020'],applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG'},
];

export function clinicalExpansionRecommendationCandidates(_answers:Answers,result:AssessmentResult):ClinicalExpansionRecommendationCandidate[]{
  const candidates:ClinicalExpansionRecommendationCandidate[]=[];
  const metabolic=finding(result,'MET-001');
  const lipid=finding(result,'CVD-LIPID-001');
  const iron=finding(result,'NUT-IRON-001');

  if(metabolic?.evidenceLevel==='lab_informed'&&metabolic.status==='high_attention') candidates.push({
    id:'REC-MET-GLYCEMIC-REVIEW-001',domain:'metabolic',title:'Review the diabetes-range glycemic result with a clinician',actionClass:'monitoring',priority:'high',baseDisposition:'clinician_review',
    rationale:'A single diabetes-range HbA1c or fasting-glucose result is clinically important, but in the absence of unequivocal hyperglycemia the ADA diagnostic pathway requires confirmation rather than an app diagnosis.',
    steps:['Share the measured value, unit, date and relevant symptoms/history with a clinician.','Use the appropriate confirmatory pathway rather than treating one imported result as a final diagnosis.'],relatedFindingIds:[metabolic.id],sourceIds:['ADA-2026-DIAGNOSIS'],maturity:'prototype',applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG',
  });

  if(lipid&&['investigate','high_attention'].includes(lipid.status)) candidates.push({
    id:'REC-LIPID-REVIEW-001',domain:'cardiovascular',title:lipid.status==='high_attention'?'Review the high-priority lipid result with a clinician':'Interpret the elevated LDL result with overall cardiovascular risk',actionClass:'monitoring',priority:lipid.status==='high_attention'?'high':'medium',baseDisposition:lipid.status==='high_attention'?'clinician_review':'allowed',
    rationale:'The 2026 dyslipidemia guideline uses measured lipids together with overall ASCVD context; severe LDL or triglyceride values need clinician-led management rather than autonomous medication changes.',
    steps:['Keep the full lipid panel and current medicines available for review.','For LDL below the severe range, interpret treatment decisions with overall ASCVD risk/risk enhancers rather than this isolated number.','Do not start, stop or change prescription lipid therapy from Jaanch alone.'],relatedFindingIds:[lipid.id],sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'],maturity:'prototype',applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG',
  });

  if(iron&&['investigate','high_attention'].includes(iron.status)) candidates.push({
    id:'REC-IRON-REVIEW-001',domain:'nutrition',title:'Review the anemia / iron evidence and its cause',actionClass:'monitoring',priority:iron.status==='high_attention'?'high':'medium',baseDisposition:'clinician_review',
    rationale:'Low hemoglobin or ferritin can be clinically meaningful, but ferritin changes with inflammation and neither result alone identifies the cause or a safe replacement regimen.',
    steps:['Review hemoglobin, ferritin, symptoms and relevant bleeding/inflammation/diet context with a clinician.','Do not start a therapeutic-dose iron regimen solely from this app finding.'],relatedFindingIds:[iron.id],sourceIds:['WHO-ANEMIA-2024','WHO-FERRITIN-2020'],maturity:'prototype',applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG',
  });
  return candidates;
}
