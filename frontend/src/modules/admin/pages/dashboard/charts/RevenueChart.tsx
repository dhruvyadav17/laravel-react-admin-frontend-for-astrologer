// Last 30 days revenue line chart using Recharts

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: Array<{ date: string; revenue: number }>;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatRupee(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function RevenueChart({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fas fa-chart-line fa-3x d-block mb-3 opacity-25" />
        <p className="small mb-0">No revenue data yet</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date:    formatDate(d.date),
    revenue: d.revenue,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value: number) => [formatRupee(value), 'Revenue']} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#6366f1' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
