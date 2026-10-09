import { useMemo, useState } from 'react';
import {
  buildAIReviewV2Packet,
  decodeLongitudinalHistory,
  type AIReviewV2RunResult,
} from '@jaanch/core';

const HISTORY_KEY = 'jaanch.history.v1';
type Props = { onBack: () => void };

export function AIReviewScreen({ onBack }: Props) {
  const history = useMemo(() => typeof window === 'undefined' ? undefined : decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)), []);
  const hasSnapshot = Boolean(history?.snapshots.length);
  const [consented, setConsented] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AIReviewV2RunResult>();
  const [message, setMessage] = useState(hasSnapshot
    ? 'AI Review v2 is optional and cannot change the deterministic Jaanch result.'
    : 'Save a Jaanch check-in first. AI review runs only against saved deterministic results.');

  const packet = useMemo(
    () => history && consented && history.snapshots.length ? buildAIReviewV2Packet(history, { externalAIReviewConsent: true }) : undefined,
    [history, consented],
  );

  const runReview = async () => {
    if (!packet || running) return;
    setRunning(true);
    setResult(undefined);
    setMessage('Sending the minimized current evidence, structured context capsule and bounded change summary to the configured server-side AI provider…');
    try {
      const response = await fetch('/api/ai-review-v2', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packet }),
      });
      const payload = await response.json() as AIReviewV2RunResult | { error?: string };
      if (!response.ok) throw new Error('error' in payload && payload.error ? payload.error : `AI Review v2 request failed (${response.status}).`);
      const review = payload as AIReviewV2RunResult;
      setResult(review);
      if (review.status === 'valid') setMessage('AI Review v2 passed Jaanch schema and safety-invariant validation.');
      else if (review.status === 'invalid') setMessage('AI output failed Jaanch validation, so advisory content is hidden.');
      else setMessage(review.error ?? 'The configured AI provider could not complete the review.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'AI Review v2 could not be completed.');
    } finally { setRunning(false); }
  };

  const output = result?.status === 'valid' ? result.output : undefined;
  const base = output?.baseReview;

  return <main className="app-shell results-shell">
    <header className="app-header">
      <div><span className="eyebrow">Context-aware second pass</span><h1>AI Review v2</h1><p>AI can synthesize the current result with bounded structured context and the latest saved change summary. It cannot rewrite Jaanch findings, safety gates, applicability, evidence eligibility or treatment boundaries.</p></div>
      <button type="button" className="secondary" onClick={onBack}>← Back to Jaanch</button>
    </header>

    <section className="panel">
      <span className="eyebrow">Privacy boundary</span><h2>More context, still minimum necessary</h2>
      {hasSnapshot ? <>
        <p>Nothing is sent automatically. Consent is required before the external-review packet is created, and running the review is a separate action.</p>
        <label className="subcard" style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
          <input type="checkbox" checked={consented} onChange={event => { setConsented(event.target.checked); setResult(undefined); }} />
          <span><b>I consent to this one contextual AI review.</b><br/><small>Share the minimized deterministic result, coded health-context categories and at most the latest previous check-in's deterministic change summary. Free-text notes, medicine/supplement names and the raw previous snapshot stay local.</small></span>
        </label>
        {packet && <>
          <div className="context-grid">
            <article className="context-card"><b>{packet.current.evidence.facts.length}</b><span>current evidence facts</span></article>
            <article className="context-card"><b>{packet.context.medicationCategories.length + packet.context.supplementCategories.length}</b><span>medicine/supplement categories</span></article>
            <article className="context-card"><b>{packet.longitudinal.available ? 1 : 0}</b><span>previous comparison included</span></article>
            <article className="context-card"><b>{packet.minimization.omittedFreeTextFieldCount}</b><span>free-text/name fields omitted</span></article>
          </div>
          <p className="hint">Raw answers, free text, medicine names, supplement names and the raw prior check-in are not sent. The remaining packet still contains sensitive health information.</p>
          {packet.longitudinal.available
            ? <div className="notice"><b>Longitudinal context available</b><span>AI receives only deterministic deltas between the latest two saved check-ins: finding changes, eligible lab/measurement changes, recommendation changes and evidence-completeness change.</span></div>
            : <div className="notice"><b>No previous comparison yet</b><span>AI will review current evidence and structured context only. It is forbidden from inventing a trend.</span></div>}
        </>}
        <div className="actions"><button type="button" className="primary" disabled={!packet || running} onClick={runReview}>{running ? 'Reviewing…' : 'Run contextual AI review'}</button></div>
      </> : <div className="notice"><b>No saved result</b><span>Complete a Health Map and save a check-in first.</span></div>}
      <p className={result?.status === 'valid' ? 'success' : 'hint'}>{message}</p>
    </section>

    {result && <section className="panel"><span className="eyebrow">Runtime trace</span><h2>{result.status === 'valid' ? 'Validated advisory output' : 'Review not shown'}</h2><p>{result.providerId} · {result.modelId} · harness {result.harnessVersion} · schema {result.schemaVersion}</p>{result.status === 'invalid' && <div className="notice"><b>Validation blocked the output</b><span>{[...(result.validation?.schemaErrors ?? []), ...(result.validation?.invariantErrors ?? [])].join(' ') || 'Structured output failed validation.'}</span></div>}{result.status === 'provider_error' && <div className="notice"><b>Provider error</b><span>{result.error ?? 'No advisory output was produced.'}</span></div>}</section>}

    {output && base && <>
      {base.redFlags.length > 0 && <section className="panel"><span className="eyebrow">Do not delay</span><h2>Red flags preserved</h2>{base.redFlags.map((item,index)=><article className="urgent" key={`${item.title}-${index}`}><b>{item.title}</b><span>{item.reason}</span><small>{item.action}</small></article>)}</section>}

      <section className="panel"><span className="eyebrow">Incremental value gate</span><h2>{output.utility.materialAddition ? 'AI found a material addition' : 'No material addition needed'}</h2><p>{output.utility.reason}</p><div className="notice"><b>Deterministic result remains authoritative</b><span>“Material addition” means potentially useful explanation, contradiction, evidence prioritization or trend synthesis—not a new diagnosis.</span></div></section>

      <section className="panel"><span className="eyebrow">AI explanation</span><h2>{base.overall.highestPriority.replace('_',' ')} priority</h2><p>{base.overall.summary}</p></section>

      <div className="result-grid">
        <section className="panel"><span className="eyebrow">What changed</span><h2>Longitudinal synthesis</h2><p>{output.longitudinalSynthesis.summary}</p>{output.longitudinalSynthesis.changesWorthAttention.length > 0 && <><b>Worth attention</b><ul>{output.longitudinalSynthesis.changesWorthAttention.map((item,index)=><li key={`${item}-${index}`}>{item}</li>)}</ul></>}{output.longitudinalSynthesis.uncertainChanges.length > 0 && <><b>Uncertain / not causal</b><ul>{output.longitudinalSynthesis.uncertainChanges.map((item,index)=><li key={`${item}-${index}`}>{item}</li>)}</ul></>}</section>
        <section className="panel"><span className="eyebrow">Smallest useful next evidence</span><h2>Prioritized evidence gaps</h2>{output.prioritizedEvidenceGaps.length ? output.prioritizedEvidenceGaps.map(item=><article className="finding" key={item.id}><b>{item.title}</b><span>{item.priority.replace('_',' ')}</span><p>{item.whyItMatters}</p><small>Grounded in: {item.sourceEvidenceIds.join(' · ') || 'current supplied context'}</small></article>) : <p>No additional evidence gap was prioritized.</p>}</section>
      </div>

      <div className="result-grid">
        <section className="panel"><span className="eyebrow">Challenge the result</span><h2>Contradictions worth resolving</h2>{output.contradictions.length ? output.contradictions.map((item,index)=><article className="finding" key={`${item.type}-${index}`}><b>{item.type.replaceAll('_',' ')}</b><p>{item.summary}</p><small>Related: {item.relatedIds.join(' · ')}{item.resolutionEvidence.length ? ` · Resolve with: ${item.resolutionEvidence.join(' · ')}` : ''}</small></article>) : <p>No evidence-resolvable contradiction was identified.</p>}</section>
        <section className="panel"><span className="eyebrow">Prepare, don't prescribe</span><h2>Clinician conversation brief</h2><p>{output.clinicianPrep.summary}</p>{output.clinicianPrep.questions.length > 0 && <><b>Questions to ask</b><ol>{output.clinicianPrep.questions.map((item,index)=><li key={`${item}-${index}`}>{item}</li>)}</ol></>}{output.clinicianPrep.evidenceToBring.length > 0 && <p><b>Bring / confirm:</b> {output.clinicianPrep.evidenceToBring.join(' · ')}</p>}</section>
      </div>

      <section className="panel"><span className="eyebrow">Base review</span><h2>Domain details</h2>{base.domainAssessments.length ? base.domainAssessments.map((domain,index)=><article className="subcard" key={`${domain.domain}-${index}`}><div className="entry"><div><b>{domain.domain}</b><small>{domain.confidence} confidence</small></div></div><p>{domain.assessment}</p>{domain.missingEvidence.length > 0 && <p><b>Still useful to know:</b> {domain.missingEvidence.join(' · ')}</p>}</article>) : <p>No additional domain explanation was needed.</p>}</section>

      <section className="panel"><span className="eyebrow">Safety gate</span><h2>Treatment advice remains gated</h2><p>{base.safety.treatmentAdviceGated ? 'Yes — the AI output preserved the treatment boundary.' : 'No — this should never be displayed as a valid review.'}</p>{base.safety.gatingReasons.length > 0 && <ul>{base.safety.gatingReasons.map((reason,index)=><li key={`${reason}-${index}`}>{reason}</li>)}</ul>}</section>
    </>}
  </main>;
}
