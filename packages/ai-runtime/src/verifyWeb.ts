import {
  AI_OUTPUT_SCHEMA_VERSION,
  AI_REVIEW_PACKET_PROTOCOL,
  aiReviewOutputJsonSchema,
  type AIReviewProvider,
  type AIReviewProviderRequest,
} from '@jaanch/core';
import { reviewAIHttpBody } from './httpHandler';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const packet = {
  protocol: AI_REVIEW_PACKET_PROTOCOL,
  generatedAt: '2026-10-09T12:00:00.000Z',
  purpose: 'independent_screening_review' as const,
  consent: { externalAIReview: true as const },
  evidence: { facts: [], missing: [] },
  labs: [],
  safety: { urgent: false, redFlags: [], flags: [], decisions: [] },
  applicability: [],
  engineAssessment: { findings: [], investigations: [], recommendations: [] },
  governance: { prototypeArtifactIds: [], inputNormalizationIssues: [] },
  minimization: { rawAnswersShared: false as const, omittedRawAnswerCount: 8, omittedIneligibleLabRecordCount: 0 },
};

const provider: AIReviewProvider = {
  providerId: 'fake-live-provider',
  modelId: 'fake-model',
  async review(request: AIReviewProviderRequest) {
    assert(request.packet === packet, 'HTTP runtime must forward the exact minimized packet rather than reconstructing raw answers.');
    assert(request.outputSchema === aiReviewOutputJsonSchema, 'HTTP runtime must preserve the strict shared output schema.');
    return {
      schemaVersion: AI_OUTPUT_SCHEMA_VERSION,
      overall: { summary: 'No additional concern.', highestPriority: 'routine' },
      redFlags: [],
      domainAssessments: [],
      engineReview: { agreements: ['No conflict.'], disagreements: [], possibleMissingConsiderations: [] },
      safety: { treatmentAdviceGated: true, gatingReasons: ['Deterministic boundaries remain authoritative.'] },
    };
  },
};

const result = await reviewAIHttpBody({ packet }, provider);
assert(result.status === 'valid', 'Expected a schema-valid advisory result through the HTTP runtime boundary.');
assert(result.providerId === 'fake-live-provider' && result.modelId === 'fake-model', 'Expected provider/model traceability.');

let missingConsentBlocked = false;
try {
  await reviewAIHttpBody({ packet: { ...packet, consent: { externalAIReview: false } } }, provider);
} catch {
  missingConsentBlocked = true;
}
assert(missingConsentBlocked, 'HTTP runtime must reject a packet without explicit consent.');

let rawBodyBlocked = false;
try {
  await reviewAIHttpBody({ answers: { age: 40 } }, provider);
} catch {
  rawBodyBlocked = true;
}
assert(rawBodyBlocked, 'HTTP runtime must not accept arbitrary/raw answer bodies in place of the minimized packet.');

console.log('PASS ai-web-minimized-packet-forwarding');
console.log('PASS ai-web-provider-traceability');
console.log('PASS ai-web-consent-required');
console.log('PASS ai-web-raw-body-rejected');
console.log('AI web runtime verification passed: 4/4');
