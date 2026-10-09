# Jaanch — New Session Handover Prompt

You are taking over active development of **Jaanch**, a deterministic, evidence-aware personal health assessment and prevention product.

## 1. Start here

Repository: `Amonaval/jaanch`  
Default branch: `main`

M13.5 core architecture commit:

```text
c43984d72cf2f8f0fabc7a582baeadc21dc4d5b6
M13.5: add secure persistence architecture
```

A docs/closure commit is newer. **Always fetch current `main` before writing anything. Never overwrite a newer head.**

Read these canonical files completely:

```text
README.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/product/ASSESSMENT_QUALITY_STANDARD.md
docs/missions/M13.1_ASSESSMENT_QUALITY_RECOVERY.md
docs/missions/M13.2_RESULT_QUALITY_HEALTH_MAP_UX.md
docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md
docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md
docs/missions/M13.5_PROFILE_SECURE_PERSISTENCE_ARCHITECTURE.md
```

Then inspect the actual current source relevant to the requested work.

## 2. Product thesis / hard boundaries

Jaanch is **not** an AI diagnosis chatbot.

Core loop:

```text
Capture context → adaptive assessment → deterministic evidence/findings
→ missing/contradicting/supporting evidence → smallest useful next evidence
→ manual/report measurement capture → eligibility gates → reassessment
→ safety-gated actions → immutable check-in → versioned persistence
→ repeat/compare
```

Non-negotiable:
1. questionnaire signals are not diagnoses;
2. confidence is confidence in an assessment statement, not disease probability;
3. no generic overall health score;
4. evidence completeness is not overall health;
5. capture does not authorize interpretation;
6. report extraction creates candidates only;
7. unit/date/source facts must not be guessed;
8. one measurement does not automatically become a diagnosis;
9. prescription medication changes are never autonomous;
10. therapeutic/high-dose supplement or iron/thyroid/lipid regimens are not autonomously generated;
11. urgent red flags override routine flow;
12. applicability runs before adult rules/recommendations;
13. AI cannot override deterministic urgent/safety/applicability/evidence gates;
14. all clinical rule/test/recommendation maturity stays explicit (`prototype` / `reviewed` / `approved`);
15. local profile JSON does not imply cloud consent;
16. remote health persistence requires authenticated ownership + explicit sync consent + TLS + encryption-at-rest;
17. current browser localStorage / mobile AsyncStorage must not be described as Jaanch-encrypted medical-record storage.

## 3. Implemented mission state

Engineering implemented:

```text
M01–M09.1 foundational deterministic engine/safety/governance
M10 AI harness engineering — live utility gate PAUSED
M13 local longitudinal history
M13.1 Assessment Quality Recovery — owner trust retest open
M13.2 Consumer Health Map v3 — owner result retest open
M13.3 Clinical Evidence Capture v2 / Report UX — owner report retest open
M13.4 Narrow Clinical Interpretation Expansion — owner clinical/profile retest open
M13.5 Profile + Secure Persistence Architecture v1 — owner persistence/privacy review open
```

Do not reconstruct completed missions unless current code or hands-on testing exposes a real defect.

## 4. M13.3 evidence capture state

Report ingestion:
- file attachment preserves provenance;
- user pastes report text/OCR in current alpha;
- extraction creates candidates only;
- explicit review is required;
- missing unit/date stays missing;
- HbA1c/B12 use existing normalized lab eligibility;
- exact duplicates replaced; newer distinct results remain;
- reviewed candidates apply as one new reassessed snapshot based on latest saved baseline.

M13.4 integration means confirmed BP/lipid/haemoglobin/ferritin/TSH recorded measurements can feed only the bounded new modules after their own unit/date/verification/freshness/applicability gates. Vitamin D, fasting/random glucose and unknown markers remain recorded/unassessed.

## 5. M13.4 clinical expansion state

New source-governed prototype rules:

### Blood pressure
- rule `CV-BP-001`;
- source `ESC-BP-2024`;
- adult nonpregnant applicability;
- recent confirmed `mmHg` only;
- single reading never becomes a hypertension diagnosis;
- marked readings ask for clinician review; no medication changes.

### Lipids
- rule `CV-LIPID-001`;
- source `AHA-ACC-DYSLIPIDEMIA-2026`;
- adult nonpregnant applicability;
- confirmed mg/dL only; no silent mmol conversion;
- LDL >=160 mg/dL is important risk context, not a universal target;
- TG >=500 clinician-review context; TG >=1000 high-attention clinician review;
- no PREVENT calculator yet; no medication decision engine.

### Anaemia / iron
- rule `NUT-IRON-001`;
- sources `WHO-ANAEMIA-2024`, `WHO-FERRITIN-2020`;
- current applicability nonpregnant age 18–65;
- adult Hb thresholds female <12 g/dL, male <13 g/dL; severe <8 g/dL;
- ferritin <15 ng/mL depleted-iron-store signal in bounded context;
- missing Hb/ferritin becomes explicit evidence gaps;
- no autonomous iron regimen.

### Thyroid
- rule `MET-THYROID-001`;
- source `NICE-THYROID-NG145`;
- adult nonpregnant applicability;
- TSH >=10 or <0.1 is a confirm/clinician-review signal only;
- no diagnosis from one TSH value;
- FT4/FT3 confirmation remains clinician-guided; no medication changes.

All new rules remain `prototype`.

## 6. M13.4 evidence-integrity architecture

`packages/core/src/clinicalMeasurements.ts` is the trust boundary for broader captured measurements.

It validates:
- marker;
- user confirmation;
- supported unit;
- valid collection date;
- freshness;
- plausible range;
- latest eligible result.

It materializes private `__m134_*` fields only through the trusted capture path and tags them with a module-private Symbol. Public `assess(...)` strips forged internal fields. `createAssessmentSnapshot(...)` strips internal fields before persistence/export.

Do not weaken this boundary by exposing a public “trusted” boolean or accepting `__m134_*` from imported JSON.

## 7. Profile import/export + mocks

Protocol: `JAANCH-PROFILE-1.0`.

Core modules:

```text
packages/core/src/profileBundle.ts
packages/core/src/mockProfiles.ts
packages/core/src/verificationProfiles.ts
```

Rules:
- imported profiles rerun through the **current** deterministic engine;
- derived/stored conclusions are not trusted;
- internal M13.4 fields are stripped on import/export;
- export preserves runnable draft and optional local history;
- this is profile portability/testing, not cloud consent.

Five built-in and repo fixtures:

```text
examples/mock-profiles/low-risk-adult.json
examples/mock-profiles/cardiometabolic-lipids.json
examples/mock-profiles/vegetarian-b12-iron.json
examples/mock-profiles/thyroid-signal.json
examples/mock-profiles/severe-triglycerides.json
```

## 8. M13.5 persistence architecture

Core module:

```text
packages/core/src/persistence.ts
```

Protocols:

```text
JAANCH-PERSISTENCE-1.0
JAANCH-DELETION-1.0
JAANCH-DATA-EXPORT-1.0
```

### Current runtime truth

Existing web/mobile callers still use `encodeLongitudinalHistory(...)` and `decodeLongitudinalHistory(...)`.

After M13.5:
- encoding writes a `JAANCH-PERSISTENCE-1.0` envelope;
- decoding accepts both the new envelope and legacy `JAANCH-HISTORY-1.0`;
- current web storage remains browser `localStorage`;
- current mobile storage remains AsyncStorage;
- current security metadata is intentionally `application_storage_unencrypted` and `local_only`;
- no live auth provider, database or cloud sync exists.

### Identity / consent / retention

Persistence document includes:
- profile ID;
- owner kind (`local_device` or `authenticated`);
- consent state + policy version/timestamp;
- retention mode `until_user_deletes`;
- default history cap 20;
- security metadata;
- sync revision/state;
- longitudinal history.

Auth tokens/credentials are not part of the health document.

### Remote gate

`assertRemotePersistenceEligible(...)` requires all of:
1. authenticated owner;
2. explicit `cloudSync = granted`;
3. `server_encrypted` at-rest metadata;
4. `tls_required` transport;
5. `sync_eligible` state.

Consent revocation immediately makes the document local-only again.

### Vendor-independent backend boundary

`SecurePersistencePort` exposes:

```text
load(scope)
save(scope, encoded, expectedRevision)
delete(scope, tombstone, expectedRevision)
```

Clinical core must not depend on Supabase/Firebase/AWS semantics.

### Cross-device / delete / export

- same authenticated owner/profile only;
- immutable snapshot duplicates dedupe;
- same snapshot ID with different payload = conflict, never silent overwrite;
- deletion uses `JAANCH-DELETION-1.0` tombstone with no health history;
- user-owned data export uses `JAANCH-DATA-EXPORT-1.0` and excludes backend security/credential material;
- persisted history decode sanitizes private M13.4 fields again.

### Important non-goals

M13.5 architecture does **not** mean:
- local app storage is encrypted;
- account sign-in is implemented;
- remote backup/sync is implemented;
- production key management is solved;
- production privacy/legal consent UX is complete.

A concrete auth/backend adapter is a later pilot/deployment decision and must satisfy M13.5 rather than redefining it.

## 9. Verification

Root command:

```bash
npm run verify
```

M13.5 adds `packages/core/src/verificationPersistence.ts` covering:
- persistence-envelope encoding/roundtrip;
- legacy-history readability/migration;
- current local security truth;
- local owner remote rejection;
- authenticated+consented+encrypted remote eligibility;
- consent revocation fail-closed behavior;
- same-owner merge/dedupe;
- cross-owner rejection;
- M13.4 private-evidence persistence sanitization;
- deletion tombstone boundary;
- owned-data export boundary.

Do not claim CI passed unless actual checks exist. At M13.5 closure, the GitHub commit had no attached status checks.

## 10. Owner gates still open

Engineering progress does not equal product validation.

Owner should test:
1. M13.1 capture completeness/navigation;
2. M13.2 result comprehension;
3. M13.3 report trust;
4. all five M13.4 mock profiles;
5. profile export → re-import roundtrip;
6. missing unit/date and unsupported marker behavior;
7. BP/TG/iron/TSH boundaries without diagnostic/treatment overreach;
8. existing saved local history still loads after M13.5;
9. save/report/profile flows still persist after the new envelope;
10. current local persistence wording does not overclaim encryption/account/cloud behavior.

Any discovered trust/result/evidence/privacy defect takes priority over roadmap work.

## 11. Next planned work

If no new owner defect is supplied:

1. Resume **M10 live AI Utility Gate** only when current deterministic behavior is representative enough to judge AI fairly.
2. M11 only if M10 proves incremental value.
3. Strategic Review 3 once hands-on product evidence is available.
4. M15A Pilot Safety / Privacy / Release Gate.
5. Select/connect a concrete auth/backend adapter only when pilot infrastructure is justified; it must satisfy M13.5.
6. M14 ChatGPT/MCP later; M15B production/store hardening last.

## 12. Working rules

- Prefer high-value bounded work over broad frameworks.
- Normal mission budget 1–2 coherent commits.
- Keep web/mobile meaning shared in core; platform UI may differ.
- Do not add GitHub Actions unless requested.
- Use authoritative/current sources for clinical rules.
- Preserve source IDs, rule versions, evidence IDs and provenance.
- Keep `prototype/reviewed/approved` explicit.
- Do not restore `@jaanch/core: "workspace:*"`; workspace consumers use version `0.1.0`.
- Fix owner-discovered trust defects before roadmap vanity work.
- Do not connect sensitive cloud storage without explicit identity/consent/security semantics.

## 13. What to do when this handover is opened

1. Fetch current `main` and verify it is newer/equal to the documented state.
2. Read the canonical files listed in section 1.
3. Inspect current source relevant to the requested task.
4. If hands-on defects are supplied, prioritize them.
5. Otherwise follow the next planned work above.
6. At mission closure update code, verification, mission docs, STATUS/ROADMAP/README/handover and state the exact next effort.
