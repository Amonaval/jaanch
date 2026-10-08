import type { Answers, AssessmentResult } from './types';

export type HealthAssessmentPacket = {
  protocol: 'HAP-1.0';
  generatedAt: string;
  purpose: 'screening_and_prevention';
  answers: Answers;
  engineAssessment: AssessmentResult;
  requiredAIOutput: {
    schemaVersion: 'AI-ASSESSMENT-1.0';
    confidenceScale: ['low', 'moderate', 'high'];
    mustSeparate: ['observed_facts', 'inferences', 'missing_evidence', 'actions'];
  };
};

export function createHap(answers: Answers, result: AssessmentResult): HealthAssessmentPacket {
  return {
    protocol: 'HAP-1.0',
    generatedAt: new Date().toISOString(),
    purpose: 'screening_and_prevention',
    answers,
    engineAssessment: result,
    requiredAIOutput: {
      schemaVersion: 'AI-ASSESSMENT-1.0',
      confidenceScale: ['low', 'moderate', 'high'],
      mustSeparate: ['observed_facts', 'inferences', 'missing_evidence', 'actions'],
    },
  };
}
