import { assertCoreVerification } from './verification';
import { assertPresentationVerification } from './verificationPresentation';

const core = assertCoreVerification();
const presentation = assertPresentationVerification();
for (const result of [...core, ...presentation]) console.log(`PASS ${result.id}`);
console.log(`Verification passed: ${core.length + presentation.length}/${core.length + presentation.length}`);
