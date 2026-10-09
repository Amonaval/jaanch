import { assertCoreVerification } from './verification';
import { assertPresentationVerification } from './verificationPresentation';
import { assertRecommendationVerification } from './verificationRecommendations';

const core = assertCoreVerification();
const presentation = assertPresentationVerification();
const recommendations = assertRecommendationVerification();
for (const result of [...core, ...presentation, ...recommendations]) console.log(`PASS ${result.id}`);
console.log(`Verification passed: ${core.length + presentation.length + recommendations.length}/${core.length + presentation.length + recommendations.length}`);
