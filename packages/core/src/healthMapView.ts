import { evidenceForFinding } from './evidenceGraph';
import type { AssessmentResult, Finding, SafetyActionClass, SafetyDisposition, TestRecommendation } from './types';

export type HealthMapTone = 'positive' | 'neutral' | 'attention' | 'high_attention' | 'urgent';

export type HealthMapEvidenceItem = {
  id: string;
  label: string;
  detail: string;
  sourceType: string;
};

export type HealthMapFindingCard = {
  id: string;
  domain: Finding['domain'];
  domainLabel: string;
  title: string;
  statusLabel: string;
  urgencyLabel: string;
  tone: HealthMapTone;
  score?: number;
  confidenceLabel: string;
  evidenceLevelLabel: string;
  summary: string;
  action?: string;
  supporting: HealthMapEvidenceItem[];
  contradicting: HealthMapEvidenceItem[];
  missing: HealthMapEvidenceItem[];
  ruleLabel: string;
};

export type HealthMapPriorityItem = {
  id: string;
  kind: 'urgent' | 'finding' | 'investigation' | 'safety';
  title: string;
  detail: string;
  tone: HealthMapTone;
};

export type HealthMapSafetyItem = {
  id: string;
  label: string;
  severityLabel: string;
  reason: string;
};

export type HealthMapActionRestriction = {
  actionClass: SafetyActionClass;
  actionLabel: string;
  disposition: SafetyDisposition;
  dispositionLabel: string;
  reasons: string[];
};

export type HealthMapInvestigationItem = {
  id: string;
  title: string;
  priorityLabel: string;
  rationale: string;
  maturityLabel: string;
  sourceIds: string[];
  selectedForMinimalSet: boolean;
};

export type HealthMapViewModel = {
  title: string;
  urgent: boolean;
  urgentMessages: string[];
  evidence: {
    completeness: number;
    answered: number;
    available: number;
    label: string;
  };
  topPriorities: HealthMapPriorityItem[];
  findings: HealthMapFindingCard[];
  safety: {
    flags: HealthMapSafetyItem[];
    restrictions: HealthMapActionRestriction[];
    clearLabel?: string;
  };
  investigations: {
    blockedReason?: string;
    minimal: HealthMapInvestigationItem[];
    alternatives: HealthMapInvestigationItem[];
    uncoveredEvidenceIds: string[];
    emptyLabel?: string;
    disclaimer: string;
  };
  governance: {
    referencedSourceIds: string[];
    prototypeRuleIds: string[];
    prototypeInvestigationIds: string[];
    label: string;
  };
};

const domainLabels: Record<Finding['domain'], string> = {
  metabolic: 'Metabolic health',
  cardiovascular: 'Cardiovascular health',
  nutrition: 'Nutrition',
  sleep: 'Sleep',
  activity: 'Activity',
};

const statusLabels: Record<Finding['status'], string> = {
  good: 'Looks good',
  monitor: 'Monitor',
  investigate: 'Needs investigation',
  high_attention: 'High attention',
  insufficient_data: 'Insufficient data',
};

const urgencyLabels: Record<Finding['urgency'], string> = {
  routine: 'Routine',
  monitor: 'Monitor',
  priority: 'Priority',
  clinician_review: 'Clinician review',
  urgent: 'Urgent',
};

const confidenceLabels: Record<Finding['confidence'], string> = {
  low: 'Low confidence',
  moderate: 'Moderate confidence',
  high: 'High confidence',
};

const evidenceLevelLabels: Record<Finding['evidenceLevel'], string> = {
  questionnaire_only: 'Questionnaire evidence',
  measurement_informed: 'Measurement-informed',
  lab_informed: 'Lab-informed',
  mixed: 'Mixed evidence',
  insufficient: 'Insufficient evidence',
};

const actionLabels: Record<SafetyActionClass, string> = {
  general_lifestyle: 'General lifestyle',
  diet_guidance: 'Diet guidance',
  exercise: 'Exercise',
  monitoring: 'Monitoring',
  routine_supplement: 'Routine supplements',
  therapeutic_supplement: 'Therapeutic / high-dose supplements',
  medication_change: 'Prescription medicine changes',
};

const dispositionLabels: Record<SafetyDisposition, string> = {
  allowed: 'Allowed',
  caution: 'Use caution',
  clinician_review: 'Clinician review',
  blocked: 'Blocked',
};

const priorityLabels: Record<TestRecommendation['priority'], string> = {
  essential: 'High assessment priority',
  recommended: 'Recommended',
  optional: 'Optional',
};

const urgencyRank: Record<Finding['urgency'], number> = {
  urgent: 0,
  clinician_review: 1,
  priority: 2,
  monitor: 3,
  routine: 4,
};

const statusRank: Record<Finding['status'], number> = {
  high_attention: 0,
  investigate: 1,
  insufficient_data: 2,
  monitor: 3,
  good: 4,
};

function findingTone(finding: Finding): HealthMapTone {
  if (finding.urgency === 'urgent') return 'urgent';
  if (finding.status === 'high_attention' || finding.urgency === 'clinician_review') return 'high_attention';
  if (finding.status === 'investigate' || finding.urgency === 'priority') return 'attention';
  if (finding.status === 'good') return 'positive';
  return 'neutral';
}

function evidenceItem(node: ReturnType<typeof evidenceForFinding>['supporting'][number]): HealthMapEvidenceItem {
  return { id: node.id, label: node.label, detail: node.detail, sourceType: node.sourceType };
}

function findingCard(result: AssessmentResult, finding: Finding): HealthMapFindingCard {
  const evidence = evidenceForFinding(result.evidenceGraph, finding);
  return {
    id: finding.id,
    domain: finding.domain,
    domainLabel: domainLabels[finding.domain],
    title: finding.title,
    statusLabel: statusLabels[finding.status],
    urgencyLabel: urgencyLabels[finding.urgency],
    tone: findingTone(finding),
    score: finding.score,
    confidenceLabel: confidenceLabels[finding.confidence],
    evidenceLevelLabel: evidenceLevelLabels[finding.evidenceLevel],
    summary: finding.summary,
    action: finding.actions[0],
    supporting: evidence.supporting.map(evidenceItem),
    contradicting: evidence.contradicting.map(evidenceItem),
    missing: evidence.missing.map(evidenceItem),
    ruleLabel: finding.ruleId ? `${finding.ruleId}@${finding.ruleVersion ?? '?'}` : 'Unversioned finding',
  };
}

function investigationItem(item: TestRecommendation): HealthMapInvestigationItem {
  return {
    id: item.id,
    title: item.title,
    priorityLabel: priorityLabels[item.priority],
    rationale: item.rationale,
    maturityLabel: item.maturity === 'prototype' ? 'Prototype mapping' : item.maturity === 'reviewed' ? 'Reviewed mapping' : 'Approved mapping',
    sourceIds: item.sourceIds,
    selectedForMinimalSet: item.selectedForMinimalSet,
  };
}

export function buildHealthMapViewModel(result: AssessmentResult): HealthMapViewModel {
  const orderedFindings = [...result.findings].sort((a, b) =>
    urgencyRank[a.urgency] - urgencyRank[b.urgency]
    || statusRank[a.status] - statusRank[b.status]
    || a.title.localeCompare(b.title),
  );
  const findingCards = orderedFindings.map((finding) => findingCard(result, finding));
  const restrictions = result.safetyGate.decisions
    .filter((item) => item.disposition !== 'allowed')
    .sort((a, b) => ({ blocked: 0, clinician_review: 1, caution: 2, allowed: 3 }[a.disposition] - ({ blocked: 0, clinician_review: 1, caution: 2, allowed: 3 }[b.disposition])))
    .map((item) => ({
      actionClass: item.actionClass,
      actionLabel: actionLabels[item.actionClass],
      disposition: item.disposition,
      dispositionLabel: dispositionLabels[item.disposition],
      reasons: item.reasons,
    }));

  const minimal = result.testPlan.recommendations.filter((item) => item.selectedForMinimalSet).map(investigationItem);
  const alternatives = result.testPlan.recommendations.filter((item) => !item.selectedForMinimalSet).map(investigationItem);

  const topPriorities: HealthMapPriorityItem[] = [];
  for (const message of result.redFlags) {
    topPriorities.push({ id: `urgent:${message}`, kind: 'urgent', title: 'Urgent evaluation', detail: message, tone: 'urgent' });
  }
  for (const finding of findingCards.filter((item) => item.tone === 'high_attention' || item.tone === 'attention').slice(0, 3)) {
    topPriorities.push({ id: `finding:${finding.id}`, kind: 'finding', title: finding.title, detail: `${finding.statusLabel}. ${finding.action ?? finding.summary}`, tone: finding.tone });
  }
  if (!result.safetyGate.urgent) {
    for (const item of minimal.slice(0, Math.max(0, 5 - topPriorities.length))) {
      topPriorities.push({ id: `investigation:${item.id}`, kind: 'investigation', title: `Check ${item.title}`, detail: item.rationale, tone: 'attention' });
    }
  }
  if (!topPriorities.length && restrictions.length) {
    const first = restrictions[0];
    topPriorities.push({ id: `safety:${first.actionClass}`, kind: 'safety', title: `${first.actionLabel}: ${first.dispositionLabel}`, detail: first.reasons[0] ?? 'Safety context applies.', tone: first.disposition === 'blocked' ? 'high_attention' : 'attention' });
  }

  return {
    title: 'Your Health Map',
    urgent: result.safetyGate.urgent,
    urgentMessages: result.redFlags,
    evidence: {
      completeness: result.evidenceCompleteness,
      answered: result.answered,
      available: result.available,
      label: `${result.evidenceCompleteness}% evidence completeness`,
    },
    topPriorities: topPriorities.slice(0, 5),
    findings: findingCards,
    safety: {
      flags: result.safetyGate.flags.map((flag) => ({ id: flag.id, label: flag.label, severityLabel: flag.severity === 'urgent' ? 'Urgent' : flag.severity === 'high_caution' ? 'High caution' : 'Caution', reason: flag.reason })),
      restrictions,
      clearLabel: result.safetyGate.flags.length ? undefined : 'No configured special-population safety flag was triggered.',
    },
    investigations: {
      blockedReason: result.testPlan.blockedReason,
      minimal,
      alternatives,
      uncoveredEvidenceIds: result.testPlan.uncoveredEvidenceIds,
      emptyLabel: !result.testPlan.blockedReason && !minimal.length ? 'No mapped investigation is currently needed to resolve known evidence gaps.' : undefined,
      disclaimer: 'Investigation priority describes how much the test may reduce assessment uncertainty; it is not a diagnosis or medical-necessity order.',
    },
    governance: {
      referencedSourceIds: result.clinicalGovernance.referencedSourceIds,
      prototypeRuleIds: result.clinicalGovernance.prototypeRuleIds,
      prototypeInvestigationIds: result.clinicalGovernance.prototypeInvestigationIds,
      label: 'Clinical sources are captured for traceability. Prototype status means the rule or mapping is not yet clinician-approved.',
    },
  };
}
