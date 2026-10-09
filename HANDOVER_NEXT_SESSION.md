# Jaanch — New Session Handover Prompt

You are taking over active development of **Jaanch**, a deterministic, evidence-aware personal health assessment and prevention product.

## 1. Start here

Repository: `Amonaval/jaanch`  
Default branch: `main`

M13.6 code commit:

```text
58c8fbeb926d83061c8169721adcf6dc24a4b989
M13.6: add Health Intelligence Brief and Smart Recheck
```

A newer closure commit should exist. **Always fetch current `main` before writing.**

Read completely:

```text
docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md
README.md
```

Then inspect actual current source relevant to the task.

## 2. Strategic Review 3 controls product direction

Decision:

> **CONTINUE WITH MAJOR CHANGES — PAUSE FEATURE EXPANSION, RESET THE CONSUMER EXPERIENCE.**

Do not interpret engineering completion as product success.

SR3 judged:
- safety/evidence integrity: strong;
- architecture: strong;
- immediate consumer value: weak/moderate;
- friction: high;
- longitudinal pull: weak;
- wow factor: weak.

The product is not pilot-ready until consumer value gates pass.

## 3. Core safety/evidence boundaries

Jaanch is not an AI diagnosis chatbot.

1. questionnaire signals are not diagnoses;
2. confidence is not disease probability;
3. no generic overall health score;
4. evidence completeness is not overall health;
5. capture does not automatically authorize interpretation;
6. report extraction creates candidates only;
7. unit/date/source must not be guessed;
8. one measurement does not automatically become a diagnosis;
9. prescription-medication changes are never autonomous;
10. therapeutic/high-dose iron/thyroid/lipid/supplement regimens are not autonomously generated;
11. urgent red flags override routine flow;
12. applicability runs before rules/recommendations;
13. AI cannot override deterministic urgent/safety/applicability/evidence gates;
14. clinical maturity remains explicit;
15. current browser/mobile/local exported files are not described as Jaanch-encrypted medical-record storage;
16. provider secrets never enter browser/mobile code;
17. AI remains explicit-consent/minimum-necessary and optional.

## 4. Implemented foundation

### M01–M09.1
Adaptive deterministic assessment, evidence graph, safety, applicability, investigations, normalized lab reassessment, recommendations, governance and verification.

### M13–M13.5
Local longitudinal snapshots, assessment-quality recovery, consumer Health Map, reviewed report evidence capture, bounded BP/lipids/anaemia-iron/thyroid interpretation, profile import/export + five mocks, versioned persistence/security architecture.

### M10/M10.1/M11
Optional privacy-minimized AI review infrastructure. Utility remains unproven; no further AI mission until consumer value is proven.

## 5. M13.6 implementation

Status:

> **ENGINEERING IMPLEMENTED — OWNER VALUE / UX RETEST REQUIRED**

Core:

```text
packages/core/src/healthBrief.ts
packages/core/src/recheck.ts
packages/core/src/verificationConsumerValue.ts
```

Web:

```text
apps/web/src/HealthBriefPanel.tsx
apps/web/src/LatestBriefScreen.tsx
apps/web/src/PortableHealthFileScreen.tsx
apps/web/src/App.tsx
apps/web/src/Root.tsx
apps/web/src/styles.css
```

### Health Intelligence Brief

Bounded deterministic theme synthesis:

```text
cardiometabolic
  MET-001 + CV-BP-001 + CV-LIPID-001

blood-nutrition
  NUT-001 + NUT-IRON-001

thyroid
  MET-THYROID-001

sleep
  SLP-001
```

Rules:
- max three visible priorities;
- urgent safety separate/dominant;
- low-risk output may have zero priority cards;
- no generic filler;
- severe TG can dominate as prompt clinician review without false emergency semantics;
- every priority shows what/why/evidence/action/what-can-wait/decision-changing evidence;
- detailed evidence/provenance/governance available behind details.

### Smart Recheck

`createSmartRecheckDraft(snapshot)`:
- sanitizes persisted answers;
- preserves stable captured context;
- converts normalized HbA1c/B12 back to raw LabRecords;
- reruns current eligibility/freshness logic;
- strips private/forged `__m134_*` evidence fields.

Web Quick Recheck:
- starts from latest saved check-in;
- stable history/medicines/supplements/family/evidence already loaded;
- initially emphasizes likely-to-change facts;
- focused routes for changed history/medicines/tests/lifestyle;
- deterministic change preview before save.

## 6. User-owned portable history is now a core product direction

The owner explicitly chose a **no-account / no Jaanch-backend-history** model for now.

Primary consumer navigation includes:

```text
My Jaanch file
```

Reuse existing `JAANCH-PROFILE-1.0` instead of creating a second format.

Flow:

```text
save check-in
→ export jaanch-health-YYYY-MM-DD.json
→ user keeps it in their own folder/storage
→ optional self-email if user accepts their email provider storing health info
→ next visit upload prior Jaanch file
→ included history restored locally
→ Quick Recheck reuses established facts
→ show what changed
→ export refreshed file
```

No name is required by Jaanch and the current continuity model does not require user management, remote DB or cloud sync.

Do **not** say “no privacy issues.” Correct product wording:
- Jaanch does not need backend custody of this file;
- the file itself can still contain sensitive health data/free text;
- user-selected storage/email providers are outside Jaanch custody/control.

Established facts should be reused rather than repeatedly asked.

Age caveat: integer age + previous timestamp does not reveal exact birthday. Carry prior age as a default and request correction/confirmation when materially stale; do not silently invent an exact current age.

## 7. Consumer navigation after M13.6

Primary:
- Latest Health Brief (when history exists);
- My Jaanch file;
- Import lab report.

Advanced / experimental:
- AI second opinion;
- Profiles & test mocks.

## 8. M13.6 verification

Root `npm run verify` includes deterministic checks for:
- <=3 priorities;
- quiet low-risk behavior;
- cardiometabolic cluster;
- B12 + iron/anaemia cluster;
- thyroid dominance + medication boundary;
- severe-TG dominance without emergency inflation;
- Smart Recheck stable-context preservation;
- normalized lab -> raw evidence rerun;
- internal evidence stripping;
- deterministic brief repeatability.

Existing profile verification covers versioned profile import/export and history-preserving export.

Important: full local `npm run verify` was **not executed in the implementation environment**. Do not claim it passed until run locally.

## 9. Immediate owner validation

Run:

```bash
git pull
npm install
npm run verify
npm run web
```

Then:
1. test all five mocks;
2. judge only first-screen brief initially;
3. save a check-in;
4. download My Jaanch file;
5. import it in a clean/test session;
6. verify history returns;
7. run Quick Recheck;
8. confirm stable facts are reused;
9. confirm what-changed preview is useful;
10. export refreshed file.

If still merely “okay”, fix M13.6 before expanding.

## 10. Conditional next

Only after M13.6 is convincingly useful:

**M13.7 — Report-First Intelligence + Friction Reduction — High**

Target:

```text
upload current report
+ optionally prior Jaanch file
→ structured extraction
→ verify uncertain/high-risk candidates
→ reuse established history
→ ask minimum missing context
→ Health Intelligence Brief
→ what changed since last time
→ export updated Jaanch file
```

No backend/user account is required unless a real future product need justifies it.

## 11. Frozen

Do not start without owner override:
- further AI expansion;
- mobile parity;
- cloud/auth/backend;
- M14 ChatGPT/MCP;
- M12 Rule Studio;
- broad clinical-domain expansion;
- M15A/M15B hardening.

## 12. Working rules

- Fix value/friction issues before architecture expansion.
- Prefer deletion/simplification over new surfaces.
- Preserve deterministic safety/evidence boundaries.
- Normal mission budget 1–2 coherent commits when practical.
- Do not add GitHub Actions unless requested.
- Do not restore `@jaanch/core: "workspace:*"`.
- Update mission docs, STATUS, ROADMAP and handover at closure.

North stars:

> **Does this materially improve what the user understands or can decide within 60 seconds?**

> **Can continuity work without Jaanch owning the user's health history?**
