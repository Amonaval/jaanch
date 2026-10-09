import type { Recommendation, RecommendationPlan } from './recommendations';

export type RecommendationCard = {
  id: string;
  title: string;
  domainLabel: string;
  actionLabel: string;
  priorityLabel: string;
  dispositionLabel: string;
  rationale: string;
  steps: string[];
  sourceIds: string[];
  maturityLabel: string;
  safetyReasons: string[];
};

export type SuppressedRecommendationCard = {
  id: string;
  title: string;
  statusLabel: string;
  reasons: string[];
};

export type RecommendationViewModel = {
  title: string;
  blockedReason?: string;
  top: RecommendationCard[];
  additional: RecommendationCard[];
  blocked: RecommendationCard[];
  suppressed: SuppressedRecommendationCard[];
  disclaimer: string;
};

const domainLabels: Record<Recommendation['domain'], string> = {
  metabolic: 'Metabolic health', cardiovascular: 'Cardiovascular health', nutrition: 'Nutrition', sleep: 'Sleep', activity: 'Activity',
};
const actionLabels: Record<Recommendation['actionClass'], string> = {
  general_lifestyle: 'Lifestyle', diet_guidance: 'Diet guidance', exercise: 'Exercise', monitoring: 'Monitoring', routine_supplement: 'Routine supplement', therapeutic_supplement: 'Therapeutic supplement', medication_change: 'Medication change',
};
const priorityLabels = { high: 'High priority', medium: 'Medium priority', low: 'Lower priority' } as const;
const dispositionLabels = { allowed: 'Self-care guidance', caution: 'Use caution', clinician_review: 'Clinician review', blocked: 'Blocked' } as const;

function card(item: Recommendation): RecommendationCard {
  return {
    id: item.id,
    title: item.title,
    domainLabel: domainLabels[item.domain],
    actionLabel: actionLabels[item.actionClass],
    priorityLabel: priorityLabels[item.priority],
    dispositionLabel: dispositionLabels[item.disposition],
    rationale: item.rationale,
    steps: item.steps,
    sourceIds: item.sourceIds,
    maturityLabel: item.maturity === 'prototype' ? 'Prototype recommendation' : item.maturity === 'reviewed' ? 'Reviewed recommendation' : 'Approved recommendation',
    safetyReasons: item.safetyReasons,
  };
}

export function buildRecommendationViewModel(plan: RecommendationPlan): RecommendationViewModel {
  const topIds = new Set(plan.topRecommendationIds);
  const top = plan.recommendations.filter((item) => topIds.has(item.id)).map(card);
  const additional = plan.recommendations.filter((item) => !topIds.has(item.id) && item.disposition !== 'blocked').map(card);
  const blocked = plan.recommendations.filter((item) => item.disposition === 'blocked').map(card);
  const suppressed = plan.suppressed.map((item) => ({
    id: item.id,
    title: item.title,
    statusLabel: item.status === 'clinician_review' ? 'Needs clinician review/context' : 'Unsupported context',
    reasons: item.reasons,
  }));
  return { title: 'Your action plan', blockedReason: plan.blockedReason, top, additional, blocked, suppressed, disclaimer: plan.disclaimer };
}
