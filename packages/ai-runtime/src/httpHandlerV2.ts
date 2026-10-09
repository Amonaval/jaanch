import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  AI_REVIEW_V2_PACKET_PROTOCOL,
  runAIReviewV2Packet,
  type AIReviewV2Packet,
  type AIReviewV2Provider,
  type AIReviewV2RunResult,
} from '@jaanch/core';
import {
  createOpenAIContextReviewProvider,
  type OpenAIContextReviewProviderOptions,
} from './openaiContextReviewProvider';

const DEFAULT_MAX_BODY_BYTES = 320 * 1024;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  const allowedSet = new Set(allowed);
  return Object.keys(value).every((key) => allowedSet.has(key));
}

function packetFromBody(value: unknown): AIReviewV2Packet {
  if (!isObject(value) || !hasOnlyKeys(value, ['packet']) || !isObject(value.packet)) {
    throw new Error('Request body must contain only an AI Review v2 packet.');
  }
  const packet = value.packet;
  if (!hasOnlyKeys(packet, ['protocol','generatedAt','purpose','consent','current','context','longitudinal','minimization'])) {
    throw new Error('AI Review v2 packet contains unexpected top-level fields.');
  }
  if (packet.protocol !== AI_REVIEW_V2_PACKET_PROTOCOL) throw new Error(`Unsupported AI Review v2 packet protocol: ${String(packet.protocol ?? 'missing')}.`);
  if (!isObject(packet.consent) || !hasOnlyKeys(packet.consent, ['externalAIReview']) || packet.consent.externalAIReview !== true) throw new Error('AI Review v2 requires explicit per-run consent.');
  if (packet.purpose !== 'contextual_longitudinal_review') throw new Error('Unsupported AI Review v2 purpose.');

  if (!isObject(packet.current) || !hasOnlyKeys(packet.current, ['protocol','generatedAt','purpose','consent','evidence','labs','safety','applicability','engineAssessment','governance','minimization'])) {
    throw new Error('AI Review v2 current-assessment envelope contains unexpected fields.');
  }
  if (packet.current.protocol !== 'JAANCH-AI-REVIEW-1.0' || packet.current.purpose !== 'independent_screening_review') {
    throw new Error('AI Review v2 current assessment must use the minimized JAANCH-AI-REVIEW-1.0 contract.');
  }

  if (!isObject(packet.context) || !hasOnlyKeys(packet.context, ['ageBand','diagnosedConditionCodes','currentConcernCodes','medicationCategories','supplementCategories','familyHistoryCodes','reproductiveContext','activity'])) {
    throw new Error('AI Review v2 context capsule contains unexpected fields.');
  }
  if (!isObject(packet.longitudinal) || !hasOnlyKeys(packet.longitudinal, ['available','currentCapturedAt','previousCapturedAt','evidenceCompletenessDelta','findingTrends','labTrends','measurementTrends','recommendationTrends'])) {
    throw new Error('AI Review v2 longitudinal capsule contains unexpected fields.');
  }
  if (!isObject(packet.minimization) || !hasOnlyKeys(packet.minimization, ['rawAnswersShared','freeTextShared','medicationNamesShared','supplementNamesShared','previousRawSnapshotShared','omittedRawAnswerCount','omittedIneligibleLabRecordCount','omittedFreeTextFieldCount','omittedPreviousSnapshotCount'])) {
    throw new Error('AI Review v2 minimization metadata contains unexpected fields.');
  }
  if (packet.minimization.rawAnswersShared !== false || packet.minimization.freeTextShared !== false || packet.minimization.medicationNamesShared !== false || packet.minimization.supplementNamesShared !== false || packet.minimization.previousRawSnapshotShared !== false) {
    throw new Error('AI Review v2 packet violates the minimum-necessary data contract.');
  }
  return packet as unknown as AIReviewV2Packet;
}

export async function reviewAIV2HttpBody(body: unknown, provider: AIReviewV2Provider): Promise<AIReviewV2RunResult> {
  return runAIReviewV2Packet(packetFromBody(body), provider);
}

async function readJsonBody(request: IncomingMessage, maxBytes: number): Promise<unknown> {
  let bytes = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;
    if (bytes > maxBytes) throw new Error('AI Review v2 request is too large.');
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) throw new Error('AI Review v2 request body is empty.');
  try { return JSON.parse(raw); } catch { throw new Error('AI Review v2 request body must be valid JSON.'); }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Pragma', 'no-cache');
  response.end(JSON.stringify(payload));
}

export type AIReviewV2HttpHandlerOptions = OpenAIContextReviewProviderOptions & {
  provider?: AIReviewV2Provider;
  maxBodyBytes?: number;
};

export function createAIReviewV2HttpHandler(options: AIReviewV2HttpHandlerOptions = {}) {
  const provider = options.provider ?? createOpenAIContextReviewProvider(options);
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  return async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }
    try {
      const body = await readJsonBody(request, maxBodyBytes);
      const result = await reviewAIV2HttpBody(body, provider);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid AI Review v2 request.' });
    }
  };
}
