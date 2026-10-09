import type { Answers, ApplicabilityDecision, ApplicabilityPolicy } from './types';

const list = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];

export const applicabilityPolicies: ApplicabilityPolicy[] = [
  {
    id: 'APPL-METABOLIC-ADULT-NONPREG',
    maturity: 'prototype',
    provenance: 'clinical_source',
    sourceIds: ['ADA-2026-DIAGNOSIS'],
    minAge: 18,
    excludedReproductiveContexts: ['pregnant', 'trying', 'unsure'],
    requireKnownFemaleReproductiveContext: true,
    description: 'Current metabolic screening heuristic is limited to adults and is not a pregnancy-specific diabetes algorithm.',
  },
  {
    id: 'APPL-B12-ADULT',
    maturity: 'prototype',
    provenance: 'product_policy',
    sourceIds: ['NIH-ODS-B12-HP'],
    minAge: 18,
    description: 'Current B12 interpretation is intentionally limited to adults until age-specific clinical review is implemented.',
  },
  {
    id: 'APPL-SLEEP-ADULT',
    maturity: 'prototype',
    provenance: 'clinical_source',
    sourceIds: ['AASM-OSA-DIAGNOSTIC-2017', 'AASM-SLEEP-DURATION-2015'],
    minAge: 18,
    description: 'Current sleep screening and adult sleep-duration guidance are adult-only.',
  },
  {
    id: 'APPL-LIPID-ADULT-NONPREG',
    maturity: 'prototype',
    provenance: 'clinical_source',
    sourceIds: ['AHA-ACC-DYSLIPIDEMIA-2026'],
    minAge: 18,
    excludedReproductiveContexts: ['pregnant', 'trying', 'unsure'],
    requireKnownFemaleReproductiveContext: true,
    description: 'Current Jaanch lipid interpretation is limited to nonpregnant adults; pregnancy-specific lipid management is outside this prototype rule.',
  },
  {
    id: 'APPL-IRON-ADULT-NONPREG',
    maturity: 'prototype',
    provenance: 'clinical_source',
    sourceIds: ['WHO-ANEMIA-2024', 'WHO-FERRITIN-2020'],
    minAge: 18,
    maxAge: 65,
    allowedSexValues: ['female','male'],
    excludedReproductiveContexts: ['pregnant', 'trying', 'unsure'],
    requireKnownFemaleReproductiveContext: true,
    description: 'Current anemia/iron interpretation uses WHO adult 15–65 nonpregnant cutoffs and requires male/female sex-at-birth context for the hemoglobin threshold.',
  },
  {
    id: 'APPL-RED-FLAG-GENERAL',
    maturity: 'prototype',
    provenance: 'clinical_source',
    sourceIds: ['CDC-HEART-ATTACK-2024'],
    description: 'Concerning chest-pain escalation remains available across configured populations; it is not a diagnosis.',
  },
];

const policyById = new Map(applicabilityPolicies.map((policy) => [policy.id, policy]));

export function applicabilityPolicy(id: string) {
  return policyById.get(id);
}

export function evaluateApplicability(policyId: string, answers: Answers): ApplicabilityDecision {
  const policy = policyById.get(policyId);
  if (!policy) {
    return { policyId, status: 'unsupported_context', applicable: false, reasons: [`Unknown applicability policy: ${policyId}`] };
  }

  const reasons: string[] = [];
  const age = typeof answers.age === 'number' ? answers.age : Number.NaN;
  if (policy.minAge !== undefined) {
    if (!Number.isFinite(age)) return { policyId, status: 'clinician_review', applicable: false, reasons: ['Age is required to determine whether this clinical logic is applicable.'] };
    if (age < policy.minAge) reasons.push(`Current logic is limited to age ${policy.minAge}+.`);
  }
  if (policy.maxAge !== undefined && Number.isFinite(age) && age > policy.maxAge) reasons.push(`Current logic is limited to age ${policy.maxAge} or younger.`);

  const sex = String(answers.sex || '');
  if (policy.allowedSexValues?.length) {
    if (!sex) return { policyId, status:'clinician_review', applicable:false, reasons:['Sex-at-birth context is required before applying this rule.'] };
    if (!policy.allowedSexValues.includes(sex)) reasons.push(`Current logic is not configured for sex-at-birth context: ${sex}.`);
  }
  const reproductive = String(answers.reproductiveContext || '');
  if (policy.requireKnownFemaleReproductiveContext && sex === 'female' && !reproductive) {
    return { policyId, status: 'clinician_review', applicable: false, reasons: ['Pregnancy/reproductive context is required before applying this rule.'] };
  }
  if (reproductive && policy.excludedReproductiveContexts?.includes(reproductive)) {
    reasons.push(`Current logic does not apply to reproductive context: ${reproductive}.`);
  }

  const diagnosed = list(answers.diagnosedConditions);
  for (const condition of policy.excludedDiagnosedConditions ?? []) {
    if (diagnosed.includes(condition)) reasons.push(`Current logic is not configured for diagnosed condition: ${condition}.`);
  }

  if (reasons.length) return { policyId, status: 'unsupported_context', applicable: false, reasons };
  return { policyId, status: 'applicable', applicable: true, reasons: [policy.description] };
}

export function validateApplicabilityPolicies(policies = applicabilityPolicies): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const policy of policies) {
    if (!policy.id.trim()) errors.push('Applicability policy id is required.');
    if (ids.has(policy.id)) errors.push(`Duplicate applicability policy id: ${policy.id}`);
    ids.add(policy.id);
    if (!policy.description.trim()) errors.push(`${policy.id}: description is required.`);
    if (policy.minAge !== undefined && policy.maxAge !== undefined && policy.minAge > policy.maxAge) errors.push(`${policy.id}: minAge must not exceed maxAge.`);
    if (policy.allowedSexValues && !policy.allowedSexValues.length) errors.push(`${policy.id}: allowedSexValues must not be empty when supplied.`);
  }
  return errors;
}
