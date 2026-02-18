import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface DeltaItem {
  pathId: string;
  compositeScoreDelta: number;
  regretProbabilityDelta: number;
}

interface DeltaChartProps {
  deltas: DeltaItem[];
  height?: number;
}

export function DeltaChart({ deltas, height = 280 }: DeltaChartProps) {
  const data = deltas.map(d => ({
    name: d.pathId,
    score: +(d.compositeScoreDelta * 100).toFixed(1),
    regret: +(d.regretProbabilityDelta * 100).toFixed(1),
  }));

  return (
    <figure>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }} role="img" aria-label="压力测试变化对比图">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: '变化 (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="score" name="综合评分 Δ">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.score >= 0 ? 'var(--color-chart-positive)' : 'var(--color-chart-negative)'} />
            ))}
          </Bar>
          <Bar dataKey="regret" name="后悔概率 Δ">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.regret <= 0 ? 'var(--color-chart-positive)' : 'var(--color-chart-negative)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>压力测试变化数据</caption>
        <thead><tr><th>路径</th><th>综合评分 Δ (%)</th><th>后悔概率 Δ (%)</th></tr></thead>
        <tbody>
          {data.map(d => (
            <tr key={d.name}><td>{d.name}</td><td>{d.score}</td><td>{d.regret}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
