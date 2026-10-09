import type { ApplicabilityPolicy, ClinicalGovernanceReport, ClinicalSource, InvestigationDefinition } from './types';
import { validateApplicabilityPolicies } from './applicability';

export const clinicalSourceRegistry: ClinicalSource[] = [
  {
    id: 'ADA-2026-DIAGNOSIS',
    title: 'Standards of Care in Diabetes—2026: Diagnosis and Classification of Diabetes',
    issuingBody: 'American Diabetes Association Professional Practice Committee',
    url: 'https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes',
    publicationDate: '2025-12-08', versionLabel: '2026 Standards of Care', evidenceType: 'clinical_guideline',
    population: 'Adults undergoing risk assessment/screening for prediabetes or type 2 diabetes; pregnancy-specific diagnosis is outside this Jaanch mapping.',
    applicabilityNotes: ['Supports risk-factor-based screening and use of glycemic tests such as HbA1c or fasting glucose.','Current Jaanch metabolic scoring remains a prototype heuristic and is not an implementation of the guideline algorithm.','Asian ancestry has lower BMI screening thresholds in ADA guidance; Jaanch has not yet encoded ancestry-specific thresholds.'],
    sourceStatus: 'current', reviewStatus: 'captured', lastVerifiedOn: '2026-10-09',
  },
  {
    id: 'ADA-2026-BEHAVIOR',
    title: 'Standards of Care in Diabetes—2026: Facilitating Positive Health Behaviors and Well-being to Improve Health Outcomes',
    issuingBody: 'American Diabetes Association Professional Practice Committee',
    url: 'https://diabetesjournals.org/care/article/49/Supplement_1/S89/163932/5-Facilitating-Positive-Health-Behaviors-and-Well',
    versionLabel: '2026 Standards of Care', evidenceType: 'clinical_guideline',
    population: 'People with diabetes and people at risk for diabetes; recommendations require individualization for comorbidity and treatment context.',
    applicabilityNotes: ['Supports individualized nutrition guidance emphasizing overall food quality rather than one universal diet.','Supports assessing baseline activity and progressively increasing physical activity toward guideline-consistent levels.','Jaanch keeps these recommendations generic and safety-gated rather than prescribing a disease-specific exercise or calorie regimen.'],
    sourceStatus: 'current', reviewStatus: 'captured', lastVerifiedOn: '2026-10-09',
  },
  {
    id: 'WHO-PA-2020', title: 'WHO Guidelines on Physical Activity and Sedentary Behaviour', issuingBody: 'World Health Organization', url: 'https://www.who.int/publications/i/item/9789240015128', publicationDate: '2020-11-25', versionLabel: '2020 guideline', evidenceType: 'clinical_guideline',
    population: 'Children, adolescents, adults, older adults, pregnant/postpartum people, and people living with chronic conditions or disability.',
    applicabilityNotes: ['Supports regular physical activity and reduction of sedentary behavior across populations.','Jaanch uses the source for general activity guidance only; special populations remain constrained by the safety gate.'],
    sourceStatus: 'current', reviewStatus: 'captured', lastVerifiedOn: '2026-10-09',
  },
  {
    id: 'NIH-ODS-B12-HP', title: 'Vitamin B12 — Fact Sheet for Health Professionals', issuingBody: 'NIH Office of Dietary Supplements', url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/', evidenceType: 'government_fact_sheet',
    population: 'General population, including groups at increased risk of vitamin B12 inadequacy.',
    applicabilityNotes: ['Supports vegetarian/vegan dietary risk, fatigue/neurologic symptom context, and interpretation that serum B12 cutoffs vary by definition.','Jaanch does not use this source to authorize an automatic treatment regimen.'],
    sourceStatus: 'current', reviewStatus: 'captured', lastVerifiedOn: '2026-10-09',
  },
  {
    id: 'AASM-SLEEP-DURATION-2015', title: 'Recommended Amount of Sleep for a Healthy Adult: A Joint Consensus Statement of the AASM and Sleep Research Society', issuingBody: 'American Academy of Sleep Medicine and Sleep Research Society', url: 'https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf', publicationDate: '2015-06-01', versionLabel: 'J Clin Sleep Med. 2015;11(6):591–592', evidenceType: 'position_statement',
    population: 'Healthy adults; individual sleep need and clinical context can vary.', applicabilityNotes: ['Supports seven or more hours of regular sleep for healthy adults.','Jaanch does not apply the adult duration recommendation to pediatric users.'], sourceStatus: 'current', reviewStatus: 'captured', lastVerifiedOn: '2026-10-09',
  },
  {
    id: 'AASM-OSA-DIAGNOSTIC-2017', title: 'Clinical Practice Guideline for Diagnostic Testing for Adult Obstructive Sleep Apnea', issuingBody: 'American Academy of Sleep Medicine', url: 'https://aasm.org/resources/clinicalguidelines/diagnostic-testing-osa.pdf', publicationDate: '2017-03-15', versionLabel: 'J Clin Sleep Med. 2017;13(3)', evidenceType: 'clinical_guideline',
    population: 'Adults with concern for obstructive sleep apnea after comprehensive sleep evaluation.', applicabilityNotes: ['Supports collecting sleep history such as snoring, witnessed apneas/gasping and excessive sleepiness.','Jaanch screening must not diagnose OSA; clinician-led diagnostic testing is required.'], sourceStatus: 'current', reviewStatus: 'captured', lastVerifiedOn: '2026-10-09',
  },
  {
    id: 'CDC-HEART-ATTACK-2024', title: 'About Heart Attack Symptoms, Risk, and Recovery', issuingBody: 'U.S. Centers for Disease Control and Prevention', url: 'https://www.cdc.gov/heart-disease/about/heart-attack.html', publicationDate: '2024-10-24', evidenceType: 'public_health_guidance', population: 'General public with possible heart-attack symptoms.', applicabilityNotes: ['Supports urgent escalation for concerning chest discomfort with symptoms such as shortness of breath, faintness/sweating, or radiating discomfort.','Jaanch red-flag logic is intentionally conservative and does not diagnose myocardial infarction.'], sourceStatus: 'current', reviewStatus: 'captured', lastVerifiedOn: '2026-10-09',
  },
];

export function validateClinicalSourceRegistry(sources = clinicalSourceRegistry): string[] {
  const errors: string[] = []; const ids = new Set<string>();
  for (const source of sources) {
    if (!source.id.trim()) errors.push('Clinical source id is required.');
    if (ids.has(source.id)) errors.push(`Duplicate clinical source id: ${source.id}`); ids.add(source.id);
    if (!source.title.trim()) errors.push(`${source.id}: title is required.`);
    if (!source.issuingBody.trim()) errors.push(`${source.id}: issuing body is required.`);
    if (!source.url.startsWith('https://')) errors.push(`${source.id}: https URL is required.`);
    if (!source.population.trim()) errors.push(`${source.id}: population/applicability is required.`);
    if (!source.lastVerifiedOn) errors.push(`${source.id}: lastVerifiedOn is required.`);
  }
  return errors;
}

export function validateClinicalSourceIds(sourceIds: string[], sources = clinicalSourceRegistry): string[] {
  const known = new Set(sources.map((source) => source.id)); const errors: string[] = [];
  if (!sourceIds.length) errors.push('At least one clinical source id is required.');
  for (const id of sourceIds) if (!known.has(id)) errors.push(`Unknown clinical source id: ${id}`);
  return errors;
}

type GovernedArtifact = { id: string; maturity: 'prototype' | 'reviewed' | 'approved'; sourceIds: string[] };

export function buildClinicalGovernanceReport(
  rules: GovernedArtifact[],
  investigations: InvestigationDefinition[],
  recommendations: GovernedArtifact[] = [],
  applicabilityPolicies: ApplicabilityPolicy[] = [],
): ClinicalGovernanceReport {
  const registryErrors = [...validateClinicalSourceRegistry(), ...validateApplicabilityPolicies(applicabilityPolicies)];
  const known = new Set(clinicalSourceRegistry.map((source) => source.id));
  const referencedSourceIds = [...new Set([
    ...rules.flatMap((item) => item.sourceIds),
    ...investigations.flatMap((item) => item.sourceIds),
    ...recommendations.flatMap((item) => item.sourceIds),
    ...applicabilityPolicies.flatMap((item) => item.sourceIds),
  ])];
  const unresolvedSourceIds = referencedSourceIds.filter((id) => !known.has(id));
  return {
    registryErrors, referencedSourceIds, unresolvedSourceIds,
    prototypeRuleIds: rules.filter((item) => item.maturity === 'prototype').map((item) => item.id), reviewedRuleIds: rules.filter((item) => item.maturity === 'reviewed').map((item) => item.id), approvedRuleIds: rules.filter((item) => item.maturity === 'approved').map((item) => item.id),
    prototypeInvestigationIds: investigations.filter((item) => item.maturity === 'prototype').map((item) => item.id), reviewedInvestigationIds: investigations.filter((item) => item.maturity === 'reviewed').map((item) => item.id), approvedInvestigationIds: investigations.filter((item) => item.maturity === 'approved').map((item) => item.id),
    prototypeRecommendationIds: recommendations.filter((item) => item.maturity === 'prototype').map((item) => item.id), reviewedRecommendationIds: recommendations.filter((item) => item.maturity === 'reviewed').map((item) => item.id), approvedRecommendationIds: recommendations.filter((item) => item.maturity === 'approved').map((item) => item.id),
    prototypeApplicabilityPolicyIds: applicabilityPolicies.filter((item) => item.maturity === 'prototype').map((item) => item.id), reviewedApplicabilityPolicyIds: applicabilityPolicies.filter((item) => item.maturity === 'reviewed').map((item) => item.id), approvedApplicabilityPolicyIds: applicabilityPolicies.filter((item) => item.maturity === 'approved').map((item) => item.id),
    productPolicyIds: ['SAFETY-1.0.0', ...applicabilityPolicies.filter((item) => item.provenance === 'product_policy').map((item) => item.id)],
  };
}
