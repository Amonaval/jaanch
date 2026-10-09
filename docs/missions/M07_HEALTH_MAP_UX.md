# M07 — Health Map UX v2 + Shared Presentation Model

## Goal
Keep clinical meaning and result prioritization identical across mobile and web while allowing each platform to render natively.

## Implemented
- Shared `buildHealthMapViewModel()` selector in `@jaanch/core`.
- Platform-neutral labels for finding status, urgency, confidence, evidence level, safety dispositions and investigation priority.
- Shared deterministic ordering for findings.
- Shared top-priority list capped at five items.
- Shared evidence grouping: supports / contradicts / missing.
- Shared safety-context and action-restriction summaries.
- Shared minimum-investigation and alternative-investigation grouping.
- Shared clinical-governance presentation metadata.
- Web and React Native results consume the same view model.
- Golden verification includes Health Map ordering, red-flag priority, safety restrictions and investigation presentation semantics.

## Design rules
1. Clinical meaning belongs in shared selectors, not React components.
2. Platform views may differ in layout, interaction and visual design.
3. A generic overall health score remains intentionally absent.
4. Top priorities are deterministic and derived from urgent signals, important findings and evidence-resolution actions.
5. User-facing investigation priority continues to mean uncertainty reduction, not medical necessity.

## Deferred
- Rich visualization / charts.
- Accessibility and design-system polish beyond current prototype.
- Clinician-specific presentation.
- Historical comparison; M08/M13 provide the data model first.

## Closure
M07 is complete when mobile and web can render the Health Map without independently translating clinical statuses, safety decisions, investigation tiers or priority ordering.
