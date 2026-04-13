// REFACTOR: Uses Avatar + PageLoader components

import { Link }                                           from "react-router-dom";
import { useMyStatsQuery, useToggleAvailabilityMutation } from "../../../store/api/astrologer.api";
import { useAuth }                                        from "../../../auth/hooks/useAuth";
import Avatar                                             from "../../../components/ui/Avatar";
import { PageLoader }                                     from "../../../components/ui/States";
import { toast }                                          from "react-toastify";

function StatCard({ icon, color, title, value, sub }: {
  icon: string; color: string; title: string; value: string | number; sub: string;
}) {
  return (
    <div className="col-6 col-md-3">
      <div className="app-card h-100 text-center py-2" style={{ transition: "none" }}>
          <div style={{ fontSize: 32, color: color === "warning" ? "#ca8a04" : color === "primary" ? "var(--primary)" : color === "success" ? "#16a34a" : color === "info" ? "#0284c7" : "var(--txt-m)" }}><i className={`fas ${icon}`} /></div>
          <div className="fw-bold t-main fs-4">{value}</div>
          <div className="fw-semibold t-main small">{title}</div>
          <div className="t-muted" style={{ fontSize: 12 }}>{sub}</div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label, color }: { to: string; icon: string; label: string; color: string }) {
  return (
    <div className="col-md-4">
      <Link to={to} className="app-card text-decoration-none h-100" style={{ transition: "none" }}>
        <div className="d-flex align-items-center gap-3 py-3">
          <i className={`fas ${icon} fs-4`} />
          <span className="fw-semibold">{label}</span>
          <i className="fas fa-chevron-right ms-auto small opacity-50" />
        </div>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user }                               = useAuth();
  const { data: stats, isLoading }             = useMyStatsQuery();
  const [toggleAvail, { isLoading: toggling }] = useToggleAvailabilityMutation();

  const handleToggle = async () => {
    try {
      const res = await toggleAvail().unwrap();
      toast.success(res.is_online ? "You are now Online" : "You are now Offline");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <>


        <div className="app-card mb-4" style={{ transition: "none" }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <Avatar name={user?.name} size={48} />
              <div>
                <h5 className="mb-0 fw-bold">Welcome, {user?.name}</h5>
                <small className="t-muted">Astrologer Dashboard</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="t-muted small fw-semibold">Go Online:</span>
              <div className="form-check form-switch mb-0">
                <input className="form-check-input" type="checkbox" role="switch"
                  id="onlineToggle" checked={stats?.is_online ?? false}
                  onChange={handleToggle} disabled={toggling}
                  style={{ width: "3em", height: "1.5em", cursor: "pointer" }} />
                <label className={`form-check-label fw-semibold ${stats?.is_online ? "text-success" : "text-secondary"}`}
                  htmlFor="onlineToggle">
                  {toggling ? "..." : stats?.is_online ? "Online" : "Offline"}
                </label>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? <PageLoader /> : (
          <div className="row g-3 mb-4">
            <StatCard icon="fa-star"     color="warning"                                     title="Rating"        value={`${stats?.rating?.toFixed(1) ?? "0.0"} / 5.0`} sub="average rating" />
            <StatCard icon="fa-comments" color="primary"                                     title="Reviews"       value={stats?.total_reviews ?? 0}       sub="from clients" />
            <StatCard icon="fa-phone"    color="success"                                     title="Consultations" value={stats?.total_consultations ?? 0} sub="completed" />
            <StatCard icon="fa-circle"   color={stats?.is_available ? "success" : "secondary"} title="Availability"  value={stats?.is_available ? "Available" : "Busy"} sub="current status" />
          </div>
        )}

        <div className="row g-3">
          <QuickLink to="/astrologer/profile"  icon="fa-user-edit"    label="Edit My Profile" color="primary" />
          <QuickLink to="/astrologer/schedule" icon="fa-calendar-alt" label="Manage Schedule" color="info"    />
          <QuickLink to="/astrologer/reviews"  icon="fa-star"         label="View My Reviews" color="warning" />
        </div>

    </>
  );
}
