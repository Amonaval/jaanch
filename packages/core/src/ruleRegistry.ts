import type { Answers, Domain, Finding } from './types';

export type RuleKind = 'finding' | 'red_flag';
export type RuleMaturity = 'prototype' | 'reviewed' | 'approved';

export type RuleSource = {
  label: string;
  reference?: string;
};

export type RuleOutput = {
  matched: boolean;
  finding?: Finding;
  redFlag?: string;
  evidenceQuestionIds?: string[];
};

export type AssessmentRule = {
  id: string;
  version: string;
  domain: Domain;
  kind: RuleKind;
  title: string;
  enabled: boolean;
  maturity: RuleMaturity;
  sources: RuleSource[];
  evaluate: (answers: Answers) => RuleOutput;
};

export type RuleTrace = {
  id: string;
  version: string;
  domain: Domain;
  kind: RuleKind;
  maturity: RuleMaturity;
  matched: boolean;
  evidenceQuestionIds: string[];
};

export function validateRuleRegistry(rules: AssessmentRule[]): string[] {
  const errors: string[] = [];
  const keys = new Set<string>();
  for (const rule of rules) {
    if (!rule.id.trim()) errors.push('Rule id is required.');
    if (!/^\d+\.\d+\.\d+$/.test(rule.version)) errors.push(`${rule.id}: version must be semantic x.y.z.`);
    const key = `${rule.id}@${rule.version}`;
    if (keys.has(key)) errors.push(`${key}: duplicate rule version.`);
    keys.add(key);
    if (!rule.sources.length) errors.push(`${key}: at least one source/provenance entry is required.`);
  }
  return errors;
}

export function executeRules(rules: AssessmentRule[], answers: Answers) {
  const validationErrors = validateRuleRegistry(rules);
  if (validationErrors.length) throw new Error(`Invalid rule registry: ${validationErrors.join(' | ')}`);

  const findings: Finding[] = [];
  const redFlags: string[] = [];
  const trace: RuleTrace[] = [];
  for (const rule of rules.filter((item) => item.enabled)) {
    const output = rule.evaluate(answers);
    trace.push({
      id: rule.id,
      version: rule.version,
      domain: rule.domain,
      kind: rule.kind,
      maturity: rule.maturity,
      matched: output.matched,
      evidenceQuestionIds: output.evidenceQuestionIds ?? [],
    });
    if (output.finding) findings.push({ ...output.finding, ruleId: rule.id, ruleVersion: rule.version });
    if (output.redFlag) redFlags.push(output.redFlag);
  }
  return { findings, redFlags, trace };
}
