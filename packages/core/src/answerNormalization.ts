import type { Answers, InputValidationIssue, InputValidationReport } from './types';

const EXCLUSIVE_NONE_FIELDS = ['diagnosedConditions', 'currentConcerns'] as const;

export function normalizeAnswers(input: Answers): { answers: Answers; report: InputValidationReport } {
  const answers: Answers = { ...input };
  const issues: InputValidationIssue[] = [];

  for (const field of EXCLUSIVE_NONE_FIELDS) {
    const value = answers[field];
    if (!Array.isArray(value)) continue;
    const items = value.map(String);
    if (items.includes('none') && items.length > 1) {
      const normalized = items.filter((item) => item !== 'none');
      answers[field] = normalized;
      issues.push({
        id: `exclusive-none:${field}`,
        field,
        severity: 'normalized',
        message: `Removed contradictory "none" selection because specific ${field === 'diagnosedConditions' ? 'conditions' : 'concerns'} were also selected.`,
      });
    }
  }

  if (answers.sex !== 'female' && answers.reproductiveContext !== undefined) {
    delete answers.reproductiveContext;
    issues.push({
      id: 'reproductive-context:not-female',
      field: 'reproductiveContext',
      severity: 'normalized',
      message: 'Removed reproductive context because the current questionnaire only applies that field when sex at birth is female.',
    });
  }

  return {
    answers,
    report: {
      normalized: issues.some((issue) => issue.severity === 'normalized'),
      issues,
    },
  };
}

export function removeBareLabAnswers(input: Answers, trustedAnswerIds: string[] = []): Answers {
  const trusted = new Set(trustedAnswerIds);
  const answers: Answers = { ...input };
  for (const answerId of ['hba1c', 'b12']) {
    if (!trusted.has(answerId)) delete answers[answerId];
  }
  return answers;
}
