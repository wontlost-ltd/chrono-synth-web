/**
 * P3 工具权限 / 代理授权 / 工具调用历史 API hooks
 *
 * 后端：
 *   POST   /api/v1/admin/tool-permissions             — grant
 *   GET    /api/v1/admin/tool-permissions             — list by tenant
 *   GET    /api/v1/admin/personas/:personaId/tool-permissions
 *   DELETE /api/v1/admin/tool-permissions/:id         — revoke (body: reason)
 *   POST   /api/v1/admin/tool-permissions/revoke-by-key
 *   POST   /api/v1/admin/agency-authorizations        — create
 *   GET    /api/v1/admin/agency-authorizations?personaId|principalUserId
 *   GET    /api/v1/admin/agency-authorizations/:id
 *   POST   /api/v1/admin/agency-authorizations/:id/{suspend,resume}
 *   DELETE /api/v1/admin/agency-authorizations/:id    — revoke (body: reason)
 *   GET    /api/v1/admin/personas/:personaId/tool-invocations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export type ToolScope = 'read' | 'write' | 'execute';
export type AgencyScope = 'communication' | 'scheduling' | 'research' | 'finance' | 'all';
export type AgencyStatus = 'active' | 'suspended' | 'revoked' | 'expired';

export interface ToolConstraints {
  maxActionsPerDay?: number;
  requireConfirmation?: boolean;
  budgetLimitCents?: number;
  allowList?: string[];
  denyList?: string[];
}

export interface ToolPermission {
  id: string;
  tenantId: string;
  personaId: string;
  toolId: string;
  scope: ToolScope;
  constraints: ToolConstraints;
  grantedBy: string;
  grantedAt: number;
  expiresAt: number | null;
  revokedAt: number | null;
  revocationReason: string | null;
  revocationKey: string;
}

export interface AgencyAuthorization {
  id: string;
  tenantId: string;
  personaId: string;
  principalUserId: string;
  scope: AgencyScope;
  scopeDescription: string;
  allowedTools: string[];
  deniedTools: string[];
  status: AgencyStatus;
  grantedAt: number;
  expiresAt: number | null;
  revokedAt: number | null;
  revocationReason: string | null;
  revocationKey: string;
}

export interface ToolInvocation {
  id: string;
  tenantId: string;
  personaId: string;
  toolId: string;
  invokerType: 'mcp' | 'internal' | 'admin';
  invokerId: string;
  invokerUserId: string | null;
  status: string;
  inputHash: string;
  outputSizeBytes: number;
  errorMessage: string | null;
  costCents: number;
  durationMs: number;
  invokedAt: number;
  completedAt: number | null;
  confirmationTokenId: string | null;
}

interface Envelope<T> { data: T }

/* ── 工具权限 ───────────────────────────────────────────────────── */

export function useToolPermissions(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'tool-permissions'],
    queryFn: async ({ signal }) => {
      const r = await apiFetch<Envelope<ToolPermission[]>>('/api/v1/admin/tool-permissions', { signal });
      return r.data;
    },
    enabled,
  });
}

export function useToolPermissionsByPersona(personaId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'tool-permissions', 'persona', personaId],
    queryFn: async ({ signal }) => {
      const r = await apiFetch<Envelope<ToolPermission[]>>(
        `/api/v1/admin/personas/${personaId}/tool-permissions`,
        { signal },
      );
      return r.data;
    },
    enabled: enabled && !!personaId,
  });
}

export interface GrantToolPermissionInput {
  personaId: string;
  toolId: string;
  scope: ToolScope;
  constraints?: ToolConstraints;
  expiresAt?: number | null;
}

export function useGrantToolPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: GrantToolPermissionInput) => {
      const r = await apiFetch<Envelope<{ id: string; revocationKey: string }>>(
        '/api/v1/admin/tool-permissions',
        { method: 'POST', body: JSON.stringify(input) },
      );
      return r.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'tool-permissions'] });
    },
  });
}

export function useRevokeToolPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<void>(`/api/v1/admin/tool-permissions/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'tool-permissions'] });
    },
  });
}

/* ── 代理授权书 ─────────────────────────────────────────────────── */

export interface CreateAgencyAuthorizationInput {
  personaId: string;
  principalUserId: string;
  scope: AgencyScope;
  scopeDescription: string;
  allowedTools?: string[];
  deniedTools?: string[];
  expiresAt?: number | null;
}

export function useAgencyAuthorizationsByPersona(personaId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'agency-authorizations', 'persona', personaId],
    queryFn: async ({ signal }) => {
      const r = await apiFetch<Envelope<AgencyAuthorization[]>>(
        `/api/v1/admin/agency-authorizations?personaId=${encodeURIComponent(personaId ?? '')}`,
        { signal },
      );
      return r.data;
    },
    enabled: enabled && !!personaId,
  });
}

export function useCreateAgencyAuthorization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAgencyAuthorizationInput) => {
      const r = await apiFetch<Envelope<{ id: string; revocationKey: string }>>(
        '/api/v1/admin/agency-authorizations',
        { method: 'POST', body: JSON.stringify(input) },
      );
      return r.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'agency-authorizations'] });
    },
  });
}

export function useSuspendAgencyAuthorization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/admin/agency-authorizations/${id}/suspend`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'agency-authorizations'] }),
  });
}

export function useResumeAgencyAuthorization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/admin/agency-authorizations/${id}/resume`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'agency-authorizations'] }),
  });
}

export function useRevokeAgencyAuthorization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<void>(`/api/v1/admin/agency-authorizations/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'agency-authorizations'] }),
  });
}

/* ── 工具调用历史 ───────────────────────────────────────────────── */

export function useToolInvocations(personaId: string | null, limit = 50, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'tool-invocations', 'persona', personaId, limit],
    queryFn: async ({ signal }) => {
      const r = await apiFetch<Envelope<ToolInvocation[]>>(
        `/api/v1/admin/personas/${personaId}/tool-invocations?limit=${limit}`,
        { signal },
      );
      return r.data;
    },
    enabled: enabled && !!personaId,
  });
}
