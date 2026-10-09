# Mission Status

## Completed / engineering-implemented
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
- M10.1 — Live AI Review + Web UX: ENGINEERING IMPLEMENTED; LIVE REAL-MODEL UTILITY GATE OPEN
- M13 — Longitudinal Health + Local Persistence: IMPLEMENTED

## M13.1 — Assessment Quality Recovery + Block UX v2
Status: **ENGINEERING IMPLEMENTED — OWNER TRUST-GATE RETEST REQUIRED**  
Effort: **High**

Owner gate:
> **Jaanch captured the material facts I expected it to know.**

## M13.2 — Result Quality + Health Map Consumer UX v3
Status: **ENGINEERING IMPLEMENTED — OWNER RESULT-UX RETEST REQUIRED**  
Effort: **High**

Owner gate:
> **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

## M13.3 — Clinical Evidence Capture v2 / Report UX
Status: **ENGINEERING IMPLEMENTED — OWNER EVIDENCE-INGESTION RETEST REQUIRED**  
Effort: **High**

Implemented:
- provider-neutral report candidate/provenance contract;
- PDF/image/text provenance capture on web/mobile;
- deterministic pasted-text/OCR candidate extraction;
- explicit review before evidence promotion;
- HbA1c/B12 normalized lab eligibility remains authoritative;
- report unit/date are never guessed;
- exact duplicate/latest-result semantics;
- one reassessed immutable snapshot per reviewed report batch.

M13.4 integration:
- confirmed BP/lipid/haemoglobin/ferritin/TSH measurements can feed the bounded interpretation path only after verification/unit/date/freshness/applicability gates pass;
- Vitamin D, fasting/random glucose and unknown markers remain recorded/unassessed.

Mission detail: `docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md`.

## M13.4 — Narrow Clinical Interpretation Expansion
Status: **ENGINEERING IMPLEMENTED — OWNER CLINICAL/PROFILE RETEST REQUIRED**  
Effort: **High**

Implemented clinical domains:
- blood pressure / cardiovascular context — `CV-BP-001`, 2024 ESC;
- lipid cardiovascular-risk context — `CV-LIPID-001`, 2026 ACC/AHA dyslipidemia guidance;
- anaemia / iron-status evidence — `NUT-IRON-001`, WHO haemoglobin/ferritin guidance;
- thyroid evidence — `MET-THYROID-001`, NICE NG145.

Evidence integrity:
- eligibility requires user confirmation, supported unit, valid date, freshness and plausible range;
- private derived evidence is rebuilt only by the trusted capture path;
- public `assess(...)` strips forged internal M13.4 fields;
- persisted snapshots/profile exports strip internal derived evidence.

Profile portability:
- `JAANCH-PROFILE-1.0` import/export on web/mobile;
- imported profiles rerun the current deterministic engine;
- five synthetic mock profiles + repo fixtures.

Mission detail: `docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md`.

## M13.5 — Profile + Secure Persistence Architecture v1
Status: **ENGINEERING IMPLEMENTED — OWNER PERSISTENCE/PRIVACY REVIEW REQUIRED**  
Effort: **High**

Implemented:
- `JAANCH-PERSISTENCE-1.0` versioned persistence envelope;
- local-device vs authenticated owner boundary;
- consent state and policy-version contract;
- retention policy (`until_user_deletes`, capped history);
- truthful security metadata for current local storage;
- explicit remote-persistence eligibility gate;
- vendor-independent `SecurePersistencePort`;
- legacy `JAANCH-HISTORY-1.0` backward compatibility + migration helper;
- same-owner cross-device merge semantics with immutable-snapshot conflict rejection;
- consent revocation fail-closed behavior;
- `JAANCH-DELETION-1.0` tombstones with no health-history payload;
- `JAANCH-DATA-EXPORT-1.0` owned-data export semantics;
- persistence decode sanitization of private M13.4 derived fields;
- verification wired into `npm run verify`.

Current runtime truth:
- web still stores locally in browser `localStorage`;
- mobile still stores locally in AsyncStorage;
- these current stores are explicitly classified `application_storage_unencrypted` by Jaanch;
- cloud sync remains OFF;
- no live auth provider or remote database has been connected.

Mission detail: `docs/missions/M13.5_PROFILE_SECURE_PERSISTENCE_ARCHITECTURE.md`.

## M10.1 — Live AI Review + Web UX
Status: **ENGINEERING IMPLEMENTED — LIVE REAL-MODEL UTILITY GATE / OWNER REVIEW REQUIRED**  
Effort: **High**

Implemented:
- new `AI Review` web surface based on the latest saved deterministic check-in;
- explicit per-run consent before creation of the external review packet;
- browser-side privacy minimization before any network request;
- raw questionnaire answers omitted from the network payload;
- same-origin `/api/ai-review` server endpoint mounted by Vite dev/preview;
- API key/model configuration remains server-side in root `.env.local`;
- `OPENAI_API_KEY` is not exposed through a `VITE_` variable;
- server accepts only `JAANCH-AI-REVIEW-1.0`, POST-only, size-capped, no-store responses;
- existing OpenAI Responses provider + strict structured output reused;
- invalid/safety-violating AI output is hidden rather than partially rendered;
- provider/model/harness/schema trace shown for reviewed output;
- `npm run ai:gate` runs all five mock profiles through the configured live provider;
- non-live web runtime verification added to `npm run verify`.

The AI UX can show:
- concise explanation;
- preserved red flags;
- missing considerations;
- explicit disagreements with deterministic findings;
- domain-level explanations and missing evidence;
- treatment-advice gating reasons.

Hard boundary:
- AI never mutates deterministic findings, safety/applicability/evidence eligibility or recommendation state.

Live model status:
- **not run in the implementation session** because no user API credential was available;
- M11 remains blocked until real-model owner testing demonstrates defensible incremental value.

Mission detail: `docs/missions/M10.1_LIVE_AI_REVIEW_WEB_UX.md`.

## Combined owner validation gate
Jaanch is still not product-validated until hands-on use confirms:
1. assessment captures material facts;
2. result hierarchy is understandable;
3. report import is trustworthy;
4. narrow clinical modules do not overstate certainty or prescribe autonomously;
5. mock/import/export flow is reliable;
6. persistence/privacy behavior is understandable and does not overclaim encryption/cloud safety;
7. AI review is safe, privacy-understandable and materially useful beyond paraphrasing the deterministic result.

Recommended owner retest:
1. run all five built-in mocks;
2. export one mock/profile and re-import it;
3. use missing/incorrect unit or date and confirm interpretation is blocked;
4. test BP 148/94, TG >=1000, low Hb+ferritin and TSH 12.8 boundaries;
5. compare report evidence with manual/profile evidence;
6. confirm Vitamin D/glucose remain recorded/unassessed;
7. verify existing local history still loads and saves after the persistence-envelope migration;
8. verify current local storage wording does not imply encrypted medical-record storage;
9. configure M10.1 live AI, run a saved low-risk profile and confirm AI does not invent novelty;
10. run higher-signal mocks and judge whether AI finds useful missing considerations/explanations without diagnosis/treatment overreach;
11. run `npm run ai:gate` and review all five live outputs before deciding on M11.

Any trust/comprehension/evidence/privacy/AI-safety defect found in owner testing takes priority over roadmap work.

## Current product milestone
**AI-review web alpha candidate — deterministic product + persistence architecture implemented; live real-model utility gate and owner trust/privacy gates remain open.**

All clinical rules and mappings remain `prototype`; source capture does not mean clinical approval.

## Next work
1. Fix any owner-discovered M13.1–M13.5 or M10.1 trust/result/evidence/privacy/AI-safety defect.
2. Run the **M10.1 live AI Utility Gate** with a real configured model (`npm run ai:gate`) and hands-on web review.
3. Proceed to M11 only if AI proves incremental value.
4. Otherwise keep AI optional/deferred and run Strategic Review 3.
5. Strategic Review 3.
6. M15A Pilot Safety / Privacy / Release Gate.
7. Choose/connect a concrete auth/backend adapter only when pilot infrastructure is justified; it must satisfy M13.5.
8. M14 MCP / ChatGPT App later; M15B production/store hardening last.

## Active constraints
- Assessment quality is release-blocking.
- Result comprehension is release-blocking.
- Evidence-ingestion trust is release-blocking.
- Privacy/security claims are release-blocking.
- Current local storage must not be described as application-layer encrypted.
- Cloud upload cannot be inferred from local profile import/export.
- Remote persistence requires authenticated ownership + consent + TLS + server encryption.
- One measurement does not automatically become a diagnosis.
- Capturing a fact does not automatically authorize interpretation.
- Missing provenance must not be guessed.
- Prescription-medication changes are never autonomously recommended.
- Therapeutic iron/thyroid/lipid regimens are not autonomously prescribed.
- Evidence completeness is not overall health.
- Deterministic urgent/safety/applicability/evidence rules remain authoritative.
- AI review is advisory only and cannot mutate deterministic state.
- Generic overall health score remains dropped.

## Session handover
Canonical new-session state: `HANDOVER_NEXT_SESSION.md`.

Always verify current `main`, then read README, this status file, roadmap and the latest mission doc before writing.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Normal mission commit budget: 1–2 commits.
- High effort for assessment/result/evidence/safety/applicability/clinical/persistence/AI/release work.
