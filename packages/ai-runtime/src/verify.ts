import { AI_HARNESS_VERSION, AI_OUTPUT_SCHEMA_VERSION, AI_REVIEW_PACKET_PROTOCOL, aiReviewOutputJsonSchema, type AIReviewProviderRequest } from '@jaanch/core';
import { buildOpenAIResponsesRequest, loadJaanchHarness } from './openaiResponsesProvider';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const request = {
  packet: {
    protocol: AI_REVIEW_PACKET_PROTOCOL,
    generatedAt: '2026-10-09T00:00:00.000Z',
    purpose: 'independent_screening_review',
    consent: { externalAIReview: true },
    evidence: { facts: [], missing: [] },
    labs: [],
    safety: { urgent: false, redFlags: [], flags: [], decisions: [] },
    applicability: [],
    engineAssessment: { findings: [], investigations: [], recommendations: [] },
    governance: { prototypeArtifactIds: [], inputNormalizationIssues: [] },
    minimization: { rawAnswersShared: false, omittedRawAnswerCount: 10, omittedIneligibleLabRecordCount: 0 },
  },
  harnessVersion: AI_HARNESS_VERSION,
  outputSchema: aiReviewOutputJsonSchema,
} as AIReviewProviderRequest;

const harness = await loadJaanchHarness();
assert(harness.startsWith('# Jaanch AI Assessment Harness'), 'Expected canonical Jaanch AI harness Markdown.');

const body = buildOpenAIResponsesRequest(request, 'test-model', harness);
const wireSchema = body.text.format.schema as Record<string, any>;
assert(body.store === false, 'OpenAI request must set store:false for M10 privacy baseline.');
assert(body.text.format.type === 'json_schema' && body.text.format.strict === true, 'OpenAI request must use strict JSON Schema structured output.');
assert(wireSchema.properties?.schemaVersion?.enum?.[0] === AI_OUTPUT_SCHEMA_VERSION, 'Wire schema must pin the AI output schema version using a strict-compatible enum.');
assert(body.metadata.jaanch_harness_version === AI_HARNESS_VERSION, 'Harness version metadata is required.');
assert(body.metadata.jaanch_packet_protocol === AI_REVIEW_PACKET_PROTOCOL, 'Packet protocol metadata is required.');
assert(JSON.stringify(body).includes('rawAnswersShared'), 'Request should contain the minimized packet contract.');
assert(!JSON.stringify(body).includes('OPENAI_API_KEY'), 'Request body must not contain credential configuration names or values.');

console.log('PASS ai-runtime-harness-load');
console.log('PASS ai-runtime-store-disabled');
console.log('PASS ai-runtime-strict-schema');
console.log('PASS ai-runtime-version-trace');
console.log('PASS ai-runtime-minimized-packet');
console.log('AI runtime request verification passed: 5/5');
