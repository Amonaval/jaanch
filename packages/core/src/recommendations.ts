import { validateClinicalSourceIds } from './clinicalSources';
import { evaluateApplicability } from './applicability';
import { normalizeAnswers } from './answerNormalization';
import { m134RecommendationCandidates, m134RecommendationGovernanceArtifacts } from './m134Recommendations';
import type { Answers, AssessmentResult, Domain, SafetyActionClass, SafetyDisposition } from './types';

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationMaturity = 'prototype' | 'reviewed' | 'approved';

export type Recommendation = {
  id: string;
  domain: Exclude<Domain, 'baseline' | 'safety'>;
  title: string;
  actionClass: SafetyActionClass;
  priority: RecommendationPriority;
  disposition: SafetyDisposition;
  rationale: string;
  steps: string[];
  relatedFindingIds: string[];
  sourceIds: string[];
  maturity: RecommendationMaturity;
  safetyReasons: string[];
  applicabilityPolicyId: string;
};

export type SuppressedRecommendation = {
  id: string;
  title: string;
  applicabilityPolicyId: string;
  status: 'unsupported_context' | 'clinician_review';
  reasons: string[];
};

export type RecommendationPlan = {
  version: 'RECOMMENDATIONS-1.0.0';
  recommendations: Recommendation[];
  topRecommendationIds: string[];
  clinicianReviewIds: string[];
  blockedIds: string[];
  suppressed: SuppressedRecommendation[];
  blockedReason?: string;
  disclaimer: string;
};

type Candidate = Omit<Recommendation, 'disposition' | 'safetyReasons'> & { baseDisposition?: SafetyDisposition };
export type RecommendationGovernanceArtifact = { id:string; maturity:RecommendationMaturity; sourceIds:string[]; applicabilityPolicyId:string };

export const recommendationGovernanceArtifacts: RecommendationGovernanceArtifact[] = [
  { id:'REC-MET-ACTIVITY-001', maturity:'prototype', sourceIds:['ADA-2026-BEHAVIOR','WHO-PA-2020'], applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG' },
  { id:'REC-MET-NUTRITION-001', maturity:'prototype', sourceIds:['ADA-2026-BEHAVIOR'], applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG' },
  { id:'REC-MET-SCREEN-001', maturity:'prototype', sourceIds:['ADA-2026-DIAGNOSIS'], applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG' },
  { id:'REC-B12-CHECK-001', maturity:'prototype', sourceIds:['NIH-ODS-B12-HP'], applicabilityPolicyId:'APPL-B12-ADULT' },
  { id:'REC-B12-DIET-001', maturity:'prototype', sourceIds:['NIH-ODS-B12-HP'], applicabilityPolicyId:'APPL-B12-ADULT' },
  { id:'REC-B12-CLINICIAN-001', maturity:'prototype', sourceIds:['NIH-ODS-B12-HP'], applicabilityPolicyId:'APPL-B12-ADULT' },
  { id:'REC-SLEEP-ROUTINE-001', maturity:'prototype', sourceIds:['AASM-SLEEP-DURATION-2015'], applicabilityPolicyId:'APPL-SLEEP-ADULT' },
  { id:'REC-SLEEP-REVIEW-001', maturity:'prototype', sourceIds:['AASM-OSA-DIAGNOSTIC-2017'], applicabilityPolicyId:'APPL-SLEEP-ADULT' },
  ...m134RecommendationGovernanceArtifacts,
];

const dispositionRank: Record<SafetyDisposition, number> = { allowed: 0, caution: 1, clinician_review: 2, blocked: 3 };
const priorityRank: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };
const list = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];

function stricterDisposition(a: SafetyDisposition, b: SafetyDisposition): SafetyDisposition {
  return dispositionRank[a] >= dispositionRank[b] ? a : b;
}

function finding(result: AssessmentResult, id: string) {
  return result.findings.find((item) => item.id === id);
}

function hasInvestigation(result: AssessmentResult, ...ids: string[]) {
  return result.testPlan.recommendations.some((item) => ids.includes(item.id));
}

function candidatesFor(answers: Answers, result: AssessmentResult): Candidate[] {
  const candidates: Candidate[] = [];
  const metabolic = finding(result, 'MET-001');
  const nutrition = finding(result, 'NUT-001');
  const sleep = finding(result, 'SLP-001');
  const concerns = list(answers.currentConcerns);
  const diet = String(answers.diet || '');
  const age = Number(answers.age || 0);
  const metabolicActionable = Boolean(metabolic && ['investigate', 'high_attention'].includes(metabolic.status));
  const nutritionActionable = Boolean(nutrition && (['investigate', 'high_attention'].includes(nutrition.status) || concerns.includes('tingling')));

  if (metabolicActionable && metabolic) {
    candidates.push({ id:'REC-MET-ACTIVITY-001', domain:'metabolic', title:'Increase regular physical activity progressively', actionClass:'exercise', priority:metabolic.status==='high_attention'?'high':'medium', rationale:'Regular physical activity is a core modifiable factor for metabolic health; the plan should build from the current baseline rather than jump to an unsafe intensity.', steps:['Increase movement gradually from your current baseline.','Include both aerobic movement and strength work when appropriate for your health context.','Reduce long uninterrupted sedentary periods where practical.'], relatedFindingIds:[metabolic.id], sourceIds:['ADA-2026-BEHAVIOR','WHO-PA-2020'], maturity:'prototype', applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG' });
    candidates.push({ id:'REC-MET-NUTRITION-001', domain:'metabolic', title:'Improve overall eating-pattern quality', actionClass:'diet_guidance', priority:metabolic.status==='high_attention'?'high':'medium', rationale:'Metabolic-risk guidance should emphasize an individualized, sustainable eating pattern rather than a one-size-fits-all diet.', steps:['Prioritize minimally processed foods, vegetables, legumes, whole grains and appropriate protein sources.','Reduce sugar-sweetened drinks, refined grains and heavily processed foods where they are frequent.','Adapt the pattern to preferences, culture and clinical constraints.'], relatedFindingIds:[metabolic.id], sourceIds:['ADA-2026-BEHAVIOR'], maturity:'prototype', applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG' });
  }

  if (metabolicActionable && metabolic && hasInvestigation(result, 'LAB-HBA1C', 'LAB-FASTING-GLUCOSE')) candidates.push({ id:'REC-MET-SCREEN-001', domain:'metabolic', title:'Complete the prioritized glycemic check', actionClass:'monitoring', priority:metabolic.status==='high_attention'?'high':'medium', rationale:'A measured glycemic marker can replace uncertainty from questionnaire and body-measurement risk signals.', steps:['Use the investigation plan to choose the smallest useful screening set.','Enter the result with its unit and collection date so Jaanch can reassess.'], relatedFindingIds:[metabolic.id], sourceIds:['ADA-2026-DIAGNOSIS'], maturity:'prototype', applicabilityPolicyId:'APPL-METABOLIC-ADULT-NONPREG' });

  if (nutritionActionable && nutrition && hasInvestigation(result, 'LAB-B12')) candidates.push({ id:'REC-B12-CHECK-001', domain:'nutrition', title:'Resolve B12 uncertainty with a measured result', actionClass:'monitoring', priority:nutrition.status==='investigate'||concerns.includes('tingling')?'high':'medium', rationale:'Diet pattern and symptoms can raise suspicion, but treatment decisions should not be based on questionnaire evidence alone.', steps:['Complete the B12 investigation if clinically appropriate.','Enter the measured result with its collection date and unit for reassessment.'], relatedFindingIds:[nutrition.id], sourceIds:['NIH-ODS-B12-HP'], maturity:'prototype', applicabilityPolicyId:'APPL-B12-ADULT' });

  if ((diet === 'vegetarian' || diet === 'vegan') && nutrition) candidates.push({ id:'REC-B12-DIET-001', domain:'nutrition', title:'Make reliable vitamin B12 sources intentional', actionClass:'diet_guidance', priority:nutrition.status==='high_attention'?'medium':'low', rationale:'People following vegetarian or vegan diets can have higher risk of inadequate vitamin B12 intake.', steps:['Review whether your usual diet includes reliable B12-containing or fortified foods.','Do not use food advice as a substitute for evaluation when a measured low value or neurologic symptoms are present.'], relatedFindingIds:[nutrition.id], sourceIds:['NIH-ODS-B12-HP'], maturity:'prototype', applicabilityPolicyId:'APPL-B12-ADULT' });

  if (nutrition?.status === 'high_attention' && nutrition.evidenceLevel === 'lab_informed') candidates.push({ id:'REC-B12-CLINICIAN-001', domain:'nutrition', title:'Review the low B12 result and replacement plan with a clinician', actionClass:'therapeutic_supplement', priority:'high', baseDisposition:'clinician_review', rationale:'A measured low B12 result can justify clinical treatment consideration, but Jaanch does not choose a therapeutic dose or regimen autonomously.', steps:['Share the measured value, symptoms, diet pattern and current medicines/supplements with a clinician.','Use an individualized replacement and follow-up plan rather than an automatically generated high-dose regimen.'], relatedFindingIds:[nutrition.id], sourceIds:['NIH-ODS-B12-HP'], maturity:'prototype', applicabilityPolicyId:'APPL-B12-ADULT' });

  if (sleep && age >= 18 && ['monitor','investigate','high_attention'].includes(sleep.status) && (Number(answers.sleepHours || 0) < 7 || concerns.includes('sleep'))) candidates.push({ id:'REC-SLEEP-ROUTINE-001', domain:'sleep', title:'Protect a regular, adequate sleep window', actionClass:'general_lifestyle', priority:sleep.status==='investigate'?'medium':'low', rationale:'Adults generally need at least seven hours of regular sleep, while individual needs and clinical context can vary.', steps:['Keep sleep and wake times as consistent as practical.','Allow enough time for at least seven hours of sleep if you are an adult.','Track daytime functioning as well as hours slept.'], relatedFindingIds:[sleep.id], sourceIds:['AASM-SLEEP-DURATION-2015'], maturity:'prototype', applicabilityPolicyId:'APPL-SLEEP-ADULT' });

  if (sleep?.status === 'investigate' || answers.snoring === true) candidates.push({ id:'REC-SLEEP-REVIEW-001', domain:'sleep', title:'Consider clinician-led sleep-disorder evaluation', actionClass:'monitoring', priority:'high', baseDisposition:'clinician_review', rationale:'Loud snoring, unrefreshing sleep or a high sleep-screening signal should not be converted into an app diagnosis.', steps:['Discuss persistent symptoms with a clinician.','Use formal diagnostic testing only when clinically indicated after appropriate evaluation.'], relatedFindingIds:sleep?[sleep.id]:[], sourceIds:['AASM-OSA-DIAGNOSTIC-2017'], maturity:'prototype', applicabilityPolicyId:'APPL-SLEEP-ADULT' });

  candidates.push(...m134RecommendationCandidates(answers,result) as Candidate[]);
  return candidates;
}

export function buildRecommendationPlan(input: Answers, result: AssessmentResult): RecommendationPlan {
  const answers = normalizeAnswers(input).answers;
  if (result.safetyGate.urgent) return { version:'RECOMMENDATIONS-1.0.0', recommendations:[], topRecommendationIds:[], clinicianReviewIds:[], blockedIds:[], suppressed:[], blockedReason:'Routine recommendation planning is suppressed while an urgent red-flag pattern is active.', disclaimer:'Jaanch provides deterministic screening and prevention guidance, not diagnosis or autonomous prescription treatment.' };

  const candidates = candidatesFor(answers, result);
  const suppressed: SuppressedRecommendation[] = [];
  for (const candidate of candidates) {
    const sourceErrors = validateClinicalSourceIds(candidate.sourceIds);
    if (sourceErrors.length) throw new Error(`${candidate.id}: ${sourceErrors.join(' | ')}`);
  }

  const decisions = new Map(result.safetyGate.decisions.map((item) => [item.actionClass, item]));
  const recommendations = candidates.flatMap((candidate): Recommendation[] => {
    const applicability = evaluateApplicability(candidate.applicabilityPolicyId, answers);
    if (!applicability.applicable) {
      suppressed.push({ id:candidate.id, title:candidate.title, applicabilityPolicyId:candidate.applicabilityPolicyId, status:applicability.status==='applicable'?'unsupported_context':applicability.status, reasons:applicability.reasons });
      return [];
    }
    const safety = decisions.get(candidate.actionClass);
    return [{ ...candidate, disposition:stricterDisposition(candidate.baseDisposition ?? 'allowed', safety?.disposition ?? 'allowed'), safetyReasons:safety?.reasons ?? [] }];
  }).sort((a,b)=>priorityRank[a.priority]-priorityRank[b.priority] || dispositionRank[a.disposition]-dispositionRank[b.disposition] || a.title.localeCompare(b.title));

  const topRecommendationIds = recommendations.filter((item)=>item.disposition!=='blocked').slice(0,5).map((item)=>item.id);
  return { version:'RECOMMENDATIONS-1.0.0', recommendations, topRecommendationIds, clinicianReviewIds:recommendations.filter((item)=>item.disposition==='clinician_review').map((item)=>item.id), blockedIds:recommendations.filter((item)=>item.disposition==='blocked').map((item)=>item.id), suppressed, disclaimer:'Recommendations are screening/prevention guidance. Medication changes and therapeutic/high-dose supplement regimens are not autonomously prescribed by Jaanch.' };
}
