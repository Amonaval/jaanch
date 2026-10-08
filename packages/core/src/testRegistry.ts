import type { InvestigationDefinition } from './types';
import { validateClinicalSourceIds } from './clinicalSources';

/**
 * Prototype investigation catalog.
 * These entries are evidence-resolution mappings, not prescriptions or medical orders.
 * Clinical sourcing is captured, but clinician review is still required before production approval.
 */
export const investigationCatalog: InvestigationDefinition[] = [
  {
    id: 'LAB-HBA1C',
    title: 'HbA1c',
    kind: 'lab',
    description: 'A glycemic marker that can reduce uncertainty in the current metabolic screening finding.',
    resolvesEvidenceIds: ['met.missing.glycemic_marker'],
    alternativeGroup: 'glycemic-screening',
    utility: 90,
    maturity: 'prototype',
    sourceIds: ['ADA-2026-DIAGNOSIS'],
  },
  {
    id: 'LAB-FASTING-GLUCOSE',
    title: 'Fasting glucose',
    kind: 'lab',
    description: 'An alternative glycemic marker for the same current metabolic evidence gap.',
    resolvesEvidenceIds: ['met.missing.glycemic_marker'],
    alternativeGroup: 'glycemic-screening',
    utility: 75,
    maturity: 'prototype',
    sourceIds: ['ADA-2026-DIAGNOSIS'],
  },
  {
    id: 'LAB-B12',
    title: 'Vitamin B12',
    kind: 'lab',
    description: 'A measured B12 value can reduce the current nutrition/B12 evidence gap.',
    resolvesEvidenceIds: ['nut.missing.b12'],
    utility: 90,
    maturity: 'prototype',
    sourceIds: ['NIH-ODS-B12-HP'],
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
  }
  return errors;
}
