import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '../client';

interface PlanLimits {
  maxSimulations: number;
  maxPaths: number;
  llmTokensPerMonth: number;
}

interface Plan {
  id: string;
  name: string;
  limits: PlanLimits;
}

interface UsageData {
  planId: string;
  status: string;
  limits: PlanLimits;
  usage: Record<string, number>;
  periodEnd?: number;
}

export function usePlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: ({ signal }) => apiFetch<Plan[]>('/api/v1/billing/plans', { signal }),
  });
}

export function useUsage() {
  return useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: ({ signal }) => apiFetch<UsageData>('/api/v1/billing/usage', { signal }),
    refetchInterval: 60_000,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (body: { priceId: string; successUrl: string; cancelUrl: string }) =>
      apiFetch<{ sessionId: string; url: string }>('/api/v1/billing/checkout', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: (body: { returnUrl: string }) =>
      apiFetch<{ url: string }>('/api/v1/billing/portal', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}
