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

function packetFromBody(value: unknown): AIReviewV2Packet {
  if (!isObject(value) || !isObject(value.packet)) throw new Error('Request body must contain an AI Review v2 packet.');
  const packet = value.packet;
  if (packet.protocol !== AI_REVIEW_V2_PACKET_PROTOCOL) throw new Error(`Unsupported AI Review v2 packet protocol: ${String(packet.protocol ?? 'missing')}.`);
  if (!isObject(packet.consent) || packet.consent.externalAIReview !== true) throw new Error('AI Review v2 requires explicit per-run consent.');
  if (packet.purpose !== 'contextual_longitudinal_review') throw new Error('Unsupported AI Review v2 purpose.');
  if (!isObject(packet.minimization) || packet.minimization.rawAnswersShared !== false || packet.minimization.freeTextShared !== false || packet.minimization.previousRawSnapshotShared !== false) {
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
