import type { Recommendation, RecommendationPlan } from './recommendations';
import type { AssessmentResult, EvidenceNode, Finding } from './types';

export type HealthBriefTone = 'urgent' | 'attention' | 'neutral' | 'positive';
export type HealthBriefPriority = {
  id: string;
  rank: number;
  title: string;
  tone: HealthBriefTone;
  statusLabel: string;
  whatJaanchSees: string;
  whyItMatters: string;
  evidence: { id:string; label:string; detail:string }[];
  nextAction: string;
  nextActionDetail?: string;
  canWait: string;
  decisionChangingEvidence: string[];
  findingIds: string[];
  recommendationIds: string[];
};

export type HealthIntelligenceBrief = {
  eyebrow: string;
  headline: string;
  summary: string;
  tone: HealthBriefTone;
  priorities: HealthBriefPriority[];
  nextBestAction: string;
  mostUsefulMissingEvidence?: string;
  interpretedAreaCount: number;
  evidenceCompleteness: number;
  detailNote: string;
};

type ThemeDefinition = { id:string; findingIds:string[]; defaultTitle:string; canWait:string };
const themes:ThemeDefinition[]=[
  {id:'cardiometabolic',findingIds:['MET-001','CV-BP-001','CV-LIPID-001'],defaultTitle:'Cardiometabolic health needs a closer look',canWait:'Do not treat every number as a separate problem. Resolve the highest-impact cardiovascular/metabolic decisions before chasing smaller optimizations.'},
  {id:'blood-nutrition',findingIds:['NUT-001','NUT-IRON-001'],defaultTitle:'Blood and nutrition evidence need one joined review',canWait:'Do not assume one nutritional cause or choose a therapeutic replacement regimen until the measured evidence and likely cause are clear.'},
  {id:'thyroid',findingIds:['MET-THYROID-001'],defaultTitle:'Thyroid evidence needs confirmation',canWait:'Do not change thyroid medicine from one result alone; confirmation and treatment context come first.'},
  {id:'sleep',findingIds:['SLP-001'],defaultTitle:'Sleep deserves focused attention',canWait:'Generic sleep optimization is secondary if symptoms suggest a sleep disorder that needs proper evaluation.'},
];
const statusRank:Record<string,number>={good:0,monitor:20,insufficient_data:48,investigate:70,high_attention:100};
const urgencyRank:Record<string,number>={routine:0,monitor:5,priority:12,clinician_review:18,urgent:30};
const priorityRank:Record<string,number>={high:0,medium:1,low:2};
const dispositionRank:Record<string,number>={clinician_review:0,caution:1,allowed:2,blocked:3};
const findingWeight=(finding:Finding)=>(statusRank[finding.status]??0)+(urgencyRank[finding.urgency]??0);
const meaningfulFinding=(finding:Finding)=>finding.status==='high_attention'||finding.status==='investigate'||finding.status==='insufficient_data'||finding.urgency==='clinician_review'||finding.urgency==='urgent';
const compact=(value:string,max=220)=>{const clean=value.replace(/\s+/g,' ').trim();return clean.length<=max?clean:`${clean.slice(0,max-1).trimEnd()}…`;};
const unique=<T,>(items:T[])=>[...new Set(items)];
const intersects=(left:string[],right:string[])=>{const set=new Set(right);return left.some((item)=>set.has(item));};

function sortedRecommendations(plan:RecommendationPlan,findingIds:string[]):Recommendation[]{
  const order=new Map(plan.topRecommendationIds.map((id,index)=>[id,index]));
  return plan.recommendations.filter((item)=>item.disposition!=='blocked'&&intersects(item.relatedFindingIds,findingIds)).sort((a,b)=>(order.get(a.id)??99)-(order.get(b.id)??99)||(priorityRank[a.priority]??9)-(priorityRank[b.priority]??9)||(dispositionRank[a.disposition]??9)-(dispositionRank[b.disposition]??9));
}
function evidenceFor(result:AssessmentResult,findings:Finding[]){
  const ids=unique(findings.flatMap((finding)=>finding.supportingEvidenceIds));
  const byId=new Map(result.evidenceGraph.nodes.map((node)=>[node.id,node]));
  return ids.map((id)=>byId.get(id)).filter((node):node is EvidenceNode=>Boolean(node)).slice(0,6).map((node)=>({id:node.id,label:node.label,detail:node.detail}));
}
function decisionEvidence(result:AssessmentResult,findings:Finding[]){
  const ids=findings.map((item)=>item.id);
  const tests=result.testPlan.recommendations.filter((item)=>item.selectedForMinimalSet&&intersects(item.relatedFindingIds,ids)).map((item)=>item.title);
  const missing=findings.flatMap((finding)=>finding.missingEvidenceIds).map((id)=>result.evidenceGraph.nodes.find((node)=>node.id===id)?.label).filter((value):value is string=>Boolean(value));
  const additions:string[]=[];
  if(ids.includes('CV-BP-001')&&findings.some((item)=>item.id==='CV-BP-001'&&meaningfulFinding(item))) additions.push('A properly repeated blood-pressure series');
  if(ids.includes('MET-THYROID-001')&&findings.some((item)=>item.id==='MET-THYROID-001'&&meaningfulFinding(item))) additions.push('Clinician-guided thyroid confirmation (for example repeat TSH and FT4 when indicated)');
  if(ids.includes('NUT-IRON-001')&&findings.some((item)=>item.id==='NUT-IRON-001'&&item.missingEvidenceIds.length)) additions.push('The missing haemoglobin/ferritin evidence');
  return unique([...tests,...missing,...additions]).slice(0,4);
}
function titleFor(theme:ThemeDefinition,findings:Finding[],evidence:{label:string;detail:string}[]){
  const byId=new Map(findings.map((finding)=>[finding.id,finding]));
  const lipids=byId.get('CV-LIPID-001'),bp=byId.get('CV-BP-001'),iron=byId.get('NUT-IRON-001'),b12=byId.get('NUT-001');
  if(theme.id==='cardiometabolic'){
    if(lipids?.status==='high_attention'&&evidence.some((item)=>item.label.toLowerCase().includes('triglycer'))) return 'Very high triglycerides need prompt review';
    if(bp?.status==='high_attention') return 'Markedly high blood pressure needs prompt review';
    const actionable=findings.filter(meaningfulFinding);
    if(actionable.length>=2) return 'Several cardiometabolic signals point in the same direction';
    if(bp&&meaningfulFinding(bp)) return 'Blood pressure needs confirmation';
    if(lipids&&meaningfulFinding(lipids)) return 'Lipids need cardiovascular-risk context';
  }
  if(theme.id==='blood-nutrition'){
    if(iron?.status==='high_attention') return 'Anaemia evidence needs prompt clinical review';
    if(iron&&b12&&meaningfulFinding(iron)&&meaningfulFinding(b12)) return 'B12 and iron/anaemia evidence need one joined review';
    if(iron&&meaningfulFinding(iron)) return 'Iron / anaemia evidence needs cause-oriented review';
    if(b12&&meaningfulFinding(b12)) return 'B12 evidence needs clarification';
  }
  if(theme.id==='thyroid'&&byId.get('MET-THYROID-001')?.urgency==='clinician_review') return 'A marked thyroid signal needs confirmation, not a dose guess';
  return theme.defaultTitle;
}
function seesFor(theme:ThemeDefinition,findings:Finding[],evidence:{label:string;detail:string}[]){
  const labels=evidence.map((item)=>item.label);
  if(theme.id==='cardiometabolic'&&findings.filter(meaningfulFinding).length>=2) return `Jaanch is seeing a cluster rather than one isolated number${labels.length?`: ${labels.slice(0,5).join(', ')}`:''}.`;
  if(theme.id==='blood-nutrition'&&findings.length>1) return `B12/nutrition and iron/anaemia evidence are being considered together${labels.length?`: ${labels.slice(0,4).join(', ')}`:''}.`;
  return compact([...findings].sort((a,b)=>findingWeight(b)-findingWeight(a))[0]?.summary??'A supported screening signal is present.');
}
function whyFor(theme:ThemeDefinition,findings:Finding[]){
  const actionable=findings.filter(meaningfulFinding);
  if(theme.id==='cardiometabolic'&&actionable.length>=2) return 'Multiple independent signals can change the same cardiovascular/metabolic decisions, so resolving them together is more useful than treating each card separately.';
  if(theme.id==='blood-nutrition'&&findings.length>1) return 'Symptoms and measured blood/nutrient evidence can overlap, but the cause should not be inferred from one marker alone.';
  const lead=[...findings].sort((a,b)=>findingWeight(b)-findingWeight(a))[0];
  return lead?compact(lead.summary):'This is the highest-impact supported issue in the current evidence.';
}
function statusLabel(findings:Finding[]){
  const lead=[...findings].sort((a,b)=>findingWeight(b)-findingWeight(a))[0];
  if(!lead)return'Review';
  if(lead.status==='high_attention')return lead.urgency==='clinician_review'?'Prompt clinician review':'High attention';
  if(lead.status==='investigate')return lead.urgency==='clinician_review'?'Clinician review':'Needs confirmation';
  if(lead.status==='insufficient_data')return'Important evidence missing';
  return'Monitor';
}
function toneFor(findings:Finding[]):HealthBriefTone{const weight=Math.max(...findings.map(findingWeight),0);if(weight>=125)return'urgent';if(weight>=65)return'attention';return'neutral';}
function themePriority(theme:ThemeDefinition,result:AssessmentResult,plan:RecommendationPlan):HealthBriefPriority|undefined{
  const all=result.findings.filter((finding)=>theme.findingIds.includes(finding.id));
  if(!all.some(meaningfulFinding))return undefined;
  const findings=all;
  const evidence=evidenceFor(result,findings),recommendations=sortedRecommendations(plan,findings.map((item)=>item.id)),next=recommendations[0],missing=decisionEvidence(result,findings);
  const score=Math.max(...findings.map(findingWeight),0)+Math.max(0,findings.filter(meaningfulFinding).length-1)*6;
  return{id:theme.id,rank:score,title:titleFor(theme,findings,evidence),tone:toneFor(findings),statusLabel:statusLabel(findings),whatJaanchSees:seesFor(theme,findings,evidence),whyItMatters:whyFor(theme,findings),evidence,nextAction:next?.title??missing[0]??'Keep this evidence current and review it in the appropriate clinical context.',...(next?.steps[0]?{nextActionDetail:next.steps[0]}:{}),canWait:theme.canWait,decisionChangingEvidence:missing,findingIds:findings.map((item)=>item.id),recommendationIds:recommendations.map((item)=>item.id)};
}
function urgentPriority(result:AssessmentResult):HealthBriefPriority|undefined{
  if(!result.safetyGate.urgent)return undefined;
  const reason=result.redFlags[0]??result.safetyGate.summary[0]??'A configured urgent safety pattern is active.';
  return{id:'urgent-safety',rank:1000,title:'An urgent safety signal comes before the rest of this assessment',tone:'urgent',statusLabel:'Urgent',whatJaanchSees:reason,whyItMatters:'Routine prevention advice should not distract from an urgent pattern.',evidence:[],nextAction:reason,canWait:'Routine wellness optimization and non-urgent testing can wait until the urgent issue is addressed.',decisionChangingEvidence:[],findingIds:[],recommendationIds:[]};
}

export function buildHealthIntelligenceBrief(result:AssessmentResult,plan:RecommendationPlan):HealthIntelligenceBrief{
  const urgent=urgentPriority(result);
  const priorities=(urgent?[urgent]:themes.map((theme)=>themePriority(theme,result,plan)).filter((item):item is HealthBriefPriority=>Boolean(item)).sort((a,b)=>b.rank-a.rank)).slice(0,3).map((item,index)=>({...item,rank:index+1}));
  const interpretedAreaCount=result.findings.filter((finding)=>finding.status!=='insufficient_data').length;
  const top=priorities[0];
  if(urgent)return{eyebrow:'Your Jaanch Health Brief',headline:'Act on this first',summary:'An urgent configured safety pattern is active. Other health priorities are intentionally secondary.',tone:'urgent',priorities,nextBestAction:urgent.nextAction,interpretedAreaCount,evidenceCompleteness:result.evidenceCompleteness,detailNote:'Evidence completeness is available in details; it is not an overall health score.'};
  if(!priorities.length)return{eyebrow:'Your Jaanch Health Brief',headline:'No high-priority issue from the evidence Jaanch can currently interpret',summary:'That is limited reassurance, not a comprehensive health clearance. Jaanch is staying quiet rather than manufacturing generic advice.',tone:'positive',priorities:[],nextBestAction:'Keep meaningful measurements and symptoms current; repeat Jaanch when something changes.',interpretedAreaCount,evidenceCompleteness:result.evidenceCompleteness,detailNote:'Evidence completeness and recorded-only facts are available under evidence details.'};
  const headline=priorities.length===1?'One health priority stands out':`${priorities.length} health priorities stand out`;
  const summary=priorities.length===1?top.title:`${top.title}. The brief ranks this first so you do not have to interpret a wall of separate findings.`;
  return{eyebrow:'Your Jaanch Health Brief',headline,summary,tone:top.tone,priorities,nextBestAction:top.nextAction,mostUsefulMissingEvidence:top.decisionChangingEvidence[0],interpretedAreaCount,evidenceCompleteness:result.evidenceCompleteness,detailNote:'Full findings, provenance, maturity and evidence completeness remain available in details.'};
}
