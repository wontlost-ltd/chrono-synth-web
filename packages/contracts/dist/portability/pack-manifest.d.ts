/**
 * 可移植性包清单 — 跨运行时数据导出/导入的契约
 * 支持个人、团队、企业三种导出模式
 */
import { z } from 'zod';
export declare const PortabilityPackManifestV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"portability-pack.v1">;
    exportedAt: z.ZodString;
    exportMode: z.ZodEnum<{
        personal: "personal";
        smb: "smb";
        enterprise: "enterprise";
    }>;
    sourceRuntime: z.ZodEnum<{
        node: "node";
        web: "web";
        mobile: "mobile";
        desktop: "desktop";
    }>;
    sourceApiMajor: z.ZodEnum<{
        v1: "v1";
        v2: "v2";
    }>;
    tenant: z.ZodObject<{
        tenantId: z.ZodString;
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
        kmsKeyRef: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    payloads: z.ZodArray<z.ZodObject<{
        logicalName: z.ZodString;
        format: z.ZodEnum<{
            ndjson: "ndjson";
            json: "json";
        }>;
        path: z.ZodString;
        checksum: z.ZodString;
        required: z.ZodBoolean;
    }, z.core.$strict>>;
    blobs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
        bytes: z.ZodNumber;
    }, z.core.$strict>>>;
    compatibility: z.ZodObject<{
        minImporterVersion: z.ZodString;
        featureFlagsRequired: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    integrity: z.ZodObject<{
        algorithm: z.ZodEnum<{
            sha256: "sha256";
            sha384: "sha384";
        }>;
        manifestChecksum: z.ZodString;
        signatureAlgorithm: z.ZodEnum<{
            ed25519: "ed25519";
            "rsa-pss": "rsa-pss";
            "hmac-sha256": "hmac-sha256";
        }>;
        signaturePublicKey: z.ZodString;
        detachedSignaturePath: z.ZodString;
    }, z.core.$strict>;
    encryption: z.ZodOptional<z.ZodObject<{
        mode: z.ZodEnum<{
            passphrase: "passphrase";
            "kms-wrapped": "kms-wrapped";
            none: "none";
        }>;
        kdf: z.ZodOptional<z.ZodEnum<{
            argon2id: "argon2id";
            scrypt: "scrypt";
        }>>;
        kmsKeyRef: z.ZodOptional<z.ZodString>;
        wrappedDataKeyPath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const ExportJobStatusV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"export-job-status.v1">;
    exportId: z.ZodString;
    state: z.ZodEnum<{
        queued: "queued";
        running: "running";
        completed: "completed";
        failed: "failed";
        partial: "partial";
    }>;
    percent: z.ZodNumber;
    etaMs: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
    downloadUrl: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodString>;
    warnings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        messageId: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const ImportDryRunReportV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"import-dryrun.v1">;
    importId: z.ZodString;
    packSchemaVersion: z.ZodString;
    signatureValid: z.ZodBoolean;
    blockers: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        messageId: z.ZodString;
        entity: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    warnings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        messageId: z.ZodString;
        entity: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    deltaSummary: z.ZodRecord<z.ZodString, z.ZodObject<{
        create: z.ZodNumber;
        update: z.ZodNumber;
        skip: z.ZodNumber;
    }, z.core.$strict>>;
    estimatedDurationMs: z.ZodNumber;
    canCommit: z.ZodBoolean;
    commitToken: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type PortabilityPackManifestV1 = z.infer<typeof PortabilityPackManifestV1Schema>;
export type ExportJobStatusV1 = z.infer<typeof ExportJobStatusV1Schema>;
export type ImportDryRunReportV1 = z.infer<typeof ImportDryRunReportV1Schema>;
//# sourceMappingURL=pack-manifest.d.ts.map