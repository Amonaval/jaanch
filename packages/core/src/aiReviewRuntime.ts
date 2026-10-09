import {
  AI_HARNESS_VERSION,
  AI_OUTPUT_SCHEMA_VERSION,
  AI_REVIEW_PACKET_PROTOCOL,
  aiReviewOutputJsonSchema,
  validateAIReviewOutput,
  type AIReviewOutput,
  type AIReviewPacket,
  type AIReviewProvider,
  type AIReviewRunResult,
} from './aiReview';

/**
 * Runs a live/provider review from an already privacy-minimized packet.
 *
 * This is intentionally separate from runAIReview(hap, ...): web/server
 * integrations can build the minimized packet in the client, send only that
 * packet across the network boundary, and still reuse the same provider and
 * invariant validation contract.
 */
export async function runAIReviewPacket(
  packet: AIReviewPacket,
  provider: AIReviewProvider,
): Promise<AIReviewRunResult> {
  if (packet.protocol !== AI_REVIEW_PACKET_PROTOCOL) {
    throw new Error(`Unsupported AI review packet protocol: ${String(packet.protocol)}.`);
  }
  if (packet.consent?.externalAIReview !== true) {
    throw new Error('External AI review packet must carry explicit opt-in consent.');
  }

  try {
    const raw = await provider.review({
      packet,
      harnessVersion: AI_HARNESS_VERSION,
      outputSchema: aiReviewOutputJsonSchema,
    });
    const validation = validateAIReviewOutput(raw, packet);
    return {
      status: validation.valid ? 'valid' : 'invalid',
      providerId: provider.providerId,
      modelId: provider.modelId,
      harnessVersion: AI_HARNESS_VERSION,
      schemaVersion: AI_OUTPUT_SCHEMA_VERSION,
      packetProtocol: AI_REVIEW_PACKET_PROTOCOL,
      ...(validation.valid ? { output: raw as AIReviewOutput } : {}),
      validation,
    };
  } catch (error) {
    return {
      status: 'provider_error',
      providerId: provider.providerId,
      modelId: provider.modelId,
      harnessVersion: AI_HARNESS_VERSION,
      schemaVersion: AI_OUTPUT_SCHEMA_VERSION,
      packetProtocol: AI_REVIEW_PACKET_PROTOCOL,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
