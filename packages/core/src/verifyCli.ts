import { assertAIReviewVerification } from './verificationAI';
import { assertCoreVerification } from './verification';
import { assertPresentationVerification } from './verificationPresentation';
import { assertRecommendationVerification } from './verificationRecommendations';
import { assertLongitudinalVerification } from './verificationLongitudinal';

const core = assertCoreVerification();
const presentation = assertPresentationVerification();
const recommendations = assertRecommendationVerification();
const longitudinal = assertLongitudinalVerification();
const ai = assertAIReviewVerification();
const all = [...core, ...presentation, ...recommendations, ...longitudinal, ...ai];
for (const result of all) console.log(`PASS ${result.id}`);
console.log(`Verification passed: ${all.length}/${all.length}`);
