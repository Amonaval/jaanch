import type { RecommendationPlan } from './recommendations';
import type { Answers, AssessmentResult, NormalizedLabRecord } from './types';

export type HealthAssessmentPacket = {
  protocol: 'HAP-1.0';
  generatedAt: string;
  purpose: 'screening_and_prevention';
  answers: Answers;
  labEvidence?: NormalizedLabRecord[];
  recommendationPlan?: RecommendationPlan;
  engineAssessment: AssessmentResult;
  requiredAIOutput: {
    schemaVersion: 'AI-ASSESSMENT-1.0';
    confidenceScale: ['low', 'moderate', 'high'];
    mustSeparate: ['observed_facts', 'inferences', 'missing_evidence', 'actions'];
  };
};

export function createHap(answers: Answers, result: AssessmentResult, labEvidence?: NormalizedLabRecord[], recommendationPlan?: RecommendationPlan): HealthAssessmentPacket {
  return {
    protocol: 'HAP-1.0',
    generatedAt: new Date().toISOString(),
    purpose: 'screening_and_prevention',
    answers,
    ...(labEvidence?.length ? { labEvidence } : {}),
    ...(recommendationPlan ? { recommendationPlan } : {}),
    engineAssessment: result,
    requiredAIOutput: {
      schemaVersion: 'AI-ASSESSMENT-1.0',
      confidenceScale: ['low', 'moderate', 'high'],
      mustSeparate: ['observed_facts', 'inferences', 'missing_evidence', 'actions'],
    },
  };
}
