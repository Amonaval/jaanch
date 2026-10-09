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
- M10 — AI Harness Runtime + Privacy/Evaluation: ENGINEERING IMPLEMENTED; LIVE UTILITY GATE PAUSED
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
- cloud sync remains OFF and is not inferred from JSON import/export;
- no live auth provider or remote database has been connected.

Remote persistence is allowed by contract only when all are true:
1. authenticated profile ownership;
2. explicit cloud-sync consent;
3. TLS-required transport;
4. server-side encryption-at-rest metadata;
5. sync state resolves to `sync_eligible`.

Mission detail: `docs/missions/M13.5_PROFILE_SECURE_PERSISTENCE_ARCHITECTURE.md`.

## Combined owner validation gate
Jaanch is still not product-validated until hands-on use confirms:
1. assessment captures material facts;
2. result hierarchy is understandable;
3. report import is trustworthy;
4. narrow clinical modules do not overstate certainty or prescribe autonomously;
5. mock/import/export flow is reliable and reruns evidence through the current engine;
6. persistence/privacy behavior is understandable and does not overclaim encryption/cloud safety.

Recommended owner retest:
1. run all five built-in mocks;
2. export one mock/profile and re-import it;
3. use missing/incorrect unit or date and confirm interpretation is blocked;
4. test BP 148/94, TG >=1000, low Hb+ferritin and TSH 12.8 boundaries;
5. compare report evidence with manual/profile evidence;
6. confirm Vitamin D/glucose still remain recorded/unassessed;
7. upgrade from a checkout/browser/device with existing local history and confirm it still loads;
8. save a new check-in and verify history still round-trips after the persistence envelope migration;
9. verify UI/product wording does not imply current local storage is encrypted medical-record storage;
10. keep profile JSON portability conceptually separate from future account/cloud sync.

Any trust/comprehension/evidence/privacy defect found in owner testing takes priority over roadmap work.

## Current product milestone
**Persistence-architecture alpha candidate — local-only runtime; owner trust/result/report/clinical/profile/privacy gates still open.**

All clinical rules and mappings remain `prototype`; source capture does not mean clinical approval.

## Next work
1. Fix any owner-discovered M13.1–M13.5 trust/result/evidence/privacy defect.
2. Resume **M10 live AI Utility Gate** only when current deterministic product behavior is representative enough to judge AI fairly.
3. M11 remains conditional on M10 proving incremental value.
4. Strategic Review 3.
5. M15A Pilot Safety / Privacy / Release Gate.
6. A concrete auth/backend adapter may be selected during pilot infrastructure work, but must satisfy M13.5 rather than redefine it.
7. M14 MCP / ChatGPT App later; M15B production/store hardening last.

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
- Generic overall health score remains dropped.

## Session handover
Canonical new-session state: `HANDOVER_NEXT_SESSION.md`.

Always verify current `main`, then read README, this status file, roadmap and the latest mission doc before writing.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Normal mission commit budget: 1–2 commits.
- High effort for assessment/result/evidence/safety/applicability/clinical/persistence/release work.
