# M11 — AI Review v2 / Deeper Contextual Utility

Status: **ENGINEERING IMPLEMENTED — REAL-MODEL UTILITY / OWNER REVIEW REQUIRED**  
Effort: **High**

## Objective

Make Jaanch's optional AI second pass more useful without making it more authoritative.

M11 adds a versioned contextual/longitudinal review contract:

```text
saved deterministic history
        ↓
explicit one-run consent
        ↓
JAANCH-AI-REVIEW-2.0
  ├─ current minimized M10 packet
  ├─ bounded coded context capsule
  └─ latest deterministic longitudinal deltas only
        ↓
server-only AI provider
        ↓
AI-ASSESSMENT-2.0 strict structured output
        ↓
Jaanch v1 + v2 safety/invariant validation
        ↓
validated advisory UI only
```

The deterministic assessment, evidence eligibility, safety gates, applicability decisions and recommendations remain authoritative.

## Versioned contracts

```text
Packet:  JAANCH-AI-REVIEW-2.0
Output:  AI-ASSESSMENT-2.0
Harness: 2.0
```

M10/M10.1 v1 contracts remain in the repository for traceability and rollback.

## Context capsule

M11 can share these bounded structured fields after explicit consent:
- age band, not exact age;
- diagnosed-condition codes;
- current-concern codes;
- medication categories, not medication names/doses;
- supplement categories, not supplement names/doses;
- structured family-history codes;
- reproductive-context code when present;
- bounded activity fields.

It deliberately does **not** share:
- raw questionnaire answer map;
- free-text concern/additional-context fields;
- custom free-text conditions/concerns/family history;
- medication names, dose or frequency;
- supplement names, dose or frequency.

The packet reports how many free-text/name fields were omitted.

## Longitudinal capsule

When at least two saved check-ins exist, AI receives only deterministic comparison data from the latest two check-ins:
- finding directions/status/urgency changes;
- eligible normalized lab changes;
- eligible M13.4 measurement changes including BP/lipids/Hb/ferritin/TSH;
- recommendation changes;
- evidence-completeness delta;
- timestamps for the two compared check-ins.

The raw previous snapshot is not sent. Older saved history is not sent.

Longitudinal changes are observations, not causal conclusions. The harness explicitly forbids inventing a trajectory when no previous comparison exists.

## Output contract

M11 adds five product-oriented sections on top of the existing M10 base review.

### Utility gate

```text
utility.materialAddition: boolean
utility.reason: string
```

The model is instructed that paraphrase, generic advice and speculative novelty are **not** material additions.

If `materialAddition=false`, Jaanch rejects output that still emits prioritized evidence gaps or contradictions.

### Longitudinal synthesis

Returns:
- summary;
- changes worth attention;
- stable signals;
- uncertain/non-causal changes.

Jaanch rejects a model that claims longitudinal evidence when the packet has none.

### Prioritized evidence gaps

Small bounded set with:
- id;
- title;
- why it matters;
- priority;
- `sourceEvidenceIds`.

Every supplied source ID must exist in the packet.

### Contradictions

Supported types:
- `evidence_conflict`;
- `trend_conflict`;
- `engine_disagreement`.

Every `relatedId` must exist in supplied evidence/findings/investigations/recommendations/trends. Unknown IDs invalidate the output.

### Clinician conversation brief

Short:
- summary;
- questions to ask;
- evidence to bring/confirm.

This is preparation, not prescribing. Treatment changes remain gated by the base M10 safety contract.

## Web UX

`apps/web/src/AIReviewScreen.tsx` now runs v2.

Before transmission the user sees:
- current evidence fact count;
- medication/supplement category count;
- whether one previous comparison is included;
- how many free-text/name fields were omitted.

The UI clearly states that the remaining packet is still sensitive health information.

Endpoint:

```text
POST /api/ai-review-v2
```

The old `/api/ai-review` endpoint remains available for M10.1 traceability.

## Server boundary

New modules:

```text
packages/ai-runtime/src/openaiContextReviewProvider.ts
packages/ai-runtime/src/httpHandlerV2.ts
```

Properties:
- server-only OpenAI API key;
- strict JSON-schema structured output;
- `store:false`;
- 320 KiB request cap;
- `Cache-Control: no-store`;
- no request-body logging;
- explicit consent required;
- v2 protocol/purpose required;
- minimization flags must remain false;
- unexpected top-level/current/context/longitudinal/minimization keys rejected.

The current implementation is still Vite development/preview middleware. It is **not** a production authenticated health-data API. Production deployment still needs appropriate authentication, authorization, CSRF/origin controls, rate limiting, abuse controls and server-side deployment/security review.

## Verification

`npm run verify` now includes M11 checks for:
- explicit v2 consent;
- medicine/free-text omission;
- bounded structured-category retention;
- raw prior snapshot omission;
- longitudinal deterministic delta creation;
- valid v2 output;
- `materialAddition=false` quietness invariant;
- unknown contradiction ID rejection;
- invented longitudinal trend rejection;
- exact minimized v2 HTTP forwarding;
- raw-body rejection;
- minimization-flag enforcement;
- unexpected packet-field rejection.

## Live utility gate

M10.1 command remains:

```bash
npm run ai:gate
```

M11 adds:

```bash
npm run ai:gate:v2
```

The v2 live gate runs all five current mock profiles and reports:
- model/provider;
- validation status;
- highest priority;
- `materialAddition`;
- prioritized-gap count;
- contradiction count;
- clinician-question count;
- aggregate signal count;
- validation/provider errors.

Single-snapshot mocks do not pretend to validate longitudinal quality. Longitudinal synthesis should be judged using real saved multi-check-in history.

## Important status

M11 engineering was implemented because the owner explicitly asked to proceed before the M10.1 live gate was completed.

That does **not** convert the open real-model gate into a pass.

No implementation-only result proves that:
- a real configured model is useful;
- deeper context improves outcomes;
- clinician prep is consistently high-quality;
- longitudinal synthesis is reliable in real user history.

Those remain owner/product evaluation gates.

## Non-goals

M11 does not add:
- AI diagnosis as source of truth;
- autonomous treatment/medication changes;
- agentic health actions;
- broad free-text health-history sharing;
- full-history upload;
- mobile AI UX;
- persistent AI consent;
- cloud identity/auth;
- production AI server deployment;
- AI-written deterministic findings.

## Owner gate

Test at least:
1. low-risk mock should often say no material addition;
2. cardiometabolic/lipid mock should prioritize rather than expand into generic test lists;
3. B12/iron mock should remain cause-oriented and non-prescriptive;
4. thyroid mock must not alter thyroid medication;
5. severe-TG mock must preserve clinician-review urgency without medication changes;
6. real two-check-in history should summarize only supplied deterministic changes;
7. AI should distinguish new evidence from genuine health change;
8. contradictions must be traceable and useful;
9. clinician questions should be concise and evidence-grounded;
10. privacy wording should match what actually leaves the browser.

Any trust/safety/privacy defect outranks further AI expansion.

## Next

After owner testing, run **Strategic Review 3 — High**. Do not add an M11.1/M12 AI expansion merely because M11 exists; first decide whether AI is genuinely improving Jaanch.
