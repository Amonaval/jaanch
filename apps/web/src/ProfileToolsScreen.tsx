import { useMemo, useState } from 'react';
import {
  addProfileToHistory,
  buildHealthMapViewModel,
  decodeJaanchProfile,
  decodeLongitudinalHistory,
  encodeJaanchProfile,
  encodeLongitudinalHistory,
  getMockProfiles,
  profileFromSnapshot,
  type AssessmentSnapshot,
  type JaanchProfile,
} from '@jaanch/core';

const HISTORY_KEY='jaanch.history.v1';

function safeName(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'jaanch-profile';}
function download(profile:JaanchProfile){
 const blob=new Blob([encodeJaanchProfile(profile)],{type:'application/json'});
 const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download=`${safeName(profile.name)}.jaanch.json`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export function ProfileToolsScreen({onApplied,onBack}:{onApplied:()=>void;onBack:()=>void}){
 const mocks=useMemo(()=>getMockProfiles(),[]);
 const [raw,setRaw]=useState('');
 const [active,setActive]=useState<AssessmentSnapshot>();
 const [message,setMessage]=useState('');
 const run=(profile:JaanchProfile)=>{
  try{
   const history=decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY));
   const result=addProfileToHistory({history,profile});
   window.localStorage.setItem(HISTORY_KEY,encodeLongitudinalHistory(result.history));
   setActive(result.snapshot); setMessage(`Loaded and ran “${profile.name}”. A new immutable check-in was saved locally.`); onApplied();
  }catch(error){setMessage(error instanceof Error?error.message:'Could not run profile.');}
 };
 const importRaw=()=>{try{run(decodeJaanchProfile(raw));}catch(error){setMessage(error instanceof Error?error.message:'Profile JSON is invalid.');}};
 const chooseFile=async(file?:File)=>{if(!file)return;try{const text=await file.text();setRaw(text);const profile=decodeJaanchProfile(text);run(profile);}catch(error){setMessage(error instanceof Error?error.message:'Could not import profile file.');}};
 const exportLatest=()=>{
  const history=decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)); const latest=history.snapshots[0];
  if(!latest){setMessage('Save or run a Jaanch check-in first.');return;}
  download(profileFromSnapshot(latest)); setMessage('Exported the latest saved check-in as a portable Jaanch profile JSON file.');
 };
 const health=active?buildHealthMapViewModel(active.assessment):undefined;
 return <main className="app-shell">
  <header className="app-header"><div><span className="eyebrow">Portable profile tools</span><h1>Profiles & test scenarios</h1><p>Run realistic mock profiles, import a profile JSON, or export your latest saved check-in. This is local prototype portability—not an account or cloud medical record.</p></div><button type="button" className="secondary" onClick={onBack}>← Assessment</button></header>
  <section className="assessment-card">
   <div className="notice"><b>Profile protocol</b><span>Imports are validated, then run through the same deterministic engine, lab eligibility, safety and recommendation rules as normal Jaanch check-ins.</span></div>
   <div className="actions"><button type="button" className="primary" onClick={exportLatest}>Export latest profile JSON</button><label className="secondary" style={{display:'inline-flex',alignItems:'center',cursor:'pointer'}}>Import profile file<input style={{display:'none'}} type="file" accept="application/json,.json,.jaanch.json" onChange={event=>chooseFile(event.target.files?.[0])}/></label></div>
   <div className="field"><label>Or paste profile JSON</label><textarea rows={8} value={raw} onChange={event=>setRaw(event.target.value)} placeholder="Paste a JAANCH-PROFILE-1.0 JSON document"/></div>
   <button type="button" className="secondary" onClick={importRaw}>Import & run pasted profile</button>
   {message&&<p className="success">{message}</p>}
  </section>
  <section className="panel"><span className="eyebrow">Built-in fixtures</span><h2>Mock profiles you can run immediately</h2><p className="hint">Each fixture uses fresh relative lab dates so it remains useful for regression testing. You can also download any mock as JSON and import it again.</p>
   <div className="context-grid">{mocks.map(profile=><article className="context-card" key={profile.id}><b>{profile.name}</b><span>{profile.description}</span><div className="actions"><button type="button" className="primary" onClick={()=>run(profile)}>Run mock</button><button type="button" className="secondary" onClick={()=>download(profile)}>Download JSON</button></div></article>)}</div>
  </section>
  {active&&health&&<section className="panel"><span className="eyebrow">Last profile run</span><h2>{active.assessment.findings.length} finding(s) from the real engine</h2><p>{health.evidence.label}</p>{health.findings.map(item=><article className="finding" key={item.id}><b>{item.domainLabel}: {item.title}</b><span>{item.statusLabel} · {item.urgencyLabel} · {item.evidenceLevelLabel}</span><p>{item.summary}</p></article>)}{active.capturedContext?.recordedMeasurements.length?<div className="notice"><b>Recorded / still unassessed</b><span>{active.capturedContext.recordedMeasurements.map(item=>`${item.label}: ${item.value}${item.unit?` ${item.unit}`:''}`).join(' · ')}</span></div>:null}</section>}
 </main>;
}
