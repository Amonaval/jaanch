import type { EvidenceGraph, Finding, InvestigationDefinition, InvestigationPriority, TestPlan, TestRecommendation } from './types';
import { investigationCatalog, validateInvestigationCatalog } from './testRegistry';

const priorityRank: Record<InvestigationPriority, number> = {
  essential: 0,
  recommended: 1,
  optional: 2,
};

function priorityFor(findings: Finding[]): InvestigationPriority {
  if (findings.some((finding) => ['priority', 'clinician_review', 'urgent'].includes(finding.urgency))) return 'essential';
  if (findings.some((finding) => ['investigate', 'high_attention'].includes(finding.status))) return 'recommended';
  return 'optional';
}

function relatedFindingsForEvidence(findings: Finding[], evidenceIds: string[]) {
  const wanted = new Set(evidenceIds);
  return findings.filter((finding) => finding.missingEvidenceIds.some((id) => wanted.has(id)));
}

function buildRecommendation(definition: InvestigationDefinition, findings: Finding[], graph: EvidenceGraph): TestRecommendation | undefined {
  const nodeIds = new Set(graph.nodes.filter((node) => node.kind === 'missing').map((node) => node.id));
  const resolves = definition.resolvesEvidenceIds.filter((id) => nodeIds.has(id));
  if (!resolves.length) return undefined;

  const related = relatedFindingsForEvidence(findings, resolves);
  if (!related.length) return undefined;
  const missingLabels = resolves
    .map((id) => graph.nodes.find((node) => node.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  return {
    id: definition.id,
    title: definition.title,
    kind: definition.kind,
    priority: priorityFor(related),
    rationale: `Reduces uncertainty for ${missingLabels.join(', ')}; linked to ${related.map((finding) => finding.title).join(', ')}.`,
    relatedFindingIds: related.map((finding) => finding.id),
    resolvesEvidenceIds: resolves,
    alternativeGroup: definition.alternativeGroup,
    selectedForMinimalSet: false,
    maturity: definition.maturity,
    sourceIds: definition.sourceIds,
  };
}

function selectMinimalSet(recommendations: TestRecommendation[], definitions: InvestigationDefinition[], targetEvidenceIds: string[]) {
  const definitionById = new Map(definitions.map((item) => [item.id, item]));
  const uncovered = new Set(targetEvidenceIds);
  const selected = new Set<string>();
  const usedAlternativeGroups = new Set<string>();

  const sorted = [...recommendations].sort((a, b) => {
    const p = priorityRank[a.priority] - priorityRank[b.priority];
    if (p) return p;
    return (definitionById.get(b.id)?.utility ?? 0) - (definitionById.get(a.id)?.utility ?? 0);
  });

  while (uncovered.size) {
    const candidate = sorted.find((item) => {
      if (selected.has(item.id)) return false;
      if (item.alternativeGroup && usedAlternativeGroups.has(item.alternativeGroup)) return false;
      return item.resolvesEvidenceIds.some((id) => uncovered.has(id));
    });
    if (!candidate) break;

    selected.add(candidate.id);
    if (candidate.alternativeGroup) usedAlternativeGroups.add(candidate.alternativeGroup);
    for (const id of candidate.resolvesEvidenceIds) uncovered.delete(id);
  }

  return { selected, uncovered: [...uncovered] };
}

export function buildTestPlan(graph: EvidenceGraph, findings: Finding[], redFlags: string[], catalog = investigationCatalog): TestPlan {
  const validationErrors = validateInvestigationCatalog(catalog);
  if (validationErrors.length) throw new Error(`Invalid investigation catalog: ${validationErrors.join(' | ')}`);

  if (redFlags.length) {
    return {
      recommendations: [],
      minimalSetIds: [],
      uncoveredEvidenceIds: [],
      blockedReason: 'Urgent red-flag evidence is active; routine screening/test prioritization is suppressed until appropriate medical evaluation.',
    };
  }

  const targetEvidenceIds = [...new Set(findings.flatMap((finding) => finding.missingEvidenceIds))];
  const recommendations = catalog
    .map((definition) => buildRecommendation(definition, findings, graph))
    .filter((item): item is TestRecommendation => Boolean(item));

  const { selected, uncovered } = selectMinimalSet(recommendations, catalog, targetEvidenceIds);
  const withSelection = recommendations
    .map((item) => ({ ...item, selectedForMinimalSet: selected.has(item.id) }))
    .sort((a, b) => {
      if (a.selectedForMinimalSet !== b.selectedForMinimalSet) return a.selectedForMinimalSet ? -1 : 1;
      const p = priorityRank[a.priority] - priorityRank[b.priority];
      return p || a.title.localeCompare(b.title);
    });

  return {
    recommendations: withSelection,
    minimalSetIds: withSelection.filter((item) => item.selectedForMinimalSet).map((item) => item.id),
    uncoveredEvidenceIds: uncovered,
  };
}
