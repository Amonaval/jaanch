import type { Answers, SafetyActionClass, SafetyDecision, SafetyFlag, SafetyGate } from './types';

const ACTION_CLASSES: SafetyActionClass[] = [
  'general_lifestyle',
  'diet_guidance',
  'exercise',
  'monitoring',
  'routine_supplement',
  'therapeutic_supplement',
  'medication_change',
];

const severityRank = { allowed: 0, caution: 1, clinician_review: 2, blocked: 3 } as const;

function decision(actionClass: SafetyActionClass): SafetyDecision {
  if (actionClass === 'medication_change') {
    return {
      actionClass,
      disposition: 'blocked',
      reasons: ['Jaanch does not autonomously start, stop, or change prescription medicines.'],
    };
  }
  if (actionClass === 'therapeutic_supplement') {
    return {
      actionClass,
      disposition: 'clinician_review',
      reasons: ['Therapeutic/high-dose supplement regimens require an approved clinical rule and appropriate clinical context.'],
    };
  }
  return { actionClass, disposition: 'allowed', reasons: [] };
}

function escalate(target: SafetyDecision, disposition: SafetyDecision['disposition'], reason: string) {
  if (severityRank[disposition] > severityRank[target.disposition]) target.disposition = disposition;
  if (!target.reasons.includes(reason)) target.reasons.push(reason);
}

const list = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const diagnosed = (answers: Answers, condition: string) => list(answers.diagnosedConditions).includes(condition);

export function buildSafetyGate(answers: Answers, redFlags: string[]): SafetyGate {
  const flags: SafetyFlag[] = [];
  const decisions = ACTION_CLASSES.map(decision);
  const byClass = new Map(decisions.map((item) => [item.actionClass, item]));
  const age = Number(answers.age || 0);
  const reproductive = String(answers.reproductiveContext || '');
  const medicationCount = Number(answers.medicationCount || 0);
  const kidneySeverity = String(answers.kidneyDiseaseSeverity || '');
  const liverSeverity = String(answers.liverDiseaseSeverity || '');

  const addFlag = (flag: SafetyFlag) => flags.push(flag);
  const apply = (actionClass: SafetyActionClass, disposition: SafetyDecision['disposition'], reason: string) => {
    const target = byClass.get(actionClass);
    if (target) escalate(target, disposition, reason);
  };

  if (redFlags.length) {
    addFlag({ id: 'active_red_flag', label: 'Urgent red-flag pattern active', severity: 'urgent', reason: 'Urgent evaluation takes precedence over routine self-care planning.', sourceQuestionIds: ['currentConcerns', 'redFlagChestPain'] });
    for (const item of decisions) escalate(item, 'blocked', 'Routine recommendations are suppressed while an urgent red flag is active.');
  }

  if (age > 0 && age < 18) {
    addFlag({ id: 'pediatric', label: 'Under 18 years', severity: 'high_caution', reason: 'Pediatric recommendations require age-specific clinical rules and dosing/context.', sourceQuestionIds: ['age'] });
    for (const actionClass of ['general_lifestyle','diet_guidance','exercise'] as SafetyActionClass[]) apply(actionClass, 'caution', 'Use age-appropriate pediatric guidance rather than adult assumptions.');
    apply('routine_supplement', 'clinician_review', 'Supplement use in children requires age-specific context and dosing review.');
    apply('therapeutic_supplement', 'blocked', 'Therapeutic supplement regimens are not auto-recommended for children.');
  }

  if (reproductive === 'pregnant' || reproductive === 'trying' || reproductive === 'unsure') {
    addFlag({ id: 'pregnancy_context', label: 'Pregnancy / trying-to-conceive context', severity: 'high_caution', reason: 'Pregnancy changes the safety and appropriateness of medicines, supplements, exercise and dietary advice.', sourceQuestionIds: ['reproductiveContext'] });
    apply('diet_guidance', 'caution', 'Pregnancy-specific nutrition constraints may apply.');
    apply('exercise', 'caution', 'Pregnancy-specific exercise constraints may apply.');
    apply('routine_supplement', 'clinician_review', 'Supplement choice and dose should be pregnancy-appropriate and reviewed.');
    apply('therapeutic_supplement', 'blocked', 'Therapeutic replacement regimens require clinician oversight in pregnancy.');
  }

  if (reproductive === 'breastfeeding') {
    addFlag({ id: 'breastfeeding', label: 'Breastfeeding', severity: 'high_caution', reason: 'Breastfeeding can change medicine and supplement safety considerations.', sourceQuestionIds: ['reproductiveContext'] });
    apply('routine_supplement', 'clinician_review', 'Supplement choice and dose should be reviewed for breastfeeding context.');
    apply('therapeutic_supplement', 'blocked', 'Therapeutic replacement regimens require clinician oversight while breastfeeding.');
  }

  const hasKidney = diagnosed(answers, 'kidney');
  if (hasKidney) {
    const advanced = ['stage4_5','dialysis','transplant'].includes(kidneySeverity);
    addFlag({ id: advanced ? 'advanced_kidney_disease' : 'kidney_disease', label: advanced ? 'Advanced kidney disease context' : 'Kidney disease context', severity: advanced ? 'high_caution' : 'caution', reason: 'Kidney disease can alter safe supplement, medication, diet and fluid recommendations.', sourceQuestionIds: ['diagnosedConditions','kidneyDiseaseSeverity'] });
    apply('diet_guidance', advanced ? 'clinician_review' : 'caution', 'Kidney-specific nutrition or fluid restrictions may apply.');
    apply('exercise', advanced ? 'clinician_review' : 'caution', 'Exercise advice should account for kidney disease severity and treatment status.');
    apply('routine_supplement', 'clinician_review', 'Supplements can require renal-specific review.');
    apply('therapeutic_supplement', 'blocked', 'Therapeutic supplementation is not auto-recommended with kidney disease.');
  }

  const hasLiver = diagnosed(answers, 'liver');
  if (hasLiver) {
    const advanced = ['cirrhosis','decompensated','transplant'].includes(liverSeverity);
    addFlag({ id: advanced ? 'advanced_liver_disease' : 'liver_disease', label: advanced ? 'Advanced liver disease context' : 'Liver disease context', severity: advanced ? 'high_caution' : 'caution', reason: 'Liver disease can alter medicine, supplement and nutrition safety.', sourceQuestionIds: ['diagnosedConditions','liverDiseaseSeverity'] });
    apply('diet_guidance', advanced ? 'clinician_review' : 'caution', 'Liver-specific nutrition constraints may apply.');
    apply('exercise', advanced ? 'clinician_review' : 'caution', 'Exercise advice should account for liver disease severity.');
    apply('routine_supplement', 'clinician_review', 'Supplements can require hepatic safety review.');
    apply('therapeutic_supplement', 'blocked', 'Therapeutic supplementation is not auto-recommended with liver disease.');
  }

  if (age >= 65 && answers.frailtyConcerns === true) {
    addFlag({ id: 'older_frail', label: 'Older adult with frailty/fall-risk context', severity: 'high_caution', reason: 'Frailty changes safe exercise intensity and can increase medicine/supplement vulnerability.', sourceQuestionIds: ['age','frailtyConcerns'] });
    apply('exercise', 'clinician_review', 'Exercise should be adapted to frailty, balance and fall risk.');
    apply('routine_supplement', 'clinician_review', 'Supplement plans should account for frailty, comorbidity and medicines.');
  }

  if (answers.prescriptionMedications === true) {
    if (Number.isFinite(medicationCount) && medicationCount >= 5) {
      addFlag({ id: 'polypharmacy', label: 'Multiple prescription medicines', severity: 'high_caution', reason: 'Higher medication burden increases interaction and duplication risk.', sourceQuestionIds: ['prescriptionMedications','medicationCount','medicationCategories'] });
      apply('routine_supplement', 'clinician_review', 'Check supplement–medicine interactions before adding products.');
    } else if (!medicationCount) {
      addFlag({ id: 'medication_context_incomplete', label: 'Prescription medicine context incomplete', severity: 'caution', reason: 'Medication details are incomplete, so interaction-sensitive recommendations should remain conservative.', sourceQuestionIds: ['prescriptionMedications','medicationCount','medicationCategories'] });
      apply('routine_supplement', 'caution', 'Confirm current medicines before adding interaction-sensitive supplements.');
    }
  }

  if (answers.medicationOrSupplementAllergy === true) {
    addFlag({ id: 'allergy_history', label: 'Medication/supplement allergy history', severity: 'high_caution', reason: 'Known allergy history requires ingredient-specific review before recommending products.', sourceQuestionIds: ['medicationOrSupplementAllergy'] });
    apply('routine_supplement', 'clinician_review', 'Review ingredients and prior reactions before supplement use.');
    apply('therapeutic_supplement', 'blocked', 'Therapeutic supplementation is not auto-recommended with relevant allergy history.');
  }

  if (answers.supplementUse === true && list(answers.supplementCategories).includes('herbal')) {
    addFlag({ id: 'herbal_supplement_context', label: 'Herbal supplement use', severity: 'caution', reason: 'Herbal products can have medicine interactions and variable ingredient profiles.', sourceQuestionIds: ['supplementUse','supplementCategories'] });
    apply('routine_supplement', 'caution', 'Review existing supplements to avoid interactions or duplicate ingredients.');
  }

  return {
    version: 'SAFETY-1.0.0',
    urgent: redFlags.length > 0,
    flags,
    decisions,
    summary: flags.length
      ? flags.map((flag) => flag.reason)
      : ['No configured special-population or interaction safety gate was triggered by the supplied answers.'],
  };
}
