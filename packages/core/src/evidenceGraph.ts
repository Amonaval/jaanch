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
