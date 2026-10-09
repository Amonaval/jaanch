import { useState } from 'react';
import { decodeLongitudinalHistory } from '@jaanch/core';
import App from './App';
import { AIReviewScreen } from './AIReviewScreen';
import { LatestBriefScreen } from './LatestBriefScreen';
import { PortableHealthFileScreen } from './PortableHealthFileScreen';
import { ReportImportScreen } from './ReportImportScreen';
import { ProfileLabScreen } from './ProfileLabScreen';

const HISTORY_KEY='jaanch.history.v1';

export default function Root(){
 const [mode,setMode]=useState<'assessment'|'brief'|'file'|'report'|'profiles'|'ai'>('assessment');
 const [appRevision,setAppRevision]=useState(0);
 const applied=()=>setAppRevision(value=>value+1);
 const hasHistory=typeof window!=='undefined'&&decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)).snapshots.length>0;
 return <>
  <div style={{display:mode==='assessment'?'block':'none'}}>
   <div className="consumer-nav">
    {hasHistory&&<button type="button" className="secondary" onClick={()=>setMode('brief')}>Latest Health Brief</button>}
    <button type="button" className="secondary" onClick={()=>setMode('file')}>My Jaanch file</button>
    <button type="button" className="secondary" onClick={()=>setMode('report')}>Import lab report</button>
    <details className="advanced-tools"><summary>Advanced / experimental</summary><div><button type="button" className="secondary" onClick={()=>setMode('ai')}>AI second opinion</button><button type="button" className="secondary" onClick={()=>setMode('profiles')}>Profiles & test mocks</button></div></details>
   </div>
   <App key={appRevision}/>
  </div>
  {mode==='brief'&&<LatestBriefScreen onBack={()=>setMode('assessment')}/>} 
  {mode==='file'&&<PortableHealthFileScreen onApplied={()=>{applied();setMode('assessment');}} onBack={()=>setMode('assessment')}/>} 
  <div style={{display:mode==='report'?'block':'none'}}><ReportImportScreen onApplied={applied} onBack={()=>setMode('assessment')}/></div>
  <div style={{display:mode==='profiles'?'block':'none'}}><ProfileLabScreen onApplied={applied} onBack={()=>setMode('assessment')}/></div>
  {mode==='ai'&&<AIReviewScreen onBack={()=>setMode('assessment')}/>} 
 </>;
}
