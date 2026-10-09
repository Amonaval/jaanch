import { getAssessmentPlan } from './planner';
import { materializeAssessmentAnswers, type AssessmentCaptureContext } from './intake';
import type { Answers, Domain, Question } from './types';

export type AssessmentBlockId =
  | 'about'
  | 'history'
  | 'current'
  | 'lifestyle'
  | 'tests'
  | 'followup-safety'
  | 'followup-history'
  | 'followup-sleep'
  | 'followup-other';

export type AssessmentBlock = {
  id: AssessmentBlockId;
  title: string;
  shortTitle: string;
  description: string;
  kind: 'primary' | 'adaptive' | 'safety';
  domains: Domain[];
  questionIds: string[];
};

export type AssessmentBlockPlan = {
  blocks: AssessmentBlock[];
  effectiveAnswers: Answers;
  revision: string;
  adaptiveBlockIds: AssessmentBlockId[];
};

export type BlockNavigationState = {
  currentBlockId: AssessmentBlockId;
  backStack: AssessmentBlockId[];
  forwardStack: AssessmentBlockId[];
  planRevision: string;
  invalidatedBlockIds: AssessmentBlockId[];
};

const primaryBlocks: AssessmentBlock[] = [
  { id:'about', title:'About you & measurements', shortTitle:'About you', description:'Basic context and body measurements used to decide which follow-ups matter.', kind:'primary', domains:['baseline'], questionIds:['age','sex','reproductiveContext','heightCm','weightKg','waistCm','frailtyConcerns'] },
  { id:'history', title:'Health history & medicines', shortTitle:'History', description:'Known diagnoses, medicines, supplements, allergies and family history.', kind:'primary', domains:['baseline','cardiovascular','metabolic','nutrition'], questionIds:['diagnosedConditions','prescriptionMedications','medicationCount','medicationCategories','supplementUse','supplementCategories','medicationOrSupplementAllergy','familyDiabetes'] },
  { id:'current', title:'Current health & symptoms', shortTitle:'Current health', description:'What is bothering you now, with room for concerns that are not in Jaanch yet.', kind:'primary', domains:['baseline','safety'], questionIds:['currentConcerns'] },
  { id:'lifestyle', title:'Lifestyle', shortTitle:'Lifestyle', description:'Walking, exercise, diet, sleep and tobacco context.', kind:'primary', domains:['activity','nutrition','sleep','baseline'], questionIds:['diet','activityDays','sleepHours','smoking'] },
  { id:'tests', title:'Known tests & measurements', shortTitle:'Tests', description:'Record what you already know. Jaanch can keep values even when it cannot interpret them yet.', kind:'primary', domains:['baseline','metabolic','nutrition','cardiovascular'], questionIds:['recentLabs'] },
];

const primaryQuestionIds = new Set(primaryBlocks.flatMap((block)=>block.questionIds));

function adaptiveBlock(id:AssessmentBlockId, title:string, shortTitle:string, description:string, kind:AssessmentBlock['kind'], questions:Question[]):AssessmentBlock {
  return { id, title, shortTitle, description, kind, domains:[...new Set(questions.map((question)=>question.domain))], questionIds:questions.map((question)=>question.id) };
}

export function getAssessmentBlockPlan(input: Answers, context: AssessmentCaptureContext): AssessmentBlockPlan {
  const effectiveAnswers = materializeAssessmentAnswers(input, context);
  const questionPlan = getAssessmentPlan(effectiveAnswers);
  const adaptiveQuestions = questionPlan.questions.map((item)=>item.question).filter((question)=>!primaryQuestionIds.has(question.id));

  const safety = adaptiveQuestions.filter((question)=>question.domain==='safety');
  const history = adaptiveQuestions.filter((question)=>question.domain==='baseline');
  const sleep = adaptiveQuestions.filter((question)=>question.domain==='sleep');
  const other = adaptiveQuestions.filter((question)=>!['safety','baseline','sleep'].includes(question.domain));

  const adaptive:AssessmentBlock[] = [];
  if (safety.length) adaptive.push(adaptiveBlock('followup-safety','Important safety follow-up','Safety','A short safety clarification is needed before continuing.', 'safety', safety));
  if (history.length) adaptive.push(adaptiveBlock('followup-history','A few health-history details','History details','These follow-ups were activated by your health history.', 'adaptive', history));
  if (sleep.length) adaptive.push(adaptiveBlock('followup-sleep','Sleep follow-up','Sleep','A few sleep details can improve the screening context.', 'adaptive', sleep));
  if (other.length) adaptive.push(adaptiveBlock('followup-other','Relevant follow-ups','Follow-ups','Only follow-ups activated by your earlier answers are shown here.', 'adaptive', other));

  const blocks = [...primaryBlocks, ...adaptive];
  return {
    blocks,
    effectiveAnswers,
    revision:blocks.map((block)=>`${block.id}:${block.questionIds.join(',')}`).join('|'),
    adaptiveBlockIds:adaptive.map((block)=>block.id),
  };
}

export function createBlockNavigation(plan:AssessmentBlockPlan):BlockNavigationState {
  return { currentBlockId:plan.blocks[0]?.id ?? 'about', backStack:[], forwardStack:[], planRevision:plan.revision, invalidatedBlockIds:[] };
}

const isInPlan = (id:AssessmentBlockId, plan:AssessmentBlockPlan) => plan.blocks.some((block)=>block.id===id);

export function reconcileBlockNavigation(state:BlockNavigationState, plan:AssessmentBlockPlan):BlockNavigationState {
  const known = new Set(plan.blocks.map((block)=>block.id));
  const invalidated = [...new Set([
    ...state.invalidatedBlockIds,
    ...state.backStack.filter((id)=>!known.has(id)),
    ...state.forwardStack.filter((id)=>!known.has(id)),
    ...(known.has(state.currentBlockId) ? [] : [state.currentBlockId]),
  ])];
  const backStack = state.backStack.filter((id)=>known.has(id));
  const forwardStack = state.forwardStack.filter((id)=>known.has(id));
  const currentBlockId = known.has(state.currentBlockId)
    ? state.currentBlockId
    : forwardStack[0] ?? backStack[backStack.length-1] ?? plan.blocks[0]?.id ?? 'about';
  return { currentBlockId, backStack:backStack.filter((id)=>id!==currentBlockId), forwardStack:forwardStack.filter((id)=>id!==currentBlockId), planRevision:plan.revision, invalidatedBlockIds:invalidated };
}

export function goBackBlock(state:BlockNavigationState, plan:AssessmentBlockPlan):BlockNavigationState {
  const reconciled = reconcileBlockNavigation(state,plan);
  const backStack=[...reconciled.backStack];
  const previous=backStack.pop();
  if(!previous) return reconciled;
  return { ...reconciled, currentBlockId:previous, backStack, forwardStack:[reconciled.currentBlockId,...reconciled.forwardStack] };
}

export function goForwardBlock(state:BlockNavigationState, plan:AssessmentBlockPlan):{state:BlockNavigationState; complete:boolean} {
  const reconciled = reconcileBlockNavigation(state,plan);
  const forwardStack=[...reconciled.forwardStack];
  while(forwardStack.length){
    const next=forwardStack.shift()!;
    if(isInPlan(next,plan)) return { state:{...reconciled,currentBlockId:next,backStack:[...reconciled.backStack,reconciled.currentBlockId],forwardStack}, complete:false };
  }
  const currentIndex=plan.blocks.findIndex((block)=>block.id===reconciled.currentBlockId);
  const next=plan.blocks[currentIndex+1];
  if(!next) return { state:{...reconciled,forwardStack:[]}, complete:true };
  return { state:{...reconciled,currentBlockId:next.id,backStack:[...reconciled.backStack,reconciled.currentBlockId],forwardStack:[]}, complete:false };
}

export function jumpToBlock(state:BlockNavigationState, plan:AssessmentBlockPlan, target:AssessmentBlockId):BlockNavigationState {
  const reconciled=reconcileBlockNavigation(state,plan);
  if(!isInPlan(target,plan) || target===reconciled.currentBlockId) return reconciled;
  return { ...reconciled, currentBlockId:target, backStack:[...reconciled.backStack,reconciled.currentBlockId], forwardStack:[] };
}

export function currentAssessmentBlock(state:BlockNavigationState, plan:AssessmentBlockPlan) {
  return plan.blocks.find((block)=>block.id===state.currentBlockId) ?? plan.blocks[0];
}
