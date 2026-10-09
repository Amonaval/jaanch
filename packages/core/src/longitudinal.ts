import type { RecommendationPlan } from './recommendations';
import type { AssessmentCaptureContext } from './intake';
import type { Answers, AssessmentResult, LabMarkerId, NormalizedLabRecord, SafetyDisposition } from './types';
import { sanitizeInternalClinicalEvidence } from './clinicalMeasurements';
import { decodePersistedHistoryPayload, encodeHistoryPersistenceEnvelope } from './persistence';

export const LONGITUDINAL_HISTORY_PROTOCOL = 'JAANCH-HISTORY-1.0' as const;
export const ASSESSMENT_SNAPSHOT_PROTOCOL = 'JAANCH-SNAPSHOT-1.0' as const;

export type AssessmentSnapshot = {
  protocol: typeof ASSESSMENT_SNAPSHOT_PROTOCOL;
  id: string;
  capturedAt: string;
  answers: Answers;
  capturedContext?: AssessmentCaptureContext;
  labs: NormalizedLabRecord[];
  assessment: AssessmentResult;
  recommendationPlan: RecommendationPlan;
};

export type LongitudinalHistory = {
  protocol: typeof LONGITUDINAL_HISTORY_PROTOCOL;
  snapshots: AssessmentSnapshot[];
};

export type FindingTrend = {
  findingId: string;
  title: string;
  beforeStatus?: string;
  afterStatus?: string;
  beforeUrgency?: string;
  afterUrgency?: string;
  direction: 'improved' | 'worsened' | 'changed' | 'new' | 'resolved' | 'unchanged';
};

export type LabTrend = {
  markerId: LabMarkerId;
  beforeValue?: number;
  afterValue?: number;
  unit?: string;
  delta?: number;
};

export type RecommendationTrend = {
  id: string;
  title: string;
  change: 'added' | 'resolved' | 'disposition_changed';
  beforeDisposition?: SafetyDisposition;
  afterDisposition?: SafetyDisposition;
};

export type SnapshotComparison = {
  previousSnapshotId: string;
  currentSnapshotId: string;
  evidenceCompletenessDelta: number;
  findingTrends: FindingTrend[];
  resolvedInvestigationIds: string[];
  addedInvestigationIds: string[];
  recommendationTrends: RecommendationTrend[];
  labTrends: LabTrend[];
};

export type LongitudinalViewModel = {
  title: string;
  snapshotCount: number;
  latest?: {
    id: string;
    capturedAt: string;
    evidenceCompleteness: number;
    findingCount: number;
    topRecommendationCount: number;
  };
  comparison?: SnapshotComparison;
};

const urgencyRank: Record<string, number> = { routine:0, monitor:1, priority:2, clinician_review:3, urgent:4 };
const findingStatusRank: Record<string, number> = { good:0, monitor:1, insufficient_data:2, investigate:3, high_attention:4 };

function clone<T>(value:T):T { return JSON.parse(JSON.stringify(value)) as T; }

export function emptyLongitudinalHistory(): LongitudinalHistory {
  return { protocol: LONGITUDINAL_HISTORY_PROTOCOL, snapshots: [] };
}

export function createAssessmentSnapshot(input:{
  answers:Answers;
  capturedContext?:AssessmentCaptureContext;
  labs?:NormalizedLabRecord[];
  assessment:AssessmentResult;
  recommendationPlan:RecommendationPlan;
  capturedAt?:string;
  id?:string;
}):AssessmentSnapshot {
  const capturedAt=input.capturedAt ?? new Date().toISOString();
  const id=input.id ?? `snapshot-${capturedAt.replace(/[^0-9]/g,'')}`;
  return {
    protocol:ASSESSMENT_SNAPSHOT_PROTOCOL,
    id,
    capturedAt,
    answers:clone(sanitizeInternalClinicalEvidence(input.answers)),
    ...(input.capturedContext ? { capturedContext:clone(input.capturedContext) } : {}),
    labs:clone(input.labs ?? []),
    assessment:clone(input.assessment),
    recommendationPlan:clone(input.recommendationPlan),
  };
}

export function addSnapshot(history:LongitudinalHistory,snapshot:AssessmentSnapshot,maxSnapshots=20):LongitudinalHistory {
  const withoutDuplicate=history.snapshots.filter((item)=>item.id!==snapshot.id);
  const snapshots=[snapshot,...withoutDuplicate].sort((a,b)=>Date.parse(b.capturedAt)-Date.parse(a.capturedAt)).slice(0,maxSnapshots);
  return { protocol:LONGITUDINAL_HISTORY_PROTOCOL, snapshots:clone(snapshots) };
}

export function removeSnapshot(history:LongitudinalHistory,snapshotId:string):LongitudinalHistory {
  return { protocol:LONGITUDINAL_HISTORY_PROTOCOL, snapshots:history.snapshots.filter((snapshot)=>snapshot.id!==snapshotId) };
}

export function encodeLongitudinalHistory(history:LongitudinalHistory):string { return encodeHistoryPersistenceEnvelope(history); }

export function decodeLongitudinalHistory(raw:string|null|undefined):LongitudinalHistory {
  return decodePersistedHistoryPayload(raw);
}

function findingDirection(before:AssessmentSnapshot['assessment']['findings'][number],after:AssessmentSnapshot['assessment']['findings'][number]):FindingTrend['direction'] {
  if(before.status===after.status && before.urgency===after.urgency) return 'unchanged';
  const beforeWeight=(urgencyRank[before.urgency]??0)*10+(findingStatusRank[before.status]??0);
  const afterWeight=(urgencyRank[after.urgency]??0)*10+(findingStatusRank[after.status]??0);
  if(afterWeight<beforeWeight) return 'improved';
  if(afterWeight>beforeWeight) return 'worsened';
  return 'changed';
}

function latestEligibleLabs(snapshot:AssessmentSnapshot){
  const byMarker=new Map<LabMarkerId,NormalizedLabRecord>();
  for(const lab of snapshot.labs.filter((item)=>item.eligibleForAssessment)){
    const previous=byMarker.get(lab.markerId);
    if(!previous || Date.parse(lab.collectedAt)>Date.parse(previous.collectedAt)) byMarker.set(lab.markerId,lab);
  }
  return byMarker;
}

export function compareSnapshots(previous:AssessmentSnapshot,current:AssessmentSnapshot):SnapshotComparison {
  const previousFindings=new Map(previous.assessment.findings.map((finding)=>[finding.id,finding]));
  const currentFindings=new Map(current.assessment.findings.map((finding)=>[finding.id,finding]));
  const findingIds=new Set([...previousFindings.keys(),...currentFindings.keys()]);
  const findingTrends:FindingTrend[]=[];
  for(const findingId of findingIds){
    const before=previousFindings.get(findingId), after=currentFindings.get(findingId);
    if(!before&&after) findingTrends.push({findingId,title:after.title,afterStatus:after.status,afterUrgency:after.urgency,direction:'new'});
    else if(before&&!after) findingTrends.push({findingId,title:before.title,beforeStatus:before.status,beforeUrgency:before.urgency,direction:'resolved'});
    else if(before&&after) findingTrends.push({findingId,title:after.title,beforeStatus:before.status,afterStatus:after.status,beforeUrgency:before.urgency,afterUrgency:after.urgency,direction:findingDirection(before,after)});
  }

  const beforeInvestigations=new Set(previous.assessment.testPlan.recommendations.map((item)=>item.id));
  const afterInvestigations=new Set(current.assessment.testPlan.recommendations.map((item)=>item.id));
  const resolvedInvestigationIds=[...beforeInvestigations].filter((id)=>!afterInvestigations.has(id));
  const addedInvestigationIds=[...afterInvestigations].filter((id)=>!beforeInvestigations.has(id));

  const beforeRecommendations=new Map(previous.recommendationPlan.recommendations.map((item)=>[item.id,item]));
  const afterRecommendations=new Map(current.recommendationPlan.recommendations.map((item)=>[item.id,item]));
  const recommendationIds=new Set([...beforeRecommendations.keys(),...afterRecommendations.keys()]);
  const recommendationTrends:RecommendationTrend[]=[];
  for(const id of recommendationIds){
    const before=beforeRecommendations.get(id), after=afterRecommendations.get(id);
    if(!before&&after) recommendationTrends.push({id,title:after.title,change:'added',afterDisposition:after.disposition});
    else if(before&&!after) recommendationTrends.push({id,title:before.title,change:'resolved',beforeDisposition:before.disposition});
    else if(before&&after&&before.disposition!==after.disposition) recommendationTrends.push({id,title:after.title,change:'disposition_changed',beforeDisposition:before.disposition,afterDisposition:after.disposition});
  }

  const beforeLabs=latestEligibleLabs(previous), afterLabs=latestEligibleLabs(current);
  const labMarkerIds=new Set<LabMarkerId>([...beforeLabs.keys(),...afterLabs.keys()]);
  const labTrends:LabTrend[]=[...labMarkerIds].map((markerId)=>{
    const before=beforeLabs.get(markerId), after=afterLabs.get(markerId);
    return { markerId, beforeValue:before?.normalizedValue, afterValue:after?.normalizedValue, unit:after?.canonicalUnit??before?.canonicalUnit, ...(before&&after?{delta:after.normalizedValue-before.normalizedValue}:{}) };
  });

  return { previousSnapshotId:previous.id,currentSnapshotId:current.id,evidenceCompletenessDelta:current.assessment.evidenceCompleteness-previous.assessment.evidenceCompleteness,findingTrends,resolvedInvestigationIds,addedInvestigationIds,recommendationTrends,labTrends };
}

export function buildLongitudinalViewModel(history:LongitudinalHistory):LongitudinalViewModel {
  const [latest,previous]=history.snapshots;
  return {
    title:'Health history', snapshotCount:history.snapshots.length,
    latest:latest?{id:latest.id,capturedAt:latest.capturedAt,evidenceCompleteness:latest.assessment.evidenceCompleteness,findingCount:latest.assessment.findings.length,topRecommendationCount:latest.recommendationPlan.topRecommendationIds.length}:undefined,
    comparison:latest&&previous?compareSnapshots(previous,latest):undefined,
  };
}
