import { useMemo, useState } from 'react';
import { assess, createHap, visibleQuestions, type AnswerValue, type Answers } from '@jaanch/core';

export default function App(){
 const [answers,setAnswers]=useState<Answers>({}); const [i,setI]=useState(0); const [done,setDone]=useState(false);
 const qs=useMemo(()=>visibleQuestions(answers),[answers]); const q=qs[Math.min(i,Math.max(0,qs.length-1))]; const result=useMemo(()=>assess(answers),[answers]);
 if(done) return <main><h1>Your Health Map</h1><p>Evidence completeness: {result.evidenceCompleteness}%</p>{result.redFlags.map(x=><aside key={x}>{x}</aside>)}{result.findings.map(f=><section key={f.id}><h2>{f.title}</h2><b>{f.status}</b><p>{f.summary}</p><small>{f.actions[0]}</small></section>)}<details><summary>HAP-1.0</summary><pre>{JSON.stringify(createHap(answers,result),null,2)}</pre></details></main>;
 if(!q) return <main><h1>Jaanch</h1><p>No questions available.</p></main>;
 const set=(v:AnswerValue)=>setAnswers(a=>({...a,[q.id]:v})); const value=answers[q.id];
 return <main><header><h1>Jaanch</h1><p>Deterministic personal health assessment</p></header><progress value={i+1} max={qs.length}/><section><small>{q.master?'Master question':'Adaptive follow-up'} · {q.domain}</small><h2>{q.title}</h2>{q.type==='number'?<input type="number" value={typeof value==='number'?value:''} onChange={e=>set(Number(e.target.value))}/>:<div>{q.options?.map(o=><button key={o.value} onClick={()=>set(q.type==='boolean'?o.value==='yes':o.value)}>{o.label}</button>)}</div>}<p>Why asked: {q.master?'baseline assessment':'triggered by earlier answers'}.</p></section><nav><button disabled={!i} onClick={()=>setI(Math.max(0,i-1))}>Back</button><button disabled={value===undefined} onClick={()=>i>=qs.length-1?setDone(true):setI(i+1)}>Continue</button></nav></main>;
}
