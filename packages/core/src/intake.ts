import type { Answers, LabRecord } from './types';
import { isClinicallyInterpretedMeasurement, materializeClinicalMeasurementAnswers } from './clinicalMeasurements';

export type CapturedFactState = 'structured' | 'user_reported_unstructured' | 'recorded_unassessed' | 'needs_clarification';
export type MeasurementSystem = 'metric' | 'imperial';

export type NamedHealthEntry = {
  id: string;
  name: string;
  category?: string;
  purpose?: string;
  dose?: string;
  frequency?: string;
  state: CapturedFactState;
};

export type ActivityProfile = {
  walkingDaysPerWeek?: number;
  walkingMinutesPerDay?: number;
  stepsPerDay?: number;
  walkingPace?: 'easy' | 'brisk' | 'fast';
  exerciseTypes: string[];
  exerciseDaysPerWeek?: number;
  exerciseMinutesPerSession?: number;
  exerciseIntensity?: 'light' | 'moderate' | 'vigorous';
  otherActivity?: string;
};

export type RecordedMeasurement = {
  id: string;
  markerId: string;
  label: string;
  value: string;
  unit?: string;
  collectedAt?: string;
  source: 'manual' | 'report' | 'import';
  verification: 'user_confirmed' | 'unverified';
  referenceRange?: string;
  state: 'recorded_unassessed' | 'needs_clarification';
};

export type AssessmentCaptureContext = {
  unitPreference: MeasurementSystem;
  customConditions: string[];
  medications: NamedHealthEntry[];
  supplements: NamedHealthEntry[];
  customConcerns: string[];
  concernDetails?: string;
  familyHistory: string[];
  customFamilyHistory: string[];
  activity: ActivityProfile;
  recordedMeasurements: RecordedMeasurement[];
  additionalContext?: string;
};

export type CatalogOption = {
  value: string;
  label: string;
  group?: string;
  hint?: string;
};

export const conditionCatalog: CatalogOption[] = [
  { value:'diabetes', label:'Diabetes', group:'Metabolic' },
  { value:'prediabetes', label:'Prediabetes', group:'Metabolic' },
  { value:'hypertension', label:'High blood pressure', group:'Heart & circulation' },
  { value:'lipid_disorder', label:'High cholesterol / lipid disorder', group:'Heart & circulation' },
  { value:'heart', label:'Heart / vascular disease', group:'Heart & circulation' },
  { value:'kidney', label:'Kidney disease', group:'Major conditions' },
  { value:'liver', label:'Liver disease', group:'Major conditions' },
  { value:'thyroid', label:'Thyroid disease', group:'Hormonal' },
  { value:'respiratory', label:'Asthma / chronic respiratory disease', group:'Respiratory' },
  { value:'anemia', label:'Anemia / iron deficiency', group:'Blood / nutrition' },
  { value:'vitamin_deficiency', label:'Known vitamin deficiency', group:'Blood / nutrition' },
  { value:'gastrointestinal', label:'Gastrointestinal condition', group:'Digestive' },
  { value:'neurological', label:'Neurological condition', group:'Neurological' },
  { value:'mental_health', label:'Mental-health diagnosis', group:'Mental health' },
  { value:'cancer', label:'Cancer / major oncologic condition', group:'Major conditions' },
  { value:'none', label:'None / not diagnosed', group:'None' },
];

export const concernCatalog: CatalogOption[] = [
  { value:'fatigue', label:'Fatigue / low energy', group:'Energy' },
  { value:'sleep', label:'Poor sleep / daytime sleepiness', group:'Sleep' },
  { value:'tingling', label:'Tingling / numbness', group:'Neurological' },
  { value:'headache', label:'Headache', group:'Neurological' },
  { value:'dizziness', label:'Dizziness / faint feeling', group:'Neurological' },
  { value:'chestPain', label:'Chest pain / pressure', group:'Heart & breathing' },
  { value:'breathlessness', label:'Breathlessness', group:'Heart & breathing' },
  { value:'palpitations', label:'Palpitations / racing heart', group:'Heart & breathing' },
  { value:'thirst', label:'Excess thirst / urination', group:'Metabolic' },
  { value:'weight_change', label:'Unexpected weight change', group:'Weight & appetite' },
  { value:'appetite_change', label:'Appetite change', group:'Weight & appetite' },
  { value:'digestive', label:'Digestive / bowel concern', group:'Digestive' },
  { value:'urinary', label:'Urinary concern', group:'Urinary' },
  { value:'pain', label:'Persistent pain', group:'Pain' },
  { value:'skin_hair', label:'Skin / hair concern', group:'Skin & hair' },
  { value:'mood_stress', label:'Mood / stress concern', group:'Mental wellbeing' },
  { value:'none', label:'No current concerns', group:'None' },
];

export const medicationCategoryCatalog: CatalogOption[] = [
  { value:'lipid_lowering', label:'Cholesterol / lipid lowering' },
  { value:'blood_pressure', label:'Blood pressure' },
  { value:'diabetes', label:'Diabetes' },
  { value:'metformin', label:'Metformin' },
  { value:'anticoagulant', label:'Blood thinner / anticoagulant' },
  { value:'thyroid', label:'Thyroid' },
  { value:'steroid', label:'Long-term steroid' },
  { value:'ppi', label:'Acid reducing / PPI' },
  { value:'psychiatric', label:'Psychiatric' },
  { value:'other', label:'Other' },
];

export const supplementCategoryCatalog: CatalogOption[] = [
  { value:'multivitamin', label:'Multivitamin' },
  { value:'vitamin_d', label:'Vitamin D' },
  { value:'b12', label:'Vitamin B12' },
  { value:'iron', label:'Iron' },
  { value:'calcium', label:'Calcium' },
  { value:'magnesium', label:'Magnesium' },
  { value:'omega3', label:'Omega-3' },
  { value:'herbal', label:'Herbal / traditional product' },
  { value:'other', label:'Other' },
];

export const exerciseTypeCatalog: CatalogOption[] = [
  { value:'strength', label:'Strength / resistance' },
  { value:'running', label:'Running / jogging' },
  { value:'cycling', label:'Cycling' },
  { value:'swimming', label:'Swimming' },
  { value:'sport', label:'Sport' },
  { value:'yoga', label:'Yoga / mobility' },
  { value:'gym_cardio', label:'Gym / cardio machine' },
  { value:'other', label:'Other activity' },
];

export const familyHistoryCatalog: CatalogOption[] = [
  { value:'diabetes', label:'Diabetes' },
  { value:'premature_cvd', label:'Early heart / vascular disease' },
  { value:'hypertension', label:'High blood pressure' },
  { value:'lipid_disorder', label:'High cholesterol / lipid disorder' },
  { value:'thyroid_autoimmune', label:'Thyroid / autoimmune disease' },
  { value:'selected_cancer', label:'Important cancer history' },
  { value:'none', label:'No important family history known' },
];

export const recordedMeasurementCatalog: CatalogOption[] = [
  { value:'vitamin_d_25oh', label:'Vitamin D (25-OH)', hint:'Common unit: ng/mL' },
  { value:'fasting_glucose', label:'Fasting glucose', hint:'Common unit: mg/dL' },
  { value:'random_glucose', label:'Random glucose', hint:'Common unit: mg/dL' },
  { value:'total_cholesterol', label:'Total cholesterol', hint:'M13.4 interprets recent confirmed mg/dL values only.' },
  { value:'ldl', label:'LDL cholesterol', hint:'M13.4 interprets recent confirmed mg/dL values only.' },
  { value:'hdl', label:'HDL cholesterol', hint:'M13.4 interprets recent confirmed mg/dL values only.' },
  { value:'triglycerides', label:'Triglycerides', hint:'M13.4 interprets recent confirmed mg/dL values only.' },
  { value:'hemoglobin', label:'Hemoglobin', hint:'M13.4 interprets recent confirmed g/dL values only.' },
  { value:'ferritin', label:'Ferritin', hint:'M13.4 interprets recent confirmed ng/mL or equivalent values only.' },
  { value:'tsh', label:'TSH', hint:'M13.4 interprets recent confirmed mIU/L or equivalent values only.' },
  { value:'blood_pressure', label:'Blood pressure', hint:'M13.4 interprets recent confirmed values such as 120/80 mmHg.' },
  { value:'other', label:'Other test / measurement' },
];

export function emptyAssessmentCaptureContext(): AssessmentCaptureContext {
  return {
    unitPreference:'metric',
    customConditions:[],
    medications:[],
    supplements:[],
    customConcerns:[],
    familyHistory:[],
    customFamilyHistory:[],
    activity:{ exerciseTypes:[] },
    recordedMeasurements:[],
  };
}

export const round1 = (value:number) => Math.round(value * 10) / 10;
export const inchesToCm = (inches:number) => round1(inches * 2.54);
export const cmToInches = (cm:number) => round1(cm / 2.54);
export const poundsToKg = (lb:number) => round1(lb * 0.45359237);
export const kgToPounds = (kg:number) => round1(kg / 0.45359237);
export const feetInchesToCm = (feet:number, inches:number) => inchesToCm(feet * 12 + inches);
export function cmToFeetInches(cm:number) {
  const total = cm / 2.54;
  let feet = Math.floor(total / 12);
  let inches = Math.round(total - feet * 12);
  if (inches === 12) { feet += 1; inches = 0; }
  return { feet, inches };
}

export function deriveActivityDays(context: AssessmentCaptureContext): number | undefined {
  const walkingQualifies = (context.activity.walkingMinutesPerDay ?? 0) >= 30 ? (context.activity.walkingDaysPerWeek ?? 0) : 0;
  const exerciseQualifies = (context.activity.exerciseMinutesPerSession ?? 0) >= 30 ? (context.activity.exerciseDaysPerWeek ?? 0) : 0;
  if (!context.activity.walkingDaysPerWeek && !context.activity.exerciseDaysPerWeek) return undefined;
  return Math.min(7, Math.max(walkingQualifies, exerciseQualifies));
}

export function materializeAssessmentAnswers(input: Answers, context: AssessmentCaptureContext): Answers {
  const answers: Answers = { ...input };
  const activityDays = deriveActivityDays(context);
  if (activityDays !== undefined) answers.activityDays = activityDays;

  if (context.medications.length > 0) {
    answers.prescriptionMedications = true;
    answers.medicationCount = context.medications.length;
    const categories = context.medications.map((item) => item.category).filter((value): value is string => Boolean(value));
    if (categories.length) answers.medicationCategories = [...new Set(categories)];
  } else if (answers.prescriptionMedications === true) {
    answers.medicationCount = Number(answers.medicationCount ?? 0);
  }

  if (context.supplements.length > 0) {
    answers.supplementUse = true;
    const categories = context.supplements.map((item) => item.category).filter((value): value is string => Boolean(value));
    if (categories.length) answers.supplementCategories = [...new Set(categories)];
  }

  if (context.familyHistory.includes('diabetes')) answers.familyDiabetes = true;
  else if (context.familyHistory.includes('none')) answers.familyDiabetes = false;

  return materializeClinicalMeasurementAnswers(answers, context.recordedMeasurements);
}

export function createNamedHealthEntry(input: { name:string; category?:string; purpose?:string; dose?:string; frequency?:string }, prefix='entry'): NamedHealthEntry {
  return {
    id:`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name:input.name.trim(),
    ...(input.category ? { category:input.category } : {}),
    ...(input.purpose?.trim() ? { purpose:input.purpose.trim() } : {}),
    ...(input.dose?.trim() ? { dose:input.dose.trim() } : {}),
    ...(input.frequency?.trim() ? { frequency:input.frequency.trim() } : {}),
    state:'recorded_unassessed',
  };
}

export function createRecordedMeasurement(input: Omit<RecordedMeasurement,'id'|'state'>): RecordedMeasurement {
  return {
    ...input,
    id:`measurement-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    state: input.value.trim() ? 'recorded_unassessed' : 'needs_clarification',
  };
}

export type CapturedContextSummaryItem = {
  id:string;
  title:string;
  detail:string;
  state:CapturedFactState;
};

export function capturedContextSummary(context: AssessmentCaptureContext): CapturedContextSummaryItem[] {
  const items: CapturedContextSummaryItem[] = [];
  context.customConditions.forEach((value,index)=>items.push({id:`condition-${index}`,title:'Other diagnosed condition',detail:value,state:'user_reported_unstructured'}));
  context.medications.forEach((item)=>items.push({id:item.id,title:`Medicine: ${item.name}`,detail:[item.purpose,item.category].filter(Boolean).join(' · ') || 'Recorded medicine',state:item.state}));
  context.supplements.forEach((item)=>items.push({id:item.id,title:`Supplement: ${item.name}`,detail:item.purpose || item.category || 'Recorded supplement',state:item.state}));
  context.customConcerns.forEach((value,index)=>items.push({id:`concern-${index}`,title:'Other current concern',detail:value,state:'user_reported_unstructured'}));
  context.customFamilyHistory.forEach((value,index)=>items.push({id:`family-${index}`,title:'Other family history',detail:value,state:'user_reported_unstructured'}));
  context.recordedMeasurements.forEach((item)=>{ if(!isClinicallyInterpretedMeasurement(item)) items.push({id:item.id,title:item.label,detail:`${item.value}${item.unit ? ` ${item.unit}` : ''}${item.collectedAt ? ` · ${item.collectedAt}` : ''}`,state:item.state}); });
  if (context.concernDetails?.trim()) items.push({id:'concern-details',title:'Additional symptom details',detail:context.concernDetails.trim(),state:'user_reported_unstructured'});
  if (context.additionalContext?.trim()) items.push({id:'additional-context',title:'Additional health context',detail:context.additionalContext.trim(),state:'user_reported_unstructured'});
  return items;
}

export function splitMeasurementForEngine(markerId:string, value:number, unit:string, collectedAt:string): { lab?:LabRecord; recorded?:RecordedMeasurement } {
  if (markerId === 'hba1c') return { lab:{ id:`lab-hba1c-${Date.now()}`, markerId:'hba1c', value, unit:unit || '%', collectedAt, source:'manual', verification:'user_confirmed' } };
  if (markerId === 'vitamin_b12') return { lab:{ id:`lab-b12-${Date.now()}`, markerId:'vitamin_b12', value, unit:unit || 'pg/mL', collectedAt, source:'manual', verification:'user_confirmed' } };
  const definition = recordedMeasurementCatalog.find((item)=>item.value===markerId);
  return { recorded:{ id:`measurement-${markerId}-${Date.now()}`, markerId, label:definition?.label ?? markerId, value:String(value), unit:unit || undefined, collectedAt, source:'manual', verification:'user_confirmed', state:'recorded_unassessed' } };
}
