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
Status: COMPLETE (prototype scope)

### M02 — Adaptive Question Planner v1
Status: COMPLETE

### M03 — Rule Registry v1
Status: COMPLETE

### M04 — Evidence Graph + Finding Model
Status: COMPLETE

### M05 — Screening & Test Priority Engine
Status: COMPLETE

### M05.1 — Core Verification Harness
Status: NEXT
Purpose: close the executable scenario-testing gap identified by SR1 before adding safety-critical rule depth.
Deliverables: golden scenario fixtures, deterministic repeatability tests, planner/rule/evidence/test-plan assertions, contradiction/skip/red-flag cases, invariant failure tests.
Effort: Medium.

### M06 — Safety Gate + Clinical Source Baseline
Add special-population context, medications/supplements/allergies, contraindication/suppression rules, stronger red flags, and a source/reference governance contract for clinical rules and investigation mappings.
Effort: High.

### M07 — Health Map UX v2 + Shared Presentation Model
Domain map, priority list, evidence completeness, rule/provenance viewer, patient-friendly explanations and shared platform-neutral presentation selectors so mobile/web semantics do not drift.
Effort: Medium.

### M08 — Lab Reassessment + Normalization/Freshness
Manual lab entry, normalized marker IDs, units, collection time, provenance, freshness semantics, reassessment and changed-verdict view.
Effort: High after SR1 scope expansion.

### M09 — Recommendation Engine v1
Lifestyle, diet, exercise, monitoring, clinician-review and appropriately gated supplement-consideration classes.
Effort: High.

### M10 — AI Harness Runtime
Construct prompt from harness + HAP; validate strict JSON; retain AI result separately.
Effort: Medium.

### M11 — Engine vs AI Verdict
Agreement/disagreement model, missing-evidence resolver and deterministic final verdict rules.
Effort: High.

### M12 — Rule Studio v1
Status: DEFERRED BY SR1 until after initial distribution/release hardening unless rule-authoring volume becomes a concrete bottleneck.

### M13 — Longitudinal Health
Assessment history, trends, compare and retest loop.
Effort: Medium.

### M14 — MCP / ChatGPT App
Expose assessment tools and interactive UI while keeping sequencing and safety in Jaanch core.
Effort: High.

### M15 — Validation & Release Hardening
Clinical content review workflow hardening, privacy model, audit trail, accessibility, threat model and release checklist.
Effort: High.

## Mission batches after SR1
- **Quality gate:** M05.1 alone.
- **Batch C:** M06 + M07 — safety/source baseline + Health Map integration.
- **Batch D:** M08 + M09 — lab reassessment + action/recommendation engine.
- **Batch E:** M10 + M11 — harness runtime + deterministic engine-vs-AI verdict.
- **Longitudinal:** M13.
- **Batch G:** M14 + M15 — distribution + release hardening; keep logically separate even if executed in one work block.
- **M12 Rule Studio:** deferred.

Within a batch, finish and verify one mission before starting the next. Do not combine multiple missions into one commit.

## Strategic review gates

### SR1 — after M05 — COMPLETE
Decision: CONTINUE WITH CHANGES.
Key changes: insert M05.1 verification harness; move source governance into M06; freeze broad domain expansion through SR2; expand M08 normalization/freshness; add shared presentation semantics to M07; defer M12 Rule Studio; drop generic overall score from near-term scope.
See `docs/reviews/SR1_FOUNDATION_REVIEW.md`.

### SR2 — after M09
Review clinical-safety posture, user usefulness, recommendation boundaries, special-population handling, explainability, false reassurance/over-testing risks, and whether deterministic logic remains understandable.

### SR3 — after M13 (before distribution)
Review end-to-end product value, AI-harness usefulness, disagreement behavior, longitudinal retention value, privacy/data minimization, OpenAI/MCP fit, and release scope. M14/M15 may be redesigned based on this review.

Each strategic review must produce `docs/reviews/SR<n>_*.md`, update `STATUS.md`, and explicitly record continue / change / drop / defer decisions.

## Back-to-back execution rule
Missions may run continuously without waiting for user approval when the roadmap is clear. Stop only for: a safety/legal product decision that materially changes scope; unavailable credentials/external dependency; destructive repository action; or a strategic review that recommends a major product pivot.
