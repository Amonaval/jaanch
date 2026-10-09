import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  aiReviewV2SignalCount,
  buildAIReviewV2Packet,
  mockProfileBundles,
  runAIReviewV2Packet,
  runProfileBundle,
  type LongitudinalHistory,
} from '@jaanch/core';
import { createOpenAIContextReviewProvider } from './openaiContextReviewProvider';

try { loadEnvFile(fileURLToPath(new URL('../../../.env.local', import.meta.url))); } catch { /* shell env remains supported */ }

const AS_OF = '2026-10-09T12:00:00.000Z';
const provider = createOpenAIContextReviewProvider();
const rows: Array<Record<string, unknown>> = [];
let failed = false;

for (const profile of mockProfileBundles) {
  const snapshot = runProfileBundle(profile, AS_OF).snapshot;
  const history: LongitudinalHistory = { protocol: 'JAANCH-HISTORY-1.0', snapshots: [snapshot] };
  const packet = buildAIReviewV2Packet(history, { externalAIReviewConsent: true });
  const review = await runAIReviewV2Packet(packet, provider);
  const row = {
    profileId: profile.id,
    label: profile.label,
    status: review.status,
    provider: review.providerId,
    model: review.modelId,
    highestPriority: review.output?.baseReview.overall.highestPriority,
    materialAddition: review.output?.utility.materialAddition,
    signalCount: review.output ? aiReviewV2SignalCount(review.output) : 0,
    prioritizedGapCount: review.output?.prioritizedEvidenceGaps.length ?? 0,
    contradictionCount: review.output?.contradictions.length ?? 0,
    clinicianQuestionCount: review.output?.clinicianPrep.questions.length ?? 0,
    validationErrors: review.validation ? [...review.validation.schemaErrors, ...review.validation.invariantErrors] : [],
    error: review.error,
  };
  rows.push(row);
  if (review.status !== 'valid') failed = true;
}

console.table(rows.map((row) => ({
  profile: row.profileId,
  status: row.status,
  priority: row.highestPriority ?? '-',
  material: row.materialAddition ?? '-',
  gaps: row.prioritizedGapCount,
  contradictions: row.contradictionCount,
  questions: row.clinicianQuestionCount,
  signals: row.signalCount,
})));
console.log(JSON.stringify({ protocol: 'JAANCH-AI-V2-LIVE-GATE-REPORT-1.0', asOf: AS_OF, rows }, null, 2));
console.log('Manual utility review remains required. Low-risk profiles should often return materialAddition=false. Longitudinal synthesis should be judged on real multi-check-in history, not invented fixture history.');
if (failed) process.exitCode = 1;
