import { useMemo, useState } from 'react';
import {
  addConfirmedReportEvidenceToHistory,
  confirmReportEvidenceCandidate,
  createReportProvenance,
  decodeLongitudinalHistory,
  encodeLongitudinalHistory,
  extractReportCandidatesFromText,
  type ConfirmedReportEvidence,
  type ReportEvidenceCandidate,
  type ReportProvenance,
} from '@jaanch/core';

const HISTORY_KEY='jaanch.history.v1';
const asIso=(value:string)=>value?`${value}T00:00:00.000Z`:undefined;

export function ReportImportScreen({onApplied,onBack}:{onApplied:()=>void;onBack:()=>void}){
 const [provenance,setProvenance]=useState<ReportProvenance>();
 const [reportDate,setReportDate]=useState('');
 const [text,setText]=useState('');
 const [candidates,setCandidates]=useState<ReportEvidenceCandidate[]>([]);
 const [confirmed,setConfirmed]=useState<Record<string,ConfirmedReportEvidence>>({});
 const [message,setMessage]=useState('');
 const confirmedCount=Object.keys(confirmed).length;
 const savedCount=useMemo(()=>typeof window==='undefined'?0:decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)).snapshots.length,[]);

 const chooseFile=(file?:File)=>{if(!file)return;setProvenance(createReportProvenance({fileName:file.name,mimeType:file.type||undefined,sizeBytes:file.size,extractionMethod:'pasted_text'}));setCandidates([]);setConfirmed({});setMessage('Source attached. Paste report text or OCR output, then verify each candidate.');};
 const extract=()=>{if(!text.trim()){setMessage('Paste report text or OCR output first.');return;}const source=provenance??createReportProvenance({fileName:'Pasted report text',kind:'text',extractionMethod:'pasted_text'});if(!provenance)setProvenance(source);const next=extractReportCandidatesFromText({text,provenance:source,defaultCollectedAt:asIso(reportDate)});setCandidates(next);setConfirmed({});setMessage(next.length?`${next.length} candidate result${next.length===1?'':'s'} found. Extraction alone changes nothing.`:'No structured candidate was found. Keep using manual entry for anything missed.');};
 const patch=(id:string,update:Partial<ReportEvidenceCandidate>)=>{setCandidates(items=>items.map(item=>item.id===id?{...item,...update,status:'candidate'}:item));setConfirmed(current=>{const next={...current};delete next[id];return next;});};
 const review=(candidate:ReportEvidenceCandidate)=>{const result=confirmReportEvidenceCandidate(candidate);if(result.issues.length){setMessage(result.issues.join(' '));return;}setConfirmed(current=>({...current,[candidate.id]:result}));setCandidates(items=>items.map(item=>item.id===candidate.id?{...item,status:'confirmed'}:item));setMessage(result.lab?'Reviewed and ready: supported marker. Existing unit/date/freshness rules still decide eligibility when applied.':'Reviewed and ready: this marker will stay recorded/unassessed.');};
 const apply=()=>{if(!confirmedCount){setMessage('Review at least one candidate before applying.');return;}const history=decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY));if(!history.snapshots.length){setMessage('Save a Jaanch check-in first. Report import reassesses your latest saved profile so it never invents missing health context.');return;}const result=addConfirmedReportEvidenceToHistory({history,confirmed:Object.values(confirmed)});if(!result.reassessment){setMessage('No saved baseline was available.');return;}window.localStorage.setItem(HISTORY_KEY,encodeLongitudinalHistory(result.history));const r=result.reassessment;setMessage(`Applied ${confirmedCount} reviewed result${confirmedCount===1?'':'s'} in one reassessed check-in. ${r.interpretedLabCount} supported lab(s); ${r.recordedUnassessedCount} recorded/unassessed; ${r.duplicateCount} exact duplicate(s) replaced.`);onApplied();};
 return <main className="app-shell">
  <header className="app-header"><div><span className="eyebrow">Clinical evidence capture v2</span><h1>Import a lab report</h1><p>Extraction creates candidates only. You verify the value, unit and date before anything is added to Jaanch.</p></div><button type="button" className="secondary" onClick={onBack}>← Assessment</button></header>
  <section className="assessment-card">
   <div className="notice"><b>Safety boundary</b><span>PDF/image attachment preserves source provenance. This alpha does not silently trust document OCR: paste report text/OCR output, review every candidate, then apply reviewed results to your latest saved check-in.</span></div>
   <p className="hint">Saved baseline available: {savedCount>0?'Yes':'No — save a check-in in Assessment first.'}</p>
   <div className="field-grid two"><div className="field"><label>Report PDF / image</label><input type="file" accept="application/pdf,image/*,text/plain" onChange={event=>chooseFile(event.target.files?.[0])}/></div><div className="field"><label>Collection / report date</label><input type="date" value={reportDate} onChange={event=>setReportDate(event.target.value)}/></div></div>
   {provenance&&<p className="hint"><b>{provenance.fileName}</b> · {provenance.kind}{provenance.sizeBytes?` · ${Math.max(1,Math.round(provenance.sizeBytes/1024))} KB`:''}</p>}
   <div className="field"><label>Report text / OCR output</label><textarea rows={8} value={text} onChange={event=>setText(event.target.value)} placeholder={'Example:\nHbA1c: 5.9 %\nVitamin B12: 168 pg/mL\nVitamin D (25-OH): 22 ng/mL'}/></div>
   <div className="actions"><button type="button" className="secondary" onClick={extract}>Extract candidates</button>{confirmedCount>0&&<button type="button" className="primary" onClick={apply}>Apply {confirmedCount} reviewed result{confirmedCount===1?'':'s'}</button>}</div>
   {message&&<p className="success">{message}</p>}
   {candidates.filter(item=>item.status!=='rejected').map(candidate=><article className="subcard" key={candidate.id}>
    <div className="entry"><div><b>{candidate.label}</b><small>{Math.round((candidate.extractionConfidence??0)*100)}% extraction confidence · {candidate.markerId==='hba1c'||candidate.markerId==='vitamin_b12'?'supported only through normal lab gates':'recorded/unassessed after apply'}</small></div><button type="button" onClick={()=>{setCandidates(items=>items.map(item=>item.id===candidate.id?{...item,status:'rejected'}:item));setConfirmed(current=>{const next={...current};delete next[candidate.id];return next;});}}>Ignore</button></div>
    <div className="field-grid three"><input aria-label={`${candidate.label} value`} value={candidate.value} onChange={event=>patch(candidate.id,{value:event.target.value,numericValue:Number.isFinite(Number(event.target.value))?Number(event.target.value):undefined})}/><input aria-label={`${candidate.label} unit`} value={candidate.unit??''} onChange={event=>patch(candidate.id,{unit:event.target.value||undefined})} placeholder="Unit"/><input aria-label={`${candidate.label} date`} type="date" value={candidate.collectedAt?.slice(0,10)??reportDate} onChange={event=>patch(candidate.id,{collectedAt:asIso(event.target.value)})}/></div>
    <input aria-label={`${candidate.label} reference range`} value={candidate.referenceRange??''} onChange={event=>patch(candidate.id,{referenceRange:event.target.value||undefined})} placeholder="Reference range (optional)"/>
    {candidate.issues.length>0&&<p className="hint">Check: {candidate.issues.join(' ')}</p>}
    <button type="button" className={candidate.status==='confirmed'?'secondary':'primary'} onClick={()=>review(candidate)}>{candidate.status==='confirmed'?'Reviewed ✓':'Review & confirm candidate'}</button>
   </article>)}
  </section>
 </main>;
}
