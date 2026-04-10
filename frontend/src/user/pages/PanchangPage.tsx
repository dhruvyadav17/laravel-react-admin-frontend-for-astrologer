// PATH: src/user/pages/PanchangPage.tsx
// IMPROVEMENT: Previously it showed only "Coming from API soon..." (empty UI)
//              Now includes proper placeholder cards with date picker + sections
//              When API is ready, only replace static values with real data

import { useState } from "react";
import UserPage from "../components/ui/UserPage";

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/* ── Info Card ───────────────────────────────────── */
function PanchangCard({
  icon,
  title,
  value,
  color = "primary",
}: {
  icon: string;
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="col-sm-6 col-md-3">
      <div className="app-card text-center py-3">
        <div className={`text-${color} mb-2`} style={{ fontSize: 28 }}>
          <i className={`fas ${icon}`} />
        </div>
        <div className="fw-semibold small mb-1">{title}</div>
        <div className="text-muted small">{value}</div>
      </div>
    </div>
  );
}

export default function PanchangPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  return (
    <UserPage title="📅 Panchang">

      {/* Date Selector */}
      <div className="text-center mb-4">
        <label className="form-label fw-semibold mb-2 d-block">
          Select Date
        </label>
        <input
          type="date"
          className="form-control w-auto mx-auto shadow-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <p className="text-muted small mt-2">{formatDate(date)}</p>
      </div>

      {/* Info Notice */}
      <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
        <i className="fas fa-info-circle" />
        <span>
          Live Panchang data integration is coming soon. The preview below shows the layout structure.
        </span>
      </div>

      {/* Main Panchang Info */}
      <div className="row g-3 mb-4">
        <PanchangCard icon="fa-sun"      title="Tithi"     value="—" color="warning" />
        <PanchangCard icon="fa-star"     title="Nakshatra" value="—" color="primary" />
        <PanchangCard icon="fa-moon"     title="Yoga"      value="—" color="info" />
        <PanchangCard icon="fa-calendar" title="Karan"     value="—" color="success" />
      </div>

      <div className="row g-3">
        {/* Sunrise / Sunset */}
        <div className="col-md-6">
          <div className="app-card">
            <h6 className="fw-bold mb-3">
              <i className="fas fa-sun text-warning me-2" />
              Sunrise & Sunset
            </h6>
            <div className="row text-center">
              <div className="col-6">
                <div className="text-muted small">Sunrise</div>
                <div className="fw-semibold">—</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Sunset</div>
                <div className="fw-semibold">—</div>
              </div>
            </div>
          </div>
        </div>

        {/* Auspicious Timings */}
        <div className="col-md-6">
          <div className="app-card">
            <h6 className="fw-bold mb-3">
              <i className="fas fa-clock text-primary me-2" />
              Auspicious Timings
            </h6>
            <div className="row text-center">
              <div className="col-6">
                <div className="text-muted small">Rahu Kaal</div>
                <div className="fw-semibold">—</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Abhijit Muhurat</div>
                <div className="fw-semibold">—</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </UserPage>
  );
}