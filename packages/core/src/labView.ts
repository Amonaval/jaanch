import type { LabReassessment, NormalizedLabRecord } from './types';
import { labMarkerDefinition } from './labs';

export type LabRecordView = {
  id: string;
  markerLabel: string;
  valueLabel: string;
  collectedLabel: string;
  sourceLabel: string;
  freshnessLabel: string;
  eligibilityLabel: string;
  eligible: boolean;
  issues: string[];
};

export type LabChangeView = {
  id: string;
  title: string;
  detail: string;
};

export type LabReassessmentViewModel = {
  title: string;
  records: LabRecordView[];
  appliedCount: number;
  appliedLabel: string;
  changes: LabChangeView[];
  noChangeLabel?: string;
  freshnessDisclaimer: string;
};

function recordView(record: NormalizedLabRecord): LabRecordView {
  const marker = labMarkerDefinition(record.markerId);
  const freshnessLabel = record.freshness === 'recent'
    ? 'Recent'
    : record.freshness === 'aging'
      ? 'Aging'
      : record.freshness === 'stale'
        ? 'Historical / stale for reassessment'
        : 'Future date — invalid';
  return {
    id: record.id,
    markerLabel: marker?.label ?? record.markerId,
    valueLabel: `${record.normalizedValue} ${record.canonicalUnit}`,
    collectedLabel: record.collectedAt.slice(0, 10),
    sourceLabel: record.sourceLabel ?? (record.source === 'manual' ? 'Manual entry' : record.source === 'report' ? 'Report' : 'Imported'),
    freshnessLabel,
    eligibilityLabel: record.eligibleForAssessment ? 'Applied to reassessment' : 'Not applied to reassessment',
    eligible: record.eligibleForAssessment,
    issues: record.issues,
  };
}

export function buildLabReassessmentViewModel(reassessment: LabReassessment): LabReassessmentViewModel {
  const changes: LabChangeView[] = [];
  for (const finding of reassessment.changes.findingChanges) {
    changes.push({
      id: `finding:${finding.findingId}`,
      title: finding.title,
      detail: `${finding.beforeStatus} → ${finding.afterStatus}; ${finding.beforeEvidenceLevel} → ${finding.afterEvidenceLevel}.`,
    });
  }
  for (const id of reassessment.changes.resolvedInvestigationIds) {
    changes.push({ id: `resolved-test:${id}`, title: 'Investigation resolved', detail: `${id} is no longer recommended because new evidence addressed its gap.` });
  }
  for (const id of reassessment.changes.addedInvestigationIds) {
    changes.push({ id: `added-test:${id}`, title: 'New investigation surfaced', detail: `${id} became relevant after reassessment.` });
  }
  for (const id of reassessment.changes.newlyResolvedEvidenceIds) {
    changes.push({ id: `resolved-evidence:${id}`, title: 'Evidence gap resolved', detail: id });
  }

  return {
    title: 'Lab reassessment',
    records: reassessment.normalizedLabs.map(recordView),
    appliedCount: reassessment.appliedLabRecordIds.length,
    appliedLabel: `${reassessment.appliedLabRecordIds.length} lab record${reassessment.appliedLabRecordIds.length === 1 ? '' : 's'} applied to the current assessment`,
    changes,
    noChangeLabel: changes.length ? undefined : 'No deterministic finding or investigation changed from the eligible lab evidence.',
    freshnessDisclaimer: 'Freshness labels are Jaanch reassessment recency rules, not a statement that a result is clinically valid or invalid for every purpose.',
  };
}
