import { assess } from './engine';
import type {
  Answers,
  AssessmentResult,
  LabMarkerId,
  LabRecord,
  LabReassessment,
  LabReassessmentChanges,
  NormalizedLabRecord,
} from './types';

export type LabMarkerDefinition = {
  id: LabMarkerId;
  label: string;
  answerId: 'hba1c' | 'b12';
  canonicalUnit: string;
  acceptedUnits: string[];
  min: number;
  max: number;
  recentDays: number;
  usableDays: number;
};

/**
 * Freshness windows are Jaanch product semantics for reassessment recency.
 * They are not diagnostic validity periods and do not replace clinician judgment.
 */
export const labMarkerCatalog: LabMarkerDefinition[] = [
  {
    id: 'hba1c',
    label: 'HbA1c',
    answerId: 'hba1c',
    canonicalUnit: '%',
    acceptedUnits: ['%', 'percent'],
    min: 3,
    max: 20,
    recentDays: 180,
    usableDays: 365,
  },
  {
    id: 'vitamin_b12',
    label: 'Vitamin B12',
    answerId: 'b12',
    canonicalUnit: 'pg/mL',
    acceptedUnits: ['pg/mL', 'pg/ml'],
    min: 50,
    max: 2500,
    recentDays: 180,
    usableDays: 365,
  },
];

const DAY_MS = 86_400_000;
const markerById = new Map(labMarkerCatalog.map((marker) => [marker.id, marker]));

function asDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeUnit(definition: LabMarkerDefinition, unit: string) {
  return definition.acceptedUnits.find((candidate) => candidate.toLowerCase() === unit.trim().toLowerCase())
    ? definition.canonicalUnit
    : undefined;
}

export function normalizeLabRecords(records: LabRecord[], asOf = new Date().toISOString()): NormalizedLabRecord[] {
  const asOfDate = asDate(asOf) ?? new Date();
  return records.map((record) => {
    const definition = markerById.get(record.markerId);
    const issues: string[] = [];
    const collected = asDate(record.collectedAt);
    const normalizedUnit = definition ? normalizeUnit(definition, record.unit) : undefined;
    let ageDays: number | undefined;
    let freshness: NormalizedLabRecord['freshness'] = 'stale';

    if (!definition) issues.push(`Unsupported marker: ${record.markerId}`);
    if (!Number.isFinite(record.value)) issues.push('Lab value must be a finite number.');
    if (!collected) issues.push('Collection date/time is invalid.');
    if (!normalizedUnit) issues.push(`Unsupported unit for ${record.markerId}: ${record.unit}`);

    if (definition && Number.isFinite(record.value) && (record.value < definition.min || record.value > definition.max)) {
      issues.push(`Value ${record.value} is outside the configured plausible range ${definition.min}–${definition.max} ${definition.canonicalUnit}.`);
    }

    if (collected) {
      ageDays = Math.floor((asOfDate.getTime() - collected.getTime()) / DAY_MS);
      if (ageDays < 0) freshness = 'future_invalid';
      else if (definition && ageDays <= definition.recentDays) freshness = 'recent';
      else if (definition && ageDays <= definition.usableDays) freshness = 'aging';
      else freshness = 'stale';
    }

    if (freshness === 'future_invalid') issues.push('Collection date is in the future relative to reassessment time.');
    if (record.verification !== 'user_confirmed') issues.push('Lab value is not user-confirmed.');

    const eligibleForAssessment = Boolean(
      definition
      && normalizedUnit
      && collected
      && Number.isFinite(record.value)
      && record.value >= definition.min
      && record.value <= definition.max
      && record.verification === 'user_confirmed'
      && freshness !== 'stale'
      && freshness !== 'future_invalid',
    );

    return {
      ...record,
      canonicalUnit: definition?.canonicalUnit ?? record.unit,
      normalizedValue: record.value,
      ageDays,
      freshness,
      eligibleForAssessment,
      issues,
    };
  });
}

export function latestEligibleLabs(records: NormalizedLabRecord[]) {
  const selected = new Map<LabMarkerId, NormalizedLabRecord>();
  for (const record of records.filter((item) => item.eligibleForAssessment)) {
    const existing = selected.get(record.markerId);
    if (!existing || new Date(record.collectedAt).getTime() > new Date(existing.collectedAt).getTime()) selected.set(record.markerId, record);
  }
  return [...selected.values()];
}

export function applyLabRecordsToAnswers(answers: Answers, normalized: NormalizedLabRecord[]): { answers: Answers; applied: NormalizedLabRecord[] } {
  const applied = latestEligibleLabs(normalized);
  const next: Answers = { ...answers };
  for (const record of applied) {
    const definition = markerById.get(record.markerId);
    if (definition) next[definition.answerId] = record.normalizedValue;
  }
  if (applied.length) next.recentLabs = true;
  return { answers: next, applied };
}

function attachLabProvenance(result: AssessmentResult, applied: NormalizedLabRecord[]): AssessmentResult {
  const byAnswerId = new Map<string, NormalizedLabRecord>();
  for (const record of applied) {
    const definition = markerById.get(record.markerId);
    if (definition) byAnswerId.set(definition.answerId, record);
  }

  return {
    ...result,
    evidenceGraph: {
      ...result.evidenceGraph,
      nodes: result.evidenceGraph.nodes.map((node) => {
        if (node.sourceType !== 'lab') return node;
        const record = node.provenance.questionIds.map((id) => byAnswerId.get(id)).find(Boolean);
        if (!record) return node;
        const freshnessLabel = record.freshness === 'recent' ? 'recent' : 'aging';
        return {
          ...node,
          detail: `${node.detail} Collected ${record.collectedAt.slice(0, 10)} · ${freshnessLabel} · ${record.source}.`,
          provenance: { ...node.provenance, labRecordIds: [record.id] },
        };
      }),
    },
  };
}

function compareAssessmentResults(before: AssessmentResult, after: AssessmentResult): LabReassessmentChanges {
  const beforeById = new Map(before.findings.map((finding) => [finding.id, finding]));
  const findingChanges = after.findings.flatMap((finding) => {
    const previous = beforeById.get(finding.id);
    if (!previous) return [];
    if (
      previous.status === finding.status
      && previous.evidenceLevel === finding.evidenceLevel
      && previous.urgency === finding.urgency
    ) return [];
    return [{
      findingId: finding.id,
      title: finding.title,
      beforeStatus: previous.status,
      afterStatus: finding.status,
      beforeEvidenceLevel: previous.evidenceLevel,
      afterEvidenceLevel: finding.evidenceLevel,
      beforeUrgency: previous.urgency,
      afterUrgency: finding.urgency,
    }];
  });

  const beforeTests = new Set(before.testPlan.recommendations.map((item) => item.id));
  const afterTests = new Set(after.testPlan.recommendations.map((item) => item.id));
  const beforeMissing = new Set(before.findings.flatMap((finding) => finding.missingEvidenceIds));
  const afterMissing = new Set(after.findings.flatMap((finding) => finding.missingEvidenceIds));

  return {
    findingChanges,
    resolvedInvestigationIds: [...beforeTests].filter((id) => !afterTests.has(id)),
    addedInvestigationIds: [...afterTests].filter((id) => !beforeTests.has(id)),
    newlyResolvedEvidenceIds: [...beforeMissing].filter((id) => !afterMissing.has(id)),
  };
}

export function reassessWithLabs(answers: Answers, records: LabRecord[], asOf = new Date().toISOString()): LabReassessment {
  const before = assess(answers);
  const normalizedLabs = normalizeLabRecords(records, asOf);
  const appliedResult = applyLabRecordsToAnswers(answers, normalizedLabs);
  const after = attachLabProvenance(assess(appliedResult.answers), appliedResult.applied);
  return {
    asOf,
    before,
    after,
    normalizedLabs,
    appliedLabRecordIds: appliedResult.applied.map((record) => record.id),
    changes: compareAssessmentResults(before, after),
  };
}

export function labMarkerDefinition(markerId: LabMarkerId) {
  return markerById.get(markerId);
}
