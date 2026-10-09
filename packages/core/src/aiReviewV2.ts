import { buildAIReviewPacket, aiReviewOutputJsonSchema, validateAIReviewOutput, type AIReviewOutput, type AIReviewPacket } from './aiReview';
import { clinicalMeasurementEligibility, type CanonicalClinicalMeasurement } from './clinicalMeasurements';
import { createHap } from './hap';
import { compareSnapshots, type AssessmentSnapshot, type LongitudinalHistory } from './longitudinal';
import type { Urgency } from './types';

export const AI_REVIEW_V2_PACKET_PROTOCOL = 'JAANCH-AI-REVIEW-2.0' as const;
export const AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION = 'AI-ASSESSMENT-2.0' as const;
export const AI_REVIEW_V2_HARNESS_VERSION = '2.0' as const;

export type AIReviewV2Packet = {
  protocol: typeof AI_REVIEW_V2_PACKET_PROTOCOL;
  generatedAt: string;
  purpose: 'contextual_longitudinal_review';
  consent: { externalAIReview: true };
  current: AIReviewPacket;
  context: {
    ageBand: 'under_18' | '18_39' | '40_64' | '65_plus' | 'unknown';
    diagnosedConditionCodes: string[];
    currentConcernCodes: string[];
    medicationCategories: string[];
    supplementCategories: string[];
    familyHistoryCodes: string[];
    reproductiveContext?: string;
    activity: {
      walkingDaysPerWeek?: number;
      walkingMinutesPerDay?: number;
      exerciseDaysPerWeek?: number;
      exerciseMinutesPerSession?: number;
      exerciseIntensity?: string;
    };
  };
  longitudinal: {
    available: boolean;
    currentCapturedAt: string;
    previousCapturedAt?: string;
    evidenceCompletenessDelta?: number;
    findingTrends: Array<{
      findingId: string;
      title: string;
      direction: 'improved' | 'worsened' | 'changed' | 'new' | 'resolved' | 'unchanged';
      beforeStatus?: string;
      afterStatus?: string;
      beforeUrgency?: string;
      afterUrgency?: string;
    }>;
    labTrends: Array<{
      markerId: string;
      beforeValue?: number;
      afterValue?: number;
      unit?: string;
      delta?: number;
    }>;
    measurementTrends: Array<{
      markerId: string;
      direction: 'changed' | 'new' | 'resolved';
      before?: string;
      after?: string;
      unit?: string;
    }>;
    recommendationTrends: Array<{
      id: string;
      title: string;
      change: 'added' | 'resolved' | 'disposition_changed';
      beforeDisposition?: string;
      afterDisposition?: string;
    }>;
  };
  minimization: {
    rawAnswersShared: false;
    freeTextShared: false;
    medicationNamesShared: false;
    supplementNamesShared: false;
    previousRawSnapshotShared: false;
    omittedRawAnswerCount: number;
    omittedIneligibleLabRecordCount: number;
    omittedFreeTextFieldCount: number;
    omittedPreviousSnapshotCount: number;
  };
};

export type AIReviewV2Output = {
  schemaVersion: typeof AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION;
  utility: { materialAddition: boolean; reason: string };
  baseReview: AIReviewOutput;
  longitudinalSynthesis: {
    available: boolean;
    summary: string;
    changesWorthAttention: string[];
    stableSignals: string[];
    uncertainChanges: string[];
  };
  prioritizedEvidenceGaps: Array<{
    id: string;
    title: string;
    whyItMatters: string;
    priority: 'routine' | 'monitor' | 'priority' | 'clinician_review';
    sourceEvidenceIds: string[];
  }>;
  contradictions: Array<{
    type: 'evidence_conflict' | 'trend_conflict' | 'engine_disagreement';
    relatedIds: string[];
    summary: string;
    resolutionEvidence: string[];
  }>;
  clinicianPrep: { summary: string; questions: string[]; evidenceToBring: string[] };
};

export type AIReviewV2Validation = { valid: boolean; schemaErrors: string[]; invariantErrors: string[] };
export type AIReviewV2ProviderRequest = { packet: AIReviewV2Packet; harnessVersion: typeof AI_REVIEW_V2_HARNESS_VERSION; outputSchema: typeof aiReviewV2OutputJsonSchema };
export interface AIReviewV2Provider { providerId: string; modelId: string; review(request: AIReviewV2ProviderRequest): Promise<unknown>; }
export type AIReviewV2RunResult = {
  status: 'valid' | 'invalid' | 'provider_error';
  providerId: string;
  modelId: string;
  harnessVersion: typeof AI_REVIEW_V2_HARNESS_VERSION;
  schemaVersion: typeof AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION;
  packetProtocol: typeof AI_REVIEW_V2_PACKET_PROTOCOL;
  output?: AIReviewV2Output;
  validation?: AIReviewV2Validation;
  error?: string;
};

function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function strings(value: unknown): value is string[] { return Array.isArray(value) && value.every((item) => typeof item === 'string'); }
function stringArray(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; }
function numberOrUndefined(value: unknown) { return typeof value === 'number' && Number.isFinite(value) ? value : undefined; }
function ageBand(value: unknown): AIReviewV2Packet['context']['ageBand'] {
  const age = numberOrUndefined(value);
  if (age === undefined) return 'unknown';
  if (age < 18) return 'under_18';
  if (age < 40) return '18_39';
  if (age < 65) return '40_64';
  return '65_plus';
}
function unique(values: Array<string | undefined>) { return [...new Set(values.filter((item): item is string => Boolean(item)))]; }

function contextCapsule(snapshot: AssessmentSnapshot): AIReviewV2Packet['context'] {
  const answers = snapshot.answers;
  const context = snapshot.capturedContext;
  return {
    ageBand: ageBand(answers.age),
    diagnosedConditionCodes: stringArray(answers.diagnosedConditions),
    currentConcernCodes: stringArray(answers.currentConcerns),
    medicationCategories: unique([...stringArray(answers.medicationCategories), ...(context?.medications.map((item) => item.category) ?? [])]),
    supplementCategories: unique([...stringArray(answers.supplementCategories), ...(context?.supplements.map((item) => item.category) ?? [])]),
    familyHistoryCodes: unique(context?.familyHistory ?? []),
    ...(typeof answers.reproductiveContext === 'string' ? { reproductiveContext: answers.reproductiveContext } : {}),
    activity: {
      ...(numberOrUndefined(context?.activity.walkingDaysPerWeek) !== undefined ? { walkingDaysPerWeek: context?.activity.walkingDaysPerWeek } : {}),
      ...(numberOrUndefined(context?.activity.walkingMinutesPerDay) !== undefined ? { walkingMinutesPerDay: context?.activity.walkingMinutesPerDay } : {}),
      ...(numberOrUndefined(context?.activity.exerciseDaysPerWeek) !== undefined ? { exerciseDaysPerWeek: context?.activity.exerciseDaysPerWeek } : {}),
      ...(numberOrUndefined(context?.activity.exerciseMinutesPerSession) !== undefined ? { exerciseMinutesPerSession: context?.activity.exerciseMinutesPerSession } : {}),
      ...(typeof context?.activity.exerciseIntensity === 'string' ? { exerciseIntensity: context.activity.exerciseIntensity } : {}),
    },
  };
}

function freeTextCount(snapshot: AssessmentSnapshot) {
  const context = snapshot.capturedContext;
  if (!context) return 0;
  return [
    ...context.customConditions, ...context.customConcerns, ...context.customFamilyHistory,
    context.concernDetails, context.additionalContext,
    ...context.medications.flatMap((item) => [item.name, item.purpose, item.dose, item.frequency]),
    ...context.supplements.flatMap((item) => [item.name, item.purpose, item.dose, item.frequency]),
  ].filter((item) => typeof item === 'string' && item.trim().length > 0).length;
}

function displayMeasurement(value: CanonicalClinicalMeasurement) {
  return value.markerId === 'blood_pressure' ? `${value.systolic}/${value.diastolic}` : String(value.value);
}
function eligibleMeasurementMap(snapshot: AssessmentSnapshot) {
  const result = new Map<string, CanonicalClinicalMeasurement>();
  for (const record of snapshot.capturedContext?.recordedMeasurements ?? []) {
    const eligibility = clinicalMeasurementEligibility(record, snapshot.capturedAt);
    const canonical = eligibility.canonical;
    if (!eligibility.eligible || !canonical) continue;
    const previous = result.get(canonical.markerId);
    if (!previous || Date.parse(canonical.collectedAt) > Date.parse(previous.collectedAt)) result.set(canonical.markerId, canonical);
  }
  return result;
}
function measurementTrends(previous: AssessmentSnapshot, current: AssessmentSnapshot): AIReviewV2Packet['longitudinal']['measurementTrends'] {
  const before = eligibleMeasurementMap(previous), after = eligibleMeasurementMap(current);
  const markers = new Set([...before.keys(), ...after.keys()]);
  const trends: AIReviewV2Packet['longitudinal']['measurementTrends'] = [];
  for (const markerId of markers) {
    const left = before.get(markerId), right = after.get(markerId);
    if (!left && right) { trends.push({ markerId, direction: 'new', after: displayMeasurement(right), unit: right.canonicalUnit }); continue; }
    if (left && !right) { trends.push({ markerId, direction: 'resolved', before: displayMeasurement(left), unit: left.canonicalUnit }); continue; }
    if (!left || !right) continue;
    const leftValue = displayMeasurement(left), rightValue = displayMeasurement(right);
    if (leftValue !== rightValue || left.canonicalUnit !== right.canonicalUnit) trends.push({ markerId, direction: 'changed', before: leftValue, after: rightValue, unit: right.canonicalUnit });
  }
  return trends;
}

export function buildAIReviewV2Packet(history: LongitudinalHistory, options: { externalAIReviewConsent: boolean }): AIReviewV2Packet {
  if (options.externalAIReviewConsent !== true) throw new Error('External AI review requires explicit opt-in consent.');
  const [latest, previous] = history.snapshots;
  if (!latest) throw new Error('AI Review v2 requires a saved deterministic check-in.');
  const hap = createHap(latest.answers, latest.assessment, latest.labs, latest.recommendationPlan, latest.capturedContext);
  const current = buildAIReviewPacket(hap, { externalAIReviewConsent: true });
  const comparison = previous ? compareSnapshots(previous, latest) : undefined;
  return {
    protocol: AI_REVIEW_V2_PACKET_PROTOCOL,
    generatedAt: new Date().toISOString(),
    purpose: 'contextual_longitudinal_review',
    consent: { externalAIReview: true },
    current,
    context: contextCapsule(latest),
    longitudinal: {
      available: Boolean(previous && comparison), currentCapturedAt: latest.capturedAt,
      ...(previous ? { previousCapturedAt: previous.capturedAt } : {}),
      ...(comparison ? { evidenceCompletenessDelta: comparison.evidenceCompletenessDelta } : {}),
      findingTrends: comparison?.findingTrends ?? [], labTrends: comparison?.labTrends ?? [],
      measurementTrends: previous ? measurementTrends(previous, latest) : [],
      recommendationTrends: comparison?.recommendationTrends.map((item) => ({ ...item })) ?? [],
    },
    minimization: {
      rawAnswersShared: false, freeTextShared: false, medicationNamesShared: false, supplementNamesShared: false, previousRawSnapshotShared: false,
      omittedRawAnswerCount: current.minimization.omittedRawAnswerCount,
      omittedIneligibleLabRecordCount: current.minimization.omittedIneligibleLabRecordCount,
      omittedFreeTextFieldCount: freeTextCount(latest),
      omittedPreviousSnapshotCount: Math.max(0, history.snapshots.length - 1),
    },
  };
}

const priorityEnum = ['routine', 'monitor', 'priority', 'clinician_review'] as const;
const contradictionEnum = ['evidence_conflict', 'trend_conflict', 'engine_disagreement'] as const;
export const aiReviewV2OutputJsonSchema = {
  type: 'object', additionalProperties: false,
  required: ['schemaVersion', 'utility', 'baseReview', 'longitudinalSynthesis', 'prioritizedEvidenceGaps', 'contradictions', 'clinicianPrep'],
  properties: {
    schemaVersion: { type: 'string', const: AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION },
    utility: { type: 'object', additionalProperties: false, required: ['materialAddition', 'reason'], properties: { materialAddition: { type: 'boolean' }, reason: { type: 'string' } } },
    baseReview: aiReviewOutputJsonSchema,
    longitudinalSynthesis: { type: 'object', additionalProperties: false, required: ['available', 'summary', 'changesWorthAttention', 'stableSignals', 'uncertainChanges'], properties: {
      available: { type: 'boolean' }, summary: { type: 'string' }, changesWorthAttention: { type: 'array', maxItems: 5, items: { type: 'string' } }, stableSignals: { type: 'array', maxItems: 5, items: { type: 'string' } }, uncertainChanges: { type: 'array', maxItems: 5, items: { type: 'string' } },
    } },
    prioritizedEvidenceGaps: { type: 'array', maxItems: 5, items: { type: 'object', additionalProperties: false, required: ['id', 'title', 'whyItMatters', 'priority', 'sourceEvidenceIds'], properties: {
      id: { type: 'string' }, title: { type: 'string' }, whyItMatters: { type: 'string' }, priority: { type: 'string', enum: priorityEnum }, sourceEvidenceIds: { type: 'array', items: { type: 'string' } },
    } } },
    contradictions: { type: 'array', maxItems: 5, items: { type: 'object', additionalProperties: false, required: ['type', 'relatedIds', 'summary', 'resolutionEvidence'], properties: {
      type: { type: 'string', enum: contradictionEnum }, relatedIds: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' }, resolutionEvidence: { type: 'array', items: { type: 'string' } },
    } } },
    clinicianPrep: { type: 'object', additionalProperties: false, required: ['summary', 'questions', 'evidenceToBring'], properties: {
      summary: { type: 'string' }, questions: { type: 'array', maxItems: 6, items: { type: 'string' } }, evidenceToBring: { type: 'array', maxItems: 6, items: { type: 'string' } },
    } },
  },
} as const;

export function validateAIReviewV2Output(value: unknown, packet?: AIReviewV2Packet): AIReviewV2Validation {
  const schemaErrors: string[] = [], invariantErrors: string[] = [];
  if (!isObject(value)) return { valid: false, schemaErrors: ['Output must be an object.'], invariantErrors };
  if (value.schemaVersion !== AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION) schemaErrors.push(`schemaVersion must equal ${AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION}.`);
  const utility = value.utility;
  if (!isObject(utility) || typeof utility.materialAddition !== 'boolean' || typeof utility.reason !== 'string') schemaErrors.push('utility is invalid.');
  const baseValidation = validateAIReviewOutput(value.baseReview, packet?.current);
  schemaErrors.push(...baseValidation.schemaErrors.map((error) => `baseReview: ${error}`));
  invariantErrors.push(...baseValidation.invariantErrors.map((error) => `baseReview: ${error}`));
  const longitudinal = value.longitudinalSynthesis;
  if (!isObject(longitudinal) || typeof longitudinal.available !== 'boolean' || typeof longitudinal.summary !== 'string' || !strings(longitudinal.changesWorthAttention) || !strings(longitudinal.stableSignals) || !strings(longitudinal.uncertainChanges)) schemaErrors.push('longitudinalSynthesis is invalid.');
  const gaps = value.prioritizedEvidenceGaps;
  if (!Array.isArray(gaps) || !gaps.every((item) => isObject(item) && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.whyItMatters === 'string' && typeof item.priority === 'string' && priorityEnum.includes(item.priority as (typeof priorityEnum)[number]) && strings(item.sourceEvidenceIds))) schemaErrors.push('prioritizedEvidenceGaps is invalid.');
  const contradictions = value.contradictions;
  if (!Array.isArray(contradictions) || !contradictions.every((item) => isObject(item) && typeof item.type === 'string' && contradictionEnum.includes(item.type as (typeof contradictionEnum)[number]) && strings(item.relatedIds) && typeof item.summary === 'string' && strings(item.resolutionEvidence))) schemaErrors.push('contradictions is invalid.');
  const clinicianPrep = value.clinicianPrep;
  if (!isObject(clinicianPrep) || typeof clinicianPrep.summary !== 'string' || !strings(clinicianPrep.questions) || !strings(clinicianPrep.evidenceToBring)) schemaErrors.push('clinicianPrep is invalid.');
  if (packet && schemaErrors.length === 0) {
    if (isObject(longitudinal) && longitudinal.available !== packet.longitudinal.available) invariantErrors.push('AI cannot claim a longitudinal comparison when the packet has no previous comparable check-in.');
    if (isObject(longitudinal) && !packet.longitudinal.available && ([...(longitudinal.changesWorthAttention as string[]), ...(longitudinal.stableSignals as string[]), ...(longitudinal.uncertainChanges as string[])].length > 0)) invariantErrors.push('AI cannot invent longitudinal changes without longitudinal evidence.');
    const knownIds = new Set<string>([
      ...packet.current.evidence.facts.map((item) => item.id), ...packet.current.evidence.missing.map((item) => item.id), ...packet.current.engineAssessment.findings.map((item) => item.id),
      ...packet.current.engineAssessment.investigations.map((item) => item.id), ...packet.current.engineAssessment.recommendations.map((item) => item.id),
      ...packet.longitudinal.findingTrends.map((item) => item.findingId), ...packet.longitudinal.labTrends.map((item) => item.markerId), ...packet.longitudinal.measurementTrends.map((item) => item.markerId), ...packet.longitudinal.recommendationTrends.map((item) => item.id),
    ]);
    for (const gap of gaps as AIReviewV2Output['prioritizedEvidenceGaps']) if (gap.sourceEvidenceIds.some((id) => !knownIds.has(id))) invariantErrors.push(`Evidence gap references unknown source ID: ${gap.id}.`);
    for (const contradiction of contradictions as AIReviewV2Output['contradictions']) if (contradiction.relatedIds.some((id) => !knownIds.has(id))) invariantErrors.push(`Contradiction references an unknown ID: ${contradiction.summary}.`);
    if (isObject(utility) && utility.materialAddition === false && ((gaps as unknown[]).length > 0 || (contradictions as unknown[]).length > 0)) invariantErrors.push('AI marked no material addition but still emitted prioritized gaps or contradictions.');
  }
  return { valid: schemaErrors.length === 0 && invariantErrors.length === 0, schemaErrors, invariantErrors };
}

export async function runAIReviewV2Packet(packet: AIReviewV2Packet, provider: AIReviewV2Provider): Promise<AIReviewV2RunResult> {
  if (packet.protocol !== AI_REVIEW_V2_PACKET_PROTOCOL) throw new Error(`Unsupported AI Review v2 packet protocol: ${String(packet.protocol)}.`);
  if (packet.consent.externalAIReview !== true) throw new Error('AI Review v2 requires explicit per-run consent.');
  try {
    const raw = await provider.review({ packet, harnessVersion: AI_REVIEW_V2_HARNESS_VERSION, outputSchema: aiReviewV2OutputJsonSchema });
    const validation = validateAIReviewV2Output(raw, packet);
    return { status: validation.valid ? 'valid' : 'invalid', providerId: provider.providerId, modelId: provider.modelId, harnessVersion: AI_REVIEW_V2_HARNESS_VERSION, schemaVersion: AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION, packetProtocol: AI_REVIEW_V2_PACKET_PROTOCOL, ...(validation.valid ? { output: raw as AIReviewV2Output } : {}), validation };
  } catch (error) {
    return { status: 'provider_error', providerId: provider.providerId, modelId: provider.modelId, harnessVersion: AI_REVIEW_V2_HARNESS_VERSION, schemaVersion: AI_REVIEW_V2_OUTPUT_SCHEMA_VERSION, packetProtocol: AI_REVIEW_V2_PACKET_PROTOCOL, error: error instanceof Error ? error.message : String(error) };
  }
}

export function aiReviewV2SignalCount(output: AIReviewV2Output) {
  return output.prioritizedEvidenceGaps.length + output.contradictions.length + output.baseReview.engineReview.disagreements.length + output.baseReview.engineReview.possibleMissingConsiderations.length + output.longitudinalSynthesis.changesWorthAttention.length;
}
export function aiReviewV2HighestPriority(output: AIReviewV2Output): Urgency { return output.baseReview.overall.highestPriority; }
