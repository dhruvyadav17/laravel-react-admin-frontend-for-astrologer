// PATH: src/features/admin/dashboard/charts/ConsultationTypeChart.tsx
// Pie chart — chat/call/video breakdown

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS: Record<string, string> = {
  chat:  '#6366f1',
  call:  '#22c55e',
  video: '#f59e0b',
};

const LABELS: Record<string, string> = {
  chat:  'Chat',
  call:  'Voice Call',
  video: 'Video Call',
};

interface Props {
  data: Record<string, number>;
}

export default function ConsultationTypeChart({ data }: Props) {
  const chartData = Object.entries(data ?? {}).map(([key, value]) => ({
    name:  LABELS[key] ?? key,
    value: Number(value),
    color: COLORS[key]  ?? '#94a3b8',
  }));

  if (!chartData.length || chartData.every((d) => d.value === 0)) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fas fa-chart-pie fa-3x d-block mb-3 opacity-25" />
        <p className="small mb-0">No completed consultations yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value} consultations`, '']} />
        <Legend iconType="circle" iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  );
}
