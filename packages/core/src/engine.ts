import type { Answers, AssessmentResult, Evidence, Finding } from './types';
import { visibleQuestions } from './planner';

const ev = (label: string, detail: string, ids: string[]): Evidence => ({ label, detail, sourceQuestionIds: ids });

function metabolic(a: Answers): Finding {
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

function nutrition(a: Answers): Finding {
  const diet = String(a.diet || ''); const concerns = Array.isArray(a.currentConcerns) ? a.currentConcerns : [];
  let score = 0; const evidence: Evidence[] = [];
  if (diet === 'vegetarian' || diet === 'vegan') { score += 35; evidence.push(ev('Diet pattern', diet, ['diet'])); }
  if (concerns.includes('fatigue') || concerns.includes('tingling')) { score += 25; evidence.push(ev('Symptoms', 'Fatigue or tingling reported', ['currentConcerns'])); }
  const b12 = Number(a.b12 || 0); if (b12 > 0 && b12 < 200) { score = 90; evidence.push(ev('Measured B12', `${b12} pg/mL`, ['b12'])); }
  return { id:'NUT-001', domain:'nutrition', title:'B12 / nutrition evidence', status: b12 > 0 && b12 < 200 ? 'high_attention' : score >= 50 ? 'investigate' : 'monitor', urgency: b12 > 0 && b12 < 200 ? 'clinician_review' : 'routine', score, summary:'Questionnaire patterns may justify testing; measured values carry more weight.', evidence, missingEvidence: b12 ? [] : ['Vitamin B12'], actions: b12 ? ['Review the measured result in context.'] : ['Consider B12 testing if risk factors or symptoms persist.'] };
}

function sleep(a: Answers): Finding {
  const hours = Number(a.sleepHours || 0), concerns = Array.isArray(a.currentConcerns) ? a.currentConcerns : [];
  let score = 0; const evidence: Evidence[] = [];
  if (hours && hours < 6) { score += 35; evidence.push(ev('Sleep duration', `${hours} hours/night`, ['sleepHours'])); }
  if (concerns.includes('sleep')) { score += 20; evidence.push(ev('Reported concern', 'Poor sleep', ['currentConcerns'])); }
  if (a.snoring === true) { score += 35; evidence.push(ev('Snoring', 'Loud snoring / unrefreshing sleep', ['snoring'])); }
  return { id:'SLP-001', domain:'sleep', title:'Sleep health', status: score >= 60 ? 'investigate' : score >= 25 ? 'monitor' : 'good', urgency: score >= 60 ? 'clinician_review' : 'routine', score, summary:'Sleep duration and symptoms are screened separately from diagnosis.', evidence, actions: score >= 60 ? ['Consider clinician review for sleep-disorder screening.'] : ['Protect a consistent sleep window and monitor daytime functioning.'] };
}

export function assess(answers: Answers): AssessmentResult {
  const visible = visibleQuestions(answers); const answered = visible.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const redFlags = answers.redFlagChestPain === true ? ['New or severe chest pain with associated concerning symptoms needs urgent medical evaluation rather than app assessment.'] : [];
  return { findings:[metabolic(answers), nutrition(answers), sleep(answers)], evidenceCompleteness: Math.round((answered / Math.max(visible.length,1)) * 100), answered, available: visible.length, redFlags };
}
