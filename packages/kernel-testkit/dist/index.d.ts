/**
 * 同步状态快照测试夹具工厂
 * 用于 sync-engine 及上层集成测试
 */
import { type SyncStatusSnapshotV1 } from '@chrono/contracts';
import { type IDatabase } from '../../../src/storage/database.js';
export declare function createSyncStatusSnapshotFixture(overrides?: Partial<SyncStatusSnapshotV1>): SyncStatusSnapshotV1;
export declare function createMigratedMemoryDb(): IDatabase;
export declare function withMigratedDb<T>(fn: (db: IDatabase) => T): T;
export declare function withMigratedDbAsync<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>;
//# sourceMappingURL=index.d.ts.map