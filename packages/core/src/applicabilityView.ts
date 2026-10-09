import type { AssessmentResult } from './types';

export type ApplicabilityNotice = {
  id: string;
  title: string;
  statusLabel: string;
  detail: string;
};

export type ApplicabilityViewModel = {
  title: string;
  notices: ApplicabilityNotice[];
  inputNotices: ApplicabilityNotice[];
  clearLabel?: string;
};

export function buildApplicabilityViewModel(result: AssessmentResult): ApplicabilityViewModel {
  const notices: ApplicabilityNotice[] = [];

  for (const trace of result.ruleTrace.filter((item) => item.applicabilityStatus !== 'applicable')) {
    notices.push({
      id: `rule:${trace.id}`,
      title: `${trace.domain} assessment not applied`,
      statusLabel: trace.applicabilityStatus === 'clinician_review' ? 'Needs context / clinician review' : 'Unsupported context',
      detail: trace.applicabilityReasons.join(' '),
    });
  }

  for (const item of result.testPlan.suppressedRecommendations) {
    notices.push({
      id: `investigation:${item.id}`,
      title: `${item.title} not shown as a routine next step`,
      statusLabel: item.status === 'clinician_review' ? 'Needs clinician review' : 'Unsupported context',
      detail: item.reasons.join(' '),
    });
  }

  const inputNotices = result.inputValidation.issues.map((issue) => ({
    id: `input:${issue.id}`,
    title: `Input normalized: ${issue.field}`,
    statusLabel: issue.severity === 'invalid' ? 'Invalid input' : issue.severity === 'warning' ? 'Check input' : 'Normalized',
    detail: issue.message,
  }));

  return {
    title: 'Applicability & evidence integrity',
    notices,
    inputNotices,
    clearLabel: !notices.length && !inputNotices.length ? 'No configured applicability or input-integrity limitation was triggered.' : undefined,
  };
}
