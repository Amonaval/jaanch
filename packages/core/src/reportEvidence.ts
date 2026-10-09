import type { LabRecord } from './types';
import type { RecordedMeasurement } from './intake';

export type ReportAssetKind = 'pdf' | 'image' | 'text' | 'unknown';
export type ReportExtractionMethod = 'manual' | 'pasted_text' | 'provider';

export type ReportProvenance = {
  reportId: string;
  fileName: string;
  kind: ReportAssetKind;
  mimeType?: string;
  sizeBytes?: number;
  importedAt: string;
  extractionMethod: ReportExtractionMethod;
  extractionProvider?: string;
  extractionProviderVersion?: string;
};

export type ReportEvidenceCandidateStatus = 'candidate' | 'needs_clarification' | 'confirmed' | 'rejected';

export type ReportEvidenceCandidate = {
  id: string;
  reportId: string;
  rawLabel: string;
  markerId: string;
  label: string;
  value: string;
  numericValue?: number;
  unit?: string;
  collectedAt?: string;
  referenceRange?: string;
  extractionConfidence?: number;
  status: ReportEvidenceCandidateStatus;
  issues: string[];
  provenance: ReportProvenance;
};

export type ReportLabRecord = LabRecord & {
  reportProvenance: ReportProvenance;
  candidateId: string;
  extractionConfidence?: number;
};

export type ReportRecordedMeasurement = RecordedMeasurement & {
  reportProvenance: ReportProvenance;
  candidateId: string;
  extractionConfidence?: number;
};

export type ConfirmedReportEvidence = {
  candidateId: string;
  lab?: ReportLabRecord;
  recorded?: ReportRecordedMeasurement;
  issues: string[];
};

export type ReportCandidateExtractor = {
  id: string;
  version: string;
  extract(input: { text: string; provenance: ReportProvenance; defaultCollectedAt?: string }): Promise<ReportEvidenceCandidate[]>;
};

type MarkerDefinition = {
  markerId: string;
  label: string;
  aliases: RegExp[];
  defaultUnit?: string;
  interpreted?: 'hba1c' | 'vitamin_b12';
};

const markerDefinitions: MarkerDefinition[] = [
  { markerId:'hba1c', label:'HbA1c', aliases:[/\bhba1c\b/i,/glycated\s+ha?emoglobin/i], defaultUnit:'%', interpreted:'hba1c' },
  { markerId:'vitamin_b12', label:'Vitamin B12', aliases:[/vitamin\s*b\s*12/i,/\bb12\b/i], defaultUnit:'pg/mL', interpreted:'vitamin_b12' },
  { markerId:'vitamin_d_25oh', label:'Vitamin D (25-OH)', aliases:[/25[\s-]*(?:oh|hydroxy).*vitamin\s*d/i,/vitamin\s*d(?:\s*\(25[-\s]?oh\))?/i], defaultUnit:'ng/mL' },
  { markerId:'fasting_glucose', label:'Fasting glucose', aliases:[/fasting\s+(?:blood\s+)?glucose/i,/\bfbs\b/i], defaultUnit:'mg/dL' },
  { markerId:'random_glucose', label:'Random glucose', aliases:[/random\s+(?:blood\s+)?glucose/i,/\brbs\b/i], defaultUnit:'mg/dL' },
  { markerId:'total_cholesterol', label:'Total cholesterol', aliases:[/total\s+cholesterol/i,/cholesterol\s*total/i], defaultUnit:'mg/dL' },
  { markerId:'ldl', label:'LDL cholesterol', aliases:[/\bldl(?:[-\s]?c)?\b/i,/low\s+density\s+lipoprotein/i], defaultUnit:'mg/dL' },
  { markerId:'hdl', label:'HDL cholesterol', aliases:[/\bhdl(?:[-\s]?c)?\b/i,/high\s+density\s+lipoprotein/i], defaultUnit:'mg/dL' },
  { markerId:'triglycerides', label:'Triglycerides', aliases:[/\btriglycerides?\b/i,/\btg\b/i], defaultUnit:'mg/dL' },
  { markerId:'hemoglobin', label:'Hemoglobin', aliases:[/\bha?emoglobin\b/i,/\bhgb\b/i], defaultUnit:'g/dL' },
  { markerId:'ferritin', label:'Ferritin', aliases:[/\bferritin\b/i], defaultUnit:'ng/mL' },
  { markerId:'tsh', label:'TSH', aliases:[/thyroid\s+stimulating\s+hormone/i,/\btsh\b/i], defaultUnit:'mIU/L' },
  { markerId:'blood_pressure', label:'Blood pressure', aliases:[/blood\s+pressure/i,/\bbp\b/i], defaultUnit:'mmHg' },
];

const unitPattern = /(%|pg\s*\/\s*m[lL]|ng\s*\/\s*m[lL]|mg\s*\/\s*d[lL]|g\s*\/\s*d[lL]|mIU\s*\/\s*[lL]|mmHg|mmol\s*\/\s*[lL]|µg\s*\/\s*[lL]|ug\s*\/\s*[lL])/i;
const valuePattern = /(?:^|\s|[:=])([<>]?\s*-?\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?)/;
const rangePattern = /(?:ref(?:erence)?\s*(?:range)?|range)\s*[:=]?\s*([^|;]+)/i;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'candidate';
}

function numericValue(value: string) {
  if (value.includes('/')) return undefined;
  const parsed = Number(value.replace(/[<>\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function definitionForLine(line: string) {
  return markerDefinitions.find((definition) => definition.aliases.some((alias) => alias.test(line)));
}

function genericLabel(line: string, valueIndex: number) {
  const before = normalizeWhitespace(line.slice(0, valueIndex).replace(/[:=|-]+$/g, ''));
  return before.length >= 2 && before.length <= 80 ? before : undefined;
}

function candidateIssues(input: { markerId: string; value: string; unit?: string; collectedAt?: string; confidence: number }) {
  const issues: string[] = [];
  if (!input.value.trim()) issues.push('No result value was extracted.');
  if (!input.collectedAt) issues.push('Collection date is missing; confirm the report date before using this evidence.');
  if (!input.unit && input.markerId !== 'blood_pressure') issues.push('Unit is missing; confirm the unit from the report.');
  if (input.markerId === 'other') issues.push('Marker is not in the structured catalogue and will remain recorded/unassessed after confirmation.');
  if (input.confidence < 0.7) issues.push('Low-confidence extraction: verify marker, value, unit and date against the report.');
  return issues;
}

export function createReportProvenance(input: {
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
  kind?: ReportAssetKind;
  importedAt?: string;
  extractionMethod?: ReportExtractionMethod;
  extractionProvider?: string;
  extractionProviderVersion?: string;
  reportId?: string;
}): ReportProvenance {
  const importedAt = input.importedAt ?? new Date().toISOString();
  const extension = input.fileName.split('.').pop()?.toLowerCase();
  const kind = input.kind ?? (input.mimeType === 'application/pdf' || extension === 'pdf' ? 'pdf' : input.mimeType?.startsWith('image/') ? 'image' : input.mimeType?.startsWith('text/') ? 'text' : 'unknown');
  return {
    reportId: input.reportId ?? `report-${importedAt.replace(/[^0-9]/g, '')}-${slug(input.fileName)}`,
    fileName: input.fileName,
    kind,
    ...(input.mimeType ? { mimeType: input.mimeType } : {}),
    ...(Number.isFinite(input.sizeBytes) ? { sizeBytes: input.sizeBytes } : {}),
    importedAt,
    extractionMethod: input.extractionMethod ?? 'manual',
    ...(input.extractionProvider ? { extractionProvider: input.extractionProvider } : {}),
    ...(input.extractionProviderVersion ? { extractionProviderVersion: input.extractionProviderVersion } : {}),
  };
}

export function normalizeReportMarker(rawLabel: string) {
  const definition = markerDefinitions.find((item) => item.aliases.some((alias) => alias.test(rawLabel)));
  return definition ? { markerId: definition.markerId, label: definition.label, defaultUnit: definition.defaultUnit, interpreted: definition.interpreted } : { markerId: 'other', label: normalizeWhitespace(rawLabel) || 'Other result' };
}

export function extractReportCandidatesFromText(input: { text: string; provenance: ReportProvenance; defaultCollectedAt?: string }): ReportEvidenceCandidate[] {
  const candidates: ReportEvidenceCandidate[] = [];
  const seen = new Set<string>();
  const lines = input.text.split(/\r?\n/).map(normalizeWhitespace).filter(Boolean);
  lines.forEach((line, index) => {
    const match = valuePattern.exec(line);
    if (!match || match.index === undefined) return;
    const definition = definitionForLine(line);
    const rawLabel = definition?.label ?? genericLabel(line, match.index);
    if (!rawLabel) return;
    const normalized = definition ? { markerId: definition.markerId, label: definition.label, defaultUnit: definition.defaultUnit } : normalizeReportMarker(rawLabel);
    const value = normalizeWhitespace(match[1]);
    const afterValue = line.slice(match.index + match[0].length);
    const unit = unitPattern.exec(afterValue)?.[1]?.replace(/\s+/g, '') ?? normalized.defaultUnit;
    const range = rangePattern.exec(line)?.[1]?.trim();
    const confidence = definition ? (unit ? 0.93 : 0.82) : 0.58;
    const key = `${normalized.markerId}|${rawLabel.toLowerCase()}|${value}|${unit ?? ''}|${input.defaultCollectedAt ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    const issues = candidateIssues({ markerId: normalized.markerId, value, unit, collectedAt: input.defaultCollectedAt, confidence });
    candidates.push({
      id:`${input.provenance.reportId}-candidate-${index}-${slug(rawLabel)}`,
      reportId:input.provenance.reportId,
      rawLabel,
      markerId:normalized.markerId,
      label:normalized.label,
      value,
      ...(numericValue(value) !== undefined ? { numericValue:numericValue(value) } : {}),
      ...(unit ? { unit } : {}),
      ...(input.defaultCollectedAt ? { collectedAt:input.defaultCollectedAt } : {}),
      ...(range ? { referenceRange:range } : {}),
      extractionConfidence:confidence,
      status:issues.some((issue)=>issue.startsWith('No result value')) ? 'needs_clarification' : 'candidate',
      issues,
      provenance:{ ...input.provenance, extractionMethod:'pasted_text' },
    });
  });
  return candidates;
}

function referenceRange(text: string | undefined, unit: string) {
  return text ? { unit, text } : undefined;
}

export function confirmReportEvidenceCandidate(candidate: ReportEvidenceCandidate, overrides: Partial<Pick<ReportEvidenceCandidate,'markerId'|'label'|'value'|'unit'|'collectedAt'|'referenceRange'>> = {}): ConfirmedReportEvidence {
  const markerId = overrides.markerId ?? candidate.markerId;
  const label = overrides.label ?? candidate.label;
  const value = overrides.value ?? candidate.value;
  const unit = overrides.unit ?? candidate.unit;
  const collectedAt = overrides.collectedAt ?? candidate.collectedAt;
  const ref = overrides.referenceRange ?? candidate.referenceRange;
  const issues: string[] = [];
  if (!value?.trim()) issues.push('A value is required before confirmation.');
  const parsed = numericValue(value ?? '');
  if ((markerId === 'hba1c' || markerId === 'vitamin_b12') && parsed === undefined) issues.push('This interpreted marker requires a numeric value.');
  if ((markerId === 'hba1c' || markerId === 'vitamin_b12') && !unit) issues.push('This interpreted marker requires a unit.');
  if ((markerId === 'hba1c' || markerId === 'vitamin_b12') && !collectedAt) issues.push('This interpreted marker requires a collection date.');
  if (issues.length) return { candidateId:candidate.id, issues };

  if (markerId === 'hba1c' || markerId === 'vitamin_b12') {
    const lab: ReportLabRecord = {
      id:`lab-${markerId}-${candidate.id}`,
      markerId,
      value:parsed as number,
      unit:unit as string,
      collectedAt:collectedAt as string,
      source:'report',
      verification:'user_confirmed',
      sourceLabel:candidate.provenance.fileName,
      ...(referenceRange(ref, unit as string) ? { referenceRange:referenceRange(ref, unit as string) } : {}),
      reportProvenance:candidate.provenance,
      candidateId:candidate.id,
      ...(candidate.extractionConfidence !== undefined ? { extractionConfidence:candidate.extractionConfidence } : {}),
    };
    return { candidateId:candidate.id, lab, issues };
  }

  const recorded: ReportRecordedMeasurement = {
    id:`measurement-${markerId}-${candidate.id}`,
    markerId,
    label,
    value:value.trim(),
    ...(unit ? { unit } : {}),
    ...(collectedAt ? { collectedAt } : {}),
    source:'report',
    verification:'user_confirmed',
    ...(ref ? { referenceRange:ref } : {}),
    state:'recorded_unassessed',
    reportProvenance:candidate.provenance,
    candidateId:candidate.id,
    ...(candidate.extractionConfidence !== undefined ? { extractionConfidence:candidate.extractionConfidence } : {}),
  };
  return { candidateId:candidate.id, recorded, issues };
}

function labIdentity(record: LabRecord) {
  return `${record.markerId}|${record.collectedAt}|${record.value}|${record.unit.trim().toLowerCase()}`;
}

function recordedIdentity(record: RecordedMeasurement) {
  return `${record.markerId}|${record.label.trim().toLowerCase()}|${record.collectedAt ?? ''}|${record.value.trim()}|${record.unit?.trim().toLowerCase() ?? ''}`;
}

export function mergeConfirmedReportEvidence(input: {
  labs: LabRecord[];
  recordedMeasurements: RecordedMeasurement[];
  confirmed: ConfirmedReportEvidence;
}) {
  if (input.confirmed.lab) {
    const key = labIdentity(input.confirmed.lab);
    const duplicate = input.labs.some((record) => labIdentity(record) === key);
    const labs = duplicate ? input.labs.map((record) => labIdentity(record) === key ? input.confirmed.lab as ReportLabRecord : record) : [...input.labs, input.confirmed.lab];
    return { labs, recordedMeasurements:input.recordedMeasurements, duplicate };
  }
  if (input.confirmed.recorded) {
    const key = recordedIdentity(input.confirmed.recorded);
    const duplicate = input.recordedMeasurements.some((record) => recordedIdentity(record) === key);
    const recordedMeasurements = duplicate ? input.recordedMeasurements.map((record) => recordedIdentity(record) === key ? input.confirmed.recorded as ReportRecordedMeasurement : record) : [...input.recordedMeasurements, input.confirmed.recorded];
    return { labs:input.labs, recordedMeasurements, duplicate };
  }
  return { labs:input.labs, recordedMeasurements:input.recordedMeasurements, duplicate:false };
}

export const reportMarkerCatalog = markerDefinitions.map(({ markerId, label, defaultUnit, interpreted }) => ({ markerId, label, defaultUnit, interpreted:Boolean(interpreted) }));
