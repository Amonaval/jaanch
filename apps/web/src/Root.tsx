import { useState } from 'react';
import App from './App';
import { ReportImportScreen } from './ReportImportScreen';

export default function Root(){
 const [mode,setMode]=useState<'assessment'|'report'>('assessment');
 const [appRevision,setAppRevision]=useState(0);
 return <>
  <div style={{display:mode==='assessment'?'block':'none'}}><div style={{maxWidth:1120,margin:'16px auto 0',padding:'0 20px'}}><button type="button" className="secondary" onClick={()=>setMode('report')}>Import lab report</button></div><App key={appRevision}/></div>
  <div style={{display:mode==='report'?'block':'none'}}><ReportImportScreen onApplied={()=>setAppRevision(value=>value+1)} onBack={()=>setMode('assessment')}/></div>
 </>;
}
