/**
 * 跨运行时同步状态契约
 * 定义所有运行时共享的同步状态词汇和能力快照
 */
import { z } from 'zod';
export const RuntimeSyncStateV1Values = [
    'unconfigured',
    'disabled',
    'idle',
    'pulling',
    'merging',
    'pushing',
    'paused',
    'offline',
    'conflicted',
    'error',
];
export const RuntimeSyncStateV1Schema = z.enum(RuntimeSyncStateV1Values);
export const SyncCapabilitiesV1Schema = z.object({
    canConfigure: z.boolean(),
    canStartSync: z.boolean(),
    canPause: z.boolean(),
    canResume: z.boolean(),
    canResolveConflict: z.boolean(),
    canRetry: z.boolean(),
    canDisable: z.boolean(),
}).strict();
export const SyncStatusSnapshotV1Schema = z.object({
    schemaVersion: z.literal(1).default(1),
    state: RuntimeSyncStateV1Schema,
    capabilities: SyncCapabilitiesV1Schema,
    syncEnabled: z.boolean(),
    networkOnline: z.boolean(),
    pendingPullCount: z.number().int().min(0).default(0),
    pendingPushCount: z.number().int().min(0).default(0),
    conflictCount: z.number().int().min(0).default(0),
    lastSyncStartedAt: z.number().int().nonnegative().nullable().default(null),
    lastSyncCompletedAt: z.number().int().nonnegative().nullable().default(null),
    lastErrorCode: z.string().min(1).nullable().default(null),
    lastErrorMessage: z.string().min(1).nullable().default(null),
    activeRunId: z.string().min(1).nullable().default(null),
}).strict();
//# sourceMappingURL=runtime-sync-state.js.map