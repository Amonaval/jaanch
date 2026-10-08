export type QuestionType = 'single' | 'multi' | 'number' | 'boolean';
export type Domain = 'baseline' | 'metabolic' | 'cardiovascular' | 'nutrition' | 'sleep' | 'activity' | 'safety';

export type Option = { value: string; label: string; hint?: string };

export type Condition = {
  questionId: string;
  operator: 'eq' | 'neq' | 'includes' | 'gte' | 'lte';
  value: string | number | boolean;
};

export type Question = {
  id: string;
  domain: Domain;
  priority: number;
  title: string;
  description?: string;
  type: QuestionType;
  options?: Option[];
  unit?: string;
  min?: number;
  max?: number;
  showWhen?: Condition[];
  master?: boolean;
};

export type AnswerValue = string | number | boolean | string[];
export type Answers = Record<string, AnswerValue>;

export type EvidenceNodeKind = 'observed' | 'derived' | 'missing';
export type EvidenceSourceType = 'questionnaire' | 'measurement' | 'lab' | 'derived' | 'missing';
export type EvidenceStrength = 'weak' | 'moderate' | 'strong' | 'decisive';
export type EvidenceRelation = 'supports' | 'contradicts' | 'missing_for';
export type FindingConfidence = 'low' | 'moderate' | 'high';
export type EvidenceLevel = 'questionnaire_only' | 'measurement_informed' | 'lab_informed' | 'mixed' | 'insufficient';

export type EvidenceProvenance = {
  questionIds: string[];
  ruleId?: string;
  ruleVersion?: string;
  derivation?: string;
};

export type EvidenceNode = {
  id: string;
  domain: Domain;
  kind: EvidenceNodeKind;
  sourceType: EvidenceSourceType;
  label: string;
  detail: string;
  strength: EvidenceStrength;
  provenance: EvidenceProvenance;
  derivedFromIds?: string[];
};

export type EvidenceEdge = {
  evidenceId: string;
  findingId: string;
  relation: EvidenceRelation;
  weight?: number;
};

export type EvidenceGraph = {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
};

export type FindingStatus = 'good' | 'monitor' | 'investigate' | 'high_attention' | 'insufficient_data';
export type Urgency = 'routine' | 'monitor' | 'priority' | 'clinician_review' | 'urgent';

export type Finding = {
  id: string;
  domain: Exclude<Domain, 'baseline' | 'safety'>;
  title: string;
  status: FindingStatus;
  urgency: Urgency;
  score?: number;
  confidence: FindingConfidence;
  evidenceLevel: EvidenceLevel;
  summary: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  missingEvidenceIds: string[];
  actions: string[];
  ruleId?: string;
  ruleVersion?: string;
};

export type InvestigationPriority = 'essential' | 'recommended' | 'optional';
export type InvestigationKind = 'lab' | 'measurement' | 'screening';
export type InvestigationMaturity = 'prototype' | 'reviewed' | 'approved';

export type InvestigationDefinition = {
  id: string;
  title: string;
  kind: InvestigationKind;
  description: string;
  resolvesEvidenceIds: string[];
  alternativeGroup?: string;
  utility: number;
  maturity: InvestigationMaturity;
  sources: string[];
};

export type TestRecommendation = {
  id: string;
  title: string;
  kind: InvestigationKind;
  priority: InvestigationPriority;
  rationale: string;
  relatedFindingIds: string[];
  resolvesEvidenceIds: string[];
  alternativeGroup?: string;
  selectedForMinimalSet: boolean;
  maturity: InvestigationMaturity;
};

export type TestPlan = {
  recommendations: TestRecommendation[];
  minimalSetIds: string[];
  uncoveredEvidenceIds: string[];
  blockedReason?: string;
};

export type RuleTraceSummary = {
  id: string;
  version: string;
  domain: Domain;
  kind: 'finding' | 'red_flag';
  maturity: 'prototype' | 'reviewed' | 'approved';
  matched: boolean;
  evidenceQuestionIds: string[];
  evidenceNodeIds: string[];
};

export type AssessmentResult = {
  findings: Finding[];
  evidenceGraph: EvidenceGraph;
  testPlan: TestPlan;
  evidenceCompleteness: number;
  answered: number;
  available: number;
  redFlags: string[];
  ruleTrace: RuleTraceSummary[];
};
