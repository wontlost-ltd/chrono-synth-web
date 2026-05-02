/**
 * SyncEnvelopeV1 — 跨运行时同步命令信封
 * 每个离线排队或在线发送的写命令都包裹在此信封中
 * 支持签名验证、幂等性保证和 nonce 重放保护
 */
import { z } from 'zod';
export declare const SyncEnvelopeV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"sync-envelope.v1">;
    commandId: z.ZodString;
    tenantId: z.ZodString;
    actorId: z.ZodString;
    runtimeId: z.ZodString;
    entityRef: z.ZodString;
    expectedVersion: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    expiresAt: z.ZodString;
    nonce: z.ZodString;
    idempotencyKey: z.ZodString;
    payloadHash: z.ZodString;
    signatureKeyId: z.ZodString;
    signature: z.ZodString;
    signatureAlgorithm: z.ZodEnum<{
        "hmac-sha256": "hmac-sha256";
        ed25519: "ed25519";
    }>;
}, z.core.$strict>;
export type SyncEnvelopeV1 = z.infer<typeof SyncEnvelopeV1Schema>;
//# sourceMappingURL=sync-envelope.d.ts.map