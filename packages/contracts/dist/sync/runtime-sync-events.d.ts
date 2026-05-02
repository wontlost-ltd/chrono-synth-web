/**
 * 同步事件类型定义
 * 驱动 RuntimeSyncState 状态机转换的事件
 */
import { z } from 'zod';
export declare const RuntimeSyncEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.configured">;
    enabled: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.disabled">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.started">;
    runId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.pull.completed">;
    pendingPullCount: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.merge.completed">;
    pendingPushCount: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.push.completed">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.conflict.detected">;
    conflictCount: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.conflict.resolved">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.paused">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.resumed">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.network.offline">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.network.online">;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.failed">;
    errorCode: z.ZodString;
    errorMessage: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    occurredAt: z.ZodNumber;
    type: z.ZodLiteral<"sync.reset">;
}, z.core.$strict>], "type">;
export type RuntimeSyncEvent = z.infer<typeof RuntimeSyncEventSchema>;
//# sourceMappingURL=runtime-sync-events.d.ts.map