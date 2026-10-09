import { useEffect, useMemo, useState } from 'react';
import {
  addSnapshot, assess, buildApplicabilityViewModel, buildHealthMapViewModel, buildLabReassessmentViewModel,
  buildLongitudinalViewModel, buildRecommendationPlan, buildRecommendationViewModel, createAssessmentSnapshot,
  createHap, decodeLongitudinalHistory, emptyLongitudinalHistory, encodeLongitudinalHistory, getAssessmentPlan,
  reassessWithLabs, SKIPPED_ANSWER,
  type AnswerValue, type Answers, type LabMarkerId, type LabRecord, type LongitudinalHistory,
} from '@jaanch/core';

const HISTORY_KEY = 'jaanch.history.v1';

export default function App(){
 const [answers,setAnswers]=useState<Answers>({});
 const [done,setDone]=useState(false);
 const [currentId,setCurrentId]=useState<string>();
 const [navHistory,setNavHistory]=useState<string[]>([]);
 const [labRecords,setLabRecords]=useState<LabRecord[]>([]);
 const [labMarker,setLabMarker]=useState<LabMarkerId>('vitamin_b12');
 const [labValue,setLabValue]=useState('');
 const [labDate,setLabDate]=useState(()=>new Date().toISOString().slice(0,10));
 const [savedMessage,setSavedMessage]=useState('');
 const [longitudinalHistory,setLongitudinalHistory]=useState<LongitudinalHistory>(()=>{
   if(typeof window==='undefined') return emptyLongitudinalHistory();
   return decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY));
 });
 useEffect(()=>{if(typeof window!=='undefined') window.localStorage.setItem(HISTORY_KEY,encodeLongitudinalHistory(longitudinalHistory));},[longitudinalHistory]);

 const plan=useMemo(()=>getAssessmentPlan(answers),[answers]);
 const current=plan.questions.find(item=>item.question.id===currentId) ?? plan.nextQuestion;
 const q=current?.question;
 const baseResult=useMemo(()=>assess(answers),[answers]);
 const reassessment=useMemo(()=>labRecords.length?reassessWithLabs(answers,labRecords):undefined,[answers,labRecords]);
 const result=reassessment?.after ?? baseResult;
 const healthMap=useMemo(()=>buildHealthMapViewModel(result),[result]);
 const applicabilityView=useMemo(()=>buildApplicabilityViewModel(result),[result]);
 const labView=useMemo(()=>reassessment?buildLabReassessmentViewModel(reassessment):undefined,[reassessment]);
 const recommendationPlan=useMemo(()=>buildRecommendationPlan(answers,result),[answers,result]);
 const recommendationView=useMemo(()=>buildRecommendationViewModel(recommendationPlan),[recommendationPlan]);
 const longitudinalView=useMemo(()=>buildLongitudinalViewModel(longitudinalHistory),[longitudinalHistory]);

 const setCurrent=(id:string,v:AnswerValue)=>{setCurrentId(id);setAnswers(a=>({...a,[id]:v}));};
 const toggleMulti=(id:string,v:string)=>{setCurrentId(id);setAnswers(a=>{const existing=Array.isArray(a[id])?a[id] as string[]:[]; const next=existing.includes(v)?existing.filter(x=>x!==v):v==='none'?['none']:[...existing.filter(x=>x!=='none'),v]; return {...a,[id]:next};});};
 const advance=()=>{if(!q)return; const next=plan.nextQuestion; if(!next){setDone(true);return;} setNavHistory(h=>[...h,q.id]); setCurrentId(next.question.id);};
 const skip=()=>{if(!q)return; setNavHistory(h=>[...h,q.id]); setAnswers(a=>({...a,[q.id]:SKIPPED_ANSWER})); setCurrentId(undefined);};
 const back=()=>setNavHistory(h=>{const copy=[...h]; const previous=copy.pop(); if(previous)setCurrentId(previous); return copy;});
 const addLab=()=>{const value=Number(labValue); if(!Number.isFinite(value)||!labDate)return; setLabRecords(items=>[...items,{id:`lab-${labMarker}-${Date.now()}`,markerId:labMarker,value,unit:labMarker==='hba1c'?'%':'pg/mL',collectedAt:`${labDate}T00:00:00.000Z`,source:'manual',verification:'user_confirmed'}]); setLabValue('');};
 const saveCheckIn=()=>{
   const snapshot=createAssessmentSnapshot({answers,labs:reassessment?.normalizedLabs??[],assessment:result,recommendationPlan});
   setLongitudinalHistory(history=>addSnapshot(history,snapshot));
   setSavedMessage(`Saved ${new Date(snapshot.capturedAt).toLocaleString()}`);
 };
 const startNewCheckIn=()=>{setAnswers({});setDone(false);setCurrentId(undefined);setNavHistory([]);setLabRecords([]);setLabValue('');setSavedMessage('');};
 const clearHistory=()=>{if(typeof window!=='undefined' && window.confirm('Clear all locally saved Jaanch check-ins on this browser?')) setLongitudinalHistory(emptyLongitudinalHistory());};

 if(done || (plan.complete && !currentId)) return <main>
  <header><h1>{healthMap.title}</h1><p>{healthMap.evidence.label}</p></header>
  <section><h2>Save this check-in</h2><p>Keep this result locally so a future assessment can show what changed.</p><button onClick={saveCheckIn}>Save check-in</button> <button onClick={startNewCheckIn}>Start a new check-in</button>{savedMessage&&<p><small>{savedMessage}</small></p>}<p><small>Prototype privacy note: browser history uses localStorage and is not encrypted medical-record storage.</small></p></section>
  {longitudinalView.snapshotCount>0&&<section><h2>{longitudinalView.title}</h2><p>{longitudinalView.snapshotCount} locally saved check-in{longitudinalView.snapshotCount===1?'':'s'}.</p>{longitudinalView.comparison&&<><h3>Latest vs previous</h3><p>Evidence completeness change: {longitudinalView.comparison.evidenceCompletenessDelta>=0?'+':''}{longitudinalView.comparison.evidenceCompletenessDelta}%</p>{longitudinalView.comparison.findingTrends.filter(x=>x.direction!=='unchanged').length>0&&<ul>{longitudinalView.comparison.findingTrends.filter(x=>x.direction!=='unchanged').map(x=><li key={x.findingId}><b>{x.title}</b> — {x.direction}{x.beforeStatus||x.afterStatus?<><br/><small>{x.beforeStatus??'not present'} → {x.afterStatus??'not present'}</small></>:null}</li>)}</ul>}{longitudinalView.comparison.resolvedInvestigationIds.length>0&&<p><b>Resolved investigations:</b> {longitudinalView.comparison.resolvedInvestigationIds.join(', ')}</p>}{longitudinalView.comparison.addedInvestigationIds.length>0&&<p><b>New investigations:</b> {longitudinalView.comparison.addedInvestigationIds.join(', ')}</p>}{longitudinalView.comparison.recommendationTrends.length>0&&<ul>{longitudinalView.comparison.recommendationTrends.map(x=><li key={x.id}>Action: <b>{x.title}</b> — {x.change.replace('_',' ')}</li>)}</ul>}{longitudinalView.comparison.labTrends.length>0&&<ul>{longitudinalView.comparison.labTrends.map(x=><li key={x.markerId}>Lab: <b>{x.markerId}</b> — {x.beforeValue??'—'} → {x.afterValue??'—'} {x.unit??''}</li>)}</ul>}</>}<details><summary>Saved check-ins</summary><ol>{longitudinalHistory.snapshots.map(snapshot=><li key={snapshot.id}>{new Date(snapshot.capturedAt).toLocaleString()} · evidence {snapshot.assessment.evidenceCompleteness}% · {snapshot.assessment.findings.length} finding(s)</li>)}</ol><button onClick={clearHistory}>Clear local history</button></details></section>}
  {healthMap.urgentMessages.map(x=><aside key={x}><b>Urgent:</b> {x}</aside>)}
  <section><h2>Top priorities</h2>{healthMap.topPriorities.length?<ol>{healthMap.topPriorities.map(x=><li key={x.id}><b>{x.title}</b><br/>{x.detail}</li>)}</ol>:<p>No high-priority item from the current evidence.</p>}</section>
  <section><h2>{recommendationView.title}</h2><p><small>{recommendationView.disclaimer}</small></p>{recommendationView.blockedReason?<aside>{recommendationView.blockedReason}</aside>:<>{recommendationView.top.length?<ol>{recommendationView.top.map(x=><li key={x.id}><b>{x.title}</b> — {x.priorityLabel} · {x.dispositionLabel}<br/>{x.rationale}<ul>{x.steps.map(step=><li key={step}>{step}</li>)}</ul><small>{x.maturityLabel} · {x.sourceIds.join(', ')}</small>{x.safetyReasons.length?<p><small>Safety: {x.safetyReasons.join(' ')}</small></p>:null}</li>)}</ol>:<p>No new action recommendation from the current evidence.</p>}{recommendationView.additional.length>0&&<details><summary>Additional actions</summary><ul>{recommendationView.additional.map(x=><li key={x.id}><b>{x.title}</b> — {x.dispositionLabel}<br/>{x.rationale}</li>)}</ul></details>}{recommendationView.blocked.length>0&&<details><summary>Blocked by safety context</summary><ul>{recommendationView.blocked.map(x=><li key={x.id}><b>{x.title}</b> — {x.safetyReasons.join(' ') || 'Blocked by safety policy.'}</li>)}</ul></details>}</>}</section>
  <section><h2>{applicabilityView.title}</h2>{applicabilityView.clearLabel?<p>{applicabilityView.clearLabel}</p>:<ul>{[...applicabilityView.notices,...applicabilityView.inputNotices].map(x=><li key={x.id}><b>{x.title}</b> — {x.statusLabel}<br/><small>{x.detail}</small></li>)}</ul>}</section>
  <section><h2>Add lab evidence</h2><p><small>Manual entries are treated as user-confirmed. Date and unit are retained with the result.</small></p><select value={labMarker} onChange={e=>setLabMarker(e.target.value as LabMarkerId)}><option value="vitamin_b12">Vitamin B12 (pg/mL)</option><option value="hba1c">HbA1c (%)</option></select><input type="number" placeholder="Value" value={labValue} onChange={e=>setLabValue(e.target.value)}/><input type="date" value={labDate} onChange={e=>setLabDate(e.target.value)}/><button disabled={!labValue||!labDate} onClick={addLab}>Add and reassess</button>{labView&&<><h3>{labView.title}</h3><p>{labView.appliedLabel}</p><p><small>{labView.freshnessDisclaimer}</small></p><ul>{labView.records.map(x=><li key={x.id}><b>{x.markerLabel}: {x.valueLabel}</b> · {x.collectedLabel} · {x.freshnessLabel} · {x.eligibilityLabel}{x.issues.length?<><br/><small>{x.issues.join(' ')}</small></>:null}</li>)}</ul>{labView.changes.length?<><h3>What changed</h3><ul>{labView.changes.map(x=><li key={x.id}><b>{x.title}</b> — {x.detail}</li>)}</ul></>:<p>{labView.noChangeLabel}</p>}</>}</section>
  <section><h2>Safety context</h2>{healthMap.safety.flags.map(x=><article key={x.id}><b>{x.label}</b> · {x.severityLabel}<p>{x.reason}</p></article>)}{healthMap.safety.clearLabel&&<p>{healthMap.safety.clearLabel}</p>}{healthMap.safety.restrictions.length>0&&<ul>{healthMap.safety.restrictions.map(x=><li key={x.actionClass}><b>{x.actionLabel}</b> — {x.dispositionLabel}{x.reasons[0]?`: ${x.reasons[0]}`:''}</li>)}</ul>}</section>
  {healthMap.findings.map(f=><section key={f.id}><h2>{f.domainLabel}: {f.title}</h2><p><b>{f.statusLabel}</b> · {f.urgencyLabel} · {f.confidenceLabel} · {f.evidenceLevelLabel}</p><p>{f.summary}</p><details><summary>Why this finding</summary>{f.supporting.length>0&&<><h3>Supports</h3><ul>{f.supporting.map(x=><li key={x.id}>{x.label}: {x.detail}</li>)}</ul></>}{f.contradicting.length>0&&<><h3>Contradicts</h3><ul>{f.contradicting.map(x=><li key={x.id}>{x.label}: {x.detail}</li>)}</ul></>}{f.missing.length>0&&<><h3>Missing</h3><ul>{f.missing.map(x=><li key={x.id}>{x.label}: {x.detail}</li>)}</ul></>}<small>{f.ruleLabel}</small></details>{f.action&&<p>{f.action}</p>}</section>)}
  <section><h2>What to check next</h2><p><small>{healthMap.investigations.disclaimer}</small></p>{healthMap.investigations.blockedReason?<aside>{healthMap.investigations.blockedReason}</aside>:<>{healthMap.investigations.minimal.length?<ol>{healthMap.investigations.minimal.map(x=><li key={x.id}><b>{x.title}</b> — {x.priorityLabel}<br/>{x.rationale}<br/><small>{x.maturityLabel} · {x.sourceIds.join(', ')}</small></li>)}</ol>:<p>{healthMap.investigations.emptyLabel}</p>}{healthMap.investigations.alternatives.length>0&&<details><summary>Alternatives / additional options</summary><ul>{healthMap.investigations.alternatives.map(x=><li key={x.id}><b>{x.title}</b> — {x.rationale}</li>)}</ul></details>}</>}</section>
  <details><summary>Clinical governance</summary><p>{healthMap.governance.label}</p><p>Sources: {healthMap.governance.referencedSourceIds.join(', ')}</p><p>Prototype rules: {healthMap.governance.prototypeRuleIds.join(', ') || 'None'}</p></details>
  <details><summary>HAP-1.0</summary><pre>{JSON.stringify(createHap(answers,result,reassessment?.normalizedLabs,recommendationPlan),null,2)}</pre></details>
 </main>;
 if(!q || !current) return <main><h1>Jaanch</h1><p>No questions available.</p></main>;
 const value=answers[q.id];
 return <main><header><h1>Jaanch</h1><p>Deterministic personal health assessment</p>{longitudinalView.snapshotCount>0&&<p><small>{longitudinalView.snapshotCount} previous check-in{longitudinalView.snapshotCount===1?'':'s'} saved locally.</small></p>}</header><progress value={plan.answered} max={Math.max(plan.questions.length,1)}/><section><small>{q.master?'Master question':'Adaptive follow-up'} · {q.domain}</small><h2>{q.title}</h2>{q.description&&<p>{q.description}</p>}{q.type==='number'?<input type="number" min={q.min} max={q.max} value={typeof value==='number'?value:''} onChange={e=>setCurrent(q.id,Number(e.target.value))}/>:<div>{q.options?.map(o=>{const selected=q.type==='multi'?Array.isArray(value)&&value.includes(o.value):value===(q.type==='boolean'?(o.value==='yes'):o.value); return <button aria-pressed={selected} key={o.value} onClick={()=>q.type==='multi'?toggleMulti(q.id,o.value):setCurrent(q.id,q.type==='boolean'?o.value==='yes':o.value)}>{selected?'✓ ':''}{o.label}</button>})}</div>}<p><strong>Why asked:</strong> {current.whyAsked.join(' ')}</p></section><nav><button disabled={!navHistory.length} onClick={back}>Back</button><button onClick={skip}>Skip / don't know</button><button disabled={value===undefined || (Array.isArray(value)&&value.length===0)} onClick={advance}>Continue</button></nav></main>;
}
