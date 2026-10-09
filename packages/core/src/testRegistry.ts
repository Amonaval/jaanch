import type { InvestigationDefinition } from './types';
import { validateClinicalSourceIds } from './clinicalSources';
import { applicabilityPolicy } from './applicability';

/**
 * Prototype investigation catalog.
 * These entries are evidence-resolution mappings, not prescriptions or medical orders.
 * Clinical sourcing is captured, but clinician review is still required before production approval.
 */
export const investigationCatalog: InvestigationDefinition[] = [
  {
    id: 'LAB-HBA1C', title: 'HbA1c', kind: 'lab',
    description: 'A glycemic marker that can reduce uncertainty in the current adult nonpregnant metabolic screening finding.',
    resolvesEvidenceIds: ['met.missing.glycemic_marker'], alternativeGroup: 'glycemic-screening', utility: 90, maturity: 'prototype', sourceIds: ['ADA-2026-DIAGNOSIS'], applicabilityPolicyId: 'APPL-METABOLIC-ADULT-NONPREG',
  },
  {
    id: 'LAB-FASTING-GLUCOSE', title: 'Fasting glucose', kind: 'lab',
    description: 'An alternative eligible glycemic marker for the same adult nonpregnant metabolic evidence gap.',
    resolvesEvidenceIds: ['met.missing.glycemic_marker'], alternativeGroup: 'glycemic-screening', utility: 80, maturity: 'prototype', sourceIds: ['ADA-2026-DIAGNOSIS'], applicabilityPolicyId: 'APPL-METABOLIC-ADULT-NONPREG',
  },
  {
    id: 'LAB-B12', title: 'Vitamin B12', kind: 'lab',
    description: 'A measured B12 value can reduce the current adult nutrition/B12 evidence gap.',
    resolvesEvidenceIds: ['nut.missing.b12'], utility: 90, maturity: 'prototype', sourceIds: ['NIH-ODS-B12-HP'], applicabilityPolicyId: 'APPL-B12-ADULT',
  },
  {
    id:'LAB-LIPID-PANEL', title:'Lipid profile', kind:'lab',
    description:'A measured lipid profile can resolve the deliberately narrow LDL/triglyceride evidence gap when lipid history or treatment context makes the module relevant.',
    resolvesEvidenceIds:['cvd.missing.lipid_panel'], utility:80, maturity:'prototype', sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'], applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG',
  },
  {
    id:'LAB-HEMOGLOBIN', title:'Hemoglobin', kind:'lab',
    description:'Measured hemoglobin can resolve the current adult nonpregnant anemia evidence gap; it does not establish the cause.',
    resolvesEvidenceIds:['nut.missing.hemoglobin'], utility:90, maturity:'prototype', sourceIds:['WHO-ANEMIA-2024'], applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG',
  },
  {
    id:'LAB-FERRITIN', title:'Ferritin', kind:'lab',
    description:'Measured ferritin can reduce iron-store uncertainty, with inflammation context still required for interpretation.',
    resolvesEvidenceIds:['nut.missing.ferritin'], utility:85, maturity:'prototype', sourceIds:['WHO-FERRITIN-2020'], applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG',
  },
];

export function validateInvestigationCatalog(catalog: InvestigationDefinition[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of catalog) {
    if (!item.id.trim()) errors.push('Investigation id is required.');
    if (ids.has(item.id)) errors.push(`Duplicate investigation id: ${item.id}`);
    ids.add(item.id);
    if (!item.resolvesEvidenceIds.length) errors.push(`${item.id}: at least one evidence gap is required.`);
    if (!Number.isFinite(item.utility) || item.utility < 0 || item.utility > 100) errors.push(`${item.id}: utility must be 0–100.`);
    for (const sourceError of validateClinicalSourceIds(item.sourceIds)) errors.push(`${item.id}: ${sourceError}`);
    if (!applicabilityPolicy(item.applicabilityPolicyId)) errors.push(`${item.id}: unknown applicability policy ${item.applicabilityPolicyId}.`);
  }
  return errors;
}
