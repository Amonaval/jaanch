import type { Answers, Domain, EvidenceEdge, EvidenceNode, EvidenceLevel, Finding, FindingConfidence } from './types';
import type { AssessmentRule, RuleOutput } from './ruleRegistry';

const list = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const numeric = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const edge = (evidenceId: string, findingId: string, relation: EvidenceEdge['relation'], weight?: number): EvidenceEdge => ({ evidenceId, findingId, relation, weight });
const node = (
  id: string,
  domain: Domain,
  kind: EvidenceNode['kind'],
  sourceType: EvidenceNode['sourceType'],
  label: string,
  detail: string,
  strength: EvidenceNode['strength'],
  questionIds: string[],
): EvidenceNode => ({ id, domain, kind, sourceType, label, detail, strength, provenance: { questionIds } });

const confidenceFor = (evidenceLevel: EvidenceLevel, evidenceCount: number): FindingConfidence => {
  if (evidenceLevel === 'lab_informed' && evidenceCount >= 2) return 'high';
  if (evidenceCount >= 1) return 'moderate';
  return 'low';
};

function lipidRule(a: Answers): RuleOutput {
  const findingId = 'CVD-LIPID-001';
  const ldl = numeric(a.ldl);
  const hdl = numeric(a.hdl);
  const triglycerides = numeric(a.triglycerides);
  const total = numeric(a.totalCholesterol);
  const values = [ldl, hdl, triglycerides, total].filter((value): value is number => value !== undefined);
  const diagnosed = list(a.diagnosedConditions);
  const medicationCategories = list(a.medicationCategories);
  const relevantWithoutLabs = diagnosed.includes('lipid_disorder') || medicationCategories.includes('lipid_lowering');
  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];
  const supporting: string[] = [];
  const contradicting: string[] = [];
  const missing: string[] = [];

  if (!values.length && !relevantWithoutLabs) return { matched:false, evidenceQuestionIds:['ldl','hdl','triglycerides','totalCholesterol','diagnosedConditions','medicationCategories'] };

  if (!values.length) {
    const id = 'cvd.missing.lipid_panel';
    missing.push(id);
    nodes.push(node(id, 'cardiovascular', 'missing', 'missing', 'Lipid profile', 'No eligible lipid result is available for this adult cardiovascular context.', 'moderate', ['ldl','hdl','triglycerides','totalCholesterol']));
    edges.push(edge(id, findingId, 'missing_for'));
    const finding: Finding = {
      id:findingId, domain:'cardiovascular', title:'Lipid / cholesterol evidence', status:'insufficient_data', urgency:'routine', confidence:'low', evidenceLevel:'insufficient',
      summary:'No eligible lipid result is available. Jaanch does not infer cholesterol status from medicines, body size, or questionnaire answers.',
      supportingEvidenceIds:[], contradictingEvidenceIds:[], missingEvidenceIds:missing,
      actions:['A lipid profile can reduce this evidence gap when clinically appropriate.'],
    };
    return { matched:true, finding, evidenceNodes:nodes, evidenceEdges:edges, evidenceQuestionIds:['ldl','hdl','triglycerides','totalCholesterol','diagnosedConditions','medicationCategories'] };
  }

  const addLab = (id:string,label:string,value:number|undefined,unit='mg/dL') => {
    if (value === undefined) return;
    nodes.push(node(id, 'cardiovascular', 'observed', 'lab', label, `${value} ${unit}`, 'strong', [id.split('.').pop() ?? label]));
  };
  addLab('cvd.obs.ldl','LDL cholesterol',ldl);
  addLab('cvd.obs.hdl','HDL cholesterol',hdl);
  addLab('cvd.obs.triglycerides','Triglycerides',triglycerides);
  addLab('cvd.obs.totalCholesterol','Total cholesterol',total);

  let status: Finding['status'] = 'monitor';
  let urgency: Finding['urgency'] = 'routine';
  let summary = 'Eligible lipid results are available. Treatment targets depend on overall ASCVD risk and clinical context, so Jaanch does not label an isolated panel as globally “good” or prescribe lipid-lowering medicine.';

  if (ldl !== undefined && ldl >= 190) {
    supporting.push('cvd.obs.ldl');
    edges.push(edge('cvd.obs.ldl', findingId, 'supports', 90));
    status = 'high_attention';
    urgency = 'clinician_review';
    summary = 'LDL-C is in the severe hypercholesterolemia range used by the 2026 ACC/AHA dyslipidemia guideline. This warrants clinician-led risk and treatment review; Jaanch does not autonomously change medication.';
  } else if (triglycerides !== undefined && triglycerides >= 1000) {
    supporting.push('cvd.obs.triglycerides');
    edges.push(edge('cvd.obs.triglycerides', findingId, 'supports', 90));
    status = 'high_attention';
    urgency = 'clinician_review';
    summary = 'Triglycerides are at or above 1000 mg/dL, a range where the 2026 ACC/AHA dyslipidemia guideline highlights pancreatitis-prevention management. Prompt clinician review is appropriate; Jaanch does not prescribe therapy.';
  } else if (ldl !== undefined && ldl >= 160) {
    supporting.push('cvd.obs.ldl');
    edges.push(edge('cvd.obs.ldl', findingId, 'supports', 65));
    status = 'investigate';
    urgency = 'priority';
    summary = 'LDL-C is elevated enough to matter in contemporary primary-prevention risk discussion. Medication decisions still depend on age, ASCVD history, PREVENT-ASCVD risk and other risk enhancers that this prototype does not fully calculate.';
  } else {
    for (const id of ['cvd.obs.ldl','cvd.obs.hdl','cvd.obs.triglycerides','cvd.obs.totalCholesterol']) {
      if (nodes.some((item)=>item.id===id)) { contradicting.push(id); edges.push(edge(id, findingId, 'contradicts')); }
    }
  }

  if (ldl === undefined || triglycerides === undefined) {
    const id = 'cvd.missing.lipid_panel';
    missing.push(id);
    nodes.push(node(id, 'cardiovascular', 'missing', 'missing', 'Complete lipid context', 'LDL-C and triglycerides are not both available, so Jaanch keeps the lipid interpretation deliberately partial.', 'moderate', ['ldl','triglycerides']));
    edges.push(edge(id, findingId, 'missing_for'));
  }

  const finding: Finding = {
    id:findingId, domain:'cardiovascular', title:'Lipid / cholesterol evidence', status, urgency,
    confidence:confidenceFor('lab_informed', values.length), evidenceLevel:'lab_informed', summary,
    supportingEvidenceIds:supporting, contradictingEvidenceIds:contradicting, missingEvidenceIds:missing,
    actions: urgency === 'clinician_review'
      ? ['Review the measured lipid result and overall cardiovascular risk with a clinician; do not change prescription therapy from this app result alone.']
      : ['Keep the result in longitudinal follow-up and interpret it with overall cardiovascular risk rather than one isolated number.'],
  };
  return { matched:true, finding, evidenceNodes:nodes, evidenceEdges:edges, evidenceQuestionIds:['ldl','hdl','triglycerides','totalCholesterol','diagnosedConditions','medicationCategories'] };
}

function ironRule(a: Answers): RuleOutput {
  const findingId = 'NUT-IRON-001';
  const hemoglobin = numeric(a.hemoglobin);
  const ferritin = numeric(a.ferritin);
  const sex = String(a.sex || '');
  const concerns = list(a.currentConcerns);
  const diagnosed = list(a.diagnosedConditions);
  const diet = String(a.diet || '');
  const relevantWithoutLabs = concerns.includes('fatigue') || diagnosed.includes('anemia') || diagnosed.includes('vitamin_deficiency');
  if (hemoglobin === undefined && ferritin === undefined && !relevantWithoutLabs) return { matched:false, evidenceQuestionIds:['hemoglobin','ferritin','sex','currentConcerns','diagnosedConditions','diet'] };

  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];
  const supporting: string[] = [];
  const contradicting: string[] = [];
  const missing: string[] = [];
  const hbCutoff = sex === 'male' ? 13 : sex === 'female' ? 12 : undefined;

  if (hemoglobin !== undefined) {
    const id = 'nut.obs.hemoglobin';
    nodes.push(node(id,'nutrition','observed','lab','Hemoglobin',`${hemoglobin} g/dL`,'strong',['hemoglobin']));
    if (hbCutoff !== undefined && hemoglobin < hbCutoff) { supporting.push(id); edges.push(edge(id,findingId,'supports',85)); }
    else { contradicting.push(id); edges.push(edge(id,findingId,'contradicts')); }
  } else {
    const id='nut.missing.hemoglobin'; missing.push(id); nodes.push(node(id,'nutrition','missing','missing','Hemoglobin','No eligible hemoglobin result is available to assess anemia evidence.','moderate',['hemoglobin'])); edges.push(edge(id,findingId,'missing_for'));
  }

  if (ferritin !== undefined) {
    const id = 'nut.obs.ferritin';
    nodes.push(node(id,'nutrition','observed','lab','Ferritin',`${ferritin} ng/mL`,'strong',['ferritin']));
    if (ferritin < 15) { supporting.push(id); edges.push(edge(id,findingId,'supports',80)); }
    else { contradicting.push(id); edges.push(edge(id,findingId,'contradicts')); }
  } else {
    const id='nut.missing.ferritin'; missing.push(id); nodes.push(node(id,'nutrition','missing','missing','Ferritin','Ferritin is not available; iron stores remain partly uncertain.','moderate',['ferritin'])); edges.push(edge(id,findingId,'missing_for'));
  }

  const lowHb = hemoglobin !== undefined && hbCutoff !== undefined && hemoglobin < hbCutoff;
  const lowFerritin = ferritin !== undefined && ferritin < 15;
  let status: Finding['status']; let urgency: Finding['urgency']; let summary: string;
  if (lowHb) {
    status='high_attention'; urgency='clinician_review';
    summary = `Hemoglobin is below the WHO 2024 adult cutoff used by this prototype for ${sex === 'male' ? 'men' : 'nonpregnant women'} aged 15–65. This is anemia evidence, not a cause diagnosis; altitude, smoking, illness and other clinical factors can change interpretation.`;
  } else if (lowFerritin) {
    status='investigate'; urgency='priority';
    summary='Ferritin is below 15 ng/mL, the WHO cutoff for iron deficiency in apparently healthy adults. Inflammation can materially change ferritin interpretation, so cause and treatment require clinical context.';
  } else if (hemoglobin === undefined || ferritin === undefined) {
    status='insufficient_data'; urgency='routine';
    summary='The available evidence is incomplete for a bounded anemia/iron assessment. Jaanch avoids inferring iron deficiency from fatigue or diet alone.';
  } else {
    status='monitor'; urgency='routine';
    summary='Current eligible hemoglobin and ferritin do not cross the narrow WHO cutoffs used by this prototype, but this is not a complete anemia or iron-disorder evaluation and does not rule out clinically important causes.';
  }

  const evidenceCount=[hemoglobin,ferritin].filter((value)=>value!==undefined).length;
  const finding: Finding = {
    id:findingId, domain:'nutrition', title:'Anemia / iron evidence', status, urgency,
    confidence:confidenceFor(evidenceCount ? 'lab_informed' : 'insufficient', evidenceCount), evidenceLevel:evidenceCount ? 'lab_informed':'insufficient', summary,
    supportingEvidenceIds:supporting, contradictingEvidenceIds:contradicting, missingEvidenceIds:missing,
    actions: lowHb || lowFerritin
      ? ['Review the measured results, symptoms and possible causes with a clinician before starting a therapeutic iron regimen.']
      : missing.length ? ['Fill the smallest useful evidence gap if symptoms or clinical context justify it.'] : ['Keep the measured results with longitudinal context.'],
  };
  return { matched:true, finding, evidenceNodes:nodes, evidenceEdges:edges, evidenceQuestionIds:['hemoglobin','ferritin','sex','currentConcerns','diagnosedConditions','diet'] };
}

export const clinicalExpansionRules: AssessmentRule[] = [
  { id:'CVD-LIPID-001', version:'1.0.0', domain:'cardiovascular', kind:'finding', title:'Lipid / cholesterol evidence', enabled:true, maturity:'prototype', sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'], applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG', evaluate:lipidRule },
  { id:'NUT-IRON-001', version:'1.0.0', domain:'nutrition', kind:'finding', title:'Anemia / iron evidence', enabled:true, maturity:'prototype', sourceIds:['WHO-ANEMIA-2024','WHO-FERRITIN-2020'], applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG', evaluate:ironRule },
];
