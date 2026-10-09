import { readFile } from 'node:fs/promises';
import OpenAI from 'openai';
import {
  AI_HARNESS_VERSION,
  AI_OUTPUT_SCHEMA_VERSION,
  AI_REVIEW_PACKET_PROTOCOL,
  type AIReviewProvider,
  type AIReviewProviderRequest,
} from '@jaanch/core';

export type OpenAIResponsesProviderOptions = {
  enabled?: boolean;
  apiKey?: string;
  model?: string;
  harnessText?: string;
  client?: OpenAI;
};

export async function loadJaanchHarness() {
  return readFile(new URL('../../../docs/ai-harness/HEALTH_ASSESSMENT_HARNESS.md', import.meta.url), 'utf8');
}

function openAICompatibleSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(openAICompatibleSchema);
  if (!value || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  const target: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(source)) {
    if (key === 'const') {
      target.enum = [item];
      continue;
    }
    target[key] = openAICompatibleSchema(item);
  }
  return target;
}

export function buildOpenAIResponsesRequest(
  request: AIReviewProviderRequest,
  model: string,
  harnessText: string,
) {
  return {
    model,
    instructions: `${harnessText}\n\nRuntime contract: Review only the supplied JAANCH-AI-REVIEW packet. Preserve deterministic urgent, safety, applicability and evidence-eligibility boundaries. Return only the structured output defined by the response schema.`,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify(request.packet),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'jaanch_ai_assessment',
        description: 'Standardized advisory review of a privacy-minimized Jaanch assessment packet.',
        schema: openAICompatibleSchema(request.outputSchema),
        strict: true,
      },
    },
    store: false,
    max_output_tokens: 3500,
    metadata: {
      jaanch_harness_version: request.harnessVersion,
      jaanch_packet_protocol: request.packet.protocol,
      jaanch_output_schema: AI_OUTPUT_SCHEMA_VERSION,
    },
  };
}

export function createOpenAIResponsesProvider(options: OpenAIResponsesProviderOptions = {}): AIReviewProvider {
  const enabled = options.enabled ?? process.env.JAANCH_AI_LIVE_ENABLED === 'true';
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model = options.model ?? process.env.JAANCH_AI_MODEL;

  return {
    providerId: 'openai-responses',
    modelId: model ?? 'unconfigured',
    async review(request) {
      if (!enabled) throw new Error('Live AI review is disabled. Enable it only after explicit product/user opt-in.');
      if (!apiKey && !options.client) throw new Error('OpenAI API credentials are required for live AI review.');
      if (!model) throw new Error('JAANCH_AI_MODEL is required for live AI review.');
      if (request.harnessVersion !== AI_HARNESS_VERSION) throw new Error(`Unsupported harness version: ${request.harnessVersion}`);
      if (request.packet.protocol !== AI_REVIEW_PACKET_PROTOCOL) throw new Error(`Unsupported packet protocol: ${request.packet.protocol}`);

      const harnessText = options.harnessText ?? await loadJaanchHarness();
      const client = options.client ?? new OpenAI({ apiKey });
      const response = await client.responses.create(buildOpenAIResponsesRequest(request, model, harnessText) as never);
      const text = response.output_text;
      if (!text?.trim()) throw new Error('OpenAI response did not contain structured output text.');
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('OpenAI structured output was not valid JSON.');
      }
    },
  };
}
