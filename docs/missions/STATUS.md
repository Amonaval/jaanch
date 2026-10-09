# Mission Status

## Completed
- M01 — Foundation + Constitution: IMPLEMENTED (prototype scope)
- M02 — Adaptive Question Planner v1: IMPLEMENTED
- M03 — Versioned Rule Registry: IMPLEMENTED
- M04 — Evidence Graph + Finding Model: IMPLEMENTED
- M05 — Screening & Test Priority Engine: IMPLEMENTED
- Strategic Review 1: COMPLETE — CONTINUE WITH CHANGES
- M05.1 — Core Verification Harness: IMPLEMENTED
- M06 — Safety Gate + Clinical Source Baseline: IMPLEMENTED
- M07 — Health Map UX v2 + Shared Presentation Model: IMPLEMENTED
- M08 — Lab Reassessment + Normalization/Freshness: IMPLEMENTED
- M09 — Recommendation Engine v1: IMPLEMENTED
- Strategic Review 2: COMPLETE — CONTINUE WITH CHANGES
- M09.1 — Clinical Applicability & Evidence Integrity Gate: IMPLEMENTED
- M10 — AI Harness Runtime + Privacy/Evaluation: ENGINEERING IMPLEMENTED
- M13 — Longitudinal Health + Local Persistence: IMPLEMENTED

## M13 closure
- Added immutable versioned assessment snapshots and versioned longitudinal history.
- Snapshot captures answers, normalized lab evidence, deterministic assessment, recommendation plan, timestamp and stable ID.
- Added latest-vs-previous comparison for evidence completeness, findings, investigations, recommendations and lab values.
- Added safe history serialization/decoding and bounded newest-first retention.
- Web persists explicit saved check-ins in browser `localStorage`.
- Mobile persists explicit saved check-ins in AsyncStorage.
- Both platforms expose save, new check-in, comparison, saved-history and clear-history flows.
- Added longitudinal golden scenarios to `npm run verify:core`.
- Added detailed root `README.md` for web, Expo Go, physical-phone testing, EAS Android APK installation, troubleshooting and test scenarios.
- Added Expo SDK 57 mobile baseline, app identity and EAS development/preview/production profiles.
- Current local history storage is prototype/unencrypted; use demo data while evaluating.

## Product milestone
**Working end-to-end prototype: NOW.**

The owner should test Jaanch on web and phone before adding broad new medical scope.

## Current recommended work
### Hands-on product validation
Run the README test scenarios and capture:
- installation/startup blockers;
- questionnaire friction;
- confusing wording;
- Health Map information overload/underload;
- missing next-step clarity;
- longitudinal/history usefulness;
- mobile-specific usability problems.

### Then: M13.1 — First-Run UX & Product Usability Hardening
Effort: **High**

Use actual hands-on feedback to harden onboarding, navigation, progress, results hierarchy, next actions, error/empty/loading states, history controls and the simple-vs-auditable information balance.

## Parallel decision point
### M10 AI Utility Gate — PENDING REAL-MODEL EVALUATION
M10 engineering exists, but a real configured model has not yet proven incremental value.

- Pass → M11 AI Review Comparison & Safe Escalation may proceed.
- Fail / mainly paraphrase / remains unavailable → keep M11 deferred and focus on standalone Jaanch value.

## Recommended next missions
1. **M13.1 — First-Run UX & Product Usability Hardening** — High
2. **M13.2 — Profile + Secure Persistence Architecture v1** — High
3. **M13.3 — Lab/Report Capture UX** — Medium/High
4. **M10 Utility Gate** — High, parallel/optional decision gate
5. **M11 — AI Review Comparison & Safe Escalation** — High, CONDITIONAL
6. **M13.4 — Narrow Clinical Expansion** — High
7. **Strategic Review 3** — High
8. **M15A — Pilot Safety / Privacy / Release Gate** — High
9. **M14 — MCP / ChatGPT App** — High, after standalone value is validated
10. **M15B — Store / Production Hardening** — High

## Active constraints
- Do not add broad health-domain breadth before hands-on validation of the current loop.
- No adult-oriented rule/test mapping may silently run in unsupported populations.
- One canonical normalized lab-ingestion path drives lab-informed findings.
- Investigation planning respects applicability.
- Contradictory inputs are normalized before rule execution.
- AI must not treat stale/unverified/ineligible lab records as active evidence.
- AI must not upgrade prototype logic to clinical authority.
- Live AI sharing must be opt-in/minimized.
- Deterministic urgent/safety/applicability restrictions remain authoritative.
- M11 proceeds only if M10 proves incremental value with a real configured model.
- Do not introduce a generic overall health score.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Commit budget: 1–2 commits per mission
- Default effort: Medium
- Safety/applicability/AI/reconciliation/persistence/release missions use High effort where warranted.
- Strategic reviews may continue, change, drop or defer roadmap work.
