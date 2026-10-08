import type { EvidenceEdge, EvidenceGraph, EvidenceNode, Finding } from './types';

export const emptyEvidenceGraph = (): EvidenceGraph => ({ nodes: [], edges: [] });

function sameNode(a: EvidenceNode, b: EvidenceNode) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function mergeEvidenceGraph(base: EvidenceGraph, nodes: EvidenceNode[], edges: EvidenceEdge[]): EvidenceGraph {
  const nodeMap = new Map(base.nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    const existing = nodeMap.get(node.id);
    if (existing && !sameNode(existing, node)) {
      throw new Error(`Evidence node collision with different payload: ${node.id}`);
    }
    nodeMap.set(node.id, node);
  }

  const edgeMap = new Map(base.edges.map((edge) => [`${edge.evidenceId}|${edge.findingId}|${edge.relation}`, edge]));
  for (const edge of edges) edgeMap.set(`${edge.evidenceId}|${edge.findingId}|${edge.relation}`, edge);

  return { nodes: [...nodeMap.values()], edges: [...edgeMap.values()] };
}

export function enrichEvidenceProvenance(nodes: EvidenceNode[], ruleId: string, ruleVersion: string): EvidenceNode[] {
  return nodes.map((node) => ({
    ...node,
    provenance: { ...node.provenance, ruleId, ruleVersion },
  }));
}

export function evidenceForFinding(graph: EvidenceGraph, finding: Finding) {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((node): node is EvidenceNode => Boolean(node));
  return {
    supporting: pick(finding.supportingEvidenceIds),
    contradicting: pick(finding.contradictingEvidenceIds),
    missing: pick(finding.missingEvidenceIds),
  };
}

export function validateEvidenceGraph(graph: EvidenceGraph, findings: Finding[]): string[] {
  const errors: string[] = [];
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const findingIds = new Set(findings.map((finding) => finding.id));
  const edgeKeys = new Set(graph.edges.map((edge) => `${edge.evidenceId}|${edge.findingId}|${edge.relation}`));

  for (const edge of graph.edges) {
    if (!nodes.has(edge.evidenceId)) errors.push(`Edge references missing evidence node: ${edge.evidenceId}`);
    if (!findingIds.has(edge.findingId)) errors.push(`Edge references missing finding: ${edge.findingId}`);
  }

  for (const node of graph.nodes) {
    if (node.kind === 'derived') {
      if (!node.provenance.derivation) errors.push(`Derived evidence lacks derivation: ${node.id}`);
      if (!node.derivedFromIds?.length) errors.push(`Derived evidence lacks parent nodes: ${node.id}`);
      for (const parentId of node.derivedFromIds ?? []) if (!nodes.has(parentId)) errors.push(`Derived evidence ${node.id} references missing parent: ${parentId}`);
    }
    if (node.kind === 'missing' && node.sourceType !== 'missing') errors.push(`Missing evidence has invalid source type: ${node.id}`);
  }

  const checkRefs = (finding: Finding, ids: string[], relation: EvidenceEdge['relation']) => {
    for (const id of ids) {
      if (!nodes.has(id)) errors.push(`${finding.id} references missing evidence node: ${id}`);
      if (!edgeKeys.has(`${id}|${finding.id}|${relation}`)) errors.push(`${finding.id} lacks ${relation} edge for evidence: ${id}`);
    }
  };

  for (const finding of findings) {
    checkRefs(finding, finding.supportingEvidenceIds, 'supports');
    checkRefs(finding, finding.contradictingEvidenceIds, 'contradicts');
    checkRefs(finding, finding.missingEvidenceIds, 'missing_for');
  }
  return errors;
}

export function assertEvidenceGraph(graph: EvidenceGraph, findings: Finding[]) {
  const errors = validateEvidenceGraph(graph, findings);
  if (errors.length) throw new Error(`Invalid evidence graph: ${errors.join(' | ')}`);
}

export function evidenceGraphSummary(graph: EvidenceGraph) {
  return {
    observed: graph.nodes.filter((node) => node.kind === 'observed').length,
    derived: graph.nodes.filter((node) => node.kind === 'derived').length,
    missing: graph.nodes.filter((node) => node.kind === 'missing').length,
    supports: graph.edges.filter((edge) => edge.relation === 'supports').length,
    contradicts: graph.edges.filter((edge) => edge.relation === 'contradicts').length,
    missingFor: graph.edges.filter((edge) => edge.relation === 'missing_for').length,
  };
}
