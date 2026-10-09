# Jaanch Roadmap

## Current state

Engineering is implemented through **M11 — AI Review v2 / Deeper Contextual Utility**, while the deterministic product-quality and privacy gates from M13.1–M13.5 remain open.

Current milestone:

> **Context-aware AI-review web alpha candidate — deterministic Jaanch remains authoritative; owner trust/privacy/real-model utility gates remain open.**

AI integration existing in code is not evidence that AI is useful.

---

## Completed / engineering-implemented

### M01–M09.1 — Deterministic foundation
Adaptive intake, rule/evidence model, safety, applicability, investigations, recommendations and verification.

### M10 — AI Harness Runtime + Privacy/Evaluation
- explicit consent;
- privacy-minimized v1 packet;
- strict structured output;
- safety invariant validation;
- server-only provider adapter;
- utility gate concept.

### M10.1 — Live AI Review + Web UX
- same-origin server endpoint;
- server-only provider credentials;
- browser review UX;
- five-mock live gate command;
- real-model utility still not declared passed.

### M11 — AI Review v2 / Deeper Contextual Utility
Status: **ENGINEERING IMPLEMENTED — OWNER / REAL-MODEL UTILITY REVIEW REQUIRED**  
Effort: High

Adds:
- `JAANCH-AI-REVIEW-2.0` / `AI-ASSESSMENT-2.0` / harness 2.0;
- coded context capsule without names/free text;
- latest-two-check-in deterministic change capsule;
- BP/lipid/Hb/ferritin/TSH longitudinal measurement deltas in addition to normalized lab/finding/recommendation changes;
- explicit material-addition gate;
- prioritized evidence gaps with source IDs;
- traceable contradiction types;
- clinician conversation brief;
- no-trend-without-history invariant;
- unknown-ID rejection;
- stricter v2 HTTP envelope/minimization validation;
- `npm run ai:gate:v2`.

Mission: `docs/missions/M11_AI_REVIEW_V2_CONTEXTUAL_UTILITY.md`.

### M13–M13.5 — Product quality / evidence / clinical / persistence
Implemented engineering includes:
- longitudinal check-ins;
- assessment-quality recovery;
- consumer Health Map;
- reviewed report evidence capture;
- bounded BP/lipid/anaemia-iron/thyroid interpretation;
- five synthetic profiles + import/export;
- versioned local persistence architecture and future remote-security contract.

Owner gates remain open.

---

## Immediate phase — Owner validation + AI utility decision

### Required tests
1. `npm run verify` locally.
2. Run all five deterministic mocks.
3. Verify report/manual/profile evidence semantics.
4. Configure live AI and test AI Review v2.
5. Run `npm run ai:gate:v2`.
6. Low-risk mock should often return `materialAddition=false`.
7. High-signal mocks should prioritize and explain rather than generate broad generic health advice.
8. Use a genuine history with at least two saved check-ins to test longitudinal synthesis.
9. Confirm evidence change is not misrepresented as health improvement/worsening.
10. Confirm treatment/urgent/applicability boundaries are preserved.

### Gate result

Choose one:

```text
GO      → AI is materially useful and safe enough to retain as a product layer
MODIFY  → useful in places, but needs bounded correction before pilot
DEFER   → AI adds noise/paraphrase; keep it optional and stop expanding it
```

No further AI mission should be started automatically.

---

## Strategic Review 3 — NEXT PLANNED MISSION

Effort: **High**

Evaluate the product as a whole rather than one subsystem:
- intake completeness;
- result comprehension;
- report-evidence trust;
- narrow clinical usefulness vs overreach;
- longitudinal value;
- local persistence/privacy direction;
- AI v2 incremental value and privacy cost;
- whether web/mobile roles are still correct;
- whether current modules are enough for a private pilot;
- overbuilding vs missing essential value;
- which roadmap items should be deleted, not merely postponed.

Expected output: CONTINUE / CONTINUE WITH CHANGES / PAUSE, plus a sharply reduced pilot plan.

---

## M15A — Pilot Safety / Privacy / Release Gate

Only after Strategic Review 3.

Required before meaningful external pilot use:
- qualified clinical review of supported rules;
- source governance;
- intended-use/claim review;
- privacy/consent/retention semantics;
- threat model and production encryption decisions;
- authenticated backend only if remote persistence is justified;
- delete/export behavior;
- production AI endpoint security if AI is retained;
- accessibility;
- telemetry/error policy;
- reproducible verification/build gate;
- jurisdiction/regulatory review as appropriate.

Milestone: controlled private-pilot candidate.

---

## Later / conditional

### Concrete authenticated backend
Select only when pilot needs cross-device/cloud continuity. Must satisfy M13.5 and remain independent from clinical semantics.

### M14 — ChatGPT / MCP integration
Later, only after standalone Jaanch proves value and schemas stabilize.

### M15B — Production / store hardening
Production builds, Play/TestFlight, crash monitoring, migrations, backup/recovery, store policies/assets, operational runbook.

### M12 Rule Studio
Still deferred. Do not build rule-authoring infrastructure before core user value and governance needs justify it.

---

## Product maturity checkpoints

| Checkpoint | State |
|---|---|
| M13.1 | assessment trust gate open |
| M13.2 | result comprehension gate open |
| M13.3 | evidence-ingestion trust gate open |
| M13.4 | narrow-clinical/profile trust gate open |
| M13.5 | persistence/privacy gate open |
| M10.1 | live AI integration implemented; real-model utility unproven |
| M11 | contextual/longitudinal AI engineering implemented; utility unproven |
| Strategic Review 3 | next whole-product decision |
| M15A | controlled private-pilot gate |
| M15B | production-candidate software, still dependent on clinical/legal/regulatory readiness |

---

## Non-negotiable constraints
- deterministic rules own urgent/safety/applicability/evidence eligibility;
- AI never becomes the source of truth;
- raw answers/free text/full prior history are not silently uploaded;
- no autonomous prescription changes or therapeutic regimens;
- one measurement is not a diagnosis;
- missing provenance is not guessed;
- evidence completeness is not overall health;
- current local storage is not application-layer encrypted medical-record storage;
- Vite middleware is not production security infrastructure;
- AI expansion requires demonstrated value, not enthusiasm for AI.

For a new session, fetch current `main`, read `HANDOVER_NEXT_SESSION.md`, README, STATUS, this roadmap and the latest mission document before writing.
