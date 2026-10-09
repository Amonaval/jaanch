import { buildRecommendationPlan } from './recommendations';
import { materializeAssessmentAnswers, emptyAssessmentCaptureContext, type AssessmentCaptureContext } from './intake';
import { addSnapshot, createAssessmentSnapshot, type AssessmentSnapshot, type LongitudinalHistory } from './longitudinal';
import { labMarkerDefinition, reassessWithLabs } from './labs';
import { removeBareLabAnswers } from './answerNormalization';
import type { Answers, LabRecord, NormalizedLabRecord } from './types';

export const JAANCH_PROFILE_PROTOCOL = 'JAANCH-PROFILE-1.0' as const;

export type JaanchProfile = {
  protocol: typeof JAANCH_PROFILE_PROTOCOL;
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  answers: Answers;
  capturedContext: AssessmentCaptureContext;
  labs: LabRecord[];
};

function clone<T>(value:T):T { return JSON.parse(JSON.stringify(value)) as T; }
function rawLab(record: NormalizedLabRecord): LabRecord {
  const { canonicalUnit:_canonicalUnit, normalizedValue:_normalizedValue, ageDays:_ageDays, freshness:_freshness, eligibleForAssessment:_eligibleForAssessment, issues:_issues, ...raw } = record;
  return raw;
}

export function createJaanchProfile(input:{
  id:string;
  name:string;
  description?:string;
  createdAt?:string;
  answers:Answers;
  capturedContext?:AssessmentCaptureContext;
  labs?:LabRecord[];
}):JaanchProfile {
  return {
    protocol:JAANCH_PROFILE_PROTOCOL,
    id:input.id.trim(),
    name:input.name.trim(),
    ...(input.description?.trim()?{description:input.description.trim()}:{}),
    createdAt:input.createdAt ?? new Date().toISOString(),
    answers:clone(input.answers),
    capturedContext:clone(input.capturedContext ?? emptyAssessmentCaptureContext()),
    labs:clone(input.labs ?? []),
  };
}

export function validateJaanchProfile(profile:JaanchProfile):string[]{
  const errors:string[]=[];
  if(profile.protocol!==JAANCH_PROFILE_PROTOCOL) errors.push(`Unsupported profile protocol: ${String(profile.protocol)}`);
  if(!profile.id?.trim()) errors.push('Profile id is required.');
  if(!profile.name?.trim()) errors.push('Profile name is required.');
  if(!profile.answers || typeof profile.answers!=='object' || Array.isArray(profile.answers)) errors.push('Profile answers must be an object.');
  if(!profile.capturedContext || typeof profile.capturedContext!=='object') errors.push('Profile capturedContext is required.');
  else {
    const context=profile.capturedContext;
    for(const field of ['customConditions','medications','supplements','customConcerns','familyHistory','customFamilyHistory','recordedMeasurements'] as const) if(!Array.isArray(context[field])) errors.push(`Profile capturedContext.${field} must be an array.`);
    if(!context.activity || typeof context.activity!=='object' || !Array.isArray(context.activity.exerciseTypes)) errors.push('Profile capturedContext.activity.exerciseTypes must be an array.');
  }
  if(!Array.isArray(profile.labs)) errors.push('Profile labs must be an array.');
  for(const lab of Array.isArray(profile.labs)?profile.labs:[]){
    if(!labMarkerDefinition(lab.markerId)) errors.push(`Unsupported lab marker in profile: ${String(lab.markerId)}`);
    if(!Number.isFinite(lab.value)) errors.push(`${lab.id}: lab value must be numeric.`);
    if(!lab.unit?.trim()) errors.push(`${lab.id}: lab unit is required.`);
    if(!lab.collectedAt || Number.isNaN(Date.parse(lab.collectedAt))) errors.push(`${lab.id}: valid collection date is required.`);
  }
  return errors;
}

export function encodeJaanchProfile(profile:JaanchProfile):string {
  const errors=validateJaanchProfile(profile); if(errors.length) throw new Error(`Invalid Jaanch profile: ${errors.join(' | ')}`);
  return JSON.stringify(profile,null,2);
}

export function decodeJaanchProfile(raw:string):JaanchProfile {
  let parsed:unknown;
  try{ parsed=JSON.parse(raw); }catch{ throw new Error('Profile is not valid JSON.'); }
  if(!parsed || typeof parsed!=='object') throw new Error('Profile JSON must contain an object.');
  const profile=parsed as JaanchProfile;
  const errors=validateJaanchProfile(profile); if(errors.length) throw new Error(`Invalid Jaanch profile: ${errors.join(' | ')}`);
  return clone(profile);
}

export function profileFromSnapshot(snapshot:AssessmentSnapshot,input?:{id?:string;name?:string;description?:string}):JaanchProfile {
  return createJaanchProfile({
    id:input?.id ?? `profile-${snapshot.id}`,
    name:input?.name ?? `Jaanch profile — ${new Date(snapshot.capturedAt).toLocaleDateString()}`,
    description:input?.description,
    createdAt:snapshot.capturedAt,
    answers:removeBareLabAnswers(snapshot.answers),
    capturedContext:snapshot.capturedContext ?? emptyAssessmentCaptureContext(),
    labs:snapshot.labs.map(rawLab),
  });
}

export function snapshotFromProfile(profile:JaanchProfile,input?:{capturedAt?:string;id?:string}):AssessmentSnapshot {
  const errors=validateJaanchProfile(profile); if(errors.length) throw new Error(`Invalid Jaanch profile: ${errors.join(' | ')}`);
  const capturedAt=input?.capturedAt ?? new Date().toISOString();
  const materialized=materializeAssessmentAnswers(removeBareLabAnswers(profile.answers),profile.capturedContext);
  const reassessment=reassessWithLabs(materialized,profile.labs,capturedAt);
  const assessment=reassessment.after;
  const recommendationPlan=buildRecommendationPlan(materialized,assessment);
  return createAssessmentSnapshot({
    answers:materialized,
    capturedContext:profile.capturedContext,
    labs:reassessment.normalizedLabs,
    assessment,
    recommendationPlan,
    capturedAt,
    id:input?.id ?? `profile-run-${profile.id}-${capturedAt.replace(/[^0-9]/g,'')}`,
  });
}

export function addProfileToHistory(input:{history:LongitudinalHistory;profile:JaanchProfile;capturedAt?:string;id?:string}){
  const snapshot=snapshotFromProfile(input.profile,{capturedAt:input.capturedAt,id:input.id});
  return { snapshot, history:addSnapshot(input.history,snapshot) };
}
