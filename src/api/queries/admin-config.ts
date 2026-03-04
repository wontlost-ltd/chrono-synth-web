/**
 * 管理后台配置 API hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

interface ConfigItem {
  key: string;
  value: unknown;
  category: string;
  requiresRestart: boolean;
  groupKey: string;
  updatedAt: number;
  updatedBy: string;
}

interface ConfigAuditEntry {
  key: string;
  old_value_json: string;
  new_value_json: string;
  changed_by: string;
  changed_at: number;
}

interface ApplyPatchResult {
  updated: number;
  requiresRestart: string[];
}

export function useAdminConfig(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'config'],
    queryFn: ({ signal }) => apiFetch<ConfigItem[]>('/api/v1/admin/config', { signal }),
    enabled,
  });
}

export function useAdminConfigEffective(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'config', 'effective'],
    queryFn: ({ signal }) => apiFetch<Record<string, unknown>>('/api/v1/admin/config?view=effective', { signal }),
    enabled,
  });
}

export function useAdminConfigAudit(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'config', 'audit'],
    queryFn: ({ signal }) => apiFetch<ConfigAuditEntry[]>('/api/v1/admin/config/audit', { signal }),
    enabled,
  });
}

export function useApplyConfigPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      apiFetch<ApplyPatchResult>('/api/v1/admin/config', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'config'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'config', 'audit'] });
    },
  });
}
