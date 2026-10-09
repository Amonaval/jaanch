# Jaanch Roadmap

## Strategic Review 3 decision

**CONTINUE WITH MAJOR CHANGES.**

The core trust/evidence architecture is worth keeping, but Jaanch is not yet compelling enough for pilot hardening or further feature expansion.

SR3 found a material gap between engineering maturity and consumer value:

- safety/evidence integrity is strong;
- the visible experience is too laborious;
- results are too card-heavy and weakly synthesized;
- repeat use is too expensive because new check-ins reset the profile;
- report-first use is cumbersome;
- AI sophistication is ahead of proven AI usefulness.

Full review: `docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md`.

Current milestone:

> **Trustworthy alpha foundation — consumer-value reset required before pilot work.**

---

## Phase 1 — M13.6 Consumer Value Reset — NEXT

### M13.6 — Health Intelligence Brief + Smart Recheck

Effort: **High**

Mission: `docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md`

Build no broad new clinical scope. Use the existing engine better.

Required outcomes:

1. One-screen **Health Intelligence Brief** instead of a long card wall.
2. Maximum 1–3 health priorities/themes.
3. Deterministic cross-rule synthesis when multiple findings belong to one priority cluster.
4. Every priority answers:
   - what Jaanch sees;
   - why it matters to this person;
   - which evidence supports it;
   - next best action;
   - what can wait;
   - what missing evidence could change the view.
5. Demote evidence-completeness percentage from hero metric.
6. Move Profiles & mocks / protocol / runtime-debug surfaces out of primary consumer navigation.
7. **Smart Recheck** starts from latest saved profile rather than blank state.
8. Stable profile/history/medicine context persists into a recheck.
9. Time-sensitive/incomplete fields receive attention first.
10. Preview what changed before saving.
11. Evidence/provenance remains available in expandable details.
12. AI v2 stays optional and cannot define the core brief.

### M13.6 value gate

Across all five mocks, a user should understand within 10 seconds:

- top concern;
- why;
- next action;
- next evidence.

Returning-user gate:

> A routine unchanged recheck must be substantially faster than first-time intake and must not require re-entering stable profile facts.

---

## Phase 2 — M13.7 Report-First Intelligence

Effort: **High**

Target journey:

```text
Upload report
   ↓
structured extraction
   ↓
verify only uncertain / safety-critical candidates
   ↓
ask minimum missing personal context
   ↓
Health Intelligence Brief
```

Goals:
- remove the requirement that report-first users manually build a full baseline before seeing value;
- evaluate trustworthy PDF/image extraction/OCR architecture;
- preserve provenance, units, dates, confirmation and eligibility gates;
- use confidence-based review rather than blindly accepting extraction;
- ask only the personal questions needed to interpret supported evidence.

---

## Phase 3 — Consumer validation

Before M15A, owner testing must answer **yes** to:

1. Would I actually use Jaanch again next month?
2. Does the first screen tell me something worth the input effort?
3. Can I explain my top Jaanch insight to another person after closing the app?
4. Is repeat use easy?
5. Is report import easier than manually interpreting the report myself?
6. Does Jaanch prioritize instead of merely list abnormalities?
7. Are safety boundaries useful rather than just verbose disclaimers?

If not, continue product-value work rather than infrastructure work.

---

## Phase 4 — M15A Pilot Safety / Privacy / Release Gate

**Blocked until consumer-value validation passes.**

When unblocked:
- qualified clinical review of supported rules;
- intended-use/claim review;
- privacy/consent/retention;
- threat model and encryption decisions;
- authenticated backend only if pilot needs it;
- delete/export behavior;
- AI production endpoint security only if AI survives value testing;
- accessibility;
- telemetry/error policy;
- reproducible verification/build gate;
- jurisdiction/regulatory review as appropriate.

---

## Frozen / conditional work

### Further AI expansion — FROZEN
M10/M10.1/M11 remain experimental infrastructure. No more AI mission until the core Health Brief is genuinely useful and live-model value is demonstrated.

Likely eventual role, if retained: one compact second-opinion/insight block embedded into the result rather than a parallel product surface.

### Mobile parity — FROZEN
Do not spend effort matching an experience that is not yet strong on web.

### Cloud/auth/backend — FROZEN
M13.5 contracts remain useful architecture. Do not connect sensitive remote persistence until product pull justifies cross-device continuity.

### M14 ChatGPT/MCP — FROZEN
Standalone value must be proven first.

### M12 Rule Studio — FROZEN
Rule-authoring infrastructure is not a consumer-value blocker.

### Broad clinical-domain expansion — FROZEN
Current supported domains must become excellent before breadth expansion.

### M15B Production/store hardening — LATER
Only after pilot readiness.

---

## What stays from completed work

### KEEP
- deterministic engine;
- evidence graph;
- safety/applicability;
- unit/date/freshness/verification boundaries;
- normalized lab + M13.4 measurement paths;
- report provenance/review contract;
- source governance;
- longitudinal snapshot/comparison engine;
- profile/persistence protocols;
- AI privacy/safety contracts as optional experimental infrastructure.

### DEMOTE / HIDE from consumer first layer
- evidence-completeness percentage;
- protocol/version names;
- provider/runtime traces;
- Profiles & mocks;
- raw captured-context wall;
- technical maturity/governance detail.

These remain available to developers/advanced details but should not define the consumer experience.

---

## Product north stars

### 60-second decision test

> **Does this materially improve what a user understands or can decide within 60 seconds?**

### Memorability test

> **Can the user repeat the key insight to a spouse or clinician after closing Jaanch?**

### Value-density test

> **Does the output justify the amount of information the user had to provide?**

Future work should fail the roadmap gate if it cannot answer these convincingly.

---

## Product maturity checkpoints

| Checkpoint | State |
|---|---|
| M01–M13.5 + M11 | strong technical/trust alpha foundation |
| SR3 | consumer value judged insufficient; reset required |
| M13.6 | Health Brief + Smart Recheck value gate |
| M13.7 | report-first friction/value gate |
| owner says “I would use this again” | consumer alpha value gate passed |
| M15A | controlled private-pilot candidate |
| M15B | production-candidate software, still dependent on clinical/legal/regulatory readiness |

For a new session, fetch current `main`, read `HANDOVER_NEXT_SESSION.md`, `docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md`, STATUS and this roadmap before implementation.
