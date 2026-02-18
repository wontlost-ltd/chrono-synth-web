import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { SimulationStatus, CreateSimulationRequest, CreateStressTestRequest } from '../../types';

export function useSimulation(simId: string) {
  return useQuery({
    queryKey: ['simulation', simId],
    queryFn: ({ signal }) => apiFetch<SimulationStatus>(`/api/v1/simulations/${encodeURIComponent(simId)}`, { signal }),
    enabled: !!simId,
  });
}

export function useCreateSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSimulationRequest) =>
      apiFetch<{ simulationId: string }>('/api/v1/simulations/life', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['simulation'] }); },
  });
}

export function useCreateStressTest(simId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStressTestRequest) =>
      apiFetch<{ simulationId: string }>(`/api/v1/simulations/${encodeURIComponent(simId)}/stress-test`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visualization', 'stress-comparison', simId] });
    },
  });
}
