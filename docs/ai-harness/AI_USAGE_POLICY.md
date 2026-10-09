# AI Usage Policy

## Principle
AI is optional and advisory. The deterministic Jaanch core remains the source of truth for sequencing, evidence state, configured safety rules and auditable findings.

## Permitted uses
- review a privacy-minimized Health Assessment Packet projection;
- explain deterministic findings in clearer language without changing their meaning;
- identify contradictions or missing considerations;
- challenge possible false-positive/false-negative candidates;
- prioritize unresolved evidence gaps;
- draft rule changes for later human review;
- translate or simplify user-facing explanations.

## Prohibited uses
- autonomously modify production clinical rules;
- fabricate symptoms, diagnoses, measurements, medicines, family history or test results;
- suppress or override deterministic red flags;
- create findings for contexts marked not assessed/not applicable;
- treat stale/unverified/future-dated lab values as current evidence;
- prescribe, start, stop or alter prescription medicines;
- generate therapeutic/high-dose supplement regimens unless an explicitly approved rule and all safety gates permit it;
- write directly into the user's verified medical history from model output.

## External data minimization
The externally shared AI packet must contain only fields necessary for the requested review. Internally stored HAP content may be richer than the packet sent to an AI provider.

The runtime should preserve:
- packet/schema version;
- harness version;
- provider/model identifier;
- deterministic assessment version/context;
- timestamps needed for audit;
- consent/data-sharing decision where applicable.

## Evaluation gate
AI is not considered valuable merely because it produces fluent output. Before engine-vs-AI reconciliation expands, evaluation should demonstrate meaningful incremental value over deterministic output, such as:
- detecting a contradiction the engine missed;
- surfacing a material missing consideration;
- challenging a plausible false positive or false negative;
- improving explanation without semantic drift;
- improving evidence-gap prioritization.

If the AI adds no material value, deterministic output should remain unchanged and the system should avoid inventing novelty.

## Rule-authoring workflow
AI proposal → draft schema validation → automated scenario tests → source review → clinical review → approval → versioned production rule.

AI-generated content never skips those stages.
