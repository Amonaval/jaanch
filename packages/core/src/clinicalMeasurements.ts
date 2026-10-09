import type { Answers } from './types';

export type M134ClinicalMeasurementMarker =
  | 'blood_pressure'
  | 'total_cholesterol'
  | 'ldl'
  | 'hdl'
  | 'triglycerides'
  | 'hemoglobin'
  | 'ferritin'
  | 'tsh';

type RecordedMeasurementLike = {
  id: string;
  markerId: string;
  label: string;
  value: string;
  unit?: string;
  collectedAt?: string;
  verification: 'user_confirmed' | 'unverified';
};

type NumericSpec = {
  markerId: Exclude<M134ClinicalMeasurementMarker, 'blood_pressure'>;
  canonicalUnit: string;
  acceptedUnits: string[];
  min: number;
  max: number;
  usableDays: number;
};

export type CanonicalClinicalMeasurement = {
  markerId: M134ClinicalMeasurementMarker;
  recordId: string;
  collectedAt: string;
  canonicalUnit: string;
  value?: number;
  systolic?: number;
  diastolic?: number;
};

export type ClinicalMeasurementEligibility = {
  eligible: boolean;
  issues: string[];
  canonical?: CanonicalClinicalMeasurement;
};

const DAY_MS = 86_400_000;
const INTERNAL_PREFIX = '__m134_';
const MATERIALIZED_CLINICAL_EVIDENCE = Symbol('jaanch.m134.materialized-clinical-evidence');

const numericSpecs: NumericSpec[] = [
  { markerId:'total_cholesterol', canonicalUnit:'mg/dL', acceptedUnits:['mg/dl'], min:50, max:1000, usableDays:730 },
  { markerId:'ldl', canonicalUnit:'mg/dL', acceptedUnits:['mg/dl'], min:5, max:600, usableDays:730 },
  { markerId:'hdl', canonicalUnit:'mg/dL', acceptedUnits:['mg/dl'], min:5, max:200, usableDays:730 },
  { markerId:'triglycerides', canonicalUnit:'mg/dL', acceptedUnits:['mg/dl'], min:10, max:5000, usableDays:730 },
  { markerId:'hemoglobin', canonicalUnit:'g/dL', acceptedUnits:['g/dl'], min:3, max:25, usableDays:365 },
  { markerId:'ferritin', canonicalUnit:'ng/mL', acceptedUnits:['ng/ml','µg/l','ug/l','mcg/l'], min:1, max:5000, usableDays:365 },
  { markerId:'tsh', canonicalUnit:'mIU/L', acceptedUnits:['miu/l','uiu/ml','µiu/ml','uiu/ml'], min:0.001, max:1000, usableDays:365 },
];

const numericSpecByMarker = new Map(numericSpecs.map((spec) => [spec.markerId, spec]));
const interpretedMarkers = new Set<M134ClinicalMeasurementMarker>(['blood_pressure', ...numericSpecs.map((spec) => spec.markerId)]);

function normalizedUnit(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, '');
}

function dateValue(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseBloodPressure(value: string) {
  const match = value.trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  if (!match) return undefined;
  const systolic = Number(match[1]);
  const diastolic = Number(match[2]);
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return undefined;
  return { systolic, diastolic };
}

function field(markerId: M134ClinicalMeasurementMarker, part: string) {
  return `${INTERNAL_PREFIX}${markerId}_${part}`;
}

export function clinicalMeasurementAnswerIds(markerId: M134ClinicalMeasurementMarker) {
  return markerId === 'blood_pressure'
    ? [field(markerId,'systolic'), field(markerId,'diastolic'), field(markerId,'date'), field(markerId,'id')]
    : [field(markerId,'value'), field(markerId,'unit'), field(markerId,'date'), field(markerId,'id')];
}

export function clinicalMeasurementEligibility(record: RecordedMeasurementLike, asOf = new Date().toISOString()): ClinicalMeasurementEligibility {
  const markerId = record.markerId as M134ClinicalMeasurementMarker;
  if (!interpretedMarkers.has(markerId)) return { eligible:false, issues:['Marker is not interpreted by M13.4.'] };
  const issues: string[] = [];
  if (record.verification !== 'user_confirmed') issues.push('Measurement is not user-confirmed.');
  const collected = dateValue(record.collectedAt);
  if (!collected) issues.push('A valid collection date is required.');
  const asOfDate = dateValue(asOf) ?? new Date();
  const ageDays = collected ? Math.floor((asOfDate.getTime() - collected.getTime()) / DAY_MS) : undefined;
  if (ageDays !== undefined && ageDays < 0) issues.push('Collection date is in the future.');

  if (markerId === 'blood_pressure') {
    const unit = normalizedUnit(record.unit);
    if (unit !== 'mmhg') issues.push('Blood pressure must use mmHg.');
    const parsed = parseBloodPressure(record.value);
    if (!parsed) issues.push('Blood pressure must be entered as systolic/diastolic, for example 120/80.');
    if (parsed && (parsed.systolic < 60 || parsed.systolic > 300 || parsed.diastolic < 30 || parsed.diastolic > 200 || parsed.systolic <= parsed.diastolic)) issues.push('Blood-pressure values are outside the configured plausible range.');
    if (ageDays !== undefined && ageDays > 90) issues.push('Blood-pressure measurement is older than the M13.4 90-day interpretation window.');
    if (issues.length || !parsed || !collected) return { eligible:false, issues };
    return { eligible:true, issues, canonical:{ markerId, recordId:record.id, collectedAt:collected.toISOString(), canonicalUnit:'mmHg', systolic:parsed.systolic, diastolic:parsed.diastolic } };
  }

  const spec = numericSpecByMarker.get(markerId as NumericSpec['markerId']);
  if (!spec) return { eligible:false, issues:['No canonical specification is configured for this marker.'] };
  const unit = normalizedUnit(record.unit);
  if (!unit || !spec.acceptedUnits.includes(unit)) issues.push(`Expected ${spec.canonicalUnit}; unit conversion is not silently inferred.`);
  const value = Number(record.value.trim());
  if (!Number.isFinite(value)) issues.push('A numeric value is required.');
  if (Number.isFinite(value) && (value < spec.min || value > spec.max)) issues.push('Value is outside the configured plausible range.');
  if (ageDays !== undefined && ageDays > spec.usableDays) issues.push(`Measurement is older than the M13.4 ${spec.usableDays}-day interpretation window.`);
  if (issues.length || !collected || !Number.isFinite(value)) return { eligible:false, issues };
  return { eligible:true, issues, canonical:{ markerId, recordId:record.id, collectedAt:collected.toISOString(), canonicalUnit:spec.canonicalUnit, value } };
}

export function isClinicallyInterpretedMeasurement(record: RecordedMeasurementLike, asOf?: string) {
  return clinicalMeasurementEligibility(record, asOf).eligible;
}

export function sanitizeInternalClinicalEvidence(input: Answers): Answers {
  const answers: Answers = {};
  for (const [key,value] of Object.entries(input)) if (!key.startsWith(INTERNAL_PREFIX)) answers[key] = value;
  return answers;
}

export function hasMaterializedClinicalEvidence(input: Answers) {
  return Boolean((input as Answers & { [MATERIALIZED_CLINICAL_EVIDENCE]?: boolean })[MATERIALIZED_CLINICAL_EVIDENCE]);
}

export function markMaterializedClinicalEvidence<T extends Answers>(answers: T): T {
  Object.defineProperty(answers, MATERIALIZED_CLINICAL_EVIDENCE, { value:true, enumerable:false, configurable:true });
  return answers;
}

export function inheritMaterializedClinicalEvidence<T extends Answers>(source: Answers, target: T): T {
  return hasMaterializedClinicalEvidence(source) ? markMaterializedClinicalEvidence(target) : target;
}

export function materializeClinicalMeasurementAnswers(input: Answers, records: RecordedMeasurementLike[], asOf = new Date().toISOString()): Answers {
  const answers = sanitizeInternalClinicalEvidence(input);
  const latest = new Map<M134ClinicalMeasurementMarker, CanonicalClinicalMeasurement>();
  for (const record of records) {
    const eligibility = clinicalMeasurementEligibility(record, asOf);
    const canonical = eligibility.canonical;
    if (!eligibility.eligible || !canonical) continue;
    const previous = latest.get(canonical.markerId);
    if (!previous || Date.parse(canonical.collectedAt) > Date.parse(previous.collectedAt)) latest.set(canonical.markerId, canonical);
  }
  for (const measurement of latest.values()) {
    answers[field(measurement.markerId,'id')] = measurement.recordId;
    answers[field(measurement.markerId,'date')] = measurement.collectedAt;
    answers[field(measurement.markerId,'unit')] = measurement.canonicalUnit;
    if (measurement.markerId === 'blood_pressure') {
      answers[field(measurement.markerId,'systolic')] = measurement.systolic as number;
      answers[field(measurement.markerId,'diastolic')] = measurement.diastolic as number;
    } else {
      answers[field(measurement.markerId,'value')] = measurement.value as number;
    }
  }
  return markMaterializedClinicalEvidence(answers);
}

export function readClinicalMeasurement(answers: Answers, markerId: M134ClinicalMeasurementMarker): CanonicalClinicalMeasurement | undefined {
  const recordId = answers[field(markerId,'id')];
  const collectedAt = answers[field(markerId,'date')];
  const canonicalUnit = answers[field(markerId,'unit')];
  if (typeof recordId !== 'string' || typeof collectedAt !== 'string' || typeof canonicalUnit !== 'string') return undefined;
  if (markerId === 'blood_pressure') {
    const systolic = Number(answers[field(markerId,'systolic')]);
    const diastolic = Number(answers[field(markerId,'diastolic')]);
    if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return undefined;
    return { markerId, recordId, collectedAt, canonicalUnit, systolic, diastolic };
  }
  const value = Number(answers[field(markerId,'value')]);
  if (!Number.isFinite(value)) return undefined;
  return { markerId, recordId, collectedAt, canonicalUnit, value };
}

export const m134InterpretedMeasurementMarkers = [...interpretedMarkers];
