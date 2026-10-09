import { addSnapshot, decodeLongitudinalHistory, emptyLongitudinalHistory, encodeLongitudinalHistory } from './longitudinal';
import { mockProfileBundles } from './mockProfiles';
import { runProfileBundle } from './profileBundle';
import {
  JAANCH_DATA_EXPORT_PROTOCOL,
  JAANCH_DELETION_PROTOCOL,
  JAANCH_PERSISTENCE_PROTOCOL,
  assertRemotePersistenceEligible,
  configureAuthenticatedPersistence,
  createLocalPersistenceDocument,
  createPersistenceDataExport,
  createPersistenceDeletionTombstone,
  decodePersistenceDocument,
  mergePersistenceDocuments,
  migrateLegacyHistoryToPersistence,
  revokeCloudSyncConsent,
} from './persistence';

export type PersistenceVerificationResult = { id: string; passed: boolean; details?: string };
const check = (id: string, condition: boolean, details: string): PersistenceVerificationResult => ({ id, passed: condition, details: condition ? undefined : details });
const throws = (fn: () => unknown) => { try { fn(); return false; } catch { return true; } };
const FIXED_AT = '2026-10-09T12:00:00.000Z';

export function runPersistenceVerification(): PersistenceVerificationResult[] {
  const results: PersistenceVerificationResult[] = [];
  const firstRun = runProfileBundle(mockProfileBundles[0]!, FIXED_AT);
  const secondRun = runProfileBundle(mockProfileBundles[1]!, '2026-10-09T12:05:00.000Z');
  const firstHistory = addSnapshot(emptyLongitudinalHistory(), firstRun.snapshot);

  const encoded = encodeLongitudinalHistory(firstHistory);
  const parsed = JSON.parse(encoded) as { protocol?: string };
  results.push(check('persistence-local-envelope-protocol', parsed.protocol === JAANCH_PERSISTENCE_PROTOCOL, 'Expected local history encoding to use the M13.5 persistence envelope.'));
  results.push(check('persistence-history-roundtrip', decodeLongitudinalHistory(encoded).snapshots[0]?.id === firstRun.snapshot.id, 'Expected persistence-wrapped history to round-trip through the existing history API.'));

  const legacyRaw = JSON.stringify(firstHistory);
  results.push(check('persistence-legacy-history-readable', decodeLongitudinalHistory(legacyRaw).snapshots.length === 1, 'Expected JAANCH-HISTORY-1.0 payloads to remain readable during migration.'));
  const migrated = migrateLegacyHistoryToPersistence(legacyRaw, FIXED_AT);
  results.push(check('persistence-legacy-migration-consent-provenance', migrated.consent.basis === 'legacy_local_migration' && migrated.security.remoteSyncAllowed === false, 'Expected legacy local history migration to remain local-only with explicit provenance.'));

  const local = createLocalPersistenceDocument(firstHistory, { profileId: 'profile-a', recordedAt: FIXED_AT, revision: 3 });
  results.push(check('persistence-local-security-truthful', local.security.protection === 'application_storage_unencrypted' && local.security.credentialsPersisted === false && !local.security.remoteSyncAllowed, 'Expected local web/mobile alpha persistence to be labelled unencrypted at the application-storage layer and remote-sync disabled.'));
  results.push(check('persistence-local-remote-rejected', throws(() => assertRemotePersistenceEligible(local)), 'Expected local-device ownership to be rejected at the remote persistence boundary.'));

  const authenticated = configureAuthenticatedPersistence(local, {
    subjectId: 'auth-user-123', provider: 'test-auth', profileId: 'profile-a',
    cloudSyncConsent: 'granted', protection: 'server_encrypted', recordedAt: FIXED_AT,
  });
  const scope = assertRemotePersistenceEligible(authenticated);
  results.push(check('persistence-authenticated-remote-eligible', scope.profileId === 'profile-a' && scope.subjectId === 'auth-user-123' && authenticated.sync.state === 'sync_eligible', 'Expected authenticated owner + explicit sync consent + TLS/server encryption metadata to unlock the remote boundary.'));

  const revoked = revokeCloudSyncConsent(authenticated, '2026-10-09T12:01:00.000Z');
  results.push(check('persistence-consent-revocation-blocks-sync', revoked.sync.state === 'local_only' && !revoked.security.remoteSyncAllowed && throws(() => assertRemotePersistenceEligible(revoked)), 'Expected cloud-sync consent revocation to fail closed immediately.'));

  const secondHistory = addSnapshot(firstHistory, secondRun.snapshot);
  const peer = configureAuthenticatedPersistence(createLocalPersistenceDocument(secondHistory, { profileId: 'profile-a', recordedAt: FIXED_AT, revision: 4 }), {
    subjectId: 'auth-user-123', provider: 'test-auth', profileId: 'profile-a',
    cloudSyncConsent: 'granted', protection: 'server_encrypted', recordedAt: FIXED_AT,
  });
  const merged = mergePersistenceDocuments(authenticated, peer, '2026-10-09T12:10:00.000Z');
  results.push(check('persistence-cross-device-merge-deduplicates', merged.history.snapshots.length === 2 && merged.sync.revision > peer.sync.revision, 'Expected same-owner cross-device merge to deduplicate immutable snapshots and advance revision.'));

  const otherOwner = configureAuthenticatedPersistence(createLocalPersistenceDocument(firstHistory, { profileId: 'profile-a', recordedAt: FIXED_AT }), {
    subjectId: 'different-user', provider: 'test-auth', profileId: 'profile-a',
    cloudSyncConsent: 'granted', protection: 'server_encrypted', recordedAt: FIXED_AT,
  });
  results.push(check('persistence-cross-owner-merge-rejected', throws(() => mergePersistenceDocuments(authenticated, otherOwner, FIXED_AT)), 'Expected cross-owner merge to be forbidden.'));

  const forged = JSON.parse(JSON.stringify(local)) as any;
  forged.history.snapshots[0].answers.__m134_bp_systolic = 250;
  const sanitized = decodePersistenceDocument(JSON.stringify(forged));
  results.push(check('persistence-internal-evidence-sanitized', sanitized.history.snapshots[0]?.answers.__m134_bp_systolic === undefined, 'Expected private M13.4 derived evidence to be stripped while decoding persisted data.'));

  const tombstone = createPersistenceDeletionTombstone(authenticated, '2026-10-09T12:20:00.000Z');
  results.push(check('persistence-delete-tombstone-minimal', tombstone.protocol === JAANCH_DELETION_PROTOCOL && !('history' in tombstone) && tombstone.revision === authenticated.sync.revision + 1, 'Expected delete propagation to use a minimal tombstone with no health history payload.'));

  const exported = createPersistenceDataExport(local, FIXED_AT);
  results.push(check('persistence-data-export-bounded', exported.protocol === JAANCH_DATA_EXPORT_PROTOCOL && !('security' in exported) && exported.history.snapshots.length === 1, 'Expected user data export to include owned health data/consent while excluding backend security or credential material.'));
  return results;
}

export function assertPersistenceVerification() {
  const results = runPersistenceVerification();
  const failed = results.filter((item) => !item.passed);
  if (failed.length) throw new Error(`Persistence verification failed: ${failed.map((item) => `${item.id}: ${item.details}`).join(' | ')}`);
  return results;
}
