import { useMemo, useState } from 'react';
import {
  addSnapshot,
  decodeLongitudinalHistory,
  decodeProfileBundle,
  encodeLongitudinalHistory,
  encodeProfileBundle,
  mockProfileBundles,
  profileBundleFromHistory,
  runProfileBundle,
  type JaanchProfileBundle,
  type ProfileRunResult,
} from '@jaanch/core';

const HISTORY_KEY='jaanch.history.v1';

type Props={onApplied:()=>void;onBack:()=>void};

export function ProfileLabScreen({onApplied,onBack}:Props){
 const [selectedId,setSelectedId]=useState(mockProfileBundles[0]?.id??'');
 const [imported,setImported]=useState<JaanchProfileBundle>();
 const [runResult,setRunResult]=useState<ProfileRunResult>();
 const [message,setMessage]=useState('Choose a mock or import a JAANCH-PROFILE-1.0 JSON file. Running it executes the current deterministic engine and saves one local check-in.');
 const selected=useMemo(()=>imported??mockProfileBundles.find(item=>item.id===selectedId)??mockProfileBundles[0],[imported,selectedId]);

 const persistRun=(bundle:JaanchProfileBundle)=>{
  const result=runProfileBundle(bundle);
  const history=decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY));
  window.localStorage.setItem(HISTORY_KEY,encodeLongitudinalHistory(addSnapshot(history,result.snapshot)));
  setRunResult(result); setMessage(`Ran “${bundle.label}” through the current engine and saved the resulting check-in locally.`); onApplied();
 };
 const download=(bundle:JaanchProfileBundle)=>{
  const blob=new Blob([encodeProfileBundle(bundle)],{type:'application/json'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download=`${bundle.id}.jaanch-profile.json`; link.click(); URL.revokeObjectURL(url);
 };
 const importFile=async(file?:File)=>{
  if(!file)return;
  try{const bundle=decodeProfileBundle(await file.text());setImported(bundle);setSelectedId('');persistRun(bundle);}catch(error){setMessage(error instanceof Error?error.message:'Could not import profile.');}
 };
 const exportLatest=()=>{
  try{const history=decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY));download(profileBundleFromHistory(history,'Exported Jaanch profile'));setMessage('Exported the latest saved profile plus local history as versioned JSON.');}catch(error){setMessage(error instanceof Error?error.message:'Nothing to export yet.');}
 };

 return <main className="app-shell">
  <header className="app-header"><div><span className="eyebrow">Test & portability</span><h1>Profiles & mock scenarios</h1><p>Import/export is local JSON portability, not an account or cloud-sync feature. Mock profiles are designed to exercise current deterministic rules safely.</p></div><button type="button" className="secondary" onClick={onBack}>← Back to assessment</button></header>
  <div className="notice"><b>JAANCH-PROFILE-1.0</b><span>{message}</span></div>
  <section className="panel"><h2>Import or export</h2><div className="field-grid two"><div className="field"><label>Import profile JSON</label><input type="file" accept="application/json,.json" onChange={event=>importFile(event.target.files?.[0])}/><p className="hint">Import automatically reruns the profile against the current engine; derived clinical fields inside JSON are discarded and rebuilt from verified captured evidence.</p></div><div className="field"><label>Export your latest saved profile</label><button type="button" className="secondary" onClick={exportLatest}>Download latest profile JSON</button><p className="hint">Includes the latest runnable draft and local history. It does not include credentials or cloud identity.</p></div></div></section>
  <section className="panel"><span className="eyebrow">Ready-made test data</span><h2>Mock profiles</h2><div className="result-list">{mockProfileBundles.map(profile=><article className="entry" key={profile.id}><div><b>{profile.label}</b><small>{profile.description}</small></div><div className="actions"><button type="button" className="primary" onClick={()=>{setImported(undefined);setSelectedId(profile.id);persistRun(profile);}}>Run</button><button type="button" className="secondary" onClick={()=>download(profile)}>Download JSON</button></div></article>)}</div></section>
  {selected&&<section className="panel"><h2>Selected profile</h2><p><b>{selected.label}</b></p><p>{selected.description}</p><div className="actions"><button type="button" className="primary" onClick={()=>persistRun(selected)}>Run selected profile</button><button type="button" className="secondary" onClick={()=>download(selected)}>Download selected JSON</button></div></section>}
  {runResult&&<section className="panel"><span className="eyebrow">Current-engine result</span><h2>{runResult.bundle.label}</h2><p>{runResult.snapshot.assessment.evidenceCompleteness}% questionnaire evidence completeness — not an overall health score.</p><div className="result-grid"><div><h3>Findings</h3>{runResult.snapshot.assessment.findings.map(item=><article className="finding" key={item.id}><b>{item.title}</b><span>{item.status} · {item.urgency} · {item.evidenceLevel}</span><p>{item.summary}</p></article>)}</div><div><h3>Actions</h3>{runResult.snapshot.recommendationPlan.recommendations.slice(0,8).map(item=><article className="action" key={item.id}><b>{item.title}</b><span>{item.priority} · {item.disposition}</span><p>{item.rationale}</p></article>)}</div></div></section>}
 </main>;
}
