/**
 * 同步状态快照测试夹具工厂
 * 用于 sync-engine 及上层集成测试
 */
import { SyncStatusSnapshotV1Schema, } from '@chrono/contracts';
import { createMemoryDatabase } from '../../../src/storage/database.js';
import { runMigrations } from '../../../src/storage/migrations.js';
function buildCapabilities(state, syncEnabled, networkOnline, conflictCount) {
    return {
        canConfigure: state === 'unconfigured' || state === 'disabled',
        canStartSync: state === 'idle' && syncEnabled && networkOnline,
        canPause: (state === 'idle' || state === 'pulling' || state === 'merging' || state === 'pushing') &&
            syncEnabled,
        canResume: state === 'paused',
        canResolveConflict: state === 'conflicted' && conflictCount > 0,
        canRetry: state === 'error' && syncEnabled && networkOnline,
        canDisable: state !== 'unconfigured' && state !== 'disabled',
    };
}
export function createSyncStatusSnapshotFixture(overrides = {}) {
    const state = overrides.state ?? 'unconfigured';
    const syncEnabled = overrides.syncEnabled ?? false;
    const networkOnline = overrides.networkOnline ?? true;
    const conflictCount = overrides.conflictCount ?? 0;
    return SyncStatusSnapshotV1Schema.parse({
        schemaVersion: 1,
        state,
        syncEnabled,
        networkOnline,
        pendingPullCount: 0,
        pendingPushCount: 0,
        conflictCount,
        lastSyncStartedAt: null,
        lastSyncCompletedAt: null,
        lastErrorCode: null,
        lastErrorMessage: null,
        activeRunId: null,
        capabilities: buildCapabilities(state, syncEnabled, networkOnline, conflictCount),
        ...overrides,
    });
}
export function createMigratedMemoryDb() {
    const db = createMemoryDatabase();
    runMigrations(db);
    return db;
}
export function withMigratedDb(fn) {
    return fn(createMigratedMemoryDb());
}
export async function withMigratedDbAsync(fn) {
    return fn(createMigratedMemoryDb());
}
//# sourceMappingURL=index.js.map