import { z } from 'zod';
export declare const RuntimeSyncStateV2Values: readonly ["initial_sync", "online_synced", "online_dirty", "syncing", "offline_queueing", "offline_readonly", "conflict_inbox", "degraded_remote", "reauth_required", "recovery_required"];
export declare const RuntimeSyncStateV2Schema: z.ZodEnum<{
    initial_sync: "initial_sync";
    online_synced: "online_synced";
    online_dirty: "online_dirty";
    syncing: "syncing";
    offline_queueing: "offline_queueing";
    offline_readonly: "offline_readonly";
    conflict_inbox: "conflict_inbox";
    degraded_remote: "degraded_remote";
    reauth_required: "reauth_required";
    recovery_required: "recovery_required";
}>;
export type RuntimeSyncStateV2 = z.infer<typeof RuntimeSyncStateV2Schema>;
export declare const SyncStatusSnapshotV2Schema: z.ZodObject<{
    schemaVersion: z.ZodDefault<z.ZodLiteral<2>>;
    state: z.ZodEnum<{
        initial_sync: "initial_sync";
        online_synced: "online_synced";
        online_dirty: "online_dirty";
        syncing: "syncing";
        offline_queueing: "offline_queueing";
        offline_readonly: "offline_readonly";
        conflict_inbox: "conflict_inbox";
        degraded_remote: "degraded_remote";
        reauth_required: "reauth_required";
        recovery_required: "recovery_required";
    }>;
    tenantId: z.ZodString;
    runtimeId: z.ZodString;
    networkOnline: z.ZodBoolean;
    authValid: z.ZodBoolean;
    remoteReachable: z.ZodBoolean;
    localWritable: z.ZodBoolean;
    pendingPushCount: z.ZodDefault<z.ZodNumber>;
    pendingPullCount: z.ZodDefault<z.ZodNumber>;
    conflictCount: z.ZodDefault<z.ZodNumber>;
    activeRunId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    lastSyncedLedgerVersion: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    localHighWatermark: z.ZodDefault<z.ZodNumber>;
    lastErrorCode: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type SyncStatusSnapshotV2 = z.infer<typeof SyncStatusSnapshotV2Schema>;
//# sourceMappingURL=runtime-sync-state-v2.d.ts.map