/**
 * 跨运行时同步状态契约
 * 定义所有运行时共享的同步状态词汇和能力快照
 */
import { z } from 'zod';
export declare const RuntimeSyncStateV1Values: readonly ["unconfigured", "disabled", "idle", "pulling", "merging", "pushing", "paused", "offline", "conflicted", "error"];
export declare const RuntimeSyncStateV1Schema: z.ZodEnum<{
    unconfigured: "unconfigured";
    disabled: "disabled";
    idle: "idle";
    pulling: "pulling";
    merging: "merging";
    pushing: "pushing";
    paused: "paused";
    offline: "offline";
    conflicted: "conflicted";
    error: "error";
}>;
export type RuntimeSyncStateV1 = z.infer<typeof RuntimeSyncStateV1Schema>;
export declare const SyncCapabilitiesV1Schema: z.ZodObject<{
    canConfigure: z.ZodBoolean;
    canStartSync: z.ZodBoolean;
    canPause: z.ZodBoolean;
    canResume: z.ZodBoolean;
    canResolveConflict: z.ZodBoolean;
    canRetry: z.ZodBoolean;
    canDisable: z.ZodBoolean;
}, z.core.$strict>;
export type SyncCapabilitiesV1 = z.infer<typeof SyncCapabilitiesV1Schema>;
export declare const SyncStatusSnapshotV1Schema: z.ZodObject<{
    schemaVersion: z.ZodDefault<z.ZodLiteral<1>>;
    state: z.ZodEnum<{
        unconfigured: "unconfigured";
        disabled: "disabled";
        idle: "idle";
        pulling: "pulling";
        merging: "merging";
        pushing: "pushing";
        paused: "paused";
        offline: "offline";
        conflicted: "conflicted";
        error: "error";
    }>;
    capabilities: z.ZodObject<{
        canConfigure: z.ZodBoolean;
        canStartSync: z.ZodBoolean;
        canPause: z.ZodBoolean;
        canResume: z.ZodBoolean;
        canResolveConflict: z.ZodBoolean;
        canRetry: z.ZodBoolean;
        canDisable: z.ZodBoolean;
    }, z.core.$strict>;
    syncEnabled: z.ZodBoolean;
    networkOnline: z.ZodBoolean;
    pendingPullCount: z.ZodDefault<z.ZodNumber>;
    pendingPushCount: z.ZodDefault<z.ZodNumber>;
    conflictCount: z.ZodDefault<z.ZodNumber>;
    lastSyncStartedAt: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    lastSyncCompletedAt: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    lastErrorCode: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    lastErrorMessage: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    activeRunId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type SyncStatusSnapshotV1 = z.infer<typeof SyncStatusSnapshotV1Schema>;
//# sourceMappingURL=runtime-sync-state.d.ts.map