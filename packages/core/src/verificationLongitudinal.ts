import { assess } from './engine';
import { reassessWithLabs } from './labs';
import { buildRecommendationPlan } from './recommendations';
import { addSnapshot, buildLongitudinalViewModel, compareSnapshots, createAssessmentSnapshot, decodeLongitudinalHistory, emptyLongitudinalHistory, encodeLongitudinalHistory } from './longitudinal';
import type { Answers, LabRecord } from './types';

export type LongitudinalVerificationResult = { id: string; passed: boolean; details?: string };
const check = (id: string, condition: boolean, details: string): LongitudinalVerificationResult => ({ id, passed: condition, details: condition ? undefined : details });

const base: Answers = {
  age: 38,
  sex: 'male',
  heightCm: 175,
  weightKg: 82,
  waistCm: 98,
  diagnosedConditions: ['none'],
  prescriptionMedications: false,
  supplementUse: false,
  medicationOrSupplementAllergy: false,
  diet: 'vegetarian',
  activityDays: 1,
  sleepHours: 6.5,
  smoking: false,
  familyDiabetes: true,
  currentConcerns: ['fatigue'],
  recentLabs: false,
};

export function runLongitudinalVerification(): LongitudinalVerificationResult[] {
  const results: LongitudinalVerificationResult[] = [];
  const firstResult = assess(base);
  const firstRecommendations = buildRecommendationPlan(base, firstResult);
  const first = createAssessmentSnapshot({ answers: base, assessment: firstResult, recommendationPlan: firstRecommendations, capturedAt: '2026-09-01T08:00:00.000Z', id: 'snapshot-1' });

  const lab: LabRecord = { id: 'b12-1', markerId: 'vitamin_b12', value: 150, unit: 'pg/mL', collectedAt: '2026-10-01T08:00:00.000Z', source: 'manual', verification: 'user_confirmed' };
  const laterAnswers: Answers = { ...base, activityDays: 4, currentConcerns: ['none'] };
  const reassessment = reassessWithLabs(laterAnswers, [lab], '2026-10-02T08:00:00.000Z');
  const laterRecommendations = buildRecommendationPlan(laterAnswers, reassessment.after);
  const second = createAssessmentSnapshot({ answers: laterAnswers, labs: reassessment.normalizedLabs, assessment: reassessment.after, recommendationPlan: laterRecommendations, capturedAt: '2026-10-02T08:00:00.000Z', id: 'snapshot-2' });

  let history = emptyLongitudinalHistory();
  history = addSnapshot(history, first);
  history = addSnapshot(history, second);
  results.push(check('longitudinal-newest-first', history.snapshots[0]?.id === 'snapshot-2' && history.snapshots[1]?.id === 'snapshot-1', 'Expected snapshots ordered newest first.'));

  const roundTrip = decodeLongitudinalHistory(encodeLongitudinalHistory(history));
  results.push(check('longitudinal-storage-roundtrip', roundTrip.snapshots.length === 2 && roundTrip.snapshots[0]?.id === 'snapshot-2', 'Expected versioned history serialization to round-trip.'));

  const comparison = compareSnapshots(first, second);
  results.push(check('longitudinal-finding-change', comparison.findingTrends.some((item) => item.findingId === 'NUT-001' && item.beforeStatus !== item.afterStatus), 'Expected measured B12 to change the nutrition finding.'));
  results.push(check('longitudinal-lab-trend', comparison.labTrends.some((item) => item.markerId === 'vitamin_b12' && item.afterValue === 150), 'Expected B12 lab history to be represented in comparison.'));
  results.push(check('longitudinal-investigation-resolution', comparison.resolvedInvestigationIds.includes('LAB-B12'), 'Expected B12 investigation to resolve after eligible measured evidence.'));

  const view = buildLongitudinalViewModel(history);
  results.push(check('longitudinal-view-latest', view.snapshotCount === 2 && view.latest?.id === 'snapshot-2' && Boolean(view.comparison), 'Expected shared longitudinal view model to expose latest snapshot and comparison.'));

  const capped = addSnapshot(history, createAssessmentSnapshot({ answers: laterAnswers, assessment: reassessment.after, labs: reassessment.normalizedLabs, recommendationPlan: laterRecommendations, capturedAt: '2026-10-03T08:00:00.000Z', id: 'snapshot-3' }), 2);
  results.push(check('longitudinal-history-cap', capped.snapshots.length === 2 && capped.snapshots[0]?.id === 'snapshot-3', 'Expected configurable history cap and newest-first retention.'));

  results.push(check('longitudinal-invalid-storage-safe', decodeLongitudinalHistory('{bad json').snapshots.length === 0, 'Expected invalid persisted data to fail closed to empty history.'));
  return results;
}

export function assertLongitudinalVerification() {
  const results = runLongitudinalVerification();
  const failed = results.filter((item) => !item.passed);
  if (failed.length) throw new Error(`Longitudinal verification failed: ${failed.map((item) => `${item.id}: ${item.details}`).join(' | ')}`);
  return results;
}
