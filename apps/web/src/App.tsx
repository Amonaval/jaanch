import { useMemo, useState } from 'react';
import { assess, createHap, getAssessmentPlan, SKIPPED_ANSWER, type AnswerValue, type Answers } from '@jaanch/core';

export default function App(){
 const [answers,setAnswers]=useState<Answers>({}); const [done,setDone]=useState(false);
 const plan=useMemo(()=>getAssessmentPlan(answers),[answers]); const current=plan.nextQuestion; const q=current?.question; const result=useMemo(()=>assess(answers),[answers]);
 const set=(id:string,v:AnswerValue)=>setAnswers(a=>({...a,[id]:v}));
 const toggleMulti=(id:string,v:string)=>setAnswers(a=>{const existing=Array.isArray(a[id])?a[id] as string[]:[]; return {...a,[id]:existing.includes(v)?existing.filter(x=>x!==v):[...existing,v]};});
 if(done || plan.complete) return <main><h1>Your Health Map</h1><p>Evidence completeness: {result.evidenceCompleteness}%</p>{result.redFlags.map(x=><aside key={x}>{x}</aside>)}{result.findings.map(f=><section key={f.id}><h2>{f.title}</h2><b>{f.status}</b><p>{f.summary}</p><small>{f.actions[0]}</small></section>)}<details><summary>HAP-1.0</summary><pre>{JSON.stringify(createHap(answers,result),null,2)}</pre></details></main>;
 if(!q || !current) return <main><h1>Jaanch</h1><p>No questions available.</p></main>;
 const value=answers[q.id];
 return <main><header><h1>Jaanch</h1><p>Deterministic personal health assessment</p></header><progress value={plan.answered} max={Math.max(plan.questions.length,1)}/><section><small>{q.master?'Master question':'Adaptive follow-up'} · {q.domain}</small><h2>{q.title}</h2>{q.type==='number'?<input type="number" min={q.min} max={q.max} value={typeof value==='number'?value:''} onChange={e=>set(q.id,Number(e.target.value))}/>:<div>{q.options?.map(o=>{const selected=q.type==='multi'?Array.isArray(value)&&value.includes(o.value):value===(q.type==='boolean'?(o.value==='yes'):o.value); return <button aria-pressed={selected} key={o.value} onClick={()=>q.type==='multi'?toggleMulti(q.id,o.value):set(q.id,q.type==='boolean'?o.value==='yes':o.value)}>{selected?'✓ ':''}{o.label}</button>})}</div>}<p><strong>Why asked:</strong> {current.whyAsked.join(' ')}</p></section><nav><button onClick={()=>set(q.id,SKIPPED_ANSWER)}>Skip / don't know</button><button disabled={value===undefined || (Array.isArray(value)&&value.length===0)} onClick={()=>plan.remaining<=1?setDone(true):undefined}>Continue</button></nav></main>;
}
