/**
 * AI 安全治理 API hooks（T0-B：人格漂移监测 + 告警）
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export type DriftAlertLevel = 'ok' | 'warning' | 'critical';

export interface DriftValueDelta {
  valueId: string;
  label: string;
  baseline: number;
  current: number;
  delta: number;
  alertLevel: DriftAlertLevel;
}

export interface DriftReport {
  reportId: string;
  tenantId: string;
  baselineSnapshotId: string | null;
  analyzedAt: number;
  valueDrifts: DriftValueDelta[];
  overallDriftScore: number;
  alertLevel: DriftAlertLevel;
  /** 仅 POST /drift-report 后由 service 注入 */
  alertEmitted?: boolean;
  auditId?: string | null;
}

interface DriftEnvelope { data: DriftReport }

export function useLatestDriftReport(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'safety', 'drift-report'],
    queryFn: async ({ signal }) => {
      try {
        const resp = await apiFetch<DriftEnvelope>('/api/v1/admin/safety/drift-report', { signal });
        return resp.data;
      } catch (err) {
        /* 404 = 还没生成过报告 */
        if (err instanceof Error && err.message.includes('404')) return null;
        throw err;
      }
    },
    enabled,
  });
}

export function useGenerateDriftReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const resp = await apiFetch<DriftEnvelope>('/api/v1/admin/safety/drift-report', {
        method: 'POST',
      });
      return resp.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'safety', 'drift-report'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'safety', 'status'] });
    },
  });
}

export interface SafetyStatusSummary {
  memoryConfidence: {
    total: number;
    unverifiedCount: number;
    bySourceKind: Record<string, number>;
  };
  drift: {
    latestReport: DriftReport | null;
    recentAlerts: Array<{
      reportId: string;
      analyzedAt: number;
      alertLevel: DriftAlertLevel;
      overallDriftScore: number;
    }>;
  };
  /** 0–100，越高越安全 */
  safetyScore: number;
}

export function useSafetyStatus(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'safety', 'status'],
    queryFn: async ({ signal }) => {
      const resp = await apiFetch<{ data: SafetyStatusSummary }>(
        '/api/v1/admin/safety/status',
        { signal },
      );
      return resp.data;
    },
    enabled,
  });
}
