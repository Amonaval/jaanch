import type { Answers, Evidence, Finding } from './types';
import type { AssessmentRule } from './ruleRegistry';

const ev = (label: string, detail: string, ids: string[]): Evidence => ({ label, detail, sourceQuestionIds: ids });
const concerns = (a: Answers) => Array.isArray(a.currentConcerns) ? a.currentConcerns : [];

function metabolicFinding(a: Answers): Finding {
  const age = Number(a.age || 0), h = Number(a.heightCm || 0) / 100, w = Number(a.weightKg || 0), waist = Number(a.waistCm || 0), days = Number(a.activityDays ?? 7);
  const bmi = h ? w / (h * h) : 0;
  let score = 0; const evidence: Evidence[] = [];
  if (age >= 35) { score += 15; evidence.push(ev('Age', `${age} years`, ['age'])); }
  if (bmi >= 25) { score += 25; evidence.push(ev('BMI', bmi.toFixed(1), ['heightCm','weightKg'])); }
  if (waist >= 90) { score += 20; evidence.push(ev('Waist', `${waist} cm`, ['waistCm'])); }
  if (days < 3) { score += 15; evidence.push(ev('Activity', `${days} active days/week`, ['activityDays'])); }
  if (a.familyDiabetes === true) { score += 25; evidence.push(ev('Family history', 'Parent/sibling with diabetes', ['familyDiabetes'])); }
  const hasLab = Number(a.hba1c || 0) > 0;
  return { id:'MET-001', domain:'metabolic', title:'Metabolic screening risk', status: score >= 60 ? 'high_attention' : score >= 30 ? 'investigate' : 'monitor', urgency: score >= 60 ? 'priority' : 'routine', score: Math.min(score,100), summary:'Screening signals based on age, body composition, activity and family history.', evidence, missingEvidence: hasLab ? [] : ['HbA1c or fasting glucose'], actions: hasLab ? ['Interpret measured glucose markers with context.'] : ['Consider diabetes screening to reduce uncertainty.'] };
}

function nutritionFinding(a: Answers): Finding {
  const diet = String(a.diet || ''); const current = concerns(a);
  let score = 0; const evidence: Evidence[] = [];
  if (diet === 'vegetarian' || diet === 'vegan') { score += 35; evidence.push(ev('Diet pattern', diet, ['diet'])); }
  if (current.includes('fatigue') || current.includes('tingling')) { score += 25; evidence.push(ev('Symptoms', 'Fatigue or tingling reported', ['currentConcerns'])); }
  const b12 = Number(a.b12 || 0); if (b12 > 0 && b12 < 200) { score = 90; evidence.push(ev('Measured B12', `${b12} pg/mL`, ['b12'])); }
  return { id:'NUT-001', domain:'nutrition', title:'B12 / nutrition evidence', status: b12 > 0 && b12 < 200 ? 'high_attention' : score >= 50 ? 'investigate' : 'monitor', urgency: b12 > 0 && b12 < 200 ? 'clinician_review' : 'routine', score, summary:'Questionnaire patterns may justify testing; measured values carry more weight.', evidence, missingEvidence: b12 ? [] : ['Vitamin B12'], actions: b12 ? ['Review the measured result in context.'] : ['Consider B12 testing if risk factors or symptoms persist.'] };
}

function sleepFinding(a: Answers): Finding {
  const hours = Number(a.sleepHours || 0), current = concerns(a);
  let score = 0; const evidence: Evidence[] = [];
  if (hours && hours < 6) { score += 35; evidence.push(ev('Sleep duration', `${hours} hours/night`, ['sleepHours'])); }
  if (current.includes('sleep')) { score += 20; evidence.push(ev('Reported concern', 'Poor sleep', ['currentConcerns'])); }
  if (a.snoring === true) { score += 35; evidence.push(ev('Snoring', 'Loud snoring / unrefreshing sleep', ['snoring'])); }
  return { id:'SLP-001', domain:'sleep', title:'Sleep health', status: score >= 60 ? 'investigate' : score >= 25 ? 'monitor' : 'good', urgency: score >= 60 ? 'clinician_review' : 'routine', score, summary:'Sleep duration and symptoms are screened separately from diagnosis.', evidence, actions: score >= 60 ? ['Consider clinician review for sleep-disorder screening.'] : ['Protect a consistent sleep window and monitor daytime functioning.'] };
}

export const assessmentRules: AssessmentRule[] = [
  {
    id: 'MET-SCREEN-001', version: '1.0.0', domain: 'metabolic', kind: 'finding', title: 'Metabolic screening risk', enabled: true, maturity: 'prototype',
    sources: [{ label: 'Prototype screening heuristic — clinical sourcing required before production.' }],
    evaluate: (answers) => ({ matched: true, finding: metabolicFinding(answers), evidenceQuestionIds: ['age','heightCm','weightKg','waistCm','activityDays','familyDiabetes','hba1c'] }),
  },
  {
    id: 'NUT-B12-001', version: '1.0.0', domain: 'nutrition', kind: 'finding', title: 'B12 / nutrition screening', enabled: true, maturity: 'prototype',
    sources: [{ label: 'Prototype nutrition heuristic — clinical sourcing required before production.' }],
    evaluate: (answers) => ({ matched: true, finding: nutritionFinding(answers), evidenceQuestionIds: ['diet','currentConcerns','b12'] }),
  },
  {
    id: 'SLP-SCREEN-001', version: '1.0.0', domain: 'sleep', kind: 'finding', title: 'Sleep screening', enabled: true, maturity: 'prototype',
    sources: [{ label: 'Prototype sleep heuristic — clinical sourcing required before production.' }],
    evaluate: (answers) => ({ matched: true, finding: sleepFinding(answers), evidenceQuestionIds: ['sleepHours','currentConcerns','snoring'] }),
  },
  {
    id: 'SAFE-CHEST-001', version: '1.0.0', domain: 'safety', kind: 'red_flag', title: 'Concerning chest pain escalation', enabled: true, maturity: 'prototype',
    sources: [{ label: 'Safety prototype — emergency wording and clinical source review required before production.' }],
    evaluate: (answers) => answers.redFlagChestPain === true
      ? { matched: true, redFlag: 'New or severe chest pain with associated concerning symptoms needs urgent medical evaluation rather than app assessment.', evidenceQuestionIds: ['currentConcerns','redFlagChestPain'] }
      : { matched: false, evidenceQuestionIds: ['currentConcerns','redFlagChestPain'] },
  },
];
