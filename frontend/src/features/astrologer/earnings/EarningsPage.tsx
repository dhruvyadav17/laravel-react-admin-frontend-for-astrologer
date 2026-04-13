import { useMyStatsQuery, useMyEarningsQuery } from '../../../store/api/astrologer.api';

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

export default function EarningsPage() {
  const { data: stats } = useMyStatsQuery();
  const { data: earningsData } = useMyEarningsQuery();

  const summary = earningsData?.summary as EarningSummary | undefined;
  const earnings = (earningsData?.data as EarningRecord[] | undefined) ?? [];

  const cards = [
    {
      icon: 'fa-rupee-sign',
      color: 'success',
      label: 'Total Earned',
      value: `?${(summary?.total_net ?? 0).toFixed(2)}`,
      sub: 'All time net earnings (after 20% fee)',
    },
    {
      icon: 'fa-phone',
      color: 'primary',
      label: 'Consultations',
      value: stats?.total_consultations ?? 0,
      sub: 'Total completed sessions',
    },
    {
      icon: 'fa-star',
      color: 'warning',
      label: 'Rating',
      value: `${(stats?.rating ?? 0).toFixed(1)} ?`,
      sub: `${stats?.total_reviews ?? 0} reviews`,
    },
    {
      icon: 'fa-clock',
      color: 'info',
      label: 'Pending Payout',
      value: `?${(summary?.pending_payout ?? 0).toFixed(2)}`,
      sub: 'Processed every Monday',
    },
  ];

  return (
    <>
      <div className="row g-3 mb-4">
        {cards.map(({ icon, color, label, value, sub }) => (
          <div key={label} className="col-6 col-md-3">
            <div className="app-card h-100">
              <div className="p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div
                    className="rounded d-flex align-items-center justify-content-center text-white"
                    style={{ background: `var(--bs-${color}, #6c757d)`, width: 36, height: 36 }}
                  >
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

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="app-card h-100">
            <div className="fw-bold t-main pb-3 mb-3" style={{ borderBottom: '1px solid var(--bdr)' }}>
              <h6 className="fw-bold t-main mb-0">Payout Info</h6>
            </div>
            <div className="p-3">
              <div className="d-flex flex-column gap-3">
                {[
                  ['Payout cycle', 'Weekly (every Monday)'],
                  ['Min payout', '?500'],
                  ['Platform fee', '20%'],
                  ['Your share', '80% of session fee'],
                  ['Payment mode', 'Bank / UPI'],
                  ['Total settled', `?${(summary?.settled ?? 0).toFixed(2)}`],
                ].map(([label, value]) => (
                  <div key={label} className="d-flex justify-content-between align-items-center">
                    <span className="t-muted small">{label}</span>
                    <span className="small fw-semibold">{value}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 small mt-3 mb-0" style={{ background: 'rgba(14,165,233,.10)', border: '1px solid rgba(14,165,233,.3)', color: '#0284c7' }}>
                <i className="fas fa-info-circle me-1" />
                Contact support to update your bank details.
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="app-card h-100">
            <div className="d-flex justify-content-between align-items-center fw-bold t-main pb-3 mb-3" style={{ borderBottom: '1px solid var(--bdr)' }}>
              <h6 className="fw-bold t-main mb-0">Recent Earnings</h6>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(100,116,139,.15)', color: '#475569', border: '1px solid rgba(100,116,139,.3)' }}>{earnings.length} records</span>
            </div>

            {earnings.length === 0 ? (
              <div className="text-center py-5 t-muted">
                <i className="fas fa-receipt fa-3x d-block mb-3 opacity-25" />
                <p className="fw-semibold mb-1">No earnings yet</p>
                <p className="small mb-0">Complete your first consultation</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ background: 'var(--surf2)' }}>
                    <tr>
                      <th className="small">Session #</th>
                      <th className="small">Gross</th>
                      <th className="small">Fee (20%)</th>
                      <th className="small">Your Share</th>
                      <th className="small">Status</th>
                      <th className="small">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((e) => (
                      <tr key={e.id}>
                        <td className="small t-muted">#{e.consultation_id}</td>
                        <td className="small">?{e.gross_amount}</td>
                        <td className="small t-muted">?{e.platform_fee}</td>
                        <td className="small fw-semibold text-success">?{e.net_amount}</td>
                        <td>
                          <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: e.status === 'settled' ? 'rgba(34,197,94,.15)' : 'rgba(234,179,8,.15)', color: e.status === 'settled' ? '#16a34a' : '#ca8a04', border: `1px solid ${e.status === 'settled' ? 'rgba(34,197,94,.3)' : 'rgba(234,179,8,.3)'}` }}>
                            {e.status}
                          </span>
                        </td>
                        <td className="small t-muted">{e.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="p-3">
          <h6 className="fw-bold mb-3">
            <i className="fas fa-lightbulb text-warning me-2" />
            Tips to Maximize Your Earnings
          </h6>
          <div className="row g-2">
            {[
              'Complete your profile fully -- add photo, bio, and expertise',
              'Set regular online hours -- users prefer available astrologers',
              'Respond to every review -- it improves your overall rating',
              'Keep prices competitive -- ?15-25/min is ideal for beginners',
            ].map((text) => (
              <div key={text} className="col-md-6">
                <div className="d-flex align-items-start gap-2">
                  <i className="fas fa-check-circle mt-1 flex-shrink-0" style={{ color: '#16a34a' }} />
                  <span className="small">{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
