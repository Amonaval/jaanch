import { buildHealthMapViewModel, type HealthMapTone } from './healthMapView';
import { buildRecommendationViewModel } from './recommendationView';
import { compareSnapshots, type AssessmentSnapshot, type LongitudinalHistory } from './longitudinal';
import type { RecommendationPlan } from './recommendations';
import type { AssessmentResult } from './types';

export type ConsumerResultStatus = 'urgent' | 'attention' | 'needs_evidence' | 'quiet';

export type ConsumerResultItem = {
  id: string;
  title: string;
  detail: string;
  meta?: string;
  tone: HealthMapTone;
};

export type ConsumerActionItem = {
  id: string;
  title: string;
  why: string;
  priorityLabel: string;
  dispositionLabel: string;
  steps: string[];
  tone: HealthMapTone;
};

export type ConsumerChangeItem = {
  id: string;
  title: string;
  detail: string;
  direction: 'improved' | 'worsened' | 'changed' | 'new' | 'resolved';
};

export type ConsumerChangeSummary = {
  title: string;
  headline: string;
  evidenceDelta: number;
  evidenceDetail: string;
  items: ConsumerChangeItem[];
  labChanges: ConsumerChangeItem[];
};

export type ConsumerResultViewModel = {
  hero: {
    eyebrow: string;
    headline: string;
    summary: string;
    status: ConsumerResultStatus;
    tone: HealthMapTone;
    evidenceLabel: string;
    evidenceDetail: string;
    nextBestAction: string;
  };
  stats: {
    interpretedAreas: number;
    uncertaintyCount: number;
    recordedContextCount: number;
    evidenceCompleteness: number;
  };
  mattersNow: ConsumerResultItem[];
  actions: ConsumerActionItem[];
  supported: ConsumerResultItem[];
  uncertainty: ConsumerResultItem[];
  changes?: ConsumerChangeSummary;
  details: {
    healthMap: ReturnType<typeof buildHealthMapViewModel>;
    recommendations: ReturnType<typeof buildRecommendationViewModel>;
  };
};

const uniqueById = <T extends { id:string }>(items:T[]):T[] => [...new Map(items.map(item=>[item.id,item])).values()];

function resultStatus(result:AssessmentResult, healthMap:ReturnType<typeof buildHealthMapViewModel>):ConsumerResultStatus {
  if (result.safetyGate.urgent) return 'urgent';
  if (healthMap.findings.some(item=>item.tone==='high_attention'||item.tone==='attention')) return 'attention';
  if (healthMap.investigations.minimal.length || healthMap.findings.some(item=>item.statusLabel==='Insufficient data'||item.missing.length>0)) return 'needs_evidence';
  return 'quiet';
}

function heroFor(status:ConsumerResultStatus){
  if(status==='urgent') return {
    headline:'One issue needs urgent attention',
    summary:'Jaanch found a configured red-flag pattern. Routine wellness guidance is intentionally secondary until this is addressed.',
    tone:'urgent' as HealthMapTone,
  };
  if(status==='attention') return {
    headline:'A few things deserve your attention',
    summary:'The current evidence contains one or more actionable screening signals. These are not diagnoses; the next steps below focus on the safest useful actions and evidence gaps.',
    tone:'attention' as HealthMapTone,
  };
  if(status==='needs_evidence') return {
    headline:'The main opportunity is reducing uncertainty',
    summary:'No urgent pattern is active, but some areas cannot be assessed confidently from the information available. The Health Map shows the smallest useful next evidence to collect.',
    tone:'neutral' as HealthMapTone,
  };
  return {
    headline:'No high-priority issue from the evidence Jaanch can currently interpret',
    summary:'That does not mean every aspect of your health is known or normal. It means the configured rules did not identify a high-priority signal in the evidence currently available.',
    tone:'positive' as HealthMapTone,
  };
}

function changeSummary(previous:AssessmentSnapshot,current:AssessmentSnapshot):ConsumerChangeSummary {
  const comparison=compareSnapshots(previous,current);
  const items:ConsumerChangeItem[]=comparison.findingTrends.flatMap(item=>item.direction==='unchanged'?[]:[{
    id:`finding:${item.findingId}`,
    title:item.title,
    detail:item.direction==='resolved'?'No longer appears in the current assessment.':item.direction==='new'?'New in the current assessment.':`${item.beforeStatus??'previous'} → ${item.afterStatus??'current'}`,
    direction:item.direction,
  }]);
  const labChanges:ConsumerChangeItem[]=comparison.labTrends
    .filter(item=>item.beforeValue===undefined||item.afterValue===undefined||item.delta!==0)
    .map(item=>({
      id:`lab:${item.markerId}`,
      title:item.markerId==='hba1c'?'HbA1c':'Vitamin B12',
      detail:item.beforeValue===undefined?`New measured value: ${item.afterValue} ${item.unit??''}`.trim():item.afterValue===undefined?'No current eligible value.':`${item.beforeValue} → ${item.afterValue} ${item.unit??''}${item.delta===undefined?'':` (${item.delta>0?'+':''}${Math.round(item.delta*10)/10})`}`.trim(),
      direction:'changed',
    }));
  const meaningful=items.length+labChanges.length;
  const delta=Math.abs(comparison.evidenceCompletenessDelta);
  const evidenceDetail=comparison.evidenceCompletenessDelta===0
    ? 'Evidence completeness is unchanged.'
    : `Evidence completeness ${comparison.evidenceCompletenessDelta>0?'improved':'decreased'} by ${delta} percentage point${delta===1?'':'s'}.`;
  return {
    title:'Since your last saved check-in',
    headline:meaningful?`${meaningful} meaningful change${meaningful===1?'':'s'} detected`:'No meaningful assessment change detected',
    evidenceDelta:comparison.evidenceCompletenessDelta,
    evidenceDetail,
    items:items.slice(0,5),
    labChanges:labChanges.slice(0,4),
  };
}

export function buildConsumerResultViewModel(input:{
  result:AssessmentResult;
  recommendationPlan:RecommendationPlan;
  currentSnapshot?:AssessmentSnapshot;
  history?:LongitudinalHistory;
  recordedContextCount?:number;
}):ConsumerResultViewModel {
  const healthMap=buildHealthMapViewModel(input.result);
  const recommendations=buildRecommendationViewModel(input.recommendationPlan);
  const status=resultStatus(input.result,healthMap);
  const hero=heroFor(status);

  const mattersNow:ConsumerResultItem[]=healthMap.topPriorities.map(item=>({
    id:item.id,
    title:item.title,
    detail:item.detail,
    tone:item.tone,
    meta:item.kind==='investigation'?'Evidence gap':item.kind==='finding'?'Screening signal':item.kind==='urgent'?'Urgent':'Safety context',
  })).slice(0,4);

  const actions:ConsumerActionItem[]=recommendations.top
    .filter(item=>item.dispositionLabel!=='Blocked')
    .slice(0,4)
    .map(item=>({
      id:item.id,
      title:item.title,
      why:item.rationale,
      priorityLabel:item.priorityLabel,
      dispositionLabel:item.dispositionLabel,
      steps:item.steps.slice(0,3),
      tone:item.dispositionLabel==='Clinician review'?'attention':'neutral',
    }));

  const supported:ConsumerResultItem[]=healthMap.findings
    .filter(item=>item.statusLabel!=='Insufficient data')
    .map(item=>({
      id:`supported:${item.id}`,
      title:item.title,
      detail:item.summary,
      meta:`${item.statusLabel} · ${item.confidenceLabel} · ${item.evidenceLevelLabel}`,
      tone:item.tone,
    }));

  const uncertaintyFromFindings:ConsumerResultItem[]=healthMap.findings
    .filter(item=>item.statusLabel==='Insufficient data'||item.missing.length>0)
    .map(item=>({
      id:`uncertain:${item.id}`,
      title:item.domainLabel,
      detail:item.missing[0]?.detail??'More evidence is needed before this area can be assessed confidently.',
      meta:item.statusLabel==='Insufficient data'?'Not enough evidence':'Evidence gap remains',
      tone:'neutral',
    }));
  const uncertaintyFromTests:ConsumerResultItem[]=healthMap.investigations.minimal.map(item=>({
    id:`test:${item.id}`,
    title:`Consider ${item.title}`,
    detail:item.rationale,
    meta:item.priorityLabel,
    tone:'attention',
  }));
  const uncertainty=uniqueById([...uncertaintyFromFindings,...uncertaintyFromTests]).slice(0,6);

  const nextBestAction = status==='urgent'
    ? healthMap.urgentMessages[0] ?? 'Seek urgent medical evaluation.'
    : actions[0]?.title
      ?? uncertaintyFromTests[0]?.title
      ?? 'Keep your information current and repeat the assessment when meaningful evidence changes.';

  const latest=input.history?.snapshots[0];
  const changes=latest&&input.currentSnapshot&&latest.id!==input.currentSnapshot.id?changeSummary(latest,input.currentSnapshot):undefined;
  const interpretedAreas=healthMap.findings.filter(item=>item.statusLabel!=='Insufficient data').length;

  return {
    hero:{
      eyebrow:'Your Jaanch Health Map',
      headline:hero.headline,
      summary:hero.summary,
      status,
      tone:hero.tone,
      evidenceLabel:healthMap.evidence.label,
      evidenceDetail:`${healthMap.evidence.answered} of ${healthMap.evidence.available} configured evidence inputs are currently available. Completeness measures available evidence, not overall health.`,
      nextBestAction,
    },
    stats:{
      interpretedAreas,
      uncertaintyCount:uncertainty.length,
      recordedContextCount:input.recordedContextCount??0,
      evidenceCompleteness:healthMap.evidence.completeness,
    },
    mattersNow,
    actions,
    supported,
    uncertainty,
    ...(changes?{changes}:{}),
    details:{healthMap,recommendations},
  };
}
