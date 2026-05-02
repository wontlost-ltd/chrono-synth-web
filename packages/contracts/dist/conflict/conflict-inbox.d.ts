/**
 * 冲突收件箱 DTO — 跨端冲突处理的数据契约
 * 支持 TOCTOU 防护（乐观并发控制通过 ifMatch/conflictVersion）
 */
import { z } from 'zod';
export declare const ConflictInboxItemV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"conflict-inbox.v1">;
    conflictId: z.ZodString;
    conflictVersion: z.ZodString;
    tenantId: z.ZodString;
    entityType: z.ZodEnum<{
        persona: "persona";
        memory: "memory";
        task: "task";
        device: "device";
        policy: "policy";
    }>;
    entityId: z.ZodString;
    commandId: z.ZodOptional<z.ZodString>;
    sourceRuntime: z.ZodEnum<{
        web: "web";
        mobile: "mobile";
        desktop: "desktop";
        node: "node";
    }>;
    detectedAt: z.ZodString;
    severity: z.ZodEnum<{
        blocking: "blocking";
        warning: "warning";
    }>;
    localSummaryId: z.ZodString;
    localSummaryParams: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    serverSummaryId: z.ZodString;
    serverSummaryParams: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    suggestedActions: z.ZodArray<z.ZodEnum<{
        keep_local: "keep_local";
        keep_server: "keep_server";
        duplicate: "duplicate";
        merge_manually: "merge_manually";
    }>>;
}, z.core.$strict>;
export declare const ConflictResolveRequestV1Schema: z.ZodObject<{
    conflictId: z.ZodString;
    ifMatch: z.ZodString;
    action: z.ZodEnum<{
        keep_local: "keep_local";
        keep_server: "keep_server";
        duplicate: "duplicate";
        merge_manually: "merge_manually";
    }>;
    mergePayload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strict>;
export declare const ConflictResolveResultV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"conflict-resolve-result.v1">;
    conflictId: z.ZodString;
    action: z.ZodEnum<{
        keep_local: "keep_local";
        keep_server: "keep_server";
        duplicate: "duplicate";
        merge_manually: "merge_manually";
    }>;
    resolvedAt: z.ZodString;
    resultingSyncState: z.ZodEnum<{
        online_synced: "online_synced";
        syncing: "syncing";
        conflict_inbox: "conflict_inbox";
    }>;
    remainingBlockingCount: z.ZodNumber;
}, z.core.$strict>;
export type ConflictInboxItemV1 = z.infer<typeof ConflictInboxItemV1Schema>;
export type ConflictResolveRequestV1 = z.infer<typeof ConflictResolveRequestV1Schema>;
export type ConflictResolveResultV1 = z.infer<typeof ConflictResolveResultV1Schema>;
//# sourceMappingURL=conflict-inbox.d.ts.map