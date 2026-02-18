import { useParams } from 'react-router-dom';

/** 从 URL 参数提取 simulationId */
export function useSimulationId(): string {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error('缺少 simulationId 参数');
  return id;
}
