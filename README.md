# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention prototype.

It captures health context, separates facts from inference/uncertainty, applies deterministic safety/applicability/evidence gates, supports measured/report evidence, longitudinal check-ins, bounded clinical interpretation and an optional privacy-minimized AI second pass.

> Jaanch is a development prototype, not a medical device, diagnosis service or replacement for a clinician. Current clinical rules remain `prototype` unless explicitly promoted by qualified review. Current browser/mobile local storage is not application-layer encrypted medical-record storage.

---

## Strategic Review 3 — current product decision

SR3 reviewed Jaanch as a skeptical consumer rather than as its engineer.

Decision:

> **CONTINUE WITH MAJOR CHANGES — pause feature expansion and reset the consumer experience.**

Full review:

```text
docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md
```

SR3 concluded that the trust/evidence architecture is strong, but the visible product is not yet “very good” and does not consistently create a wow moment.

Product-review scores included:

| Area | Score / 10 |
|---|---:|
| Safety / evidence integrity | 8.5 |
| Deterministic architecture | 8.0 |
| Immediate user value | 4.5 |
| Personalization depth | 4.0 |
| Ease / friction | 3.5 |
| Longitudinal pull | 2.5 |
| Wow factor | 2.5 |

Current milestone:

> **Trustworthy alpha foundation — consumer-value reset required before pilot work.**

---

## Main SR3 findings

### 1. Too much architecture, too little compression
The current Health Map exposes many cards, counters, evidence gaps and trace details. The product should instead synthesize the first screen into 1–3 memorable health priorities.

### 2. Actions are safe but often obvious
Advice such as exercise more, improve eating pattern, repeat BP or discuss abnormal labs is responsible but not sufficiently differentiated. Jaanch needs cross-signal decision synthesis.

### 3. Repeat-use UX undermines longitudinal value
`Start new check-in` currently resets the profile. Returning users should begin from their latest saved profile and answer only what changed.

### 4. Report-first use is cumbersome
Current report import preserves provenance well, but requires a saved baseline plus pasted OCR/text and candidate review before value appears.

### 5. AI engineering is ahead of proven AI value
M10/M10.1/M11 remain useful experimental infrastructure, but further AI expansion is frozen until the core consumer result becomes genuinely useful.

---

# NEXT — M13.6

## Consumer Value Reset: Health Intelligence Brief + Smart Recheck

Effort: **High**

Mission doc:

```text
docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md
```

Required outcomes:

1. One-screen **Health Intelligence Brief**.
2. Maximum 1–3 health priorities/themes.
3. Deterministic cross-rule synthesis when multiple signals belong to one health priority.
4. Every priority answers:
   - what Jaanch sees;
   - why it matters to this person;
   - evidence chain;
   - next best action;
   - what can wait;
   - what evidence could change the conclusion.
5. Evidence-completeness percentage demoted from hero metric.
6. Profiles & mocks / protocol / runtime-debug surfaces moved out of primary consumer navigation.
7. **Smart Recheck** starts from latest saved profile instead of blank state.
8. Stable profile/history/medicine context retained.
9. Concise “what changed” preview before saving.
10. Evidence/provenance stays available behind detail.
11. AI v2 remains optional and cannot define the core Health Brief.

M13.6 exit gate: on each of the five mocks, a user should understand within 10 seconds **what matters, why, what to do next and what evidence matters next**.

---

## After M13.6

### M13.7 — Report-First Intelligence + Friction Reduction

Target journey:

```text
Upload report
  → structured extraction
  → verify uncertain / safety-critical fields
  → ask minimum missing context
  → Health Intelligence Brief
```

Only after M13.6/M13.7 owner testing says **“I would actually use this again”** should pilot/production infrastructure resume.

---

## Frozen until consumer-value gates pass

- further AI missions;
- mobile parity work;
- cloud/auth/backend;
- M14 ChatGPT/MCP;
- M12 Rule Studio;
- broad clinical-domain expansion;
- M15A pilot hardening;
- M15B store/production hardening.

---

## Existing foundation that remains valuable

Engineering is implemented through M11 and M13.5, including:

- adaptive deterministic assessment;
- evidence graph;
- rule/source governance;
- safety and applicability gates;
- prioritized investigations;
- normalized HbA1c/B12 reassessment;
- bounded BP/lipid/haemoglobin/ferritin/TSH interpretation;
- conservative recommendations;
- report candidate/provenance/review flow;
- local longitudinal snapshots/comparison;
- profile import/export + five synthetic mocks;
- versioned persistence/security contracts;
- M10/M11 privacy-minimized AI review infrastructure.

The next phase should reuse these foundations rather than expand them.

---

## Current clinical boundaries

Supported bounded prototype interpretation includes:
- metabolic screening;
- B12/nutrition;
- sleep;
- chest-pain red-flag escalation;
- blood pressure;
- lipids;
- anaemia/iron status;
- thyroid evidence.

Important constraints:
- one measurement is not automatically a diagnosis;
- missing unit/date/source is not guessed;
- no autonomous prescription-medication changes;
- no autonomous therapeutic iron/thyroid/lipid/high-dose supplement regimen;
- unsupported contexts remain not-assessed/recorded rather than silently inferred.

---

# Run locally

Prerequisites:
- Node.js **22.13+**
- npm 10+ recommended

```bash
git clone https://github.com/Amonaval/jaanch.git
cd jaanch
npm install
npm run verify
npm run web
```

Existing checkout:

```bash
git pull
npm install
npm run verify
npm run web
```

Mobile development remains available but is frozen as a roadmap priority:

```bash
npm run mobile:fix
npm run doctor:mobile
npm run mobile
```

---

## Optional AI review development

AI is not required for core Jaanch.

Copy `.env.example` to `.env.local` and configure server-side values only:

```text
JAANCH_AI_LIVE_ENABLED=true
OPENAI_API_KEY=<your-key>
JAANCH_AI_MODEL=<configured model>
```

Commands:

```bash
npm run ai:gate
npm run ai:gate:v2
```

The current Vite AI middleware is development/preview infrastructure, not a production authenticated health-data API.

---

## Product north stars after SR3

> **Does this materially improve what the user understands or can decide within 60 seconds?**

> **Can the user repeat the key insight to another person after closing Jaanch?**

> **Does the output justify the amount of information the user had to provide?**

For a fresh development session, start with `HANDOVER_NEXT_SESSION.md` and the SR3 review.
