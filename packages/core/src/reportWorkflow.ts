import { buildRecommendationPlan } from './recommendations';
import { emptyAssessmentCaptureContext } from './intake';
import { addSnapshot, createAssessmentSnapshot, type AssessmentSnapshot, type LongitudinalHistory } from './longitudinal';
import { reassessWithLabs } from './labs';
import type { LabRecord, NormalizedLabRecord } from './types';
import { mergeConfirmedReportEvidence, type ConfirmedReportEvidence } from './reportEvidence';

function toRawLab(record: NormalizedLabRecord): LabRecord {
  const { canonicalUnit: _canonicalUnit, normalizedValue: _normalizedValue, ageDays: _ageDays, freshness: _freshness, eligibleForAssessment: _eligibleForAssessment, issues: _issues, ...raw } = record;
  return raw;
}

export type ReportSnapshotReassessment = {
  snapshot: AssessmentSnapshot;
  duplicateCount: number;
  interpretedLabCount: number;
  recordedUnassessedCount: number;
};

export function reassessSnapshotWithConfirmedReportEvidence(input: {
  baseline: AssessmentSnapshot;
  confirmed: ConfirmedReportEvidence[];
  capturedAt?: string;
  id?: string;
}): ReportSnapshotReassessment {
  if (!input.confirmed.length) throw new Error('At least one confirmed report result is required.');
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  let labs: LabRecord[] = input.baseline.labs.map(toRawLab);
  const baseContext = input.baseline.capturedContext ?? emptyAssessmentCaptureContext();
  let recordedMeasurements = baseContext.recordedMeasurements;
  let duplicateCount = 0;
  let interpretedLabCount = 0;
  let recordedUnassessedCount = 0;

  for (const confirmed of input.confirmed) {
    if (!confirmed.lab && !confirmed.recorded) throw new Error(`Confirmed report evidence ${confirmed.candidateId} contains no promotable value.`);
    const merged = mergeConfirmedReportEvidence({ labs, recordedMeasurements, confirmed });
    labs = merged.labs;
    recordedMeasurements = merged.recordedMeasurements;
    if (merged.duplicate) duplicateCount += 1;
    if (confirmed.lab) interpretedLabCount += 1;
    if (confirmed.recorded) recordedUnassessedCount += 1;
  }

  const reassessment = reassessWithLabs(input.baseline.answers, labs, capturedAt);
  const assessment = reassessment.after;
  const recommendationPlan = buildRecommendationPlan(input.baseline.answers, assessment);
  const snapshot = createAssessmentSnapshot({
    answers: input.baseline.answers,
    capturedContext: { ...baseContext, recordedMeasurements },
    labs: reassessment.normalizedLabs,
    assessment,
    recommendationPlan,
    capturedAt,
    id: input.id,
  });
  return { snapshot, duplicateCount, interpretedLabCount, recordedUnassessedCount };
}

export function addConfirmedReportEvidenceToHistory(input: {
  history: LongitudinalHistory;
  confirmed: ConfirmedReportEvidence[];
  capturedAt?: string;
  id?: string;
}): { history: LongitudinalHistory; reassessment?: ReportSnapshotReassessment } {
  const baseline = input.history.snapshots[0];
  if (!baseline) return { history: input.history };
  const reassessment = reassessSnapshotWithConfirmedReportEvidence({ baseline, confirmed: input.confirmed, capturedAt: input.capturedAt, id: input.id });
  return { history: addSnapshot(input.history, reassessment.snapshot), reassessment };
}
