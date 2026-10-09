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
    id: 'LAB-HBA1C',
    title: 'HbA1c',
    kind: 'lab',
    description: 'A glycemic marker that can reduce uncertainty in the current adult nonpregnant metabolic screening finding.',
    resolvesEvidenceIds: ['met.missing.glycemic_marker'],
    alternativeGroup: 'glycemic-screening',
    utility: 90,
    maturity: 'prototype',
    sourceIds: ['ADA-2026-DIAGNOSIS'],
    applicabilityPolicyId: 'APPL-METABOLIC-ADULT-NONPREG',
  },
  {
    id: 'LAB-FASTING-GLUCOSE',
    title: 'Fasting glucose',
    kind: 'lab',
    description: 'An alternative glycemic marker for the same current adult nonpregnant metabolic evidence gap.',
    resolvesEvidenceIds: ['met.missing.glycemic_marker'],
    alternativeGroup: 'glycemic-screening',
    utility: 75,
    maturity: 'prototype',
    sourceIds: ['ADA-2026-DIAGNOSIS'],
    applicabilityPolicyId: 'APPL-METABOLIC-ADULT-NONPREG',
  },
  {
    id: 'LAB-B12',
    title: 'Vitamin B12',
    kind: 'lab',
    description: 'A measured B12 value can reduce the current adult nutrition/B12 evidence gap.',
    resolvesEvidenceIds: ['nut.missing.b12'],
    utility: 90,
    maturity: 'prototype',
    sourceIds: ['NIH-ODS-B12-HP'],
    applicabilityPolicyId: 'APPL-B12-ADULT',
  },
  {
    id:'MEASURE-BP',title:'Recent blood-pressure measurement',kind:'measurement',description:'A recent correctly measured blood-pressure reading can resolve missing current BP evidence when hypertension history/treatment context exists.',resolvesEvidenceIds:['cv.bp.missing.current'],utility:90,maturity:'prototype',sourceIds:['ESC-BP-2024'],applicabilityPolicyId:'APPL-BP-ADULT-NONPREG',
  },
  {
    id:'LAB-LIPID-PANEL',title:'Lipid panel',kind:'lab',description:'A current lipid panel can replace uncertainty when lipid-disorder or lipid-lowering-treatment context exists.',resolvesEvidenceIds:['cv.lipid.missing.panel'],utility:85,maturity:'prototype',sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'],applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG',
  },
  {
    id:'LAB-HEMOGLOBIN',title:'Hemoglobin',kind:'lab',description:'Measured haemoglobin can clarify whether depleted iron stores are accompanied by anaemia.',resolvesEvidenceIds:['nut.iron.missing.hemoglobin'],utility:90,maturity:'prototype',sourceIds:['WHO-ANAEMIA-2024'],applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG-18-65',
  },
  {
    id:'LAB-FERRITIN',title:'Ferritin',kind:'lab',description:'Measured ferritin can clarify depleted iron-store status when haemoglobin is low or iron/anaemia context is present.',resolvesEvidenceIds:['nut.iron.missing.ferritin'],utility:90,maturity:'prototype',sourceIds:['WHO-FERRITIN-2020'],applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG-18-65',
  },
  {
    id:'LAB-TSH',title:'TSH',kind:'lab',description:'TSH is the current structured thyroid marker used to reduce thyroid-evidence uncertainty in this adult prototype.',resolvesEvidenceIds:['met.thyroid.missing.tsh'],utility:85,maturity:'prototype',sourceIds:['NICE-THYROID-NG145'],applicabilityPolicyId:'APPL-THYROID-ADULT-NONPREG',
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
