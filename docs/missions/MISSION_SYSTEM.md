# Mission System

## Mission philosophy
Each mission must deliver a visible product capability, not only architecture. Keep missions small enough to finish and verify. Prefer 1–2 focused commits per mission. Use a third commit only for an exceptional verification/hardening fix; avoid commit fragmentation.

## Definition of done
A mission is complete only when applicable layers are closed:
- implementation;
- deterministic validation/tests;
- user-visible UX;
- safety handling;
- documentation;
- sample data/demo path;
- roadmap/status update.

## Anti-overbuilding rule
Do not build infrastructure more than one mission ahead of a concrete feature. Prefer the simplest architecture that preserves deterministic traceability, testability, and future API/MCP reuse.

## Mission list

### M01 — Foundation + Constitution
Status: IN PROGRESS
Deliverables: React shell, typed health model, master questions, adaptive question selection, initial findings, HAP packet, product constitution, AI harness, roadmap.

### M02 — Adaptive Question Planner v1
Add domain activation rules, question dependencies, stop conditions, skipped/unknown states, and question rationale.

### M03 — Rule Registry v1
Move inline assessment logic into versioned declarative rules with IDs, sources, tests and trace output.

### M04 — Evidence Graph + Finding Model
Represent known, inferred, missing and conflicting evidence explicitly across health domains.

### M05 — Screening & Test Priority Engine
Rank tests by ability to resolve important uncertainty; support essential/recommended/optional tiers.

### M06 — Safety Gate v1
Special populations, contraindication context, red flags, and recommendation-class suppression.

### M07 — Health Map UX v2
Domain map, priority list, evidence completeness, rule trace viewer, patient-friendly explanations.

### M08 — Lab Reassessment v1
Manual lab entry, result normalization, reassessment, and changed-verdict view.

### M09 — Recommendation Engine v1
Lifestyle, diet, exercise, monitoring, clinician-review and supplement-consideration classes.

### M10 — AI Harness Runtime
Construct prompt from harness + HAP; validate strict JSON; retain AI result separately.

### M11 — Engine vs AI Verdict
Agreement/disagreement model, missing-evidence resolver and deterministic final verdict rules.

### M12 — Rule Studio v1
Draft rules from natural language, validate/test/review/approve workflow.

### M13 — Longitudinal Health
Assessment history, trends, compare, retest loop.

### M14 — MCP / ChatGPT App
Expose assessment tools and interactive UI while keeping sequencing and safety in HealthMap core.

### M15 — Validation & Release Hardening
Clinical content review workflow, privacy model, audit trail, accessibility, threat model, release checklist.


## Recommended effort by mission

| Mission | Effort | Why |
|---|---|---|
| M01 Foundation + Constitution | Medium | Product skeleton + governance; already implemented. |
| M02 Adaptive Question Planner v1 | Medium | Deterministic branching and prioritization. |
| M03 Rule Registry v1 | High | Core architecture for auditable medical logic. |
| M04 Evidence Graph + Finding Model | High | Semantics of evidence/conflict/missing data affect all later outputs. |
| M05 Screening & Test Priority Engine | Medium | Ranking on top of established evidence model. |
| M06 Safety Gate v1 | High | Red flags, special populations and suppression rules are safety-critical. |
| M07 Health Map UX v2 | Medium | Product/UX integration with limited new medical logic. |
| M08 Lab Reassessment v1 | Medium | Normalization + rerun/compare flow. |
| M09 Recommendation Engine v1 | High | Requires conservative action classes, safety gating and traceability. |
| M10 AI Harness Runtime | Medium | Prompt packet assembly, schema validation and isolation of AI output. |
| M11 Engine vs AI Verdict | High | Reconciliation semantics must never silently let AI override core rules. |
| M12 Rule Studio v1 | Medium | Authoring workflow; production activation remains approval-gated. |
| M13 Longitudinal Health | Medium | History/trends/retest loop. |
| M14 MCP / ChatGPT App | High | Distribution, permission boundaries, app/tool contracts. |
| M15 Validation & Release Hardening | High | Privacy, audit, threat model, accessibility and clinical-content release gates. |

**Default:** Medium is sufficient for day-to-day implementation. Switch to High for M03, M04, M06, M09, M11, M14 and M15.

## Mission batches

Batch missions only when they are tightly coupled and still preserve per-mission status and commits.

- **Batch A — M02 + M03:** adaptive planner + versioned rule registry.
- **Batch B — M04 + M05:** evidence graph + screening/test priority.
- **Batch C — M06 + M07:** safety gates + Health Map UX integration.
- **Batch D — M08 + M09:** lab reassessment + action/recommendation engine.
- **Batch E — M10 + M11:** harness runtime + deterministic engine-vs-AI verdict.
- **Batch F — M12 + M13:** rule-authoring workflow + longitudinal loop.
- **Batch G — M14 + M15:** ChatGPT/MCP distribution + release hardening; keep these logically separate even if executed in one work block.

Within a batch, finish and verify one mission before starting the next. Do not combine multiple missions into one commit.

## Strategic review gates

Run three formal reviews so implementation does not drift:

### SR1 — after M05
Review product architecture, adaptive flow quality, rule-model ergonomics, evidence semantics, test-selection value, and whether the MVP is becoming too broad. Reorder or delete roadmap work if needed.

### SR2 — after M09
Review clinical-safety posture, user usefulness, recommendation boundaries, special-population handling, explainability, false reassurance/over-testing risks, and whether deterministic logic remains understandable.

### SR3 — after M13 (before distribution)
Review end-to-end product value, AI-harness usefulness, disagreement behavior, longitudinal retention value, privacy/data minimization, OpenAI/MCP fit, and release scope. M14/M15 may be redesigned based on this review.

Each strategic review must produce `docs/reviews/SR<n>_*.md`, update `STATUS.md`, and explicitly record **continue / change / drop / defer** decisions.

## Back-to-back execution rule

Missions may run continuously without waiting for user approval when the roadmap is clear. Stop only for: a safety/legal product decision that materially changes scope; unavailable credentials/external dependency; destructive repository action; or a strategic review that recommends a major product pivot.
