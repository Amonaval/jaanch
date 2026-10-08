# Clinical Source Governance

## Purpose
Jaanch separates **having a source** from **having an approved clinical rule**. This prevents a linked guideline or government page from being mistaken for validation of Jaanch's exact scoring, thresholds, wording, or recommendation behavior.

## Source record requirements
Every registered clinical source must have:
- stable source ID;
- title;
- issuing body;
- HTTPS URL;
- evidence/source type;
- population/applicability statement;
- applicability notes;
- current/superseded/unknown source status;
- review status;
- last verification date;
- publication/version metadata where available.

## Review lifecycle
### captured
The source was identified and its relevance recorded. This is the current state of M06 source records.

### reviewed
A qualified reviewer has assessed whether Jaanch's use of the source is faithful to its scope, population and limitations.

### approved
The governed rule or investigation mapping is approved for its explicitly defined production use.

No maturity promotion is automatic.

## Artifact maturity
Rules and investigation mappings have independent maturity:
- `prototype`
- `reviewed`
- `approved`

A prototype rule may cite an excellent source and still remain prototype because Jaanch's own implementation may be simplified, incomplete or use additional heuristics.

## Current important caveats
- The metabolic score is a Jaanch prototype heuristic; it is not the ADA screening algorithm. In particular, ancestry-specific BMI thresholds are not yet encoded.
- The B12 rule uses a prototype serum cutoff and simplified questionnaire signals; B12 deficiency definitions and confirmatory evaluation can vary.
- The sleep rule is a screening signal only and does not diagnose obstructive sleep apnea.
- The chest-pain rule is deliberately conservative escalation logic and does not diagnose a heart attack.

## Runtime guarantees
- Unknown source IDs fail registry/rule/investigation validation.
- Broken source references fail assessment rather than silently dropping provenance.
- HAP/assessment output retains rule maturity and source IDs.
- Consumer-facing UX must not describe `captured` sources as clinician approval.

## Source maintenance
At future release hardening, sources should be periodically checked for superseding guidance, changed URLs, withdrawals, altered population scope and version changes. A source update does not automatically change a rule; rule revisions remain separately versioned and reviewed.
