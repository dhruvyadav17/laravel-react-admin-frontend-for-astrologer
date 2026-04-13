import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardStatsQuery } from '../../../store/api';
import AdminPage from '../../../admin/components/page/AdminPage';
import AdminCard from '../../../admin/components/ui/AdminCard';
import InfoBox from '../../../admin/components/ui/InfoBox';
import RevenueChart from './charts/RevenueChart';
import ConsultationTypeChart from './charts/ConsultationTypeChart';

function QuickAction({
  icon,
  label,
  description,
  onClick,
  color = 'primary',
}: {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}) {
  return (
    <div className="col-md-4">
      <button className="btn w-100 h-100 text-start p-0 border-0" onClick={onClick}>
        <div className={`card border-${color} border-opacity-25 h-100 hover-shadow`}>
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
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  const widgets = useMemo(() => [
    { title: 'Total Users', value: stats?.total_users ?? 0, icon: 'fas fa-users', color: 'primary' as const },
    { title: 'Astrologers', value: stats?.total_astrologers ?? 0, icon: 'fas fa-user-astronaut', color: 'success' as const },
    { title: 'Online Now', value: stats?.online_astrologers ?? 0, icon: 'fas fa-circle', color: 'warning' as const },
    { title: 'Total Sessions', value: stats?.total_consultations ?? 0, icon: 'fas fa-comments', color: 'info' as const },
  ], [stats]);

  return (
    <AdminPage title="Astrology Dashboard">
      <AdminCard loading={isLoading}>
        <div className="row g-3">
          {widgets.map(({ title, ...rest }) => (
            <div key={title} className="col-lg-3 col-6">
              <InfoBox title={title} {...rest} />
            </div>
          ))}
        </div>
      </AdminCard>

      {!isLoading && (
        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <div className="card border-0 h-100" style={{ background: 'rgba(34,197,94,.10)' }}>
              <div className="card-body">
                <div className="text-success mb-1" style={{ fontSize: 12 }}>TODAY'S REVENUE</div>
                <h3 className="fw-bold mb-0">?{(stats?.revenue_today ?? 0).toLocaleString('en-IN')}</h3>
                <div className="text-muted small mt-1">{stats?.consultations_today ?? 0} consultations today</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 h-100" style={{ background: 'rgba(37,99,235,.10)' }}>
              <div className="card-body">
                <div className="text-primary mb-1" style={{ fontSize: 12 }}>LAST 30 DAYS</div>
                <h3 className="fw-bold mb-0">?{(stats?.revenue_30d ?? 0).toLocaleString('en-IN')}</h3>
                <div className="text-muted small mt-1">Monthly revenue</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 h-100" style={{ background: 'rgba(234,179,8,.10)' }}>
              <div className="card-body">
                <div className="text-warning mb-1" style={{ fontSize: 12 }}>TOTAL REVENUE</div>
                <h3 className="fw-bold mb-0">?{(stats?.revenue ?? 0).toLocaleString('en-IN')}</h3>
                <div className="text-muted small mt-1">All time earnings</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mt-1">
        <div className="col-md-8">
          <AdminCard>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Revenue - Last 30 Days</h6>
            </div>
            <RevenueChart data={stats?.revenue_chart ?? []} />
          </AdminCard>
        </div>
        <div className="col-md-4">
          <AdminCard>
            <h6 className="fw-bold mb-3">Consultation Types</h6>
            <ConsultationTypeChart data={stats?.type_breakdown ?? {}} />
          </AdminCard>
        </div>
      </div>

      <div className="mt-4">
        <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: 12, letterSpacing: 1 }}>
          Quick Actions
        </h6>
        <div className="row g-3">
          <QuickAction icon="fa-users" label="Manage Users" description="View, create and manage user accounts" onClick={() => navigate('/admin/users')} color="primary" />
          <QuickAction icon="fa-user-astronaut" label="Manage Astrologers" description="Verify, update and monitor astrologers" onClick={() => navigate('/admin/astrologers')} color="success" />
          <QuickAction icon="fa-history" label="Activity Log" description="View user actions and system events" onClick={() => navigate('/admin/activity')} color="warning" />
        </div>
      </div>
    </AdminPage>
  );
}
