import { readFile } from 'node:fs/promises';
import OpenAI from 'openai';
import {
  AI_REVIEW_V2_HARNESS_VERSION,
  AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION,
  AI_REVIEW_V2_PACKET_PROTOCOL,
  type AIReviewV2Provider,
  type AIReviewV2ProviderRequest,
} from '@jaanch/core';

export type OpenAIContextReviewProviderOptions = {
  enabled?: boolean;
  apiKey?: string;
  model?: string;
  harnessText?: string;
  client?: OpenAI;
};

export async function loadJaanchV2Harness() {
  return readFile(new URL('../../../docs/ai-harness/HEALTH_ASSESSMENT_HARNESS_V2.md', import.meta.url), 'utf8');
}

function openAICompatibleSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(openAICompatibleSchema);
  if (!value || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  const target: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(source)) {
    if (key === 'const') { target.enum = [item]; continue; }
    target[key] = openAICompatibleSchema(item);
  }
  return target;
}

export function buildOpenAIContextReviewRequest(request: AIReviewV2ProviderRequest, model: string, harnessText: string) {
  return {
    model,
    instructions: `${harnessText}\n\nRuntime contract: Review only the supplied ${AI_REVIEW_V2_PACKET_PROTOCOL} packet. The deterministic current assessment remains authoritative. Use context and longitudinal summaries only to improve explanation, identify evidence-resolvable contradictions, prioritize missing evidence, and prepare clinician questions. Do not invent novelty. Return only the structured output defined by the response schema.`,
    input: [{ role: 'user', content: [{ type: 'input_text', text: JSON.stringify(request.packet) }] }],
    text: {
      format: {
        type: 'json_schema',
        name: 'jaanch_ai_contextual_assessment',
        description: 'Context-aware, longitudinal advisory review of a privacy-minimized Jaanch assessment.',
        schema: openAICompatibleSchema(request.outputSchema),
        strict: true,
      },
    },
    store: false,
    max_output_tokens: 5000,
    metadata: {
      jaanch_harness_version: request.harnessVersion,
      jaanch_packet_protocol: request.packet.protocol,
      jaanch_output_schema: AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION,
    },
  };
}

export function createOpenAIContextReviewProvider(options: OpenAIContextReviewProviderOptions = {}): AIReviewV2Provider {
  const enabled = options.enabled ?? process.env.JAANCH_AI_LIVE_ENABLED === 'true';
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model = options.model ?? process.env.JAANCH_AI_MODEL;
  return {
    providerId: 'openai-responses-context-v2',
    modelId: model ?? 'unconfigured',
    async review(request) {
      if (!enabled) throw new Error('Live AI Review v2 is disabled. Enable it only after explicit product/user opt-in.');
      if (!apiKey && !options.client) throw new Error('OpenAI API credentials are required for live AI Review v2.');
      if (!model) throw new Error('JAANCH_AI_MODEL is required for live AI Review v2.');
      if (request.harnessVersion !== AI_REVIEW_V2_HARNESS_VERSION) throw new Error(`Unsupported AI Review v2 harness version: ${request.harnessVersion}`);
      if (request.packet.protocol !== AI_REVIEW_V2_PACKET_PROTOCOL) throw new Error(`Unsupported AI Review v2 packet protocol: ${request.packet.protocol}`);
      const harnessText = options.harnessText ?? await loadJaanchV2Harness();
      const client = options.client ?? new OpenAI({ apiKey });
      const response = await client.responses.create(buildOpenAIContextReviewRequest(request, model, harnessText) as never);
      const text = response.output_text;
      if (!text?.trim()) throw new Error('OpenAI response did not contain structured AI Review v2 output text.');
      try { return JSON.parse(text); } catch { throw new Error('OpenAI AI Review v2 structured output was not valid JSON.'); }
    },
  };
}
