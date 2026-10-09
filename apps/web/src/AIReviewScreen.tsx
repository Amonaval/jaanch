import { useMemo, useState } from 'react';
import {
  buildAIReviewPacket,
  createHap,
  decodeLongitudinalHistory,
  type AIReviewRunResult,
  type HealthAssessmentPacket,
} from '@jaanch/core';

const HISTORY_KEY = 'jaanch.history.v1';

type Props = { onBack: () => void };

function latestHap(): HealthAssessmentPacket | undefined {
  if (typeof window === 'undefined') return undefined;
  const snapshot = decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)).snapshots[0];
  if (!snapshot) return undefined;
  return createHap(
    snapshot.answers,
    snapshot.assessment,
    snapshot.labs,
    snapshot.recommendationPlan,
    snapshot.capturedContext,
  );
}

export function AIReviewScreen({ onBack }: Props) {
  const hap = useMemo(() => latestHap(), []);
  const [consented, setConsented] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AIReviewRunResult>();
  const [message, setMessage] = useState(
    hap
      ? 'AI review is optional and never changes the deterministic Jaanch result.'
      : 'Save a Jaanch check-in first. AI review runs only against a saved deterministic result.',
  );
  const packet = useMemo(
    () => hap && consented ? buildAIReviewPacket(hap, { externalAIReviewConsent: true }) : undefined,
    [hap, consented],
  );

  const runReview = async () => {
    if (!packet || !consented || running) return;
    setRunning(true);
    setResult(undefined);
    setMessage('Sending only the privacy-minimized review packet to the configured server-side AI provider…');
    try {
      const response = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packet }),
      });
      const payload = await response.json() as AIReviewRunResult | { error?: string };
      if (!response.ok) throw new Error('error' in payload && payload.error ? payload.error : `AI review request failed (${response.status}).`);
      const review = payload as AIReviewRunResult;
      setResult(review);
      if (review.status === 'valid') setMessage('AI review passed Jaanch schema and safety-invariant validation.');
      else if (review.status === 'invalid') setMessage('AI returned an output that failed Jaanch validation, so the advisory content is hidden.');
      else setMessage(review.error ?? 'The configured AI provider could not complete the review.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'AI review could not be completed.');
    } finally {
      setRunning(false);
    }
  };

  const output = result?.status === 'valid' ? result.output : undefined;

  return <main className="app-shell results-shell">
    <header className="app-header">
      <div>
        <span className="eyebrow">Optional second pass</span>
        <h1>AI Review</h1>
        <p>AI can explain, challenge or surface missing considerations. It cannot rewrite Jaanch findings, safety gates, applicability decisions or treatment boundaries.</p>
      </div>
      <button type="button" className="secondary" onClick={onBack}>← Back to Jaanch</button>
    </header>

    <section className="panel">
      <span className="eyebrow">Privacy boundary</span>
      <h2>Nothing is sent automatically</h2>
      {hap ? <>
        <p>Consent is required before Jaanch even creates the external-review packet. Running the review is a separate action.</p>
        <label className="subcard" style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
          <input type="checkbox" checked={consented} onChange={event => { setConsented(event.target.checked); setResult(undefined); }} />
          <span><b>I consent to this one external AI review.</b><br/><small>Create a minimized health-assessment packet that may be sent to the configured AI provider when I press Run AI review. This consent is not persisted.</small></span>
        </label>
        {packet && <>
          <p>The minimized <b>JAANCH-AI-REVIEW-1.0</b> packet is now ready locally. Raw questionnaire answers are omitted before any network request.</p>
          <div className="context-grid">
            <article className="context-card"><b>{packet.evidence.facts.length}</b><span>evidence facts to share</span></article>
            <article className="context-card"><b>{packet.evidence.missing.length}</b><span>missing-evidence items to share</span></article>
            <article className="context-card"><b>{packet.labs.length}</b><span>eligible lab records to share</span></article>
            <article className="context-card"><b>{packet.minimization.omittedRawAnswerCount}</b><span>raw answer fields omitted</span></article>
          </div>
          <p className="hint">The minimized packet still contains sensitive health evidence/findings. Provider credentials never enter browser code.</p>
        </>}
        <div className="actions"><button type="button" className="primary" disabled={!packet || running} onClick={runReview}>{running ? 'Reviewing…' : 'Run AI review'}</button></div>
      </> : <div className="notice"><b>No saved result</b><span>Return to Assessment, complete the Health Map and save a check-in. Then open AI Review again.</span></div>}
      <p className={result?.status === 'valid' ? 'success' : 'hint'}>{message}</p>
    </section>

    {result && <section className="panel">
      <span className="eyebrow">Runtime trace</span>
      <h2>{result.status === 'valid' ? 'Validated advisory output' : 'Review not shown'}</h2>
      <p>{result.providerId} · {result.modelId} · harness {result.harnessVersion} · schema {result.schemaVersion}</p>
      {result.status === 'invalid' && <div className="notice"><b>Validation blocked the output</b><span>{[...(result.validation?.schemaErrors ?? []), ...(result.validation?.invariantErrors ?? [])].join(' ') || 'Structured output failed validation.'}</span></div>}
      {result.status === 'provider_error' && <div className="notice"><b>Provider error</b><span>{result.error ?? 'No advisory output was produced.'}</span></div>}
    </section>}

    {output && <>
      {output.redFlags.length > 0 && <section className="panel"><span className="eyebrow">Do not delay</span><h2>Red flags preserved</h2>{output.redFlags.map((item, index) => <article className="urgent" key={`${item.title}-${index}`}><b>{item.title}</b><span>{item.reason}</span><small>{item.action}</small></article>)}</section>}

      <section className="panel">
        <span className="eyebrow">AI explanation</span>
        <h2>{output.overall.highestPriority.replace('_', ' ')} priority</h2>
        <p>{output.overall.summary}</p>
        <div className="notice"><b>Deterministic result remains authoritative</b><span>This text is advisory. Jaanch has not merged it into findings, recommendations, evidence eligibility or safety decisions.</span></div>
      </section>

      <div className="result-grid">
        <section className="panel">
          <span className="eyebrow">What AI added</span>
          <h2>Missing considerations</h2>
          {output.engineReview.possibleMissingConsiderations.length
            ? <ul>{output.engineReview.possibleMissingConsiderations.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
            : <p>No additional missing consideration was surfaced.</p>}
        </section>
        <section className="panel">
          <span className="eyebrow">Challenge the result</span>
          <h2>Disagreements</h2>
          {output.engineReview.disagreements.length
            ? output.engineReview.disagreements.map(item => <article className="finding" key={`${item.findingId}-${item.reason}`}><b>{item.findingId}</b><p><b>Engine:</b> {item.enginePosition}</p><p><b>AI:</b> {item.aiPosition}</p><p>{item.reason}</p>{item.resolutionEvidence.length > 0 && <small>Resolve with: {item.resolutionEvidence.join(' · ')}</small>}</article>)
            : <p>No material disagreement with the deterministic findings.</p>}
        </section>
      </div>

      <section className="panel">
        <span className="eyebrow">Explain by domain</span>
        <h2>Review details</h2>
        {output.domainAssessments.length
          ? output.domainAssessments.map((domain, index) => <article className="subcard" key={`${domain.domain}-${index}`}><div className="entry"><div><b>{domain.domain}</b><small>{domain.confidence} confidence</small></div></div><p>{domain.assessment}</p>{domain.missingEvidence.length > 0 && <p><b>Still useful to know:</b> {domain.missingEvidence.join(' · ')}</p>}{domain.recommendedActions.length > 0 && <ol>{domain.recommendedActions.map((action, actionIndex) => <li key={`${action.action}-${actionIndex}`}><b>{action.action}</b> — {action.rationale} <small>({action.class})</small></li>)}</ol>}</article>)
          : <p>The model did not add a domain-level explanation beyond the overall review.</p>}
      </section>

      <section className="panel">
        <span className="eyebrow">Safety gate</span>
        <h2>Treatment advice remains gated</h2>
        <p>{output.safety.treatmentAdviceGated ? 'Yes — the AI output preserved the treatment boundary.' : 'No — this should never be displayed as a valid review.'}</p>
        {output.safety.gatingReasons.length > 0 && <ul>{output.safety.gatingReasons.map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}</ul>}
      </section>
    </>}
  </main>;
}
