/**
 * 租户数据清单 — 数据平面的租户配置契约
 * 描述租户的存储拓扑、加密策略、同步参数与数据保留策略
 */
import { z } from 'zod';
export declare const TenantManifestV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"tenant-manifest.v1">;
    tenantId: z.ZodString;
    region: z.ZodString;
    deploymentMode: z.ZodEnum<{
        platform_managed: "platform_managed";
        shared_cluster: "shared_cluster";
        dedicated_db: "dedicated_db";
        self_hosted: "self_hosted";
    }>;
    encryptionMode: z.ZodEnum<{
        platform_managed: "platform_managed";
        tenant_dedicated: "tenant_dedicated";
    }>;
    storage: z.ZodObject<{
        primary: z.ZodString;
        replica: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    kms: z.ZodObject<{
        provider: z.ZodEnum<{
            platform: "platform";
            aws_kms: "aws_kms";
            gcp_kms: "gcp_kms";
            azure_kv: "azure_kv";
            vault: "vault";
        }>;
        keyRef: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    sync: z.ZodObject<{
        maxOfflineQueueSize: z.ZodDefault<z.ZodNumber>;
        maxOfflineAgeMs: z.ZodDefault<z.ZodNumber>;
        flushOnReconnect: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    retention: z.ZodObject<{
        defaultRetentionDays: z.ZodDefault<z.ZodNumber>;
        auditRetentionDays: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type TenantManifestV1 = z.infer<typeof TenantManifestV1Schema>;
//# sourceMappingURL=tenant-manifest.d.ts.map