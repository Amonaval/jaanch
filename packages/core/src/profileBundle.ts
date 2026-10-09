import { assess } from './engine';
import { buildRecommendationPlan } from './recommendations';
import { emptyAssessmentCaptureContext, materializeAssessmentAnswers, type AssessmentCaptureContext } from './intake';
import { reassessWithLabs } from './labs';
import { createAssessmentSnapshot, emptyLongitudinalHistory, type AssessmentSnapshot, type LongitudinalHistory } from './longitudinal';
import { materializeClinicalMeasurementAnswers, sanitizeInternalClinicalEvidence } from './clinicalMeasurements';
import type { Answers, LabRecord, NormalizedLabRecord } from './types';

export const JAANCH_PROFILE_PROTOCOL='JAANCH-PROFILE-1.0' as const;

export type JaanchProfileDraft={
  answers:Answers;
  capturedContext:AssessmentCaptureContext;
  labs:LabRecord[];
};

export type JaanchProfileBundle={
  protocol:typeof JAANCH_PROFILE_PROTOCOL;
  id:string;
  label:string;
  description?:string;
  exportedAt:string;
  draft:JaanchProfileDraft;
  history?:LongitudinalHistory;
};

export type ProfileRunResult={
  bundle:JaanchProfileBundle;
  snapshot:AssessmentSnapshot;
};

function rawLab(record:NormalizedLabRecord):LabRecord{
  const { canonicalUnit:_canonicalUnit,normalizedValue:_normalizedValue,ageDays:_ageDays,freshness:_freshness,eligibleForAssessment:_eligibleForAssessment,issues:_issues,...raw }=record;
  return raw;
}

function clone<T>(value:T):T{return JSON.parse(JSON.stringify(value)) as T;}
const arr=<T>(value:unknown):T[]=>Array.isArray(value)?value as T[]:[];

function normalizeContext(value:unknown):AssessmentCaptureContext{
  const base=emptyAssessmentCaptureContext();
  if(!value||typeof value!=='object')return base;
  const input=value as Partial<AssessmentCaptureContext>;
  return {
    unitPreference:input.unitPreference==='imperial'?'imperial':'metric',
    customConditions:arr<string>(input.customConditions).map(String),
    medications:arr<AssessmentCaptureContext['medications'][number]>(input.medications).filter((item)=>Boolean(item&&item.id&&item.name)),
    supplements:arr<AssessmentCaptureContext['supplements'][number]>(input.supplements).filter((item)=>Boolean(item&&item.id&&item.name)),
    customConcerns:arr<string>(input.customConcerns).map(String),
    ...(typeof input.concernDetails==='string'?{concernDetails:input.concernDetails}:{}),
    familyHistory:arr<string>(input.familyHistory).map(String),
    customFamilyHistory:arr<string>(input.customFamilyHistory).map(String),
    activity:{
      walkingDaysPerWeek:input.activity?.walkingDaysPerWeek,
      walkingMinutesPerDay:input.activity?.walkingMinutesPerDay,
      stepsPerDay:input.activity?.stepsPerDay,
      walkingPace:input.activity?.walkingPace,
      exerciseTypes:arr<string>(input.activity?.exerciseTypes).map(String),
      exerciseDaysPerWeek:input.activity?.exerciseDaysPerWeek,
      exerciseMinutesPerSession:input.activity?.exerciseMinutesPerSession,
      exerciseIntensity:input.activity?.exerciseIntensity,
      ...(typeof input.activity?.otherActivity==='string'?{otherActivity:input.activity.otherActivity}:{}),
    },
    recordedMeasurements:arr<AssessmentCaptureContext['recordedMeasurements'][number]>(input.recordedMeasurements).filter((item)=>Boolean(item&&item.id&&item.markerId&&typeof item.value==='string')),
    ...(typeof input.additionalContext==='string'?{additionalContext:input.additionalContext}:{}),
  };
}

function normalizeLabs(value:unknown):LabRecord[]{
  return arr<LabRecord>(value).filter((item)=>Boolean(item&&item.id&&(item.markerId==='hba1c'||item.markerId==='vitamin_b12')&&Number.isFinite(item.value)&&typeof item.unit==='string'&&typeof item.collectedAt==='string'&&(item.verification==='user_confirmed'||item.verification==='unverified')));
}

function normalizeBundle(value:unknown):JaanchProfileBundle{
  if(!value||typeof value!=='object')throw new Error('Profile JSON must contain an object.');
  const input=value as Partial<JaanchProfileBundle>;
  if(input.protocol!==JAANCH_PROFILE_PROTOCOL)throw new Error(`Unsupported profile protocol: ${String(input.protocol??'missing')}.`);
  if(!input.draft||typeof input.draft!=='object')throw new Error('Profile draft is missing.');
  const draft=input.draft as Partial<JaanchProfileDraft>;
  const answers=draft.answers&&typeof draft.answers==='object'&&!Array.isArray(draft.answers)?sanitizeInternalClinicalEvidence(draft.answers as Answers):{};
  const label=typeof input.label==='string'&&input.label.trim()?input.label.trim():'Imported Jaanch profile';
  const exportedAt=typeof input.exportedAt==='string'&&!Number.isNaN(Date.parse(input.exportedAt))?input.exportedAt:new Date().toISOString();
  return {
    protocol:JAANCH_PROFILE_PROTOCOL,
    id:typeof input.id==='string'&&input.id.trim()?input.id:`profile-${Date.now()}`,
    label,
    ...(typeof input.description==='string'&&input.description.trim()?{description:input.description.trim()}:{}),
    exportedAt,
    draft:{ answers, capturedContext:normalizeContext(draft.capturedContext), labs:normalizeLabs(draft.labs) },
    ...(input.history&&input.history.protocol==='JAANCH-HISTORY-1.0'&&Array.isArray(input.history.snapshots)?{history:clone(input.history)}:{}),
  };
}

export function decodeProfileBundle(raw:string):JaanchProfileBundle{
  try{return normalizeBundle(JSON.parse(raw));}catch(error){if(error instanceof SyntaxError)throw new Error('Profile file is not valid JSON.');throw error;}
}

export function encodeProfileBundle(bundle:JaanchProfileBundle){return JSON.stringify(normalizeBundle(bundle),null,2);}

export function runProfileBundle(input:JaanchProfileBundle,capturedAt=new Date().toISOString()):ProfileRunResult{
  const bundle=normalizeBundle(input);
  const materialized=materializeAssessmentAnswers(bundle.draft.answers,bundle.draft.capturedContext);
  const effectiveAnswers=materializeClinicalMeasurementAnswers(materialized,bundle.draft.capturedContext.recordedMeasurements,capturedAt);
  const reassessment=bundle.draft.labs.length?reassessWithLabs(effectiveAnswers,bundle.draft.labs,capturedAt):undefined;
  const result=reassessment?.after??assess(effectiveAnswers);
  const recommendationPlan=buildRecommendationPlan(effectiveAnswers,result);
  const snapshot=createAssessmentSnapshot({ answers:effectiveAnswers,capturedContext:bundle.draft.capturedContext,labs:reassessment?.normalizedLabs??[],assessment:result,recommendationPlan,capturedAt,id:`profile-run-${bundle.id}-${capturedAt.replace(/[^0-9]/g,'')}` });
  return { bundle,snapshot };
}

export function createProfileBundle(input:{
  label:string;
  description?:string;
  answers?:Answers;
  capturedContext?:AssessmentCaptureContext;
  labs?:LabRecord[];
  history?:LongitudinalHistory;
  id?:string;
  exportedAt?:string;
}):JaanchProfileBundle{
  return normalizeBundle({ protocol:JAANCH_PROFILE_PROTOCOL,id:input.id??`profile-${Date.now()}`,label:input.label,description:input.description,exportedAt:input.exportedAt??new Date().toISOString(),draft:{answers:input.answers??{},capturedContext:input.capturedContext??emptyAssessmentCaptureContext(),labs:input.labs??[]},history:input.history });
}

export function profileBundleFromSnapshot(snapshot:AssessmentSnapshot,label='Exported Jaanch profile',history?:LongitudinalHistory):JaanchProfileBundle{
  return createProfileBundle({ id:`profile-${snapshot.id}`,label,description:`Exported from Jaanch check-in ${snapshot.id}.`,answers:snapshot.answers,capturedContext:snapshot.capturedContext??emptyAssessmentCaptureContext(),labs:snapshot.labs.map(rawLab),history,exportedAt:new Date().toISOString() });
}

export function profileBundleFromHistory(history:LongitudinalHistory,label='Exported Jaanch profile'){
  const latest=history.snapshots[0];
  if(!latest)throw new Error('Save or run a profile before exporting.');
  return profileBundleFromSnapshot(latest,label,history);
}

export function profileHistoryOrEmpty(bundle:JaanchProfileBundle){return bundle.history??emptyLongitudinalHistory();}
