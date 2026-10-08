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

export type Evidence = {
  label: string;
  detail: string;
  sourceQuestionIds: string[];
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
  summary: string;
  evidence: Evidence[];
  missingEvidence?: string[];
  actions: string[];
  ruleId?: string;
  ruleVersion?: string;
};

export type RuleTraceSummary = {
  id: string;
  version: string;
  domain: Domain;
  kind: 'finding' | 'red_flag';
  maturity: 'prototype' | 'reviewed' | 'approved';
  matched: boolean;
  evidenceQuestionIds: string[];
};

export type AssessmentResult = {
  findings: Finding[];
  evidenceCompleteness: number;
  answered: number;
  available: number;
  redFlags: string[];
  ruleTrace: RuleTraceSummary[];
};
