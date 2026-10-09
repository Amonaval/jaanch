import type { Answers, Domain, EvidenceEdge, EvidenceLevel, EvidenceNode, Finding, FindingConfidence } from './types';
import type { AssessmentRule, RuleOutput } from './ruleRegistry';
import { clinicalMeasurementAnswerIds, readClinicalMeasurement, type CanonicalClinicalMeasurement, type M134ClinicalMeasurementMarker } from './clinicalMeasurements';

const list = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const edge = (evidenceId:string, findingId:string, relation:EvidenceEdge['relation'], weight?:number):EvidenceEdge => ({ evidenceId, findingId, relation, weight });

function measurementNode(id:string, domain:Domain, marker:M134ClinicalMeasurementMarker, label:string, measurement:CanonicalClinicalMeasurement, detail:string, strength:EvidenceNode['strength']='strong'):EvidenceNode {
  return {
    id, domain, kind:'observed', sourceType:marker==='blood_pressure'?'measurement':'lab', label, detail, strength,
    provenance:{ questionIds:clinicalMeasurementAnswerIds(marker), derivation:`M13.4 canonical measurement from recorded result ${measurement.recordId}; collected ${measurement.collectedAt.slice(0,10)}.` },
  };
}

function missingNode(id:string, domain:Domain, label:string, detail:string):EvidenceNode {
  return { id, domain, kind:'missing', sourceType:'missing', label, detail, strength:'strong', provenance:{ questionIds:[] } };
}

function confidenceFor(evidenceLevel:EvidenceLevel, strong:boolean):FindingConfidence {
  if ((evidenceLevel==='lab_informed'||evidenceLevel==='measurement_informed'||evidenceLevel==='mixed') && strong) return 'high';
  if (evidenceLevel!=='insufficient') return 'moderate';
  return 'low';
}

function bloodPressureRule(a:Answers):RuleOutput {
  const findingId='CV-BP-001';
  const bp=readClinicalMeasurement(a,'blood_pressure');
  const diagnosed=list(a.diagnosedConditions);
  const medicationCategories=list(a.medicationCategories);
  const historyRelevant=diagnosed.includes('hypertension')||medicationCategories.includes('blood_pressure');
  if(!bp){
    if(!historyRelevant) return { matched:false, evidenceQuestionIds:['diagnosedConditions','medicationCategories'] };
    const missing='cv.bp.missing.current';
    const node=missingNode(missing,'cardiovascular','Current blood-pressure measurement','A recent, user-confirmed blood-pressure reading is not available.');
    const finding:Finding={ id:findingId,domain:'cardiovascular',title:'Blood-pressure context',status:'investigate',urgency:'monitor',confidence:'low',evidenceLevel:'insufficient',summary:'Blood-pressure history or treatment context is present, but Jaanch lacks a recent eligible reading.',supportingEvidenceIds:[],contradictingEvidenceIds:[],missingEvidenceIds:[missing],actions:['Capture a recent correctly measured blood-pressure reading rather than inferring control from history alone.'] };
    return { matched:true,finding,evidenceNodes:[node],evidenceEdges:[edge(missing,findingId,'missing_for')],evidenceQuestionIds:['diagnosedConditions','medicationCategories'] };
  }
  const systolic=bp.systolic as number, diastolic=bp.diastolic as number;
  const severe=systolic>=180||diastolic>=110;
  const hypertension=systolic>=140||diastolic>=90;
  const elevated=systolic>=120||diastolic>=70;
  const nodeId='cv.bp.measured';
  const node=measurementNode(nodeId,'cardiovascular','blood_pressure','Blood pressure',bp,`${systolic}/${diastolic} mmHg`,'strong');
  const status:Finding['status']=severe?'high_attention':hypertension?'investigate':elevated?'monitor':'good';
  const urgency:Finding['urgency']=severe?'clinician_review':hypertension?'monitor':'routine';
  const finding:Finding={ id:findingId,domain:'cardiovascular',title:'Blood-pressure context',status,urgency,confidence:confidenceFor('measurement_informed',hypertension),evidenceLevel:'measurement_informed',summary:severe?'This reading is markedly high and warrants prompt clinical review. A single reading still does not establish a diagnosis.':hypertension?'This reading is in the hypertension range used by the 2024 ESC office-BP classification. Confirmation with properly repeated measurements and overall cardiovascular context is still required.':elevated?'This reading is in the elevated-BP range used by the 2024 ESC classification; Jaanch treats it as a monitoring signal, not a diagnosis.':'This recent reading is below the elevated-BP threshold used by this limited prototype; one reading does not establish long-term blood-pressure status.',supportingEvidenceIds:[nodeId],contradictingEvidenceIds:[],missingEvidenceIds:[],actions:severe?['Seek prompt clinician review, especially if readings remain this high or symptoms are present.']:hypertension?['Repeat blood pressure with proper technique and review persistent elevation with a clinician.']:['Continue periodic blood-pressure monitoring appropriate to your health context.'] };
  return { matched:true,finding,evidenceNodes:[node],evidenceEdges:[edge(nodeId,findingId,'supports')],evidenceQuestionIds:clinicalMeasurementAnswerIds('blood_pressure') };
}

function lipidRule(a:Answers):RuleOutput {
  const findingId='CV-LIPID-001';
  const ldl=readClinicalMeasurement(a,'ldl'), hdl=readClinicalMeasurement(a,'hdl'), tg=readClinicalMeasurement(a,'triglycerides'), total=readClinicalMeasurement(a,'total_cholesterol');
  const values=[ldl,hdl,tg,total].filter((item):item is CanonicalClinicalMeasurement=>Boolean(item));
  const diagnosed=list(a.diagnosedConditions);
  const medicationCategories=list(a.medicationCategories);
  const historyRelevant=diagnosed.includes('lipid_disorder')||medicationCategories.includes('lipid_lowering');
  if(!values.length){
    if(!historyRelevant) return { matched:false,evidenceQuestionIds:['diagnosedConditions','medicationCategories'] };
    const missing='cv.lipid.missing.panel';
    const node=missingNode(missing,'cardiovascular','Current lipid evidence','A recent eligible lipid result is not available.');
    const finding:Finding={ id:findingId,domain:'cardiovascular',title:'Lipid cardiovascular-risk context',status:'investigate',urgency:'routine',confidence:'low',evidenceLevel:'insufficient',summary:'Lipid-disorder or lipid-lowering treatment context is present, but current measured lipid evidence is missing.',supportingEvidenceIds:[],contradictingEvidenceIds:[],missingEvidenceIds:[missing],actions:['Capture a recent lipid panel so risk can be reviewed with measured evidence.'] };
    return { matched:true,finding,evidenceNodes:[node],evidenceEdges:[edge(missing,findingId,'missing_for')],evidenceQuestionIds:['diagnosedConditions','medicationCategories'] };
  }
  const nodes:EvidenceNode[]=[], support:string[]=[];
  const add=(marker:M134ClinicalMeasurementMarker,label:string,m:CanonicalClinicalMeasurement|undefined)=>{if(!m)return;const id=`cv.lipid.${marker}`;support.push(id);nodes.push(measurementNode(id,'cardiovascular',marker,label,m,`${m.value} ${m.canonicalUnit}`));};
  add('total_cholesterol','Total cholesterol',total);add('ldl','LDL cholesterol',ldl);add('hdl','HDL cholesterol',hdl);add('triglycerides','Triglycerides',tg);
  const tgValue=tg?.value??0, ldlValue=ldl?.value??0;
  const veryHighTg=tgValue>=1000, highTg=tgValue>=500, highLdl=ldlValue>=160;
  const status:Finding['status']=veryHighTg?'high_attention':highTg||highLdl?'investigate':'monitor';
  const urgency:Finding['urgency']=veryHighTg||highTg?'clinician_review':highLdl?'monitor':'routine';
  const summary=veryHighTg?'Triglycerides are at or above 1000 mg/dL, a level where current dyslipidemia guidance highlights pancreatitis-prevention management. Jaanch does not choose medication.':highTg?'Triglycerides are at or above 500 mg/dL and warrant clinician-led review of causes and management.':highLdl?'LDL-C is at or above 160 mg/dL. Current 2026 dyslipidemia guidance treats this as important risk context, but treatment decisions still depend on age, PREVENT/ASCVD risk, comorbidity, family history and treatment status.':'Measured lipid values are available, but this limited module intentionally does not label them globally “normal” because LDL/non-HDL goals depend on overall cardiovascular risk and treatment context.';
  const finding:Finding={ id:findingId,domain:'cardiovascular',title:'Lipid cardiovascular-risk context',status,urgency,confidence:confidenceFor('lab_informed',highTg||highLdl),evidenceLevel:'lab_informed',summary,supportingEvidenceIds:support,contradictingEvidenceIds:[],missingEvidenceIds:[],actions:veryHighTg||highTg?['Arrange clinician review; do not self-adjust lipid medicines based on Jaanch.']:highLdl?['Review overall cardiovascular risk and lipid goals with a clinician rather than using one universal LDL target.']:['Use measured lipids together with overall cardiovascular-risk context.'] };
  return { matched:true,finding,evidenceNodes:nodes,evidenceEdges:support.map((id)=>edge(id,findingId,'supports')),evidenceQuestionIds:[...clinicalMeasurementAnswerIds('ldl'),...clinicalMeasurementAnswerIds('hdl'),...clinicalMeasurementAnswerIds('triglycerides'),...clinicalMeasurementAnswerIds('total_cholesterol')] };
}

function ironRule(a:Answers):RuleOutput {
  const findingId='NUT-IRON-001';
  const hemoglobin=readClinicalMeasurement(a,'hemoglobin'), ferritin=readClinicalMeasurement(a,'ferritin');
  const diagnosed=list(a.diagnosedConditions), concerns=list(a.currentConcerns);
  const contextRelevant=diagnosed.includes('anemia')||concerns.includes('fatigue')||concerns.includes('dizziness');
  if(!hemoglobin&&!ferritin&&!contextRelevant) return { matched:false,evidenceQuestionIds:['diagnosedConditions','currentConcerns'] };
  const sex=String(a.sex||'');
  const nodes:EvidenceNode[]=[], edges:EvidenceEdge[]=[], support:string[]=[], missing:string[]=[];
  if(hemoglobin){const id='nut.iron.hemoglobin';support.push(id);nodes.push(measurementNode(id,'nutrition','hemoglobin','Hemoglobin',hemoglobin,`${hemoglobin.value} g/dL`));edges.push(edge(id,findingId,'supports'));}
  if(ferritin){const id='nut.iron.ferritin';support.push(id);nodes.push(measurementNode(id,'nutrition','ferritin','Ferritin',ferritin,`${ferritin.value} ng/mL`));edges.push(edge(id,findingId,'supports'));}
  const hbCutoff=sex==='male'?13:sex==='female'?12:undefined;
  const lowHb=Boolean(hemoglobin&&hbCutoff!==undefined&&(hemoglobin.value as number)<hbCutoff);
  const severeHb=Boolean(hemoglobin&&(hemoglobin.value as number)<8);
  const lowFerritin=Boolean(ferritin&&(ferritin.value as number)<15);
  if(lowHb&&!ferritin){const id='nut.iron.missing.ferritin';missing.push(id);nodes.push(missingNode(id,'nutrition','Ferritin / iron stores','Low haemoglobin is present but ferritin is not available to clarify iron-store status.'));edges.push(edge(id,findingId,'missing_for'));}
  if(lowFerritin&&!hemoglobin){const id='nut.iron.missing.hemoglobin';missing.push(id);nodes.push(missingNode(id,'nutrition','Hemoglobin','Low ferritin is present but haemoglobin is not available to assess concurrent anaemia.'));edges.push(edge(id,findingId,'missing_for'));}
  if(!hemoglobin&&!ferritin&&contextRelevant){for(const [id,label] of [['nut.iron.missing.hemoglobin','Hemoglobin'],['nut.iron.missing.ferritin','Ferritin']] as const){missing.push(id);nodes.push(missingNode(id,'nutrition',label,'Measured evidence is not available.'));edges.push(edge(id,findingId,'missing_for'));}}
  const unknownSex=Boolean(hemoglobin&&hbCutoff===undefined);
  const status:Finding['status']=severeHb?'high_attention':lowHb||lowFerritin?'investigate':!hemoglobin&&!ferritin?'insufficient_data':unknownSex?'monitor':'good';
  const urgency:Finding['urgency']=severeHb||lowHb&&lowFerritin?'clinician_review':lowHb||lowFerritin?'monitor':'routine';
  let summary='';
  if(severeHb) summary='Hemoglobin is below 8 g/dL, within the severe-anaemia range in the WHO 2024 adult table; prompt clinical review is appropriate.';
  else if(lowHb&&lowFerritin) summary='Hemoglobin is below the WHO 2024 adult nonpregnant threshold and ferritin is below 15 ng/mL, supporting concurrent anaemia and depleted iron stores. The cause still requires clinical evaluation.';
  else if(lowHb) summary='Hemoglobin is below the WHO 2024 adult nonpregnant threshold for this sex; ferritin and clinical context help clarify whether iron deficiency is involved.';
  else if(lowFerritin) summary='Ferritin is below 15 ng/mL, which WHO guidance uses as a depleted-iron-store threshold in otherwise healthy adults; inflammation and clinical context still matter.';
  else if(unknownSex) summary='Hemoglobin is captured, but this prototype will not apply a sex-specific WHO anaemia threshold when sex-specific applicability is unavailable.';
  else if(hemoglobin||ferritin) summary='The available haemoglobin/ferritin values do not cross this module’s limited low-value thresholds. This does not exclude other causes of symptoms or blood-count abnormalities.';
  else summary='Symptoms/history suggest iron or anaemia context, but the key measured evidence is missing.';
  const level:EvidenceLevel=hemoglobin||ferritin?'lab_informed':'insufficient';
  const finding:Finding={ id:findingId,domain:'nutrition',title:'Anaemia / iron-status evidence',status,urgency,confidence:confidenceFor(level,Boolean(lowHb||lowFerritin)),evidenceLevel:level,summary,supportingEvidenceIds:support,contradictingEvidenceIds:[],missingEvidenceIds:missing,actions:lowHb||lowFerritin?['Review the measured results and likely cause with a clinician; Jaanch does not prescribe iron treatment automatically.']:missing.length?['Gather the smallest missing blood evidence if clinically appropriate.']:['Interpret these values alongside symptoms, other CBC indices and clinical context.'] };
  return { matched:true,finding,evidenceNodes:nodes,evidenceEdges:edges,evidenceQuestionIds:['sex','diagnosedConditions','currentConcerns',...clinicalMeasurementAnswerIds('hemoglobin'),...clinicalMeasurementAnswerIds('ferritin')] };
}

function thyroidRule(a:Answers):RuleOutput {
  const findingId='MET-THYROID-001';
  const tsh=readClinicalMeasurement(a,'tsh');
  const diagnosed=list(a.diagnosedConditions), medicationCategories=list(a.medicationCategories), concerns=list(a.currentConcerns);
  const symptomPattern=(concerns.includes('fatigue')&&concerns.includes('weight_change'))||(concerns.includes('palpitations')&&concerns.includes('weight_change'));
  const contextRelevant=diagnosed.includes('thyroid')||medicationCategories.includes('thyroid')||symptomPattern;
  if(!tsh){
    if(!contextRelevant) return { matched:false,evidenceQuestionIds:['diagnosedConditions','medicationCategories','currentConcerns'] };
    const missing='met.thyroid.missing.tsh';
    const node=missingNode(missing,'metabolic','TSH','Thyroid-related history or a multi-symptom pattern is present, but a recent eligible TSH is not available.');
    const finding:Finding={ id:findingId,domain:'metabolic',title:'Thyroid evidence',status:'investigate',urgency:'routine',confidence:'low',evidenceLevel:'insufficient',summary:'There is enough thyroid context to justify resolving the missing TSH evidence, but Jaanch does not infer thyroid disease from symptoms alone.',supportingEvidenceIds:[],contradictingEvidenceIds:[],missingEvidenceIds:[missing],actions:['Consider clinician-guided thyroid testing when clinically appropriate.'] };
    return { matched:true,finding,evidenceNodes:[node],evidenceEdges:[edge(missing,findingId,'missing_for')],evidenceQuestionIds:['diagnosedConditions','medicationCategories','currentConcerns'] };
  }
  const value=tsh.value as number;
  const markedlyHigh=value>=10, markedlyLow=value<0.1;
  const nodeId='met.thyroid.tsh';
  const node=measurementNode(nodeId,'metabolic','tsh','TSH',tsh,`${value} mIU/L`);
  const status:Finding['status']=markedlyHigh||markedlyLow?'investigate':'monitor';
  const urgency:Finding['urgency']=markedlyHigh||markedlyLow?'clinician_review':'routine';
  const summary=markedlyHigh?'TSH is at or above 10 mIU/L. NICE guidance uses repeated TSH plus FT4 and clinical context when evaluating subclinical hypothyroidism; one TSH value alone is not a diagnosis or treatment instruction.':markedlyLow?'TSH is below 0.1 mIU/L. NICE guidance calls for confirmatory thyroid-hormone evaluation and, when persistent with relevant context, specialist advice; Jaanch does not diagnose hyperthyroidism from this value alone.':'TSH is captured but does not cross the two marked-signal thresholds used by this narrow module. Lab-specific reference range, FT4/FT3 where indicated, symptoms and treatment context still matter.';
  const finding:Finding={ id:findingId,domain:'metabolic',title:'Thyroid evidence',status,urgency,confidence:confidenceFor('lab_informed',markedlyHigh||markedlyLow),evidenceLevel:'lab_informed',summary,supportingEvidenceIds:[nodeId],contradictingEvidenceIds:[],missingEvidenceIds:[],actions:markedlyHigh||markedlyLow?['Review the result with a clinician and use confirmatory thyroid-hormone testing as clinically indicated.']:['Interpret TSH against the laboratory reference range and clinical context.'] };
  return { matched:true,finding,evidenceNodes:[node],evidenceEdges:[edge(nodeId,findingId,'supports')],evidenceQuestionIds:clinicalMeasurementAnswerIds('tsh') };
}

export const m134AssessmentRules:AssessmentRule[]=[
  { id:'CV-BP-001',version:'1.0.0',domain:'cardiovascular',kind:'finding',title:'Blood-pressure context',enabled:true,maturity:'prototype',sourceIds:['ESC-BP-2024'],applicabilityPolicyId:'APPL-BP-ADULT-NONPREG',evaluate:bloodPressureRule },
  { id:'CV-LIPID-001',version:'1.0.0',domain:'cardiovascular',kind:'finding',title:'Lipid cardiovascular-risk context',enabled:true,maturity:'prototype',sourceIds:['AHA-ACC-DYSLIPIDEMIA-2026'],applicabilityPolicyId:'APPL-LIPID-ADULT-NONPREG',evaluate:lipidRule },
  { id:'NUT-IRON-001',version:'1.0.0',domain:'nutrition',kind:'finding',title:'Anaemia / iron-status evidence',enabled:true,maturity:'prototype',sourceIds:['WHO-ANAEMIA-2024','WHO-FERRITIN-2020'],applicabilityPolicyId:'APPL-IRON-ADULT-NONPREG-18-65',evaluate:ironRule },
  { id:'MET-THYROID-001',version:'1.0.0',domain:'metabolic',kind:'finding',title:'Thyroid evidence',enabled:true,maturity:'prototype',sourceIds:['NICE-THYROID-NG145'],applicabilityPolicyId:'APPL-THYROID-ADULT-NONPREG',evaluate:thyroidRule },
];
