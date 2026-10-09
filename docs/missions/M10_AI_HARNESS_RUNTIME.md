# M10 — AI Harness Runtime + Privacy/Evaluation

## Goal
Add an optional, auditable AI-review runtime without making AI part of Jaanch's deterministic source of truth.

M10 is intentionally split into:
1. a shared-core privacy/schema/invariant/evaluation layer; and
2. a server-only live-provider adapter.

The mobile/web apps must never carry provider API keys or directly send health packets to an external model.

## Implemented

### Shared core
- `JAANCH-AI-REVIEW-1.0` privacy-minimized external review packet.
- Explicit external-AI opt-in is required before a packet can be built.
- Raw questionnaire answers are not included in the external packet.
- Only eligible current lab evidence (`recent` / `aging`, verified and assessment-eligible) is included.
- Stale, future-dated, unverified or otherwise ineligible lab records are omitted from the external packet and counted in minimization metadata.
- Packet carries evidence facts/missing evidence, deterministic safety, applicability status, findings, minimum investigations, top recommendations, prototype-governance context and input-normalization notices.
- Stable runtime constants:
  - harness `1.1`;
  - packet `JAANCH-AI-REVIEW-1.0`;
  - output `AI-ASSESSMENT-1.0`.
- Strict output JSON Schema is exported from shared core.
- Local schema/invariant validation runs even if the provider claims structured-output compliance.
- AI cannot downgrade deterministic urgent state.
- AI must keep treatment advice gated.
- AI cannot emit self-care guidance for a domain that deterministic applicability marks unsupported.
- AI disagreements must reference a known deterministic finding; missing considerations use a separate field.
- Provider errors / invalid outputs remain separate from deterministic assessment state.

### AI Utility Gate
- Curated fixture evaluation supports expected disagreements / expected missing considerations.
- Safe paraphrase-only behavior is explicitly capable of producing `defer_m11`.
- Safe, expected incremental review behavior can produce `continue_m11`.
- Utility decision requires both safety/invariant pass and fixture-expectation pass.
- M11 remains conditional on this gate using a real configured model, not merely the canned verification fixtures.

### Server-only OpenAI adapter
Package: `@jaanch/ai-runtime`

- Live review is disabled by default.
- Requires `JAANCH_AI_LIVE_ENABLED=true`, `OPENAI_API_KEY`, and explicit `JAANCH_AI_MODEL` configuration.
- Loads the canonical Markdown harness from `docs/ai-harness/HEALTH_ASSESSMENT_HARNESS.md`.
- Uses the OpenAI Responses API from the server runtime only.
- Requests strict JSON-Schema structured output.
- Sets `store: false` in the request baseline.
- Includes harness/packet/schema version metadata.
- Parses output locally and returns it to shared-core validation.
- No API key or provider credential is placed in the request body or client applications.

### Verification
`npm run verify` now combines:
- existing deterministic/core verification;
- presentation verification;
- recommendation verification;
- AI packet/schema/invariant/utility-gate verification;
- server request-construction verification without making a network call.

AI-specific scenarios cover:
- explicit consent requirement;
- raw-answer minimization;
- stale-lab omission;
- safe schema-valid output;
- urgent downgrade rejection;
- unsupported pediatric self-care rejection;
- utility-gate continuation for expected incremental review;
- utility-gate deferral for paraphrase-only behavior;
- strict OpenAI JSON-Schema request shape;
- `store:false` request baseline;
- harness/version trace.

## Live evaluation status
**NOT RUN IN THIS MISSION ENVIRONMENT.**

No live OpenAI API credential is available to the repository runtime in this session, so M10 does not claim that a real model has passed the AI Utility Gate.

This is intentional: credentials should not be pasted into source control or exposed to mobile/web clients.

## M10 closure state
Engineering/runtime implementation: **COMPLETE**.

AI Utility Gate with a real configured model: **PENDING**.

Therefore M11 must remain blocked until a real-model fixture evaluation produces a defensible `continue_m11` decision. If it does not, defer M11 and move to M13 Longitudinal Health.

## Non-goals
- AI-generated diagnoses as source of truth;
- AI mutation of deterministic findings/rules;
- automatic medication or therapeutic-dose generation;
- live provider calls from React Native/React clients;
- broad health-domain expansion;
- silent merge of AI + deterministic verdicts.
