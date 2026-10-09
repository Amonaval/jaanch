# Mission Status

## Engineering-implemented
- M01–M09.1 — deterministic foundation, evidence graph, safety, applicability, tests/recommendations: IMPLEMENTED
- M10 — AI harness/privacy/runtime: IMPLEMENTED
- M10.1 — Live AI Review + Web UX: IMPLEMENTED; real-model utility gate open
- M11 — AI Review v2 / deeper contextual utility: **ENGINEERING IMPLEMENTED — REAL-MODEL UTILITY / OWNER REVIEW REQUIRED**
- M13 — local longitudinal health: IMPLEMENTED
- M13.1 — Assessment Quality Recovery: owner trust retest open
- M13.2 — Consumer Health Map: owner result retest open
- M13.3 — Clinical Evidence Capture v2 / Report UX: owner evidence-ingestion retest open
- M13.4 — Narrow Clinical Interpretation Expansion: owner clinical/profile retest open
- M13.5 — Profile + Secure Persistence Architecture v1: owner persistence/privacy review open

## M11 summary

Versioned contracts:

```text
JAANCH-AI-REVIEW-2.0
AI-ASSESSMENT-2.0
Harness 2.0
```

Implemented:
- current M10 minimized packet retained as the authoritative-current subpacket;
- bounded structured context capsule: age band, condition/concern codes, medication/supplement categories, family-history codes, reproductive context, activity;
- free text, medicine/supplement names/doses and raw answers remain omitted;
- at most the latest previous saved check-in contributes deterministic deltas;
- raw previous snapshot and older history are not sent;
- longitudinal deltas cover finding/lab/M13.4 measurement/recommendation/evidence-completeness changes;
- explicit `materialAddition` utility gate;
- prioritized evidence gaps grounded in supplied IDs;
- evidence/trend/engine contradictions grounded in supplied IDs;
- clinician-conversation brief;
- v1 base-review safety validation remains nested inside v2 validation;
- v2 endpoint rejects unexpected envelope keys and violated minimization flags;
- web AI Review now uses v2 while the v1 endpoint remains for traceability;
- `npm run ai:gate:v2` runs all five mocks against a configured real model.

Mission detail: `docs/missions/M11_AI_REVIEW_V2_CONTEXTUAL_UTILITY.md`.

## Important product truth

M11 was implemented because the owner explicitly asked to proceed before M10.1 real-model utility testing was complete.

Therefore:
- engineering implementation does **not** mean live AI utility is proven;
- no real configured model is declared to have passed M10.1 or M11;
- low-risk output should often remain quiet;
- deeper context is useful only if it improves understanding without inventing problems;
- longitudinal quality must be tested on real multi-check-in history, not fabricated trends.

## Combined owner validation gate

Still open:
1. assessment captures material facts;
2. result hierarchy is understandable;
3. report import is trustworthy;
4. narrow clinical interpretation does not overstate certainty or prescribe autonomously;
5. profile import/export is reliable;
6. persistence/privacy behavior is understandable and truthful;
7. AI v1/v2 preserves safety/privacy boundaries;
8. AI v2 adds real value beyond paraphrase;
9. AI v2 longitudinal synthesis distinguishes evidence change from health change.

Any trust/comprehension/evidence/privacy/AI-safety defect found in owner testing takes priority over roadmap expansion.

## Current product milestone

**Context-aware AI-review web alpha candidate — deterministic product remains authoritative; owner trust/privacy/real-model utility gates remain open.**

All clinical rules and mappings remain `prototype` unless explicitly promoted by qualified review.

## Next work

1. Owner runs `npm run verify` locally.
2. Owner runs web AI Review v2 with a configured model.
3. Run `npm run ai:gate:v2` across all five mocks.
4. Test at least one genuine two-check-in history for longitudinal synthesis.
5. Fix any trust/safety/privacy defect first.
6. Then run **Strategic Review 3 — High**.
7. M15A Pilot Safety / Privacy / Release Gate follows strategic review.
8. Concrete auth/backend selection remains a pilot-infrastructure decision and must satisfy M13.5.
9. M14 ChatGPT/MCP remains later; M15B production/store hardening last.

## Active constraints
- deterministic urgent/safety/applicability/evidence decisions remain authoritative;
- AI cannot diagnose or autonomously change prescription treatment;
- therapeutic iron/thyroid/lipid/high-dose supplement regimens are not AI-generated;
- one measurement is not automatically a diagnosis;
- missing unit/date/source is never guessed;
- free-text/raw prior history is not part of M11's external packet;
- current browser/mobile storage is not described as Jaanch-encrypted medical-record storage;
- current Vite AI middleware is development/preview infrastructure, not a production authenticated health API;
- provider secrets never enter browser/mobile code;
- generic overall health score remains dropped.

## Session handover
Canonical state: `HANDOVER_NEXT_SESSION.md`.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Prefer 1–2 coherent commits per mission.
- High effort for assessment/result/evidence/safety/clinical/persistence/AI/release work.
- Do not add GitHub Actions unless requested.
