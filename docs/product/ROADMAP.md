# Jaanch Roadmap

## Strategic Review 3 controlling decision

**CONTINUE WITH MAJOR CHANGES.**

The trust/evidence foundation remains valuable, but Jaanch must prove consumer value before more AI/platform/backend expansion.

Full review: `docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md`.

---

## Phase 1 — M13.6 Consumer Value Reset — ENGINEERING IMPLEMENTED

### M13.6 — Health Intelligence Brief + Smart Recheck + User-Owned History

Status: **OWNER VALUE / UX RETEST REQUIRED**  
Effort: **High**

Mission: `docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md`

Implemented:
1. one-screen Health Intelligence Brief;
2. maximum 1–3 deterministic priorities/themes;
3. cross-rule cardiometabolic and blood/nutrition synthesis;
4. every priority answers what/why/evidence/action/what-can-wait/what-could-change-the-view;
5. evidence completeness demoted from hero to detail;
6. AI/mocks moved behind Advanced / experimental;
7. Smart Recheck starts from latest saved state rather than blank state;
8. stable profile/history/medicine context persists;
9. likely-to-change facts shown first;
10. deterministic what-changed preview before save;
11. evidence/provenance/governance retained behind details;
12. consumer-accessible **My Jaanch file** export/import;
13. portable history reuses existing `JAANCH-PROFILE-1.0` rather than adding a redundant protocol;
14. no Jaanch account/backend/database is required for the portable-history workflow.

### Product model

Jaanch can remain a small frontend-first/free utility:

```text
use Jaanch
→ save check-in locally
→ download My Jaanch file
→ user stores it
→ next visit user uploads it
→ established facts/history restored locally
→ Quick Recheck asks what changed
→ new Health Brief + change insight
→ export updated file
```

No name is required. Backend health-history custody is not necessary for this product model.

Important: this reduces backend privacy exposure but does not make the file non-sensitive. Exported JSON may contain health information/free text and should be protected by the user.

### Established-fact reuse

Do not repeatedly ask stable questions simply because the browser session changed.

Reuse previous structured facts as defaults. Time-sensitive facts should be updated selectively.

Age caveat: previous integer age + timestamp does not reveal exact birthday, so carry it forward as a default and request correction/confirmation when materially stale rather than silently inventing an exact updated age.

### M13.6 value gate — OPEN

Across all five mocks, within ~10 seconds user should know:
- top concern;
- why;
- next action;
- next evidence.

Portable/repeat-use gate:
- user can export history;
- import restores it locally;
- stable facts are reused;
- unchanged recheck is materially faster;
- Jaanch explains what changed;
- updated history can be exported again.

---

## Phase 2 — M13.7 Report-First Intelligence — CONDITIONAL NEXT

Effort: **High**

Proceed only if M13.6 clearly improves value density.

Target journey:

```text
upload current lab report
+ optionally upload previous Jaanch file
        ↓
structured extraction
        ↓
verify uncertain / safety-critical candidates
        ↓
reuse established profile/history
        ↓
ask only minimum missing context
        ↓
Health Intelligence Brief
        ↓
“What changed since last time?”
        ↓
export updated Jaanch file
```

Goals:
- report-first users see value quickly;
- previous Jaanch history removes repetitive questions;
- provenance/unit/date/freshness/confirmation rules stay intact;
- no user account or remote health database required;
- local/user-owned file remains the continuity mechanism.

---

## Phase 3 — Consumer validation

Before pilot hardening, owner testing must answer yes to:
1. Would I actually use Jaanch again next month?
2. Does the first screen tell me something worth the input effort?
3. Can I repeat the key insight after closing the app?
4. Is repeat use easy?
5. Is report import easier than interpreting the report manually?
6. Does Jaanch prioritize instead of merely list abnormalities?
7. Does portable history make continuity feel natural without an account?

If not, continue product-value work rather than infrastructure work.

---

## Phase 4 — M15A Pilot Safety / Privacy / Release Gate

Blocked until consumer-value validation passes.

If the frontend-only/user-owned-history model remains sufficient, do **not** add authentication/backend merely because typical apps have them.

When eventually needed:
- qualified clinical review;
- intended-use/claim review;
- browser/file privacy guidance;
- accessibility;
- reproducible build/verification;
- telemetry policy only if telemetry is actually introduced;
- regulatory/jurisdiction review as appropriate.

---

## Frozen / conditional

- further AI expansion — FROZEN;
- mobile parity — FROZEN;
- cloud/auth/backend — FROZEN / may remain unnecessary;
- M14 ChatGPT/MCP — FROZEN;
- M12 Rule Studio — FROZEN;
- broad clinical-domain expansion — FROZEN;
- M15B store/production hardening — LATER.

---

## Product north stars

> **Does this materially improve what the user understands or can decide within 60 seconds?**

> **Can the user repeat the key insight after closing Jaanch?**

> **Does the output justify the information the user had to provide?**

> **Can continuity work without Jaanch owning the user's health history?**

For a new session, fetch current `main`, then read `HANDOVER_NEXT_SESSION.md`, STATUS, M13.6, SR3 and this roadmap.
