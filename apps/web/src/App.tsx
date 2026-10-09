import { useMemo, useState } from 'react';
import { assess, buildHealthMapViewModel, buildLabReassessmentViewModel, createHap, getAssessmentPlan, reassessWithLabs, SKIPPED_ANSWER, type AnswerValue, type Answers, type LabMarkerId, type LabRecord } from '@jaanch/core';

export default function App(){
 const [answers,setAnswers]=useState<Answers>({});
 const [done,setDone]=useState(false);
 const [currentId,setCurrentId]=useState<string>();
 const [history,setHistory]=useState<string[]>([]);
 const [labRecords,setLabRecords]=useState<LabRecord[]>([]);
 const [labMarker,setLabMarker]=useState<LabMarkerId>('vitamin_b12');
 const [labValue,setLabValue]=useState('');
 const [labDate,setLabDate]=useState(()=>new Date().toISOString().slice(0,10));
 const plan=useMemo(()=>getAssessmentPlan(answers),[answers]);
 const current=plan.questions.find(item=>item.question.id===currentId) ?? plan.nextQuestion;
 const q=current?.question;
 const baseResult=useMemo(()=>assess(answers),[answers]);
 const reassessment=useMemo(()=>labRecords.length?reassessWithLabs(answers,labRecords):undefined,[answers,labRecords]);
 const result=reassessment?.after ?? baseResult;
 const healthMap=useMemo(()=>buildHealthMapViewModel(result),[result]);
 const labView=useMemo(()=>reassessment?buildLabReassessmentViewModel(reassessment):undefined,[reassessment]);
 const setCurrent=(id:string,v:AnswerValue)=>{setCurrentId(id);setAnswers(a=>({...a,[id]:v}));};
 const toggleMulti=(id:string,v:string)=>{setCurrentId(id);setAnswers(a=>{const existing=Array.isArray(a[id])?a[id] as string[]:[]; return {...a,[id]:existing.includes(v)?existing.filter(x=>x!==v):[...existing,v]};});};
 const advance=()=>{if(!q)return; const next=plan.nextQuestion; if(!next){setDone(true);return;} setHistory(h=>[...h,q.id]); setCurrentId(next.question.id);};
 const skip=()=>{if(!q)return; setHistory(h=>[...h,q.id]); setAnswers(a=>({...a,[q.id]:SKIPPED_ANSWER})); setCurrentId(undefined);};
 const back=()=>setHistory(h=>{const copy=[...h]; const previous=copy.pop(); if(previous)setCurrentId(previous); return copy;});
 const addLab=()=>{const value=Number(labValue); if(!Number.isFinite(value)||!labDate)return; setLabRecords(items=>[...items,{id:`lab-${labMarker}-${Date.now()}`,markerId:labMarker,value,unit:labMarker==='hba1c'?'%':'pg/mL',collectedAt:`${labDate}T00:00:00.000Z`,source:'manual',verification:'user_confirmed'}]); setLabValue('');};
 if(done || (plan.complete && !currentId)) return <main>
  <header><h1>{healthMap.title}</h1><p>{healthMap.evidence.label}</p></header>
  {healthMap.urgentMessages.map(x=><aside key={x}><b>Urgent:</b> {x}</aside>)}
  <section><h2>Top priorities</h2>{healthMap.topPriorities.length?<ol>{healthMap.topPriorities.map(x=><li key={x.id}><b>{x.title}</b><br/>{x.detail}</li>)}</ol>:<p>No high-priority item from the current evidence.</p>}</section>
  <section><h2>Add lab evidence</h2><p><small>Manual entries are treated as user-confirmed. Date and unit are retained with the result.</small></p><select value={labMarker} onChange={e=>setLabMarker(e.target.value as LabMarkerId)}><option value="vitamin_b12">Vitamin B12 (pg/mL)</option><option value="hba1c">HbA1c (%)</option></select><input type="number" placeholder="Value" value={labValue} onChange={e=>setLabValue(e.target.value)}/><input type="date" value={labDate} onChange={e=>setLabDate(e.target.value)}/><button disabled={!labValue||!labDate} onClick={addLab}>Add and reassess</button>{labView&&<><h3>{labView.title}</h3><p>{labView.appliedLabel}</p><p><small>{labView.freshnessDisclaimer}</small></p><ul>{labView.records.map(x=><li key={x.id}><b>{x.markerLabel}: {x.valueLabel}</b> · {x.collectedLabel} · {x.freshnessLabel} · {x.eligibilityLabel}{x.issues.length?<><br/><small>{x.issues.join(' ')}</small></>:null}</li>)}</ul>{labView.changes.length?<><h3>What changed</h3><ul>{labView.changes.map(x=><li key={x.id}><b>{x.title}</b> — {x.detail}</li>)}</ul></>:<p>{labView.noChangeLabel}</p>}</>}</section>
  <section><h2>Safety context</h2>{healthMap.safety.flags.map(x=><article key={x.id}><b>{x.label}</b> · {x.severityLabel}<p>{x.reason}</p></article>)}{healthMap.safety.clearLabel&&<p>{healthMap.safety.clearLabel}</p>}{healthMap.safety.restrictions.length>0&&<ul>{healthMap.safety.restrictions.map(x=><li key={x.actionClass}><b>{x.actionLabel}</b> — {x.dispositionLabel}{x.reasons[0]?`: ${x.reasons[0]}`:''}</li>)}</ul>}</section>
  {healthMap.findings.map(f=><section key={f.id}><h2>{f.domainLabel}: {f.title}</h2><p><b>{f.statusLabel}</b> · {f.urgencyLabel} · {f.confidenceLabel} · {f.evidenceLevelLabel}</p><p>{f.summary}</p><details><summary>Why this finding</summary>{f.supporting.length>0&&<><h3>Supports</h3><ul>{f.supporting.map(x=><li key={x.id}>{x.label}: {x.detail}</li>)}</ul></>}{f.contradicting.length>0&&<><h3>Contradicts</h3><ul>{f.contradicting.map(x=><li key={x.id}>{x.label}: {x.detail}</li>)}</ul></>}{f.missing.length>0&&<><h3>Missing</h3><ul>{f.missing.map(x=><li key={x.id}>{x.label}: {x.detail}</li>)}</ul></>}<small>{f.ruleLabel}</small></details>{f.action&&<p>{f.action}</p>}</section>)}
  <section><h2>What to check next</h2><p><small>{healthMap.investigations.disclaimer}</small></p>{healthMap.investigations.blockedReason?<aside>{healthMap.investigations.blockedReason}</aside>:<>{healthMap.investigations.minimal.length?<ol>{healthMap.investigations.minimal.map(x=><li key={x.id}><b>{x.title}</b> — {x.priorityLabel}<br/>{x.rationale}<br/><small>{x.maturityLabel} · {x.sourceIds.join(', ')}</small></li>)}</ol>:<p>{healthMap.investigations.emptyLabel}</p>}{healthMap.investigations.alternatives.length>0&&<details><summary>Alternatives / additional options</summary><ul>{healthMap.investigations.alternatives.map(x=><li key={x.id}><b>{x.title}</b> — {x.rationale}</li>)}</ul></details>}</>}</section>
  <details><summary>Clinical governance</summary><p>{healthMap.governance.label}</p><p>Sources: {healthMap.governance.referencedSourceIds.join(', ')}</p><p>Prototype rules: {healthMap.governance.prototypeRuleIds.join(', ') || 'None'}</p></details>
  <details><summary>HAP-1.0</summary><pre>{JSON.stringify(createHap(answers,result,reassessment?.normalizedLabs),null,2)}</pre></details>
 </main>;
 if(!q || !current) return <main><h1>Jaanch</h1><p>No questions available.</p></main>;
 const value=answers[q.id];
 return <main><header><h1>Jaanch</h1><p>Deterministic personal health assessment</p></header><progress value={plan.answered} max={Math.max(plan.questions.length,1)}/><section><small>{q.master?'Master question':'Adaptive follow-up'} · {q.domain}</small><h2>{q.title}</h2>{q.description&&<p>{q.description}</p>}{q.type==='number'?<input type="number" min={q.min} max={q.max} value={typeof value==='number'?value:''} onChange={e=>setCurrent(q.id,Number(e.target.value))}/>:<div>{q.options?.map(o=>{const selected=q.type==='multi'?Array.isArray(value)&&value.includes(o.value):value===(q.type==='boolean'?(o.value==='yes'):o.value); return <button aria-pressed={selected} key={o.value} onClick={()=>q.type==='multi'?toggleMulti(q.id,o.value):setCurrent(q.id,q.type==='boolean'?o.value==='yes':o.value)}>{selected?'✓ ':''}{o.label}</button>})}</div>}<p><strong>Why asked:</strong> {current.whyAsked.join(' ')}</p></section><nav><button disabled={!history.length} onClick={back}>Back</button><button onClick={skip}>Skip / don't know</button><button disabled={value===undefined || (Array.isArray(value)&&value.length===0)} onClick={advance}>Continue</button></nav></main>;
}
