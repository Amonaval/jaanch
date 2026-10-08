import type { Answers, AssessmentResult } from './types';
import { visibleQuestions } from './planner';
import { executeRules } from './ruleRegistry';
import { assessmentRules } from './rules';

export function assess(answers: Answers): AssessmentResult {
  const visible = visibleQuestions(answers);
  const answered = visible.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const execution = executeRules(assessmentRules, answers);
  return {
    findings: execution.findings,
    evidenceGraph: execution.evidenceGraph,
    evidenceCompleteness: Math.round((answered / Math.max(visible.length, 1)) * 100),
    answered,
    available: visible.length,
    redFlags: execution.redFlags,
    ruleTrace: execution.trace,
  };
}
