import type { Answers, Condition, Domain, Question } from './types';
import { questions } from './questions';

export const SKIPPED_ANSWER = '__skipped__';

export type DomainActivation = {
  domain: Domain;
  active: boolean;
  reasons: string[];
};

export type PlannedQuestion = {
  question: Question;
  rank: number;
  answered: boolean;
  skipped: boolean;
  whyAsked: string[];
};

export type AssessmentPlan = {
  activeDomains: DomainActivation[];
  questions: PlannedQuestion[];
  nextQuestion?: PlannedQuestion;
  answered: number;
  skipped: number;
  remaining: number;
  complete: boolean;
};

const asList = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const has = (answers: Answers, id: string, value: string) => asList(answers[id]).includes(value);
const num = (answers: Answers, id: string) => typeof answers[id] === 'number' ? Number(answers[id]) : Number.NaN;
const diagnosed = (answers: Answers, value: string) => has(answers, 'diagnosedConditions', value);

export function conditionMatches(condition: Condition, answers: Answers): boolean {
  const actual = answers[condition.questionId];
  if (actual === undefined || actual === SKIPPED_ANSWER) return false;
  switch (condition.operator) {
    case 'eq': return actual === condition.value;
    case 'neq': return actual !== condition.value;
    case 'includes': return Array.isArray(actual) ? actual.includes(String(condition.value)) : String(actual).includes(String(condition.value));
    case 'gte': return Number(actual) >= Number(condition.value);
    case 'lte': return Number(actual) <= Number(condition.value);
  }
}

export function domainActivations(answers: Answers): DomainActivation[] {
  const heightM = num(answers, 'heightCm') / 100;
  const weight = num(answers, 'weightKg');
  const bmi = Number.isFinite(heightM) && heightM > 0 && Number.isFinite(weight) ? weight / (heightM * heightM) : Number.NaN;
  const waist = num(answers, 'waistCm');
  const sleep = num(answers, 'sleepHours');

  const map: Record<Domain, string[]> = {
    baseline: ['Core assessment context'],
    metabolic: [],
    cardiovascular: [],
    nutrition: [],
    sleep: [],
    activity: [],
    safety: [],
  };

  if (answers.familyDiabetes === true) map.metabolic.push('First-degree family history of diabetes');
  if (has(answers, 'currentConcerns', 'thirst')) map.metabolic.push('Excess thirst or urination reported');
  if (diagnosed(answers, 'diabetes') || diagnosed(answers, 'prediabetes')) map.metabolic.push('Existing glucose-related diagnosis');
  if (Number.isFinite(bmi) && bmi >= 25) map.metabolic.push('BMI screening threshold reached');
  if (Number.isFinite(waist) && waist >= 90) map.metabolic.push('Waist screening threshold reached');

  if (answers.smoking === true) map.cardiovascular.push('Current tobacco exposure');
  if (diagnosed(answers, 'hypertension') || diagnosed(answers, 'heart')) map.cardiovascular.push('Existing cardiovascular diagnosis');
  if (has(answers, 'currentConcerns', 'chestPain')) map.cardiovascular.push('Chest pain or pressure reported');

  if (answers.diet === 'vegetarian' || answers.diet === 'vegan') map.nutrition.push('Plant-based diet pattern');
  if (has(answers, 'currentConcerns', 'fatigue') || has(answers, 'currentConcerns', 'tingling')) map.nutrition.push('Symptoms relevant to nutritional screening');
  if (answers.recentLabs === true) map.nutrition.push('Recent laboratory evidence available');

  if (Number.isFinite(sleep) && sleep < 7) map.sleep.push('Short sleep duration');
  if (has(answers, 'currentConcerns', 'sleep')) map.sleep.push('Sleep concern reported');

  const activityDays = num(answers, 'activityDays');
  if (Number.isFinite(activityDays) && activityDays < 5) map.activity.push('Activity below general screening target');

  if (has(answers, 'currentConcerns', 'chestPain')) map.safety.push('Chest pain requires red-flag clarification');

  return (Object.keys(map) as Domain[]).map((domain) => ({
    domain,
    active: domain === 'baseline' || map[domain].length > 0,
    reasons: map[domain],
  }));
}

function questionWhy(question: Question, activations: DomainActivation[]): string[] {
  if (question.master) return ['Core question used to decide which health domains and follow-ups are relevant.'];
  const activation = activations.find((item) => item.domain === question.domain);
  const reasons = activation?.reasons ?? [];
  const dependencyReasons = question.showWhen?.map((condition) => `Depends on ${condition.questionId} (${condition.operator} ${String(condition.value)})`) ?? [];
  return [...reasons, ...dependencyReasons];
}

export function isQuestionEligible(question: Question, answers: Answers, activations = domainActivations(answers)): boolean {
  if (question.master) return true;
  const domain = activations.find((item) => item.domain === question.domain);
  if (!domain?.active) return false;
  return !question.showWhen?.length || question.showWhen.every((condition) => conditionMatches(condition, answers));
}

export function getAssessmentPlan(answers: Answers): AssessmentPlan {
  const activations = domainActivations(answers);
  const planned = questions
    .filter((question) => isQuestionEligible(question, answers, activations))
    .map((question) => {
      const value = answers[question.id];
      const skipped = value === SKIPPED_ANSWER;
      const answered = value !== undefined && value !== '';
      const masterBoost = question.master ? -1000 : 0;
      const safetyBoost = question.domain === 'safety' ? -500 : 0;
      return {
        question,
        rank: masterBoost + safetyBoost + question.priority,
        answered,
        skipped,
        whyAsked: questionWhy(question, activations),
      } satisfies PlannedQuestion;
    })
    .sort((a, b) => a.rank - b.rank || a.question.id.localeCompare(b.question.id));

  const nextQuestion = planned.find((item) => !item.answered);
  const answered = planned.filter((item) => item.answered).length;
  const skipped = planned.filter((item) => item.skipped).length;
  return {
    activeDomains: activations,
    questions: planned,
    nextQuestion,
    answered,
    skipped,
    remaining: planned.length - answered,
    complete: !nextQuestion,
  };
}

export const visibleQuestions = (answers: Answers) => getAssessmentPlan(answers).questions.map((item) => item.question);
