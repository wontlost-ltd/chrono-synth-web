import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
  useLatestDriftReport,
  useGenerateDriftReport,
  useSafetyStatus,
} from './safety';

const mockApiFetch = vi.fn();
vi.mock('../client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe('useLatestDriftReport', () => {
  it('unwraps data envelope', async () => {
    const report = { reportId: 'r_1', alertLevel: 'ok', overallDriftScore: 0.0 };
    mockApiFetch.mockResolvedValue({ data: report });
    const { result } = renderHook(() => useLatestDriftReport(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ reportId: 'r_1', alertLevel: 'ok' });
  });

  it('returns null on 404 (no report yet) instead of erroring', async () => {
    mockApiFetch.mockRejectedValue(new Error('HTTP 404 Not Found'));
    const { result } = renderHook(() => useLatestDriftReport(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('propagates other errors', async () => {
    mockApiFetch.mockRejectedValue(new Error('HTTP 500 Internal Server Error'));
    const { result } = renderHook(() => useLatestDriftReport(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toContain('500');
  });
});

describe('useGenerateDriftReport', () => {
  it('POSTs and unwraps the report', async () => {
    mockApiFetch.mockResolvedValue({
      data: {
        reportId: 'r_2',
        alertLevel: 'critical',
        overallDriftScore: 0.42,
        valueDrifts: [],
        baselineSnapshotId: 'snap_baseline',
        analyzedAt: 1700000000000,
      },
    });
    const { result } = renderHook(() => useGenerateDriftReport(), { wrapper: createWrapper() });
    const out = await result.current.mutateAsync();
    expect(out.alertLevel).toBe('critical');
    const [path, init] = mockApiFetch.mock.calls[0]!;
    expect(path).toBe('/api/v1/admin/safety/drift-report');
    expect(init.method).toBe('POST');
  });
});

describe('useSafetyStatus', () => {
  it('unwraps data envelope', async () => {
    mockApiFetch.mockResolvedValue({
      data: {
        memoryConfidence: { total: 100, unverifiedCount: 5, bySourceKind: { user_input: 95 } },
        drift: { latestReport: null, recentAlerts: [] },
        safetyScore: 95,
      },
    });
    const { result } = renderHook(() => useSafetyStatus(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.safetyScore).toBe(95);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/admin/safety/status', expect.any(Object));
  });
});
