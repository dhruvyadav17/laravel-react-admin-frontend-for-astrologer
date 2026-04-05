// PATH: src/astrologer/features/earnings/EarningsPage.tsx
// NEW: Earnings page — clean placeholder, real data baad mein

import { useMyStatsQuery } from "../../../store/api/astrologer.api";

export default function EarningsPage() {
  const { data: stats } = useMyStatsQuery();

  const cards = [
    { icon: "fa-rupee-sign", color: "success", label: "This Month",     value: "₹0",          sub: "No consultations yet"   },
    { icon: "fa-phone",      color: "primary", label: "Consultations",  value: stats?.total_consultations ?? 0, sub: "Total completed"  },
    { icon: "fa-star",       color: "warning", label: "Rating",         value: `${(stats?.rating ?? 0).toFixed(1)} ★`, sub: `${stats?.total_reviews ?? 0} reviews` },
    { icon: "fa-clock",      color: "info",    label: "Pending Payout", value: "₹0",          sub: "Processed weekly"       },
  ];

  return (
    <section className="content pt-3">
      <div className="container-fluid">

        <div className="row g-3 mb-4">
          {cards.map(({ icon, color, label, value, sub }) => (
            <div key={label} className="col-6 col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className={`rounded text-white d-flex align-items-center justify-content-center bg-${color}`}
                      style={{ width: 36, height: 36 }}>
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

        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h6 className="card-title mb-0">Earnings Overview</h6>
                <span className="badge bg-secondary">Coming Soon</span>
              </div>
              <div className="card-body text-center py-5 text-muted">
                <i className="fas fa-chart-bar fa-3x d-block mb-3 opacity-25" />
                <p className="mb-0">Chart will appear after your first consultation.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="card-title mb-0">Payout Info</h6>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  {[
                    ["Payout cycle",  "Weekly (every Monday)"],
                    ["Min payout",    "₹500"],
                    ["Platform fee",  "20%"],
                    ["Your share",    "80% of fee"],
                    ["Payment mode",  "Bank / UPI"],
                  ].map(([label, value]) => (
                    <div key={label} className="d-flex justify-content-between">
                      <span className="text-muted small">{label}</span>
                      <span className="small fw-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="alert alert-info mt-3 py-2 small mb-0">
                  <i className="fas fa-info-circle me-1" />
                  Bank details ke liye support se contact karein.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h6 className="card-title mb-0">Recent Transactions</h6></div>
          <div className="card-body text-center py-5 text-muted">
            <i className="fas fa-receipt fa-3x d-block mb-3 opacity-25" />
            <p className="fw-semibold mb-1">No transactions yet</p>
            <p className="small mb-3">Pehla consultation complete karein — earnings yahan dikhne lagingi.</p>
            <div className="small text-start d-inline-block">
              <strong>Zyada earn karne ke liye:</strong>
              <ul className="list-unstyled mt-2">
                <li><i className="fas fa-check text-success me-2" />Profile puri tarah complete karein</li>
                <li><i className="fas fa-check text-success me-2" />Regular online timing set karein</li>
                <li><i className="fas fa-check text-success me-2" />Reviews ka jawab dein</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
