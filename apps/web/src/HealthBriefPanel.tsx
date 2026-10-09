import type { ConsumerChangeSummary, HealthIntelligenceBrief } from '@jaanch/core';

type Props={ brief:HealthIntelligenceBrief; changes?:ConsumerChangeSummary };

export function HealthBriefPanel({brief,changes}:Props){
 return <>
  <header className={`brief-hero tone-${brief.tone}`}>
   <div><span className="eyebrow">{brief.eyebrow}</span><h1>{brief.headline}</h1><p>{brief.summary}</p></div>
   <div className="brief-next"><small>Do next</small><b>{brief.nextBestAction}</b>{brief.mostUsefulMissingEvidence&&<span>Most decision-relevant missing evidence: {brief.mostUsefulMissingEvidence}</span>}</div>
  </header>
  {brief.priorities.length>0
   ? <section className="brief-priorities" aria-label="Health priorities">{brief.priorities.map((priority,index)=><article className={`brief-priority tone-${priority.tone}`} key={priority.id}>
      <div className="brief-priority-head"><span className="priority-number">{index+1}</span><div><small>{priority.statusLabel}</small><h2>{priority.title}</h2></div></div>
      <div className="brief-grid">
       <div><span className="brief-label">What Jaanch sees</span><p>{priority.whatJaanchSees}</p></div>
       <div><span className="brief-label">Why this matters for you</span><p>{priority.whyItMatters}</p></div>
       <div className="brief-action"><span className="brief-label">Do next</span><b>{priority.nextAction}</b>{priority.nextActionDetail&&<p>{priority.nextActionDetail}</p>}</div>
       <div><span className="brief-label">What can wait</span><p>{priority.canWait}</p></div>
      </div>
      {priority.decisionChangingEvidence.length>0&&<div className="decision-evidence"><span className="brief-label">What would most change this view</span><ul>{priority.decisionChangingEvidence.map((item)=><li key={item}>{item}</li>)}</ul></div>}
      {priority.evidence.length>0&&<details className="evidence-details"><summary>Why Jaanch thinks this</summary><div className="evidence-chain">{priority.evidence.map((item)=><div key={item.id}><b>{item.label}</b><span>{item.detail}</span></div>)}</div></details>}
     </article>)}</section>
   : <section className="panel quiet-brief"><span className="eyebrow">Quiet is a valid result</span><h2>No priority card was manufactured</h2><p>{brief.summary}</p><p><b>Next:</b> {brief.nextBestAction}</p></section>}
  {changes&&<section className="panel change-preview"><span className="eyebrow">Since your last saved check-in</span><h2>{changes.headline}</h2><p>{changes.evidenceDetail}</p>{[...changes.items,...changes.labChanges].length>0?<div className="change-list">{[...changes.items,...changes.labChanges].map((item)=><div className="change-row" key={item.id}><b>{item.title}</b><span>{item.direction}</span><p>{item.detail}</p></div>)}</div>:<p>Nothing in the supported deterministic assessment materially changed.</p>}</section>}
 </>;
}
