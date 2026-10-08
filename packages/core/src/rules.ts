import type { Answers, Domain, EvidenceEdge, EvidenceNode, Finding, FindingConfidence, EvidenceLevel } from './types';
import type { AssessmentRule, RuleOutput } from './ruleRegistry';

const concerns = (a: Answers) => Array.isArray(a.currentConcerns) ? a.currentConcerns : [];
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
  derivation?: string,
  derivedFromIds?: string[],
): EvidenceNode => ({ id, domain, kind, sourceType, label, detail, strength, provenance: { questionIds, derivation }, derivedFromIds });

const confidenceFor = (score: number, evidenceLevel: EvidenceLevel): FindingConfidence => {
  if (evidenceLevel === 'lab_informed' && score >= 70) return 'high';
  if (score >= 50) return 'moderate';
  return 'low';
};

function metabolicRule(a: Answers): RuleOutput {
  const findingId = 'MET-001';
  const age = Number(a.age || 0), h = Number(a.heightCm || 0) / 100, w = Number(a.weightKg || 0), waist = Number(a.waistCm || 0), days = Number(a.activityDays ?? 7);
  const bmi = h ? w / (h * h) : 0;
  let score = 0;
  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];
  const support: string[] = [];
  const missing: string[] = [];

  if (a.heightCm !== undefined) nodes.push(node('met.obs.height', 'metabolic', 'observed', 'measurement', 'Height', `${a.heightCm} cm`, 'moderate', ['heightCm']));
  if (a.weightKg !== undefined) nodes.push(node('met.obs.weight', 'metabolic', 'observed', 'measurement', 'Weight', `${a.weightKg} kg`, 'moderate', ['weightKg']));

  if (age >= 35) {
    score += 15; const id = 'met.obs.age'; support.push(id);
    nodes.push(node(id, 'metabolic', 'observed', 'questionnaire', 'Age', `${age} years`, 'moderate', ['age']));
    edges.push(edge(id, findingId, 'supports', 15));
  }
  if (bmi >= 25) {
    score += 25; const id = 'met.derived.bmi'; support.push(id);
    nodes.push(node(id, 'metabolic', 'derived', 'derived', 'BMI', bmi.toFixed(1), 'strong', ['heightCm','weightKg'], 'weightKg / (heightMeters²)', ['met.obs.height','met.obs.weight']));
    edges.push(edge(id, findingId, 'supports', 25));
  }
  if (waist >= 90) {
    score += 20; const id = 'met.obs.waist'; support.push(id);
    nodes.push(node(id, 'metabolic', 'observed', 'measurement', 'Waist circumference', `${waist} cm`, 'strong', ['waistCm']));
    edges.push(edge(id, findingId, 'supports', 20));
  }
  if (days < 3) {
    score += 15; const id = 'met.obs.activity'; support.push(id);
    nodes.push(node(id, 'metabolic', 'observed', 'questionnaire', 'Activity', `${days} active days/week`, 'moderate', ['activityDays']));
    edges.push(edge(id, findingId, 'supports', 15));
  }
  if (a.familyDiabetes === true) {
    score += 25; const id = 'met.obs.family_diabetes'; support.push(id);
    nodes.push(node(id, 'metabolic', 'observed', 'questionnaire', 'Family history', 'Parent/sibling with diabetes', 'strong', ['familyDiabetes']));
    edges.push(edge(id, findingId, 'supports', 25));
  }

  const hasLab = Number(a.hba1c || 0) > 0;
  if (!hasLab) {
    const id = 'met.missing.glycemic_marker'; missing.push(id);
    nodes.push(node(id, 'metabolic', 'missing', 'missing', 'Glycemic marker', 'HbA1c or fasting glucose is not available.', 'strong', ['hba1c']));
    edges.push(edge(id, findingId, 'missing_for'));
  }

  const evidenceLevel: EvidenceLevel = support.some((id) => id.includes('bmi') || id.includes('waist')) ? 'measurement_informed' : support.length ? 'questionnaire_only' : 'insufficient';
  const finding: Finding = {
    id: findingId, domain:'metabolic', title:'Metabolic screening risk',
    status: score >= 60 ? 'high_attention' : score >= 30 ? 'investigate' : 'monitor',
    urgency: score >= 60 ? 'priority' : 'routine', score: Math.min(score,100),
    confidence: confidenceFor(score, evidenceLevel), evidenceLevel,
    summary:'Prototype screening signals based on age, body composition, activity and family history; this score is not a diabetes probability.',
    supportingEvidenceIds: support, contradictingEvidenceIds: [], missingEvidenceIds: missing,
    actions: hasLab ? ['Interpret measured glucose markers with context.'] : ['Consider diabetes screening to reduce uncertainty.'],
  };
  return { matched:true, finding, evidenceNodes:nodes, evidenceEdges:edges, evidenceQuestionIds:['age','heightCm','weightKg','waistCm','activityDays','familyDiabetes','hba1c'] };
}

function nutritionRule(a: Answers): RuleOutput {
  const findingId = 'NUT-001';
  const diet = String(a.diet || ''); const current = concerns(a); const b12 = Number(a.b12 || 0);
  let score = 0;
  const nodes: EvidenceNode[] = []; const edges: EvidenceEdge[] = [];
  const support: string[] = []; const contradict: string[] = []; const missing: string[] = [];

  if (diet === 'vegetarian' || diet === 'vegan') {
    score += 35; const id = 'nut.obs.diet'; support.push(id);
    nodes.push(node(id, 'nutrition', 'observed', 'questionnaire', 'Diet pattern', diet, 'moderate', ['diet']));
    edges.push(edge(id, findingId, 'supports', 35));
  }
  if (current.includes('fatigue') || current.includes('tingling')) {
    score += 25; const id = 'nut.obs.symptoms'; support.push(id);
    nodes.push(node(id, 'nutrition', 'observed', 'questionnaire', 'Symptoms', 'Fatigue or tingling reported', 'moderate', ['currentConcerns']));
    edges.push(edge(id, findingId, 'supports', 25));
  }
  if (b12 > 0 && b12 < 200) {
    score = 90; const id = 'nut.obs.b12_low'; support.push(id);
    nodes.push(node(id, 'nutrition', 'observed', 'lab', 'Measured B12', `${b12} pg/mL`, 'decisive', ['b12']));
    edges.push(edge(id, findingId, 'supports', 90));
  } else if (b12 >= 200) {
    const id = 'nut.obs.b12_not_low_by_prototype_cutoff'; contradict.push(id);
    nodes.push(node(id, 'nutrition', 'observed', 'lab', 'Measured B12', `${b12} pg/mL does not meet this prototype rule's low-value cutoff.`, 'strong', ['b12']));
    edges.push(edge(id, findingId, 'contradicts'));
  } else {
    const id = 'nut.missing.b12'; missing.push(id);
    nodes.push(node(id, 'nutrition', 'missing', 'missing', 'Vitamin B12', 'Measured vitamin B12 is not available.', 'strong', ['b12']));
    edges.push(edge(id, findingId, 'missing_for'));
  }

  const evidenceLevel: EvidenceLevel = b12 > 0 ? 'lab_informed' : support.length ? 'questionnaire_only' : 'insufficient';
  const finding: Finding = {
    id:findingId, domain:'nutrition', title:'B12 / nutrition evidence',
    status: b12 > 0 && b12 < 200 ? 'high_attention' : score >= 50 ? 'investigate' : 'monitor',
    urgency: b12 > 0 && b12 < 200 ? 'clinician_review' : 'routine', score,
    confidence: confidenceFor(score, evidenceLevel), evidenceLevel,
    summary:'Questionnaire patterns may justify testing; measured values carry more weight and cutoff definitions can vary.',
    supportingEvidenceIds:support, contradictingEvidenceIds:contradict, missingEvidenceIds:missing,
    actions: b12 ? ['Review the measured result in context.'] : ['Consider B12 testing if risk factors or symptoms persist.'],
  };
  return { matched:true, finding, evidenceNodes:nodes, evidenceEdges:edges, evidenceQuestionIds:['diet','currentConcerns','b12'] };
}

function sleepRule(a: Answers): RuleOutput {
  const findingId = 'SLP-001';
  const hours = Number(a.sleepHours || 0), current = concerns(a);
  let score = 0; const nodes: EvidenceNode[] = []; const edges: EvidenceEdge[] = []; const support: string[] = [];
  if (hours && hours < 6) {
    score += 35; const id = 'slp.obs.duration'; support.push(id);
    nodes.push(node(id, 'sleep', 'observed', 'questionnaire', 'Sleep duration', `${hours} hours/night`, 'strong', ['sleepHours']));
    edges.push(edge(id, findingId, 'supports', 35));
  }
  if (current.includes('sleep')) {
    score += 20; const id = 'slp.obs.concern'; support.push(id);
    nodes.push(node(id, 'sleep', 'observed', 'questionnaire', 'Reported concern', 'Poor sleep', 'moderate', ['currentConcerns']));
    edges.push(edge(id, findingId, 'supports', 20));
  }
  if (a.snoring === true) {
    score += 35; const id = 'slp.obs.snoring'; support.push(id);
    nodes.push(node(id, 'sleep', 'observed', 'questionnaire', 'Snoring', 'Loud snoring / unrefreshing sleep', 'strong', ['snoring']));
    edges.push(edge(id, findingId, 'supports', 35));
  }
  const evidenceLevel: EvidenceLevel = support.length ? 'questionnaire_only' : 'insufficient';
  const finding: Finding = {
    id:findingId, domain:'sleep', title:'Sleep health',
    status: score >= 60 ? 'investigate' : score >= 25 ? 'monitor' : 'good', urgency: score >= 60 ? 'clinician_review' : 'routine', score,
    confidence: confidenceFor(score, evidenceLevel), evidenceLevel,
    summary:'Sleep duration and symptoms are screening signals only; Jaanch does not diagnose sleep apnea.',
    supportingEvidenceIds:support, contradictingEvidenceIds:[], missingEvidenceIds:[],
    actions: score >= 60 ? ['Consider clinician review for sleep-disorder evaluation.'] : ['Protect a consistent sleep window and monitor daytime functioning.'],
  };
  return { matched:true, finding, evidenceNodes:nodes, evidenceEdges:edges, evidenceQuestionIds:['sleepHours','currentConcerns','snoring'] };
}

export const assessmentRules: AssessmentRule[] = [
  { id:'MET-SCREEN-001', version:'1.2.0', domain:'metabolic', kind:'finding', title:'Metabolic screening risk', enabled:true, maturity:'prototype', sourceIds:['ADA-2026-DIAGNOSIS'], evaluate:metabolicRule },
  { id:'NUT-B12-001', version:'1.2.0', domain:'nutrition', kind:'finding', title:'B12 / nutrition screening', enabled:true, maturity:'prototype', sourceIds:['NIH-ODS-B12-HP'], evaluate:nutritionRule },
  { id:'SLP-SCREEN-001', version:'1.2.0', domain:'sleep', kind:'finding', title:'Sleep screening', enabled:true, maturity:'prototype', sourceIds:['AASM-OSA-DIAGNOSTIC-2017'], evaluate:sleepRule },
  {
    id:'SAFE-CHEST-001', version:'1.2.0', domain:'safety', kind:'red_flag', title:'Concerning chest pain escalation', enabled:true, maturity:'prototype',
    sourceIds:['CDC-HEART-ATTACK-2024'],
    evaluate:(answers) => {
      if (answers.redFlagChestPain !== true) return { matched:false, evidenceQuestionIds:['currentConcerns','redFlagChestPain'] };
      const evidenceNode = node('safe.obs.concerning_chest_pain', 'safety', 'observed', 'questionnaire', 'Concerning chest-pain pattern', 'Severe/new chest pain with associated concerning symptoms reported.', 'decisive', ['currentConcerns','redFlagChestPain']);
      return { matched:true, redFlag:'New or severe chest pain with associated concerning symptoms needs urgent medical evaluation rather than app assessment.', evidenceQuestionIds:['currentConcerns','redFlagChestPain'], evidenceNodes:[evidenceNode] };
    },
  },
];
