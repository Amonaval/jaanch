import { assertCoreVerification } from './verification';

const results = assertCoreVerification();
for (const result of results) console.log(`PASS ${result.id}`);
console.log(`Core verification passed: ${results.length}/${results.length}`);
