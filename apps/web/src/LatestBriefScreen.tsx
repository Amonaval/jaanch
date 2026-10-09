import { useMemo } from 'react';
import {
  buildConsumerResultViewModel,
  buildHealthIntelligenceBrief,
  decodeLongitudinalHistory,
} from '@jaanch/core';
import { HealthBriefPanel } from './HealthBriefPanel';

const HISTORY_KEY='jaanch.history.v1';

type Props={onBack:()=>void};

export function LatestBriefScreen({onBack}:Props){
  const history=useMemo(()=>typeof window==='undefined'?undefined:decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)),[]);
  const latest=history?.snapshots[0];
  if(!latest) return <main className="app-shell"><header className="app-header"><div><span className="eyebrow">Health brief</span><h1>No saved check-in yet</h1><p>Complete an assessment or run a test profile, then save it to reopen the brief here.</p></div><button type="button" className="secondary" onClick={onBack}>← Back</button></header></main>;

  const brief=buildHealthIntelligenceBrief(latest.assessment,latest.recommendationPlan);
  const consumer=buildConsumerResultViewModel({
    result:latest.assessment,
    recommendationPlan:latest.recommendationPlan,
    currentSnapshot:latest,
    history,
    recordedContextCount:latest.capturedContext?.recordedMeasurements.length??0,
  });

  return <main className="app-shell results-shell">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:18}}><div><span className="eyebrow">Saved check-in</span><b>{new Date(latest.capturedAt).toLocaleString()}</b></div><button type="button" className="secondary" onClick={onBack}>← Back to Jaanch</button></div>
    <HealthBriefPanel brief={brief} changes={consumer.changes}/>
    <p className="hint">This is the deterministic brief saved with your latest local check-in. Use Quick Recheck from the assessment when you want to update it.</p>
  </main>;
}
