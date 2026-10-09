import {
  AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION,
  AI_REVIEW_V2_PACKET_PROTOCOL,
  aiReviewV2OutputJsonSchema,
  type AIReviewV2Provider,
  type AIReviewV2ProviderRequest,
  type AIReviewV2Packet,
} from '@jaanch/core';
import { reviewAIV2HttpBody } from './httpHandlerV2';

function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); }

const packet: AIReviewV2Packet = {
  protocol: AI_REVIEW_V2_PACKET_PROTOCOL,
  generatedAt: '2026-10-09T12:00:00.000Z',
  purpose: 'contextual_longitudinal_review',
  consent: { externalAIReview: true },
  current: {
    protocol: 'JAANCH-AI-REVIEW-1.0', generatedAt: '2026-10-09T12:00:00.000Z', purpose: 'independent_screening_review', consent: { externalAIReview: true },
    evidence: { facts: [], missing: [] }, labs: [], safety: { urgent: false, redFlags: [], flags: [], decisions: [] }, applicability: [],
    engineAssessment: { findings: [], investigations: [], recommendations: [] }, governance: { prototypeArtifactIds: [], inputNormalizationIssues: [] },
    minimization: { rawAnswersShared: false, omittedRawAnswerCount: 8, omittedIneligibleLabRecordCount: 0 },
  },
  context: { ageBand: '40_64', diagnosedConditionCodes: [], currentConcernCodes: [], medicationCategories: [], supplementCategories: [], familyHistoryCodes: [], activity: {} },
  longitudinal: { available: false, currentCapturedAt: '2026-10-09T12:00:00.000Z', findingTrends: [], labTrends: [], measurementTrends: [], recommendationTrends: [] },
  minimization: { rawAnswersShared: false, freeTextShared: false, medicationNamesShared: false, supplementNamesShared: false, previousRawSnapshotShared: false, omittedRawAnswerCount: 8, omittedIneligibleLabRecordCount: 0, omittedFreeTextFieldCount: 0, omittedPreviousSnapshotCount: 0 },
};

const provider: AIReviewV2Provider = {
  providerId: 'fake-context-provider', modelId: 'fake-context-model',
  async review(request: AIReviewV2ProviderRequest) {
    assert(request.packet === packet, 'V2 HTTP runtime must forward the exact minimized contextual packet.');
    assert(request.outputSchema === aiReviewV2OutputJsonSchema, 'V2 HTTP runtime must preserve the shared strict output schema.');
    return {
      schemaVersion: AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION,
      utility: { materialAddition: false, reason: 'No material contextual addition.' },
      baseReview: { schemaVersion: 'AI-ASSESSMENT-1.0', overall: { summary: 'No additional concern.', highestPriority: 'routine' }, redFlags: [], domainAssessments: [], engineReview: { agreements: ['No conflict.'], disagreements: [], possibleMissingConsiderations: [] }, safety: { treatmentAdviceGated: true, gatingReasons: ['Deterministic boundaries remain authoritative.'] } },
      longitudinalSynthesis: { available: false, summary: 'No prior comparison.', changesWorthAttention: [], stableSignals: [], uncertainChanges: [] },
      prioritizedEvidenceGaps: [], contradictions: [], clinicianPrep: { summary: 'No clinician-prep addition.', questions: [], evidenceToBring: [] },
    };
  },
};

const result = await reviewAIV2HttpBody({ packet }, provider);
assert(result.status === 'valid', 'Expected a schema-valid AI Review v2 result through the HTTP boundary.');
assert(result.providerId === 'fake-context-provider' && result.modelId === 'fake-context-model', 'Expected v2 provider/model traceability.');

let rawBlocked = false;
try { await reviewAIV2HttpBody({ answers: { age: 40 } }, provider); } catch { rawBlocked = true; }
assert(rawBlocked, 'V2 HTTP runtime must reject raw-answer bodies.');

let minimizationBlocked = false;
try { await reviewAIV2HttpBody({ packet: { ...packet, minimization: { ...packet.minimization, freeTextShared: true } } }, provider); } catch { minimizationBlocked = true; }
assert(minimizationBlocked, 'V2 HTTP runtime must reject packets that claim free text is shared.');

console.log('PASS ai-v2-http-minimized-context-forwarding');
console.log('PASS ai-v2-http-provider-traceability');
console.log('PASS ai-v2-http-raw-body-rejected');
console.log('PASS ai-v2-http-minimization-contract');
console.log('AI Review v2 web runtime verification passed: 4/4');
