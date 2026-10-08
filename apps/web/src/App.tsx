import { useMemo, useState } from 'react';
import { assess, createHap, getAssessmentPlan, SKIPPED_ANSWER, type AnswerValue, type Answers } from '@jaanch/core';

export default function App(){
 const [answers,setAnswers]=useState<Answers>({}); const [done,setDone]=useState(false); const [currentId,setCurrentId]=useState<string>(); const [history,setHistory]=useState<string[]>([]);
 const plan=useMemo(()=>getAssessmentPlan(answers),[answers]); const current=plan.questions.find(item=>item.question.id===currentId) ?? plan.nextQuestion; const q=current?.question; const result=useMemo(()=>assess(answers),[answers]);
 const setCurrent=(id:string,v:AnswerValue)=>{setCurrentId(id);setAnswers(a=>({...a,[id]:v}));};
 const toggleMulti=(id:string,v:string)=>{setCurrentId(id);setAnswers(a=>{const existing=Array.isArray(a[id])?a[id] as string[]:[]; return {...a,[id]:existing.includes(v)?existing.filter(x=>x!==v):[...existing,v]};});};
 const advance=()=>{if(!q)return; const next=plan.nextQuestion; if(!next){setDone(true);return;} setHistory(h=>[...h,q.id]); setCurrentId(next.question.id);};
 const skip=()=>{if(!q)return; setHistory(h=>[...h,q.id]); setAnswers(a=>({...a,[q.id]:SKIPPED_ANSWER})); setCurrentId(undefined);};
 const back=()=>setHistory(h=>{const copy=[...h]; const previous=copy.pop(); if(previous)setCurrentId(previous); return copy;});
 if(done || (plan.complete && !currentId)) return <main><h1>Your Health Map</h1><p>Evidence completeness: {result.evidenceCompleteness}%</p>{result.redFlags.map(x=><aside key={x}>{x}</aside>)}{result.findings.map(f=><section key={f.id}><h2>{f.title}</h2><b>{f.status}</b><p>{f.summary}</p><small>{f.actions[0]}</small></section>)}<details><summary>HAP-1.0</summary><pre>{JSON.stringify(createHap(answers,result),null,2)}</pre></details></main>;
 if(!q || !current) return <main><h1>Jaanch</h1><p>No questions available.</p></main>;
 const value=answers[q.id];
 return <main><header><h1>Jaanch</h1><p>Deterministic personal health assessment</p></header><progress value={plan.answered} max={Math.max(plan.questions.length,1)}/><section><small>{q.master?'Master question':'Adaptive follow-up'} · {q.domain}</small><h2>{q.title}</h2>{q.type==='number'?<input type="number" min={q.min} max={q.max} value={typeof value==='number'?value:''} onChange={e=>setCurrent(q.id,Number(e.target.value))}/>:<div>{q.options?.map(o=>{const selected=q.type==='multi'?Array.isArray(value)&&value.includes(o.value):value===(q.type==='boolean'?(o.value==='yes'):o.value); return <button aria-pressed={selected} key={o.value} onClick={()=>q.type==='multi'?toggleMulti(q.id,o.value):setCurrent(q.id,q.type==='boolean'?o.value==='yes':o.value)}>{selected?'✓ ':''}{o.label}</button>})}</div>}<p><strong>Why asked:</strong> {current.whyAsked.join(' ')}</p></section><nav><button disabled={!history.length} onClick={back}>Back</button><button onClick={skip}>Skip / don't know</button><button disabled={value===undefined || (Array.isArray(value)&&value.length===0)} onClick={advance}>Continue</button></nav></main>;
}
