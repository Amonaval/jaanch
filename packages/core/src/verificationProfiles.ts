import { addSnapshot, emptyLongitudinalHistory } from './longitudinal';
import { createProfileBundle, decodeProfileBundle, encodeProfileBundle, profileBundleFromHistory, runProfileBundle } from './profileBundle';
import { mockProfileBundles } from './mockProfiles';
import type { VerificationCaseResult } from './verification';

const check=(id:string,condition:boolean,details:string):VerificationCaseResult=>({id,passed:condition,details:condition?undefined:details});

export function runProfileVerification():VerificationCaseResult[]{
 const results:VerificationCaseResult[]=[];
 results.push(check('profile-mocks-available',mockProfileBundles.length>=5,'Expected at least five importable mock profiles.'));
 const sample=mockProfileBundles[1];
 const encoded=encodeProfileBundle(sample); const decoded=decodeProfileBundle(encoded);
 results.push(check('profile-json-roundtrip',decoded.protocol==='JAANCH-PROFILE-1.0'&&decoded.id===sample.id&&decoded.draft.capturedContext.recordedMeasurements.length===sample.draft.capturedContext.recordedMeasurements.length,'Expected profile JSON to round-trip through the versioned protocol.'));
 const run=runProfileBundle(decoded,'2026-10-09T00:00:00.000Z');
 results.push(check('profile-import-reruns-current-engine',run.snapshot.assessment.findings.some(item=>item.id==='CV-BP-001')&&run.snapshot.assessment.findings.some(item=>item.id==='CV-LIPID-001'),'Expected an imported cardiometabolic mock to run through the current M13.4 engine.'));
 const history=addSnapshot(emptyLongitudinalHistory(),run.snapshot); const exported=profileBundleFromHistory(history,'Round-trip export'); const exportedDecoded=decodeProfileBundle(encodeProfileBundle(exported));
 results.push(check('profile-export-preserves-runnable-draft',exportedDecoded.draft.capturedContext.recordedMeasurements.length===run.snapshot.capturedContext?.recordedMeasurements.length,'Expected export to retain captured measurements needed for rerunning the profile.'));
 const malicious=createProfileBundle({label:'Sanitize internal keys',answers:{age:40,sex:'male','__m134_blood_pressure_id':'forged','__m134_blood_pressure_systolic':200},capturedContext:sample.draft.capturedContext});
 results.push(check('profile-import-strips-internal-derived-fields',!Object.keys(malicious.draft.answers).some(key=>key.startsWith('__m134_')),'Expected imported/exported profiles to strip internal M13.4 derived evidence fields.'));
 for(const profile of mockProfileBundles){const profileRun=runProfileBundle(profile,'2026-10-09T00:00:00.000Z');results.push(check(`profile-mock-runs-${profile.id}`,profileRun.snapshot.assessment.findings.length>0,`Expected ${profile.id} to execute through the deterministic engine.`));}
 return results;
}

export function assertProfileVerification(){const results=runProfileVerification();const failed=results.filter(item=>!item.passed);if(failed.length)throw new Error(`Profile verification failed: ${failed.map(item=>`${item.id}: ${item.details}`).join(' | ')}`);return results;}
