import { latestEligibleLabs, normalizeLabRecords } from './labs';
import { assess } from './engine';
import { buildRecommendationPlan } from './recommendations';
import { createAssessmentSnapshot } from './longitudinal';
import { reassessSnapshotWithConfirmedReportEvidence } from './reportWorkflow';
import {
  confirmReportEvidenceCandidate,
  createReportProvenance,
  extractReportCandidatesFromText,
  mergeConfirmedReportEvidence,
} from './reportEvidence';
import type { Answers } from './types';
import type { VerificationCaseResult } from './verification';

const check=(id:string,condition:boolean,details:string):VerificationCaseResult=>({id,passed:condition,details:condition?undefined:details});

export function runEvidenceCaptureVerification(): VerificationCaseResult[] {
  const results: VerificationCaseResult[] = [];
  const provenance=createReportProvenance({
    fileName:'sample-labs.pdf',
    mimeType:'application/pdf',
    sizeBytes:12345,
    importedAt:'2026-10-09T07:00:00.000Z',
    extractionMethod:'pasted_text',
    reportId:'report-fixture',
  });
  const candidates=extractReportCandidatesFromText({
    provenance,
    defaultCollectedAt:'2026-10-01T00:00:00.000Z',
    text:['HbA1c: 5.9 % | reference range 4.0 - 5.6','Vitamin B12: 168 pg/mL','Vitamin D (25-OH): 22 ng/mL','Triglycerides: 310 mg/dL'].join('\n'),
  });

  results.push(check('report-extraction-produces-candidates-only',candidates.length===4&&candidates.every(item=>item.status==='candidate'),'Expected extraction to produce reviewable candidates without creating clinical evidence.'));
  const hba1c=candidates.find(item=>item.markerId==='hba1c');
  const b12=candidates.find(item=>item.markerId==='vitamin_b12');
  const vitaminD=candidates.find(item=>item.markerId==='vitamin_d_25oh');
  results.push(check('report-marker-normalization',Boolean(hba1c&&b12&&vitaminD),'Expected common report labels to normalize to known capture markers.'));

  if(hba1c){
    const confirmed=confirmReportEvidenceCandidate(hba1c);
    results.push(check('report-confirmation-is-explicit-eligibility-boundary',confirmed.lab?.verification==='user_confirmed'&&confirmed.lab.source==='report'&&confirmed.lab.reportProvenance.reportId==='report-fixture','Expected supported report evidence to become a lab only after explicit confirmation.'));
    const normalized=normalizeLabRecords(confirmed.lab?[confirmed.lab]:[],'2026-10-09T00:00:00.000Z');
    results.push(check('report-confirmed-lab-retains-provenance',normalized[0]?.eligibleForAssessment===true&&(normalized[0] as unknown as { reportProvenance?: { fileName?: string } })?.reportProvenance?.fileName==='sample-labs.pdf','Expected confirmed report lab to retain provenance through normalization and become eligible only through existing lab gates.'));
  }

  if(vitaminD){
    const confirmed=confirmReportEvidenceCandidate(vitaminD);
    results.push(check('report-unsupported-marker-stays-unassessed',Boolean(confirmed.recorded)&&!confirmed.lab&&confirmed.recorded?.state==='recorded_unassessed','Expected captured Vitamin D report evidence to stay recorded/unassessed until a sourced rule exists.'));
  }

  const missingUnitCandidate=extractReportCandidatesFromText({provenance,defaultCollectedAt:'2026-10-01T00:00:00.000Z',text:'HbA1c: 5.9'})[0];
  if(missingUnitCandidate){
    const confirmed=confirmReportEvidenceCandidate(missingUnitCandidate);
    results.push(check('report-missing-unit-is-not-inferred',!missingUnitCandidate.unit&&!confirmed.lab&&confirmed.issues.some(issue=>issue.includes('unit')),'Expected a missing report unit to remain missing and block interpreted-lab confirmation rather than infer a default unit.'));
  }

  if(b12){
    const missingDate={...b12,collectedAt:undefined};
    const confirmed=confirmReportEvidenceCandidate(missingDate);
    results.push(check('report-missing-date-blocks-interpreted-confirmation',!confirmed.lab&&confirmed.issues.some(issue=>issue.includes('collection date')),'Expected interpreted report evidence without a collection date to remain in clarification rather than becoming eligible.'));
  }

  if(hba1c){
    const first=confirmReportEvidenceCandidate(hba1c);
    const merged=mergeConfirmedReportEvidence({labs:[],recordedMeasurements:[],confirmed:first});
    const duplicate=mergeConfirmedReportEvidence({labs:merged.labs,recordedMeasurements:merged.recordedMeasurements,confirmed:first});
    const newerCandidate={...hba1c,id:'report-fixture-hba1c-newer',value:'5.7',numericValue:5.7,collectedAt:'2026-10-08T00:00:00.000Z'};
    const newer=confirmReportEvidenceCandidate(newerCandidate);
    const withNewer=mergeConfirmedReportEvidence({labs:duplicate.labs,recordedMeasurements:duplicate.recordedMeasurements,confirmed:newer});
    const latest=latestEligibleLabs(normalizeLabRecords(withNewer.labs,'2026-10-09T00:00:00.000Z'));
    results.push(check('report-exact-duplicate-is-deduplicated',duplicate.duplicate===true&&duplicate.labs.length===1,'Expected exact duplicate report evidence to replace provenance rather than create duplicate rows.'));
    results.push(check('report-newer-result-remains-distinct-and-wins-latest',withNewer.labs.length===2&&latest[0]?.value===5.7,'Expected a distinct newer result to remain in history while the existing latest-result semantics select it.'));
  }

  if(hba1c&&vitaminD){
    const answers:Answers={age:37,sex:'male',heightCm:175,weightKg:70,currentConcerns:['none']};
    const assessment=assess(answers);
    const baseline=createAssessmentSnapshot({answers,assessment,recommendationPlan:buildRecommendationPlan(answers,assessment),capturedAt:'2026-10-08T00:00:00.000Z',id:'report-baseline'});
    const batch=reassessSnapshotWithConfirmedReportEvidence({baseline,confirmed:[confirmReportEvidenceCandidate(hba1c),confirmReportEvidenceCandidate(vitaminD)],capturedAt:'2026-10-09T00:00:00.000Z',id:'report-reassessment'});
    results.push(check('report-batch-creates-one-reassessed-snapshot',batch.snapshot.id==='report-reassessment'&&batch.snapshot.labs.length===1&&batch.snapshot.capturedContext?.recordedMeasurements.some(item=>item.markerId==='vitamin_d_25oh')===true,'Expected reviewed report candidates to be applied together to one reassessed snapshot while unsupported markers remain recorded context.'));
  }

  const lowConfidence=extractReportCandidatesFromText({
    provenance,
    defaultCollectedAt:'2026-10-01T00:00:00.000Z',
    text:'Unmapped biomarker: 12.4 mg/dL',
  })[0];
  results.push(check('report-low-confidence-unknown-visible',Boolean(lowConfidence&&lowConfidence.markerId==='other'&&lowConfidence.issues.some(issue=>issue.includes('Low-confidence'))),'Expected unknown markers to surface low-confidence/unsupported warnings rather than silently disappear.'));
  return results;
}

export function assertEvidenceCaptureVerification(){
  const results=runEvidenceCaptureVerification();
  const failed=results.filter(item=>!item.passed);
  if(failed.length) throw new Error(`Evidence capture verification failed: ${failed.map(item=>`${item.id}: ${item.details}`).join(' | ')}`);
  return results;
}
