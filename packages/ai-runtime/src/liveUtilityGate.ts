import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createHap, mockProfileBundles, runAIReview, runProfileBundle } from '@jaanch/core';
import { createOpenAIResponsesProvider } from './openaiResponsesProvider';

try {
  loadEnvFile(fileURLToPath(new URL('../../../.env.local', import.meta.url)));
} catch {
  // Shell/environment variables remain supported when no local env file exists.
}

const AS_OF = '2026-10-09T12:00:00.000Z';
const provider = createOpenAIResponsesProvider();

const rows: Array<Record<string, unknown>> = [];
let failed = false;

for (const profile of mockProfileBundles) {
  const run = runProfileBundle(profile, AS_OF);
  const snapshot = run.snapshot;
  const hap = createHap(snapshot.answers, snapshot.assessment, snapshot.labs, snapshot.recommendationPlan, snapshot.capturedContext);
  const review = await runAIReview(hap, { externalAIReviewConsent: true }, provider);
  const signalCount = review.output
    ? review.output.engineReview.disagreements.length + review.output.engineReview.possibleMissingConsiderations.length
    : 0;
  const row = {
    profileId: profile.id,
    label: profile.label,
    status: review.status,
    provider: review.providerId,
    model: review.modelId,
    highestPriority: review.output?.overall.highestPriority,
    disagreementCount: review.output?.engineReview.disagreements.length ?? 0,
    missingConsiderationCount: review.output?.engineReview.possibleMissingConsiderations.length ?? 0,
    incrementalSignalCount: signalCount,
    validationErrors: review.validation ? [...review.validation.schemaErrors, ...review.validation.invariantErrors] : [],
    error: review.error,
  };
  rows.push(row);
  if (review.status !== 'valid') failed = true;
}

console.table(rows.map(row => ({
  profile: row.profileId,
  status: row.status,
  priority: row.highestPriority ?? '-',
  disagreements: row.disagreementCount,
  missing: row.missingConsiderationCount,
  signals: row.incrementalSignalCount,
})));
console.log(JSON.stringify({ protocol: 'JAANCH-AI-LIVE-GATE-REPORT-1.0', asOf: AS_OF, rows }, null, 2));
console.log('Manual utility review is still required: a non-zero novelty count is not automatically better, and zero novelty can be correct for a well-covered profile.');
if (failed) process.exitCode = 1;
