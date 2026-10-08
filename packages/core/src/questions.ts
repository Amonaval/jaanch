import type { Question } from './types';

const yesNo = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

export const questions: Question[] = [
  { id: 'age', domain: 'baseline', priority: 1, title: 'What is your age?', type: 'number', min: 1, max: 110, master: true },
  { id: 'sex', domain: 'baseline', priority: 2, title: 'Sex at birth', type: 'single', master: true, options: [{value:'female',label:'Female'},{value:'male',label:'Male'},{value:'other',label:'Other / intersex'},{value:'prefer_not',label:'Prefer not to say'}] },
  { id: 'heightCm', domain: 'baseline', priority: 3, title: 'Height', type: 'number', unit: 'cm', min: 80, max: 230, master: true },
  { id: 'weightKg', domain: 'baseline', priority: 4, title: 'Weight', type: 'number', unit: 'kg', min: 15, max: 350, master: true },
  { id: 'waistCm', domain: 'baseline', priority: 5, title: 'Waist circumference', type: 'number', unit: 'cm', min: 35, max: 200, master: true },
  { id: 'diagnosedConditions', domain: 'baseline', priority: 6, title: 'Which diagnosed conditions do you have?', type: 'multi', master: true, options: [{value:'diabetes',label:'Diabetes'},{value:'prediabetes',label:'Prediabetes'},{value:'hypertension',label:'High blood pressure'},{value:'kidney',label:'Kidney disease'},{value:'liver',label:'Liver disease'},{value:'heart',label:'Heart / vascular disease'},{value:'none',label:'None / not diagnosed'}] },
  { id: 'diet', domain: 'baseline', priority: 7, title: 'Which best describes your usual diet?', type: 'single', master: true, options: [{value:'vegan',label:'Vegan'},{value:'vegetarian',label:'Vegetarian'},{value:'eggetarian',label:'Vegetarian + eggs'},{value:'mixed',label:'Mixed / omnivore'}] },
  { id: 'activityDays', domain: 'baseline', priority: 8, title: 'On how many days per week do you exercise for at least 30 minutes?', type: 'number', unit: 'days/week', min: 0, max: 7, master: true },
  { id: 'sleepHours', domain: 'baseline', priority: 9, title: 'How many hours do you usually sleep?', type: 'number', unit: 'hours/night', min: 2, max: 14, master: true },
  { id: 'smoking', domain: 'baseline', priority: 10, title: 'Do you currently smoke or use tobacco?', type: 'boolean', options: yesNo, master: true },
  { id: 'familyDiabetes', domain: 'baseline', priority: 11, title: 'Does a parent or sibling have diabetes?', type: 'boolean', options: yesNo, master: true },
  { id: 'currentConcerns', domain: 'baseline', priority: 12, title: 'What are your current health concerns?', type: 'multi', master: true, options: [{value:'fatigue',label:'Fatigue'},{value:'sleep',label:'Poor sleep'},{value:'tingling',label:'Tingling / numbness'},{value:'chestPain',label:'Chest pain / pressure'},{value:'thirst',label:'Excess thirst / urination'},{value:'none',label:'No current concerns'}] },
  { id: 'recentLabs', domain: 'baseline', priority: 13, title: 'Do you have blood tests from the last 12 months?', type: 'boolean', options: yesNo, master: true },
  { id: 'hba1c', domain: 'metabolic', priority: 30, title: 'Latest HbA1c', type: 'number', unit: '%', min: 3, max: 20, showWhen: [{questionId:'recentLabs',operator:'eq',value:true}] },
  { id: 'b12', domain: 'nutrition', priority: 31, title: 'Latest vitamin B12', type: 'number', unit: 'pg/mL', min: 50, max: 2500, showWhen: [{questionId:'recentLabs',operator:'eq',value:true}] },
  { id: 'snoring', domain: 'sleep', priority: 40, title: 'Do you snore loudly or wake unrefreshed?', type: 'boolean', options: yesNo, showWhen: [{questionId:'currentConcerns',operator:'includes',value:'sleep'}] },
  { id: 'redFlagChestPain', domain: 'safety', priority: 1, title: 'Is chest pain severe, new, or associated with breathlessness, fainting, sweating, or pain spreading to the arm/jaw?', type: 'boolean', options: yesNo, showWhen: [{questionId:'currentConcerns',operator:'includes',value:'chestPain'}] }
];
