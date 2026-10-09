import type { LongitudinalHistory, AssessmentSnapshot } from './longitudinal';
import { sanitizeInternalClinicalEvidence } from './clinicalMeasurements';

export const JAANCH_PERSISTENCE_PROTOCOL = 'JAANCH-PERSISTENCE-1.0' as const;
export const JAANCH_DATA_EXPORT_PROTOCOL = 'JAANCH-DATA-EXPORT-1.0' as const;
export const JAANCH_DELETION_PROTOCOL = 'JAANCH-DELETION-1.0' as const;
export const PERSISTENCE_POLICY_VERSION = '2026-10-09' as const;
export const DEFAULT_LOCAL_PROFILE_ID = 'profile-local-default' as const;
export const DEFAULT_RETENTION_SNAPSHOT_LIMIT = 20;

export type LocalPersistenceOwner = {
  kind: 'local_device';
  ownerId: 'local-device';
};

export type AuthenticatedPersistenceOwner = {
  kind: 'authenticated';
  subjectId: string;
  provider: string;
};

export type PersistenceOwner = LocalPersistenceOwner | AuthenticatedPersistenceOwner;
export type ConsentState = 'granted' | 'not_granted' | 'revoked';
export type PersistenceProtection = 'application_storage_unencrypted' | 'platform_protected_encrypted' | 'server_encrypted';

export type PersistenceConsent = {
  policyVersion: string;
  recordedAt: string;
  basis: 'save_action' | 'explicit_settings' | 'legacy_local_migration';
  purposes: {
    localHistory: 'granted';
    cloudSync: ConsentState;
    productAnalytics: 'not_granted';
  };
};

export type PersistenceRetentionPolicy = {
  mode: 'until_user_deletes';
  maxSnapshots: number;
};

export type PersistenceSecurityMetadata = {
  classification: 'sensitive_health';
  protection: PersistenceProtection;
  transport: 'not_applicable' | 'tls_required';
  remoteSyncAllowed: boolean;
  credentialsPersisted: false;
};

export type PersistenceSyncMetadata = {
  revision: number;
  updatedAt: string;
  state: 'local_only' | 'sync_eligible';
  lastSyncedRevision?: number;
};

export type JaanchPersistenceDocument = {
  protocol: typeof JAANCH_PERSISTENCE_PROTOCOL;
  schemaVersion: 1;
  profile: {
    profileId: string;
    owner: PersistenceOwner;
  };
  consent: PersistenceConsent;
  retention: PersistenceRetentionPolicy;
  security: PersistenceSecurityMetadata;
  sync: PersistenceSyncMetadata;
  history: LongitudinalHistory;
};

export type JaanchDataExport = {
  protocol: typeof JAANCH_DATA_EXPORT_PROTOCOL;
  exportedAt: string;
  profile: JaanchPersistenceDocument['profile'];
  consent: PersistenceConsent;
  retention: PersistenceRetentionPolicy;
  history: LongitudinalHistory;
};

export type PersistenceDeletionTombstone = {
  protocol: typeof JAANCH_DELETION_PROTOCOL;
  profileId: string;
  owner: PersistenceOwner;
  deletedAt: string;
  revision: number;
};

export type AuthenticatedPersistenceScope = {
  profileId: string;
  subjectId: string;
  provider: string;
};

export interface SecurePersistencePort {
  readonly backendId: string;
  load(scope: AuthenticatedPersistenceScope): Promise<{ encoded: string; revision: number } | null>;
  save(scope: AuthenticatedPersistenceScope, encoded: string, expectedRevision?: number): Promise<{ revision: number }>;
  delete(scope: AuthenticatedPersistenceScope, tombstone: PersistenceDeletionTombstone, expectedRevision?: number): Promise<{ revision: number }>;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const validDate = (value: unknown): value is string => typeof value === 'string' && !Number.isNaN(Date.parse(value));
const positiveInteger = (value: unknown, fallback: number) => Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback;

function normalizeSnapshot(value: unknown): AssessmentSnapshot | undefined {
  if (!isRecord(value)) return undefined;
  if (value.protocol !== 'JAANCH-SNAPSHOT-1.0' || typeof value.id !== 'string' || !validDate(value.capturedAt)) return undefined;
  if (!isRecord(value.assessment) || !isRecord(value.recommendationPlan)) return undefined;
  const snapshot = clone(value) as AssessmentSnapshot;
  snapshot.answers = sanitizeInternalClinicalEvidence(isRecord(snapshot.answers) ? snapshot.answers : {});
  return snapshot;
}

export function normalizePersistedHistory(value: unknown, maxSnapshots = DEFAULT_RETENTION_SNAPSHOT_LIMIT): LongitudinalHistory {
  if (!isRecord(value) || value.protocol !== 'JAANCH-HISTORY-1.0' || !Array.isArray(value.snapshots)) {
    return { protocol: 'JAANCH-HISTORY-1.0', snapshots: [] };
  }
  const snapshots = value.snapshots
    .map(normalizeSnapshot)
    .filter((item): item is AssessmentSnapshot => Boolean(item))
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt))
    .slice(0, positiveInteger(maxSnapshots, DEFAULT_RETENTION_SNAPSHOT_LIMIT));
  return { protocol: 'JAANCH-HISTORY-1.0', snapshots };
}

function normalizeOwner(value: unknown): PersistenceOwner {
  if (isRecord(value) && value.kind === 'authenticated' && typeof value.subjectId === 'string' && value.subjectId.trim() && typeof value.provider === 'string' && value.provider.trim()) {
    return { kind: 'authenticated', subjectId: value.subjectId.trim(), provider: value.provider.trim() };
  }
  return { kind: 'local_device', ownerId: 'local-device' };
}

function normalizeConsent(value: unknown, fallbackAt: string): PersistenceConsent {
  const input = isRecord(value) ? value : {};
  const purposes = isRecord(input.purposes) ? input.purposes : {};
  const cloud = purposes.cloudSync === 'granted' || purposes.cloudSync === 'revoked' ? purposes.cloudSync : 'not_granted';
  const basis = input.basis === 'explicit_settings' || input.basis === 'legacy_local_migration' ? input.basis : 'save_action';
  return {
    policyVersion: typeof input.policyVersion === 'string' && input.policyVersion ? input.policyVersion : PERSISTENCE_POLICY_VERSION,
    recordedAt: validDate(input.recordedAt) ? input.recordedAt : fallbackAt,
    basis,
    purposes: { localHistory: 'granted', cloudSync: cloud, productAnalytics: 'not_granted' },
  };
}

function normalizeSecurity(value: unknown, owner: PersistenceOwner, cloudSync: ConsentState): PersistenceSecurityMetadata {
  const input = isRecord(value) ? value : {};
  const protection: PersistenceProtection = input.protection === 'platform_protected_encrypted' || input.protection === 'server_encrypted'
    ? input.protection
    : 'application_storage_unencrypted';
  const transport = input.transport === 'tls_required' ? 'tls_required' : 'not_applicable';
  const eligible = owner.kind === 'authenticated' && cloudSync === 'granted' && protection === 'server_encrypted' && transport === 'tls_required';
  return {
    classification: 'sensitive_health',
    protection,
    transport,
    remoteSyncAllowed: eligible,
    credentialsPersisted: false,
  };
}

function syncStateFor(document: Pick<JaanchPersistenceDocument, 'profile' | 'consent' | 'security'>): PersistenceSyncMetadata['state'] {
  return document.profile.owner.kind === 'authenticated'
    && document.consent.purposes.cloudSync === 'granted'
    && document.security.protection === 'server_encrypted'
    && document.security.transport === 'tls_required'
    ? 'sync_eligible'
    : 'local_only';
}

export function createLocalPersistenceDocument(history: LongitudinalHistory, input: {
  profileId?: string;
  recordedAt?: string;
  basis?: PersistenceConsent['basis'];
  maxSnapshots?: number;
  revision?: number;
} = {}): JaanchPersistenceDocument {
  const normalizedHistory = normalizePersistedHistory(history, input.maxSnapshots);
  const updatedAt = input.recordedAt ?? normalizedHistory.snapshots[0]?.capturedAt ?? new Date().toISOString();
  const profileId = input.profileId?.trim() || DEFAULT_LOCAL_PROFILE_ID;
  return {
    protocol: JAANCH_PERSISTENCE_PROTOCOL,
    schemaVersion: 1,
    profile: { profileId, owner: { kind: 'local_device', ownerId: 'local-device' } },
    consent: {
      policyVersion: PERSISTENCE_POLICY_VERSION,
      recordedAt: updatedAt,
      basis: input.basis ?? 'save_action',
      purposes: { localHistory: 'granted', cloudSync: 'not_granted', productAnalytics: 'not_granted' },
    },
    retention: { mode: 'until_user_deletes', maxSnapshots: positiveInteger(input.maxSnapshots, DEFAULT_RETENTION_SNAPSHOT_LIMIT) },
    security: {
      classification: 'sensitive_health',
      protection: 'application_storage_unencrypted',
      transport: 'not_applicable',
      remoteSyncAllowed: false,
      credentialsPersisted: false,
    },
    sync: { revision: positiveInteger(input.revision, Math.max(1, normalizedHistory.snapshots.length)), updatedAt, state: 'local_only' },
    history: normalizedHistory,
  };
}

export function normalizePersistenceDocument(value: unknown): JaanchPersistenceDocument {
  if (!isRecord(value) || value.protocol !== JAANCH_PERSISTENCE_PROTOCOL || value.schemaVersion !== 1) throw new Error('Unsupported Jaanch persistence document.');
  if (!isRecord(value.profile) || typeof value.profile.profileId !== 'string' || !value.profile.profileId.trim()) throw new Error('Persistence profile identity is missing.');
  const owner = normalizeOwner(value.profile.owner);
  const syncInput = isRecord(value.sync) ? value.sync : {};
  const updatedAt = validDate(syncInput.updatedAt) ? syncInput.updatedAt : new Date().toISOString();
  const retentionInput = isRecord(value.retention) ? value.retention : {};
  const maxSnapshots = positiveInteger(retentionInput.maxSnapshots, DEFAULT_RETENTION_SNAPSHOT_LIMIT);
  const consent = normalizeConsent(value.consent, updatedAt);
  const security = normalizeSecurity(value.security, owner, consent.purposes.cloudSync);
  const partial = {
    profile: { profileId: value.profile.profileId.trim(), owner },
    consent,
    security,
  };
  const state = syncStateFor(partial);
  return {
    protocol: JAANCH_PERSISTENCE_PROTOCOL,
    schemaVersion: 1,
    profile: partial.profile,
    consent,
    retention: { mode: 'until_user_deletes', maxSnapshots },
    security: { ...security, remoteSyncAllowed: state === 'sync_eligible' },
    sync: {
      revision: positiveInteger(syncInput.revision, 1),
      updatedAt,
      state,
      ...(Number.isInteger(syncInput.lastSyncedRevision) && Number(syncInput.lastSyncedRevision) > 0 ? { lastSyncedRevision: Number(syncInput.lastSyncedRevision) } : {}),
    },
    history: normalizePersistedHistory(value.history, maxSnapshots),
  };
}

export function decodePersistenceDocument(raw: string): JaanchPersistenceDocument {
  try { return normalizePersistenceDocument(JSON.parse(raw)); }
  catch (error) {
    if (error instanceof SyntaxError) throw new Error('Persistence payload is not valid JSON.');
    throw error;
  }
}

export function encodePersistenceDocument(document: JaanchPersistenceDocument): string {
  return JSON.stringify(normalizePersistenceDocument(document));
}

export function encodeHistoryPersistenceEnvelope(history: LongitudinalHistory): string {
  return encodePersistenceDocument(createLocalPersistenceDocument(history));
}

export function decodePersistedHistoryPayload(raw: string | null | undefined): LongitudinalHistory {
  if (!raw) return { protocol: 'JAANCH-HISTORY-1.0', snapshots: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isRecord(parsed) && parsed.protocol === JAANCH_PERSISTENCE_PROTOCOL) return normalizePersistenceDocument(parsed).history;
    return normalizePersistedHistory(parsed);
  } catch {
    return { protocol: 'JAANCH-HISTORY-1.0', snapshots: [] };
  }
}

export function migrateLegacyHistoryToPersistence(raw: string | null | undefined, recordedAt = new Date().toISOString()): JaanchPersistenceDocument {
  return createLocalPersistenceDocument(decodePersistedHistoryPayload(raw), { recordedAt, basis: 'legacy_local_migration' });
}

export function configureAuthenticatedPersistence(document: JaanchPersistenceDocument, input: {
  subjectId: string;
  provider: string;
  profileId?: string;
  cloudSyncConsent: 'granted' | 'not_granted' | 'revoked';
  protection: 'platform_protected_encrypted' | 'server_encrypted';
  recordedAt?: string;
}): JaanchPersistenceDocument {
  if (!input.subjectId.trim() || !input.provider.trim()) throw new Error('Authenticated persistence requires a provider and subject id.');
  const recordedAt = input.recordedAt ?? new Date().toISOString();
  const owner: AuthenticatedPersistenceOwner = { kind: 'authenticated', subjectId: input.subjectId.trim(), provider: input.provider.trim() };
  const protection = input.protection;
  const transport = protection === 'server_encrypted' ? 'tls_required' : 'not_applicable';
  const next: JaanchPersistenceDocument = {
    ...clone(document),
    profile: { profileId: input.profileId?.trim() || document.profile.profileId, owner },
    consent: {
      policyVersion: PERSISTENCE_POLICY_VERSION,
      recordedAt,
      basis: 'explicit_settings',
      purposes: { localHistory: 'granted', cloudSync: input.cloudSyncConsent, productAnalytics: 'not_granted' },
    },
    security: {
      classification: 'sensitive_health', protection, transport,
      remoteSyncAllowed: false, credentialsPersisted: false,
    },
    sync: { ...document.sync, updatedAt: recordedAt, revision: document.sync.revision + 1, state: 'local_only' },
  };
  const state = syncStateFor(next);
  next.security.remoteSyncAllowed = state === 'sync_eligible';
  next.sync.state = state;
  return normalizePersistenceDocument(next);
}

export function revokeCloudSyncConsent(document: JaanchPersistenceDocument, recordedAt = new Date().toISOString()): JaanchPersistenceDocument {
  const next = clone(document);
  next.consent = {
    policyVersion: PERSISTENCE_POLICY_VERSION,
    recordedAt,
    basis: 'explicit_settings',
    purposes: { localHistory: 'granted', cloudSync: 'revoked', productAnalytics: 'not_granted' },
  };
  next.security.remoteSyncAllowed = false;
  next.sync = { ...next.sync, revision: next.sync.revision + 1, updatedAt: recordedAt, state: 'local_only' };
  return normalizePersistenceDocument(next);
}

export function assertRemotePersistenceEligible(document: JaanchPersistenceDocument): AuthenticatedPersistenceScope {
  const normalized = normalizePersistenceDocument(document);
  const owner = normalized.profile.owner;
  if (owner.kind !== 'authenticated') throw new Error('Remote persistence requires authenticated profile ownership.');
  if (normalized.consent.purposes.cloudSync !== 'granted') throw new Error('Remote persistence requires explicit cloud-sync consent.');
  if (normalized.security.protection !== 'server_encrypted' || normalized.security.transport !== 'tls_required') throw new Error('Remote persistence requires TLS transport and server-side encryption at rest.');
  if (!normalized.security.remoteSyncAllowed || normalized.sync.state !== 'sync_eligible') throw new Error('Persistence document is not eligible for remote sync.');
  return { profileId: normalized.profile.profileId, subjectId: owner.subjectId, provider: owner.provider };
}

function sameOwner(left: PersistenceOwner, right: PersistenceOwner): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'local_device' && right.kind === 'local_device') return true;
  return left.kind === 'authenticated' && right.kind === 'authenticated' && left.subjectId === right.subjectId && left.provider === right.provider;
}

export function mergePersistenceDocuments(leftInput: JaanchPersistenceDocument, rightInput: JaanchPersistenceDocument, updatedAt = new Date().toISOString()): JaanchPersistenceDocument {
  const left = normalizePersistenceDocument(leftInput);
  const right = normalizePersistenceDocument(rightInput);
  assertRemotePersistenceEligible(left);
  assertRemotePersistenceEligible(right);
  if (left.profile.profileId !== right.profile.profileId || !sameOwner(left.profile.owner, right.profile.owner)) throw new Error('Cross-owner or cross-profile persistence merge is forbidden.');

  const byId = new Map<string, AssessmentSnapshot>();
  for (const snapshot of [...left.history.snapshots, ...right.history.snapshots]) {
    const existing = byId.get(snapshot.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(snapshot)) throw new Error(`Immutable snapshot conflict for ${snapshot.id}.`);
    byId.set(snapshot.id, snapshot);
  }
  const maxSnapshots = Math.min(left.retention.maxSnapshots, right.retention.maxSnapshots);
  const history = normalizePersistedHistory({ protocol: 'JAANCH-HISTORY-1.0', snapshots: [...byId.values()] }, maxSnapshots);
  const next: JaanchPersistenceDocument = {
    ...clone(left),
    retention: { mode: 'until_user_deletes', maxSnapshots },
    history,
    sync: {
      revision: Math.max(left.sync.revision, right.sync.revision) + 1,
      updatedAt,
      state: 'sync_eligible',
      lastSyncedRevision: Math.max(left.sync.revision, right.sync.revision),
    },
  };
  return normalizePersistenceDocument(next);
}

export function createPersistenceDeletionTombstone(document: JaanchPersistenceDocument, deletedAt = new Date().toISOString()): PersistenceDeletionTombstone {
  const normalized = normalizePersistenceDocument(document);
  return {
    protocol: JAANCH_DELETION_PROTOCOL,
    profileId: normalized.profile.profileId,
    owner: clone(normalized.profile.owner),
    deletedAt,
    revision: normalized.sync.revision + 1,
  };
}

export function createPersistenceDataExport(document: JaanchPersistenceDocument, exportedAt = new Date().toISOString()): JaanchDataExport {
  const normalized = normalizePersistenceDocument(document);
  return {
    protocol: JAANCH_DATA_EXPORT_PROTOCOL,
    exportedAt,
    profile: clone(normalized.profile),
    consent: clone(normalized.consent),
    retention: clone(normalized.retention),
    history: clone(normalized.history),
  };
}

export function encodePersistenceDataExport(document: JaanchPersistenceDocument, exportedAt = new Date().toISOString()): string {
  return JSON.stringify(createPersistenceDataExport(document, exportedAt), null, 2);
}
