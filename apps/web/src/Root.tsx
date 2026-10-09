import { useState } from 'react';
import App from './App';
import { AIReviewScreen } from './AIReviewScreen';
import { ReportImportScreen } from './ReportImportScreen';
import { ProfileLabScreen } from './ProfileLabScreen';

export default function Root(){
 const [mode,setMode]=useState<'assessment'|'report'|'profiles'|'ai'>('assessment');
 const [appRevision,setAppRevision]=useState(0);
 const applied=()=>setAppRevision(value=>value+1);
 return <>
  <div style={{display:mode==='assessment'?'block':'none'}}><div style={{maxWidth:1120,margin:'16px auto 0',padding:'0 20px',display:'flex',gap:10,flexWrap:'wrap'}}><button type="button" className="secondary" onClick={()=>setMode('report')}>Import lab report</button><button type="button" className="secondary" onClick={()=>setMode('profiles')}>Profiles & mocks</button><button type="button" className="secondary" onClick={()=>setMode('ai')}>AI Review</button></div><App key={appRevision}/></div>
  <div style={{display:mode==='report'?'block':'none'}}><ReportImportScreen onApplied={applied} onBack={()=>setMode('assessment')}/></div>
  <div style={{display:mode==='profiles'?'block':'none'}}><ProfileLabScreen onApplied={applied} onBack={()=>setMode('assessment')}/></div>
  {mode==='ai'&&<AIReviewScreen onBack={()=>setMode('assessment')}/>} 
 </>;
}
