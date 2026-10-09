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

export type InputValidationIssue = {
  id: string;
  field: string;
  severity: 'normalized' | 'warning' | 'invalid';
  message: string;
};

export type InputValidationReport = {
  normalized: boolean;
  issues: InputValidationIssue[];
};

export type ApplicabilityStatus = 'applicable' | 'unsupported_context' | 'clinician_review';
export type ApplicabilityPolicy = {
  id: string;
  maturity: 'prototype' | 'reviewed' | 'approved';
  provenance: 'product_policy' | 'clinical_source';
  sourceIds: string[];
  description: string;
  minAge?: number;
  maxAge?: number;
  allowedSexValues?: string[];
  excludedReproductiveContexts?: string[];
  excludedDiagnosedConditions?: string[];
  requireKnownFemaleReproductiveContext?: boolean;
};

export type ApplicabilityDecision = {
  policyId: string;
  status: ApplicabilityStatus;
  applicable: boolean;
  reasons: string[];
};

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
  labRecordIds?: string[];
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
  sourceIds: string[];
  applicabilityPolicyId: string;
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
  sourceIds: string[];
  applicabilityPolicyId: string;
};

export type SuppressedInvestigation = {
  id: string;
  title: string;
  applicabilityPolicyId: string;
  status: Exclude<ApplicabilityStatus, 'applicable'>;
  reasons: string[];
};

export type TestPlan = {
  recommendations: TestRecommendation[];
  minimalSetIds: string[];
  uncoveredEvidenceIds: string[];
  suppressedRecommendations: SuppressedInvestigation[];
  blockedReason?: string;
};

export type ClinicalEvidenceType = 'clinical_guideline' | 'government_fact_sheet' | 'public_health_guidance' | 'position_statement';
export type ClinicalSourceStatus = 'current' | 'superseded' | 'unknown';
export type ClinicalSourceReviewStatus = 'captured' | 'reviewed' | 'approved';

export type ClinicalSource = {
  id: string;
  title: string;
  issuingBody: string;
  url: string;
  publicationDate?: string;
  versionLabel?: string;
  evidenceType: ClinicalEvidenceType;
  population: string;
  applicabilityNotes: string[];
  sourceStatus: ClinicalSourceStatus;
  reviewStatus: ClinicalSourceReviewStatus;
  lastVerifiedOn: string;
};

export type ClinicalGovernanceReport = {
  registryErrors: string[];
  referencedSourceIds: string[];
  unresolvedSourceIds: string[];
  prototypeRuleIds: string[];
  reviewedRuleIds: string[];
  approvedRuleIds: string[];
  prototypeInvestigationIds: string[];
  reviewedInvestigationIds: string[];
  approvedInvestigationIds: string[];
  prototypeRecommendationIds: string[];
  reviewedRecommendationIds: string[];
  approvedRecommendationIds: string[];
  prototypeApplicabilityPolicyIds: string[];
  reviewedApplicabilityPolicyIds: string[];
  approvedApplicabilityPolicyIds: string[];
  productPolicyIds: string[];
};

export type SafetyActionClass =
  | 'general_lifestyle'
  | 'diet_guidance'
  | 'exercise'
  | 'monitoring'
  | 'routine_supplement'
  | 'therapeutic_supplement'
  | 'medication_change';

export type SafetyDisposition = 'allowed' | 'caution' | 'clinician_review' | 'blocked';
export type SafetyFlagSeverity = 'context' | 'caution' | 'high_caution' | 'urgent';

export type SafetyFlag = {
  id: string;
  label: string;
  severity: SafetyFlagSeverity;
  reason: string;
  sourceQuestionIds: string[];
};

export type SafetyDecision = {
  actionClass: SafetyActionClass;
  disposition: SafetyDisposition;
  reasons: string[];
};

export type SafetyGate = {
  version: 'SAFETY-1.0.0';
  urgent: boolean;
  flags: SafetyFlag[];
  decisions: SafetyDecision[];
  summary: string[];
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
  sourceIds: string[];
  applicabilityPolicyId: string;
  applicabilityStatus: ApplicabilityStatus;
  applicabilityReasons: string[];
};

export type LabMarkerId =
  | 'hba1c'
  | 'vitamin_b12'
  | 'fasting_glucose'
  | 'total_cholesterol'
  | 'ldl'
  | 'hdl'
  | 'triglycerides'
  | 'hemoglobin'
  | 'ferritin';
export type LabSource = 'manual' | 'report' | 'import';
export type LabVerification = 'user_confirmed' | 'unverified';
export type LabFreshness = 'recent' | 'aging' | 'stale' | 'future_invalid';

export type LabReferenceRange = {
  low?: number;
  high?: number;
  unit: string;
  text?: string;
};

export type LabRecord = {
  id: string;
  markerId: LabMarkerId;
  value: number;
  unit: string;
  collectedAt: string;
  source: LabSource;
  verification: LabVerification;
  sourceLabel?: string;
  referenceRange?: LabReferenceRange;
};

export type NormalizedLabRecord = LabRecord & {
  canonicalUnit: string;
  normalizedValue: number;
  ageDays?: number;
  freshness: LabFreshness;
  eligibleForAssessment: boolean;
  issues: string[];
};

export type LabFindingChange = {
  findingId: string;
  title: string;
  beforeStatus: FindingStatus;
  afterStatus: FindingStatus;
  beforeEvidenceLevel: EvidenceLevel;
  afterEvidenceLevel: EvidenceLevel;
  beforeUrgency: Urgency;
  afterUrgency: Urgency;
};

export type LabReassessmentChanges = {
  findingChanges: LabFindingChange[];
  resolvedInvestigationIds: string[];
  addedInvestigationIds: string[];
  newlyResolvedEvidenceIds: string[];
};

export type AssessmentResult = {
  findings: Finding[];
  evidenceGraph: EvidenceGraph;
  testPlan: TestPlan;
  safetyGate: SafetyGate;
  clinicalGovernance: ClinicalGovernanceReport;
  inputValidation: InputValidationReport;
  evidenceCompleteness: number;
  answered: number;
  available: number;
  redFlags: string[];
  ruleTrace: RuleTraceSummary[];
};

export type LabReassessment = {
  asOf: string;
  before: AssessmentResult;
  after: AssessmentResult;
  normalizedLabs: NormalizedLabRecord[];
  appliedLabRecordIds: string[];
  changes: LabReassessmentChanges;
};
