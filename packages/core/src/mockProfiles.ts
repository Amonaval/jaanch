import { createProfileBundle, type JaanchProfileBundle } from './profileBundle';
import { emptyAssessmentCaptureContext, type AssessmentCaptureContext } from './intake';

function context(patch:Partial<AssessmentCaptureContext>):AssessmentCaptureContext{
  const base=emptyAssessmentCaptureContext();
  return { ...base,...patch,activity:{...base.activity,...patch.activity},recordedMeasurements:patch.recordedMeasurements??[],medications:patch.medications??[],supplements:patch.supplements??[],customConditions:patch.customConditions??[],customConcerns:patch.customConcerns??[],familyHistory:patch.familyHistory??[],customFamilyHistory:patch.customFamilyHistory??[] };
}

const date='2026-09-15';
const iso=`${date}T00:00:00.000Z`;
const measurement=(id:string,markerId:string,label:string,value:string,unit:string)=>({ id,markerId,label,value,unit,collectedAt:date,source:'import' as const,verification:'user_confirmed' as const,state:'recorded_unassessed' as const });

export const mockProfileBundles:JaanchProfileBundle[]=[
  createProfileBundle({
    id:'mock-low-risk-adult',label:'Mock 1 — Low-risk adult',description:'A generally low-risk 32-year-old adult with regular activity and a recent non-elevated blood-pressure reading.',exportedAt:'2026-10-09T08:30:00.000Z',
    answers:{ age:32,sex:'male',heightCm:175,weightKg:68,waistCm:82,diet:'vegetarian',sleepHours:7.5,smoking:false,diagnosedConditions:['none'],currentConcerns:['none'],prescriptionMedications:false,supplementUse:false },
    capturedContext:context({ familyHistory:['none'],activity:{exerciseTypes:['strength'],walkingDaysPerWeek:6,walkingMinutesPerDay:40,walkingPace:'brisk',exerciseDaysPerWeek:3,exerciseMinutesPerSession:45,exerciseIntensity:'moderate'},recordedMeasurements:[measurement('mock1-bp','blood_pressure','Blood pressure','112/68','mmHg')] }),
  }),
  createProfileBundle({
    id:'mock-cardiometabolic-lipids',label:'Mock 2 — Cardiometabolic + lipids',description:'Adult with central adiposity, family history of diabetes, elevated blood pressure, LDL/TG signal and HbA1c evidence.',exportedAt:'2026-10-09T08:30:00.000Z',
    answers:{ age:46,sex:'male',heightCm:174,weightKg:88,waistCm:101,diet:'mixed',sleepHours:6.2,smoking:false,diagnosedConditions:['lipid_disorder'],currentConcerns:['none'],prescriptionMedications:false,supplementUse:false },
    capturedContext:context({ familyHistory:['diabetes','premature_cvd'],activity:{exerciseTypes:[],walkingDaysPerWeek:2,walkingMinutesPerDay:20,walkingPace:'easy'},recordedMeasurements:[measurement('mock2-bp','blood_pressure','Blood pressure','148/94','mmHg'),measurement('mock2-ldl','ldl','LDL cholesterol','174','mg/dL'),measurement('mock2-hdl','hdl','HDL cholesterol','37','mg/dL'),measurement('mock2-tg','triglycerides','Triglycerides','280','mg/dL'),measurement('mock2-total','total_cholesterol','Total cholesterol','254','mg/dL')] }),
    labs:[{ id:'mock2-hba1c',markerId:'hba1c',value:6.1,unit:'%',collectedAt:iso,source:'import',verification:'user_confirmed' }],
  }),
  createProfileBundle({
    id:'mock-vegetarian-b12-iron',label:'Mock 3 — Vegetarian + B12 + iron',description:'Nonpregnant adult woman with fatigue/tingling, low B12, low haemoglobin and depleted ferritin.',exportedAt:'2026-10-09T08:30:00.000Z',
    answers:{ age:38,sex:'female',reproductiveContext:'none',heightCm:162,weightKg:58,waistCm:76,diet:'vegetarian',sleepHours:7,smoking:false,diagnosedConditions:['anemia'],currentConcerns:['fatigue','tingling','dizziness'],prescriptionMedications:false,supplementUse:false },
    capturedContext:context({ familyHistory:['none'],activity:{exerciseTypes:['yoga'],walkingDaysPerWeek:5,walkingMinutesPerDay:35,walkingPace:'brisk',exerciseDaysPerWeek:2,exerciseMinutesPerSession:40,exerciseIntensity:'light'},recordedMeasurements:[measurement('mock3-hb','hemoglobin','Hemoglobin','10.7','g/dL'),measurement('mock3-ferritin','ferritin','Ferritin','8','ng/mL')] }),
    labs:[{ id:'mock3-b12',markerId:'vitamin_b12',value:165,unit:'pg/mL',collectedAt:iso,source:'import',verification:'user_confirmed' }],
  }),
  createProfileBundle({
    id:'mock-thyroid-signal',label:'Mock 4 — Thyroid signal',description:'Adult woman with thyroid history, fatigue/weight change and markedly elevated TSH requiring confirmation rather than an app diagnosis.',exportedAt:'2026-10-09T08:30:00.000Z',
    answers:{ age:42,sex:'female',reproductiveContext:'none',heightCm:160,weightKg:64,waistCm:84,diet:'mixed',sleepHours:6.5,smoking:false,diagnosedConditions:['thyroid'],currentConcerns:['fatigue','weight_change'],prescriptionMedications:true,supplementUse:false },
    capturedContext:context({ medications:[{id:'mock4-thyroxine',name:'Thyroid medicine',category:'thyroid',purpose:'thyroid condition',state:'recorded_unassessed'}],familyHistory:['thyroid_autoimmune'],activity:{exerciseTypes:['yoga'],walkingDaysPerWeek:4,walkingMinutesPerDay:30,walkingPace:'easy'},recordedMeasurements:[measurement('mock4-tsh','tsh','TSH','12.8','mIU/L')] }),
  }),
  createProfileBundle({
    id:'mock-severe-triglycerides',label:'Mock 5 — Severe triglyceride signal',description:'Adult on lipid-lowering treatment with triglycerides above 1000 mg/dL to exercise the clinician-review boundary.',exportedAt:'2026-10-09T08:30:00.000Z',
    answers:{ age:55,sex:'male',heightCm:171,weightKg:79,waistCm:96,diet:'mixed',sleepHours:6.8,smoking:false,diagnosedConditions:['lipid_disorder'],currentConcerns:['none'],prescriptionMedications:true,supplementUse:false },
    capturedContext:context({ medications:[{id:'mock5-statin',name:'Atorvastatin',category:'lipid_lowering',purpose:'cholesterol',state:'recorded_unassessed'}],familyHistory:['premature_cvd'],activity:{exerciseTypes:['strength'],walkingDaysPerWeek:5,walkingMinutesPerDay:30,walkingPace:'brisk',exerciseDaysPerWeek:2,exerciseMinutesPerSession:40,exerciseIntensity:'moderate'},recordedMeasurements:[measurement('mock5-bp','blood_pressure','Blood pressure','138/84','mmHg'),measurement('mock5-ldl','ldl','LDL cholesterol','132','mg/dL'),measurement('mock5-hdl','hdl','HDL cholesterol','35','mg/dL'),measurement('mock5-tg','triglycerides','Triglycerides','1050','mg/dL')] }),
  }),
];

export function mockProfileById(id:string){return mockProfileBundles.find((profile)=>profile.id===id);}
