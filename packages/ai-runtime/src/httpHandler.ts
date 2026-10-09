import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  AI_REVIEW_PACKET_PROTOCOL,
  runAIReviewPacket,
  type AIReviewPacket,
  type AIReviewProvider,
  type AIReviewRunResult,
} from '@jaanch/core';
import {
  createOpenAIResponsesProvider,
  type OpenAIResponsesProviderOptions,
} from './openaiResponsesProvider';

const DEFAULT_MAX_BODY_BYTES = 256 * 1024;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function packetFromBody(value: unknown): AIReviewPacket {
  if (!isObject(value) || !isObject(value.packet)) {
    throw new Error('Request body must contain an AI review packet.');
  }
  const packet = value.packet;
  if (packet.protocol !== AI_REVIEW_PACKET_PROTOCOL) {
    throw new Error(`Unsupported AI review packet protocol: ${String(packet.protocol ?? 'missing')}.`);
  }
  if (!isObject(packet.consent) || packet.consent.externalAIReview !== true) {
    throw new Error('AI review requires explicit per-run consent.');
  }
  if (packet.purpose !== 'independent_screening_review') {
    throw new Error('Unsupported AI review purpose.');
  }
  return packet as unknown as AIReviewPacket;
}

export async function reviewAIHttpBody(
  body: unknown,
  provider: AIReviewProvider,
): Promise<AIReviewRunResult> {
  return runAIReviewPacket(packetFromBody(body), provider);
}

async function readJsonBody(request: IncomingMessage, maxBytes: number): Promise<unknown> {
  let bytes = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;
    if (bytes > maxBytes) throw new Error('AI review request is too large.');
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) throw new Error('AI review request body is empty.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('AI review request body must be valid JSON.');
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Pragma', 'no-cache');
  response.end(JSON.stringify(payload));
}

export type AIReviewHttpHandlerOptions = OpenAIResponsesProviderOptions & {
  provider?: AIReviewProvider;
  maxBodyBytes?: number;
};

/**
 * Same-origin server handler for the web app. It never logs request bodies and
 * never exposes provider credentials to browser code.
 */
export function createAIReviewHttpHandler(options: AIReviewHttpHandlerOptions = {}) {
  const provider = options.provider ?? createOpenAIResponsesProvider(options);
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;

  return async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }

    try {
      const body = await readJsonBody(request, maxBodyBytes);
      const result = await reviewAIHttpBody(body, provider);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : 'Invalid AI review request.',
      });
    }
  };
}
