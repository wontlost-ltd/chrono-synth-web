import { z } from 'zod';
export declare const RuntimeSyncEventV2Schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.bootstrap.required">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.bootstrap.completed">;
    ledgerVersion: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.local.changed">;
    pendingPushCount: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.started">;
    runId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.completed">;
    ledgerVersion: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.network.offline">;
    queueWrites: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.network.online">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.conflict.detected">;
    conflictCount: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.conflict.resolved">;
    remainingBlockingCount: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.auth.expired">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.auth.restored">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.remote.degraded">;
    errorCode: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.recovery.required">;
    errorCode: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.reset">;
}, z.core.$strict>], "type">;
export type RuntimeSyncEventV2 = z.infer<typeof RuntimeSyncEventV2Schema>;
//# sourceMappingURL=runtime-sync-events-v2.d.ts.map