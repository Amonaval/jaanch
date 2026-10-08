# M02 — Adaptive Question Planner v1

## Goal
Turn the questionnaire from static visibility rules into a deterministic planner that asks high-information baseline questions first, activates only relevant domains, explains why a follow-up is being asked, and stops when no eligible unanswered questions remain.

## Delivered
- Domain activation model for metabolic, cardiovascular, nutrition, sleep, activity, and safety.
- Ranked question planning with master-question and safety priority boosts.
- Deterministic `nextQuestion` selection.
- Generic skip / don't-know state.
- Traceable `whyAsked` reasons derived from domain activation and dependencies.
- Shared planner used by both React Native and React web.
- Mobile numeric input and multi-select support added so the mobile-first flow can complete baseline questions.

## Boundaries
- Planner decides what to ask, not what diagnosis exists.
- Clinical findings remain in the assessment engine until M03 moves them into versioned rules.
- Safety escalation remains minimal until M06 Safety Gate.

## Acceptance criteria
1. Master questions rank before ordinary adaptive follow-ups.
2. Safety clarification outranks non-safety follow-ups when activated.
3. Inactive-domain questions are not planned.
4. Every adaptive question carries a human-readable reason.
5. Skipped questions count as completed but never as supporting clinical evidence.
6. Mobile and web consume the same planner API.

Status: COMPLETE
Effort: Medium
