import { emptyAssessmentCaptureContext, type AssessmentCaptureContext } from './intake';
import { sanitizeInternalClinicalEvidence } from './clinicalMeasurements';
import type { AssessmentSnapshot } from './longitudinal';
import type { Answers, LabRecord, NormalizedLabRecord } from './types';

export type SmartRecheckDraft = {
  baselineSnapshotId: string;
  baselineCapturedAt: string;
  answers: Answers;
  capturedContext: AssessmentCaptureContext;
  labs: LabRecord[];
  stableSummary: {
    diagnosedConditionCount: number;
    medicationCount: number;
    supplementCount: number;
    familyHistoryCount: number;
    recordedMeasurementCount: number;
  };
};

function clone<T>(value:T):T { return JSON.parse(JSON.stringify(value)) as T; }

function rawLab(record:NormalizedLabRecord):LabRecord {
  const { canonicalUnit:_canonicalUnit, normalizedValue:_normalizedValue, ageDays:_ageDays, freshness:_freshness, eligibleForAssessment:_eligibleForAssessment, issues:_issues, ...raw } = record;
  return raw;
}

export const SMART_RECHECK_TIME_SENSITIVE_FIELDS = [
  'weightKg',
  'waistCm',
  'currentConcerns',
  'sleepHours',
  'smoking',
  'activity',
  'recentLabs',
] as const;

export function createSmartRecheckDraft(snapshot:AssessmentSnapshot):SmartRecheckDraft {
  const context=clone(snapshot.capturedContext ?? emptyAssessmentCaptureContext());
  const answers=clone(sanitizeInternalClinicalEvidence(snapshot.answers));
  return {
    baselineSnapshotId:snapshot.id,
    baselineCapturedAt:snapshot.capturedAt,
    answers,
    capturedContext:context,
    labs:snapshot.labs.map(rawLab),
    stableSummary:{
      diagnosedConditionCount:Array.isArray(answers.diagnosedConditions)?answers.diagnosedConditions.filter((item)=>item!=='none').length:0,
      medicationCount:context.medications.length,
      supplementCount:context.supplements.length,
      familyHistoryCount:context.familyHistory.filter((item)=>item!=='none').length+context.customFamilyHistory.length,
      recordedMeasurementCount:context.recordedMeasurements.length+snapshot.labs.length,
    },
  };
}
