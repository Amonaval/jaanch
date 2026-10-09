import { assertAIReviewVerification } from './verificationAI';
import { assertCoreVerification } from './verification';
import { assertPresentationVerification } from './verificationPresentation';
import { assertRecommendationVerification } from './verificationRecommendations';

const core = assertCoreVerification();
const presentation = assertPresentationVerification();
const recommendations = assertRecommendationVerification();
const ai = assertAIReviewVerification();
for (const result of [...core, ...presentation, ...recommendations, ...ai]) console.log(`PASS ${result.id}`);
console.log(`Verification passed: ${core.length + presentation.length + recommendations.length + ai.length}/${core.length + presentation.length + recommendations.length + ai.length}`);
