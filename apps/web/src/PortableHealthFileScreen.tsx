import { useMemo, useState } from 'react';
import {
  addSnapshot,
  decodeLongitudinalHistory,
  decodeProfileBundle,
  emptyLongitudinalHistory,
  encodeLongitudinalHistory,
  encodeProfileBundle,
  profileBundleFromHistory,
  profileHistoryOrEmpty,
  runProfileBundle,
} from '@jaanch/core';

const HISTORY_KEY='jaanch.history.v1';

type Props={onApplied:()=>void;onBack:()=>void};

function downloadText(filename:string,text:string){
  const blob=new Blob([text],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download=filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PortableHealthFileScreen({onApplied,onBack}:Props){
  const [message,setMessage]=useState('');
  const history=useMemo(()=>typeof window==='undefined'?emptyLongitudinalHistory():decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)),[]);

  const exportFile=()=>{
    try{
      const bundle=profileBundleFromHistory(history,'My Jaanch health file');
      downloadText(`jaanch-health-${new Date().toISOString().slice(0,10)}.json`,encodeProfileBundle(bundle));
      setMessage('Downloaded. Keep this file somewhere you control so a future Jaanch session can continue from your history.');
    }catch(error){setMessage(error instanceof Error?error.message:'Save a check-in before exporting.');}
  };

  const importFile=async(file?:File)=>{
    if(!file)return;
    try{
      const bundle=decodeProfileBundle(await file.text());
      let restored=profileHistoryOrEmpty(bundle);
      if(!restored.snapshots.length){
        const run=runProfileBundle(bundle);
        restored=addSnapshot(emptyLongitudinalHistory(),run.snapshot);
      }
      window.localStorage.setItem(HISTORY_KEY,encodeLongitudinalHistory(restored));
      setMessage(`Loaded ${restored.snapshots.length} saved check-in${restored.snapshots.length===1?'':'s'}. Stable history can now be reused instead of entered again.`);
      onApplied();
    }catch(error){setMessage(error instanceof Error?error.message:'Could not load this Jaanch file.');}
  };

  return <main className="app-shell">
    <header className="app-header"><div><span className="eyebrow">Your history, owned by you</span><h1>My Jaanch file</h1><p>No Jaanch account is required for this workflow. Carry your own baseline and check-in history between sessions as a file.</p></div><button type="button" className="secondary" onClick={onBack}>← Back to Jaanch</button></header>
    <section className="panel">
      <div className="field-grid two">
        <div className="subcard"><span className="eyebrow">Keep after this session</span><h2>Save my Jaanch file</h2><p>Download the latest baseline plus saved check-in history to a folder you control.</p><button type="button" className="primary" disabled={!history.snapshots.length} onClick={exportFile}>Download my Jaanch file</button>{!history.snapshots.length&&<p className="hint">Save at least one check-in first.</p>}</div>
        <div className="subcard"><span className="eyebrow">Next time</span><h2>Continue from an older file</h2><p>Upload your Jaanch JSON. History is restored locally, and Quick Recheck can focus on what changed instead of rebuilding established facts.</p><input type="file" accept="application/json,.json" onChange={event=>importFile(event.target.files?.[0])}/></div>
      </div>
    </section>
    <section className="panel"><h2>A simple no-account routine</h2><ol className="priority-list"><li>Finish or update your Jaanch check-in.</li><li>Download <b>My Jaanch file</b>.</li><li>Keep it in a folder on your own device or storage you trust.</li><li>Optionally email it to yourself if you are comfortable with your email provider storing health information.</li><li>Next time, upload that file and update only what changed.</li></ol></section>
    <div className="notice"><b>Privacy note</b><span>This flow does not send the imported/exported file to a Jaanch backend and no name is required by Jaanch. The file itself can still contain sensitive health information—including details you typed into free-text fields—so protect it like any personal health document.</span></div>
    {message&&<p className="success">{message}</p>}
  </main>;
}
