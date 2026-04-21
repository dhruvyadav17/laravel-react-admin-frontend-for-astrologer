import { useState } from 'react';
import { useMyStatsQuery, useMyEarningsQuery } from '../../../../store/astrologer.api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

interface EarningSummary {
  total_gross: number;
  total_net: number;
  pending_payout: number;
  settled: number;
  total_jobs: number;
}

interface EarningRecord {
  id: number;
  consultation_id: number;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: 'pending' | 'settled';
  created_at: string;
}

// Custom tooltip for chart
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-3 shadow" style={{
      background: 'var(--surf)', border: '1px solid var(--bdr)', fontSize: 12,
    }}>
      <div className="fw-semibold t-main mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value).toFixed(2)}
        </div>
      ))}
    </div>
  );
}

export default function EarningsPage() {
  const { data: stats }        = useMyStatsQuery();
  const { data: earningsData } = useMyEarningsQuery();
  const [chartType, setChartType] = useState<'net' | 'gross'>('net');

  const summary  = earningsData?.summary as EarningSummary | undefined;
  const earnings = (earningsData?.data as EarningRecord[] | undefined) ?? [];

  // Build chart data from last 10 earnings
  const chartData = earnings.slice(0, 10).reverse().map((e, i) => ({
    name: `#${e.consultation_id}`,
    gross: e.gross_amount,
    net: e.net_amount,
    fee: e.platform_fee,
  }));

  const cards = [
    {
      icon: 'fa-rupee-sign', color: '#16a34a',
      label: 'Total Earned',
      value: `₹${(summary?.total_net ?? 0).toFixed(2)}`,
      sub: 'All time net earnings (after 20% fee)',
    },
    {
      icon: 'fa-phone', color: '#2563eb',
      label: 'Consultations',
      value: stats?.total_consultations ?? 0,
      sub: 'Total completed sessions',
    },
    {
      icon: 'fa-star', color: '#ca8a04',
      label: 'Rating',
      value: `${(stats?.rating ?? 0).toFixed(1)} ★`,
      sub: `${stats?.total_reviews ?? 0} reviews`,
    },
    {
      icon: 'fa-clock', color: '#0284c7',
      label: 'Pending Payout',
      value: `₹${(summary?.pending_payout ?? 0).toFixed(2)}`,
      sub: 'Processed every Monday',
    },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {cards.map(({ icon, color, label, value, sub }) => (
          <div key={label} className="col-6 col-md-3">
            <div className="app-card h-100">
              <div className="p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="rounded d-flex align-items-center justify-content-center text-white"
                    style={{ background: color, width: 36, height: 36 }}>
                    <i className={`fas ${icon}`} style={{ fontSize: 14 }} />
                  </div>
                  <span className="small t-muted fw-semibold">{label}</span>
                </div>
                <div className="fw-bold fs-4">{value}</div>
                <div className="t-muted" style={{ fontSize: 12 }}>{sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings Chart */}
      {chartData.length > 0 && (
        <div className="app-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold t-main mb-0">
              <i className="fas fa-chart-bar me-2 text-primary" />
              Earnings Chart (Last 10 sessions)
            </h6>
            <div className="d-flex gap-1">
              {(['net', 'gross'] as const).map(t => (
                <button key={t}
                  className={`btn btn-sm ${chartType === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20 }}
                  onClick={() => setChartType(t)}>
                  {t === 'net' ? 'Net (Your Share)' : 'Gross (Total)'}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--txt-m)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--txt-m)' }}
                tickFormatter={v => `₹${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey={chartType} name={chartType === 'net' ? 'Your Earning' : 'Gross Amount'}
                radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i}
                    fill={chartType === 'net' ? '#22c55e' : '#e63946'}
                    fillOpacity={0.8 + (i / chartData.length) * 0.2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="d-flex gap-4 justify-content-center mt-2">
            <span className="small t-muted d-flex align-items-center gap-1">
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />
              Your 80% share
            </span>
            <span className="small t-muted d-flex align-items-center gap-1">
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#e63946', display: 'inline-block' }} />
              Gross total
            </span>
          </div>
        </div>
      )}

      {/* Payout Info + Recent Earnings */}
      <div className="row g-3">
        <div className="col-md-5">
          <div className="app-card h-100">
            <h6 className="fw-bold t-main mb-3">
              <i className="fas fa-info-circle me-2 text-primary" />Payout Info
            </h6>
            {[
              ['Payout cycle',  'Weekly (every Monday)'],
              ['Min payout',    '₹500'],
              ['Platform fee',  '20%'],
              ['Your share',    '80% of session fee'],
            ].map(([l, v]) => (
              <div key={l} className="d-flex justify-content-between py-2"
                style={{ borderBottom: '1px solid var(--bdr)' }}>
                <span className="t-muted small">{l}</span>
                <span className="fw-semibold small">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-7">
          <div className="app-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold t-main mb-0">
                <i className="fas fa-history me-2 text-primary" />Recent Earnings
              </h6>
              {earnings.length > 0 && (
                <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: 11 }}>
                  {earnings.length} records
                </span>
              )}
            </div>

            {earnings.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-receipt fa-3x d-block mb-2 opacity-25" />
                <p className="t-muted small mb-0">No earnings yet</p>
                <p className="t-muted" style={{ fontSize: 11 }}>Complete your first consultation</p>
              </div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {earnings.map((e) => (
                  <div key={e.id} className="d-flex align-items-center gap-3 py-2"
                    style={{ borderBottom: '1px solid var(--bdr)' }}>
                    <div className={`rounded-2 d-flex align-items-center justify-content-center`}
                      style={{ width: 32, height: 32, flexShrink: 0,
                        background: e.status === 'settled' ? 'rgba(34,197,94,.12)' : 'rgba(234,179,8,.12)' }}>
                      <i className={`fas ${e.status === 'settled' ? 'fa-check' : 'fa-clock'}`}
                        style={{ fontSize: 12, color: e.status === 'settled' ? '#16a34a' : '#ca8a04' }} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold">Consultation #{e.consultation_id}</div>
                      <div className="t-muted" style={{ fontSize: 11 }}>{e.created_at}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold small text-success">+₹{e.net_amount.toFixed(2)}</div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 20,
                        background: e.status === 'settled' ? 'rgba(34,197,94,.12)' : 'rgba(234,179,8,.12)',
                        color: e.status === 'settled' ? '#16a34a' : '#ca8a04',
                      }}>
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
