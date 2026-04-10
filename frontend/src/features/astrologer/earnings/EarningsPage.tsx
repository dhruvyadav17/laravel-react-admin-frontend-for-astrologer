// PATH: src/features/astrologer/earnings/EarningsPage.tsx
// IMPROVED: Real earnings from API

import { useMyStatsQuery, useMyEarningsQuery } from '../../../store/api/astrologer.api';

interface EarningSummary {
  total_gross:    number;
  total_net:      number;
  pending_payout: number;
  settled:        number;
  total_jobs:     number;
}

interface EarningRecord {
  id:              number;
  consultation_id: number;
  gross_amount:    number;
  platform_fee:    number;
  net_amount:      number;
  status:          'pending' | 'settled';
  created_at:      string;
}

export default function EarningsPage() {
  const { data: stats }        = useMyStatsQuery();
  const { data: earningsData } = useMyEarningsQuery();

  const summary  = earningsData?.summary  as EarningSummary  | undefined;
  const earnings = (earningsData?.data    as EarningRecord[] | undefined) ?? [];

  const cards = [
    {
      icon: 'fa-rupee-sign', color: 'success',
      label: 'Total Earned',
      value: `₹${(summary?.total_net ?? 0).toFixed(2)}`,
      sub: 'All time net earnings (after 20% fee)',
    },
    {
      icon: 'fa-phone', color: 'primary',
      label: 'Consultations',
      value: stats?.total_consultations ?? 0,
      sub: 'Total completed sessions',
    },
    {
      icon: 'fa-star', color: 'warning',
      label: 'Rating',
      value: `${(stats?.rating ?? 0).toFixed(1)} ★`,
      sub: `${stats?.total_reviews ?? 0} reviews`,
    },
    {
      icon: 'fa-clock', color: 'info',
      label: 'Pending Payout',
      value: `₹${(summary?.pending_payout ?? 0).toFixed(2)}`,
      sub: 'Processed every Monday',
    },
  ];

  return (
    <>
      {/* Stats cards */}
      <div className="row g-3 mb-4">
        {cards.map(({ icon, color, label, value, sub }) => (
          <div key={label} className="col-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div
                    className={`rounded text-white d-flex align-items-center justify-content-center bg-${color}`}
                    style={{ width: 36, height: 36 }}
                  >
                    <i className={`fas ${icon}`} style={{ fontSize: 14 }} />
                  </div>
                  <span className="small text-muted fw-semibold">{label}</span>
                </div>
                <div className="fw-bold fs-4">{value}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content row */}
      <div className="row g-3 mb-4">

        {/* Payout info */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Payout Info</h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {[
                  ['Payout cycle',   'Weekly (every Monday)'],
                  ['Min payout',     '₹500'],
                  ['Platform fee',   '20%'],
                  ['Your share',     '80% of session fee'],
                  ['Payment mode',   'Bank / UPI'],
                  ['Total settled',  `₹${(summary?.settled ?? 0).toFixed(2)}`],
                ].map(([label, value]) => (
                  <div key={label} className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">{label}</span>
                    <span className="small fw-semibold">{value}</span>
                  </div>
                ))}
              </div>

              <div className="alert alert-info mt-3 py-2 small mb-0">
                <i className="fas fa-info-circle me-1" />
                Bank details update ke liye support se contact karein.
              </div>
            </div>
          </div>
        </div>

        {/* Earnings history */}
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Recent Earnings</h6>
              <span className="badge bg-secondary">{earnings.length} records</span>
            </div>

            {earnings.length === 0 ? (
              <div className="card-body text-center py-5 text-muted">
                <i className="fas fa-receipt fa-3x d-block mb-3 opacity-25" />
                <p className="fw-semibold mb-1">No earnings yet</p>
                <p className="small mb-0">Pehla consultation complete karein</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
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
                        <td className="small text-muted">#{e.consultation_id}</td>
                        <td className="small">₹{e.gross_amount}</td>
                        <td className="small text-muted">₹{e.platform_fee}</td>
                        <td className="small fw-semibold text-success">₹{e.net_amount}</td>
                        <td>
                          <span className={`badge bg-${e.status === 'settled' ? 'success' : 'warning text-dark'}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="small text-muted">{e.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card">
        <div className="card-body">
          <h6 className="fw-bold mb-3">
            <i className="fas fa-lightbulb text-warning me-2" />
            Zyada earn karne ke tips
          </h6>
          <div className="row g-2">
            {[
              ['fa-check-circle', 'success', 'Profile puri tarah complete karein — photo, bio, expertise'],
              ['fa-check-circle', 'success', 'Regular online timing set karein — users online astrologer prefer karte hain'],
              ['fa-check-circle', 'success', 'Har review ka jawab dein — rating improve hogi'],
              ['fa-check-circle', 'success', 'Price competitive rakho — ₹15-25/min beginners ke liye'],
            ].map(([icon, color, text]) => (
              <div key={text} className="col-md-6">
                <div className="d-flex align-items-start gap-2">
                  <i className={`fas ${icon} text-${color} mt-1 flex-shrink-0`} />
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
