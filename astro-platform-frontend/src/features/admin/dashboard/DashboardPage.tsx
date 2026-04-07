// PATH: src/admin/features/dashboard/DashboardPage.tsx
// FEATURE: Online astrologers count widget add kiya
// FEATURE: Quick action cards — go to users, astrologers pages
// IMPROVEMENT: Better layout with recent activity section placeholder

import { useMemo }                  from "react";
import { useNavigate }              from "react-router-dom";
import { useGetDashboardStatsQuery } from "../../../store/api";
import AdminPage                    from "../../../admin/components/page/AdminPage";
import AdminCard                    from "../../../admin/components/ui/AdminCard";
import InfoBox                      from "../../../admin/components/ui/InfoBox";

/* ── Quick action card ────────────────────────────── */
function QuickAction({
  icon, label, description, onClick, color = "primary",
}: {
  icon: string; label: string; description: string;
  onClick: () => void; color?: string;
}) {
  return (
    <div className="col-md-4">
      <button
        className="btn w-100 h-100 text-start p-0 border-0"
        onClick={onClick}
      >
        <div className={`card border-${color} border-opacity-25 h-100`}>
          <div className="card-body">
            <div className={`text-${color} mb-2`} style={{ fontSize: 28 }}>
              <i className={`fas ${icon}`} />
            </div>
            <h6 className="fw-bold mb-1">{label}</h6>
            <p className="text-muted small mb-0">{description}</p>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const navigate                    = useNavigate();
  const { data: stats, isLoading }  = useGetDashboardStatsQuery();

  const widgets = useMemo(() => [
    {
      title: "Total Users",
      value: stats?.total_users         ?? 0,
      icon:  "fas fa-users",
      color: "primary",
    },
    {
      title: "Astrologers",
      value: stats?.total_astrologers   ?? 0,
      icon:  "fas fa-user-astronaut",
      color: "success",
    },
    {
      title: "Online Now",
      value: stats?.online_astrologers  ?? 0,
      icon:  "fas fa-circle",
      color: "warning",
    },
    {
      title: "Consultations",
      value: stats?.total_consultations ?? 0,
      icon:  "fas fa-comments",
      color: "info",
    },
  ], [stats]);

  return (
    <AdminPage title="Astrology Dashboard">

      {/* Stats widgets */}
      <AdminCard loading={isLoading}>
        <div className="row g-3">
          {widgets.map(({ title, ...rest }) => (
            <div key={title} className="col-lg-3 col-6">
              <InfoBox title={title} {...rest} />
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Quick actions */}
      <div className="mt-4">
        <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: 12, letterSpacing: 1 }}>
          Quick Actions
        </h6>
        <div className="row g-3">
          <QuickAction
            icon="fa-users"
            label="Manage Users"
            description="View, create and manage user accounts"
            onClick={() => navigate("/admin/users")}
            color="primary"
          />
          <QuickAction
            icon="fa-user-astronaut"
            label="Manage Astrologers"
            description="Verify, update and monitor astrologers"
            onClick={() => navigate("/admin/astrologers")}
            color="success"
          />
          <QuickAction
            icon="fa-shield-alt"
            label="Roles & Permissions"
            description="Configure access control"
            onClick={() => navigate("/admin/roles")}
            color="warning"
          />
        </div>
      </div>

      {/* Revenue placeholder */}
      <div className="mt-4">
        <AdminCard>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold mb-0">Revenue Overview</h6>
            <span className="badge bg-secondary">Coming Soon</span>
          </div>
          <div className="text-center py-4 text-muted">
            <i className="fas fa-rupee-sign fa-3x d-block mb-3 opacity-25" />
            <p className="mb-0 small">
              Revenue tracking will be available once the consultation billing system is integrated.
            </p>
          </div>
        </AdminCard>
      </div>

    </AdminPage>
  );
}
