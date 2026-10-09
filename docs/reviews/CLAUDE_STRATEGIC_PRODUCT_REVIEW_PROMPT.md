# Jaanch — Strategic Product Review Prompt for Claude

You are reviewing **Jaanch**, an existing health product in:

```text
Amonaval/jaanch
```

Do **not** start coding.

First inspect the repository and think independently about what this product should become.

Do not assume the current roadmap, architecture, UX, AI approach, or even the current product identity is correct.

Your role is a combination of:
- skeptical consumer;
- product founder;
- UX/product strategist;
- health/safety critic;
- AI architect;
- privacy/architecture reviewer.

The goal is not incremental improvement. The goal is to decide whether Jaanch has a strong product thesis and what should happen next.

---

## 1. Original idea

People have scattered health information:
- symptoms;
- family history;
- lifestyle;
- medicines/supplements;
- measurements;
- lab reports;
- previous reports over time.

They often search values individually, ask an LLM isolated questions, or fail to connect signals across time.

Jaanch was created to help answer:

```text
What matters?
Why?
What is uncertain?
What should I do next?
What evidence is actually missing?
What changed since last time?
What can safely wait?
```

It was intentionally **not designed as an AI diagnosis chatbot**.

Core principle:

```text
fact ≠ inference ≠ screening signal ≠ diagnosis ≠ treatment
```

---

## 2. Important safety philosophy

Current product boundaries include:
- questionnaire signals are not diagnoses;
- one measurement is not automatically a diagnosis;
- confidence is not disease probability;
- no generic overall health score;
- evidence completeness is not health status;
- missing unit/date/source is never guessed;
- extracted report values require appropriate verification;
- prescription medication changes are never autonomous;
- therapeutic iron/thyroid/lipid/high-dose supplement regimens are not autonomous;
- urgent red flags override routine advice;
- applicability/evidence eligibility matter before interpretation;
- AI cannot override deterministic safety boundaries.

Preserve these unless you have a strong reason to challenge one.

---

## 3. What exists today

The repository already contains substantial engineering:

### Deterministic health engine
- adaptive questionnaire;
- evidence graph;
- observed / derived / missing evidence;
- safety gates;
- applicability policies;
- evidence/test prioritization;
- recommendation logic;
- source/governance metadata.

### Bounded clinical interpretation
Currently includes prototype-level interpretation around:
- metabolic screening;
- B12/nutrition;
- sleep;
- blood pressure;
- lipids;
- haemoglobin/ferritin / iron context;
- thyroid/TSH;
- selected safety red flags.

### Evidence/report infrastructure
- lab normalization;
- unit/date/freshness/verification checks;
- report evidence candidates;
- explicit review before use;
- reassessment after trusted evidence arrives.

### Longitudinal infrastructure
- saved check-ins;
- comparison between snapshots;
- changes in findings/labs/recommendations;
- Smart Recheck from latest saved state.

### Consumer experience
M13.6 introduced a **Health Intelligence Brief** that compresses results into at most 1–3 priorities rather than a large card wall.

Each priority tries to answer:
- what Jaanch sees;
- why it matters;
- next action;
- what can wait;
- what evidence could change the conclusion.

Low-risk cases are allowed to stay quiet rather than generating wellness filler.

### AI infrastructure
M10/M11 created optional privacy-minimized AI review with structured output and safety validation.

Its actual consumer value remains unproven.

### User-owned history
The newest direction avoids accounts/backend for now.

The user can export a versioned Jaanch file containing their runnable profile/history, keep it themselves, and upload it next time.

Conceptually:

```text
Use Jaanch
→ get brief
→ save check-in
→ export Jaanch file
→ user stores it

next visit:
old Jaanch file + new report
→ restore established context
→ ask only what changed / is missing
→ compare
→ new brief
→ export refreshed file
```

No name/account/backend is required for continuity.

The file itself can still contain sensitive health data, so do not confuse “no backend custody” with “no privacy risk.”

---

## 4. What went wrong strategically

After many missions, we performed a harsh review.

Engineering quality was ahead of product quality.

Approximate SR3 scores:

```text
Safety/evidence integrity     8.5/10
Architecture                  8/10
Immediate user value         4.5/10
Personalization              4/10
Actionability                5/10
Ease/friction                3.5/10
Longitudinal pull            2.5/10
Differentiation              4/10
Wow factor                   2.5/10
```

The central problem was:

> Jaanch was better at showing everything it knew than telling the user the one or two things that really mattered.

Example: BP, waist, HbA1c, LDL, triglycerides and family history could appear as several correct cards, while the user still had to mentally realize they form one cardiometabolic priority.

M13.6 improved this, but we have **not proven the product is now compelling**.

---

## 5. Current unresolved product problem

The bar is not “correct software.”

The bar is:

> Would a normal person voluntarily use Jaanch again because it helped them understand something important faster/better than Google, ChatGPT, Claude, or their lab portal?

Potential genuine value moments could include:
- connecting seemingly separate health signals;
- reducing 15 abnormalities to the 1–2 that matter;
- distinguishing numerical change from decision-changing change;
- telling the user what **not** to worry about yet;
- identifying the smallest missing evidence that would actually change the conclusion;
- comparing reports over time meaningfully;
- preparing a concise doctor conversation.

Do not assume these are the right moat. Evaluate them.

---

## 6. Biggest missing experience

Report-first usage is still too cumbersome.

The desired direction has been:

```text
upload previous Jaanch file (optional)
+
upload current lab/report
→ extract structured evidence
→ verify only uncertain / safety-critical items
→ reuse established facts
→ ask minimum missing context
→ explain what changed
→ Health Intelligence Brief
→ export updated Jaanch file
```

This is currently considered the possible next direction (M13.7), but **do not assume it is correct**.

---

## 7. Questions I want you to answer

### Product identity
What should Jaanch fundamentally be?

Possibilities include:
- health assessment;
- report interpreter;
- longitudinal health/change detector;
- health decision compressor;
- preventive-health companion;
- doctor-visit preparation tool;
- portable personal health state;
- something else.

Choose the sharpest job-to-be-done.

### Wow factor
Why is the product still not obviously “wow”?

What exact user moment could create real pull?

### First-time user
What is the strongest entry point?

Should it start with:
- questionnaire;
- upload report;
- build baseline;
- something else?

### Returning user
Assume the user has:
- a previous Jaanch file;
- a new health report.

Design the ideal repeat flow.

What should Jaanch already know?
What should it ask again?
What should it never make the user re-enter unnecessarily?

### Change intelligence
Could Jaanch's strongest value be:

> “What changed, and does that change a decision?”

Explore this deeply.

A value changing numerically is not always clinically/decision-relevant.

### Evidence minimization
Could “the smallest useful next evidence” become a signature capability?

Instead of recommending many tests, Jaanch could identify the one missing piece most likely to change the interpretation.

### What can wait
Most health tools tell users what to do.

Could Jaanch differentiate by clearly saying:

> These issues are lower priority right now.

Evaluate this.

### AI
We may have overbuilt AI before proving utility.

Decide the correct AI role:
- none;
- report extraction only;
- explanation only;
- second opinion;
- bounded reasoning on top of structured evidence;
- broader clinical synthesis with deterministic safety validation;
- something else.

### Deterministic engine
Is the deterministic engine:
- the core moat;
- necessary safety infrastructure;
- too rigid;
- too expensive to scale;
- or best used only for specific boundaries while AI does more reasoning?

Recommend the right architecture.

### User-owned history
Critically evaluate the no-account / no-backend model.

Does it improve trust/simplicity enough to become part of the product identity?

Is portable JSON good enough?
Should there eventually be another format or optional protection?
When, if ever, would backend/cloud continuity become justified?

### Competitive substitution
The most important competitor may simply be:

```text
Upload my lab report to ChatGPT/Claude.
```

Why should Jaanch exist instead?

If there is no convincing answer, say so.

---

## 8. Inspect the repo instead of relying only on this prompt

Start with current `main` and inspect at least:

```text
docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md
HANDOVER_NEXT_SESSION.md

packages/core/src/healthBrief.ts
packages/core/src/recheck.ts
packages/core/src/longitudinal.ts
packages/core/src/profileBundle.ts
packages/core/src/resultView.ts
packages/core/src/aiReviewV2.ts
packages/core/src/m134Rules.ts

apps/web/src/App.tsx
apps/web/src/HealthBriefPanel.tsx
apps/web/src/LatestBriefScreen.tsx
apps/web/src/PortableHealthFileScreen.tsx
apps/web/src/ReportImportScreen.tsx
```

Inspect other code where relevant.

Do not rely on sunk cost.

---

## 9. Be willing to recommend radical change

You may conclude that Jaanch should:
- narrow dramatically;
- pivot to report-first;
- center on longitudinal change;
- become mostly deterministic;
- become more AI-driven;
- keep portable files as a key differentiator;
- abandon parts of the current architecture;
- or even stop if the value proposition is not strong enough.

Do not protect previous work merely because it exists.

Classify major existing pieces as:

```text
KEEP
REFINE
HIDE
PARK
DELETE
REBUILD
```

---

## 10. Output I want from you

Do **not** code yet.

Return:

### 1. Executive verdict
What Jaanch really is today and whether the thesis is promising.

### 2. Why it is not wow yet
Rank the top causes.

### 3. Sharpest job-to-be-done
One sentence.

### 4. Strongest product direction
Give 2–3 genuinely different futures, compare them, then choose one.

### 5. Why Jaanch beats—or fails to beat—ChatGPT/Claude
Be specific.

### 6. Ideal first-time experience
Step by step.

### 7. Ideal returning-user experience
Especially old Jaanch file + new report + what changed.

### 8. Correct AI vs deterministic split
Recommend the architecture.

### 9. What to keep / remove / stop building
Include an anti-roadmap.

### 10. Next single mission
Only one mission, with:
- objective;
- 3–5 user-visible subgoals;
- explicit non-goals;
- measurable exit criteria.

---

## Final decision standard

Judge every idea using:

```text
Does it improve what the user understands?
Does it change or clarify a decision?
Does it reduce effort?
Does it reduce uncertainty?
Does it create repeat value?
Does it beat simply asking a general LLM?
Does it justify its complexity?
```

The final bar is:

> Would someone tell another person: “Use Jaanch for this — it actually tells you what matters.”

If not, the product still needs a stronger thesis.