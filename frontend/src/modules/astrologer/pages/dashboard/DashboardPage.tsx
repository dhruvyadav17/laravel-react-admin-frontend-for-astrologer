/**
 * Astrologer DashboardPage — improved with today's stats,
 * pending request count, earning summary, and quick actions.
 */
import { useMemo }   from 'react';
import { Link }      from 'react-router-dom';
import {
  useMyStatsQuery,
  useToggleAvailabilityMutation,
  useMyEarningsQuery,
} from '../../../../store/astrologer.api';
import { useAstrologerConsultationsQuery } from '../../../../store/consultation.api';
import { useAuth }    from '../../../auth/hooks/useAuth';
import Avatar         from '../../../../components/ui/Avatar';
import { PageLoader } from '../../../../components/ui/States';
import { toast }      from 'react-toastify';

/* ── Stat Card ──────────────────────────────────── */
function StatCard({ icon, color, title, value, sub, pulse = false }: {
  icon: string; color: string; title: string;
  value: string | number; sub: string; pulse?: boolean;
}) {
  const colorMap: Record<string, string> = {
    warning: '#ca8a04', primary: 'var(--primary)',
    success: '#16a34a', info: '#0284c7',
    danger: '#dc2626',  secondary: '#64748b',
  };
  return (
    <div className="col-6 col-md-3">
      <div className="app-card h-100 text-center py-2" style={{ transition: 'none' }}>
        <div style={{ fontSize: 28, color: colorMap[color] ?? 'var(--txt-m)', position: 'relative', display: 'inline-block' }}>
          <i className={`fas ${icon}`} />
          {pulse && (
            <span style={{
              position: 'absolute', top: -2, right: -2, width: 10, height: 10,
              borderRadius: '50%', background: '#ef4444',
              animation: 'pulse 1.5s infinite',
            }} />
          )}
        </div>
        <div className="fw-bold t-main fs-4">{value}</div>
        <div className="fw-semibold t-main small">{title}</div>
        <div className="t-muted" style={{ fontSize: 12 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ── Quick Link ─────────────────────────────────── */
function QuickLink({ to, icon, label, badge }: {
  to: string; icon: string; label: string; badge?: number;
}) {
  return (
    <div className="col-md-4 col-6">
      <Link to={to} className="app-card text-decoration-none h-100 d-block position-relative" style={{ transition: 'none' }}>
        <div className="d-flex align-items-center gap-3 py-2">
          <i className={`fas ${icon} fs-5 t-muted`} />
          <span className="fw-semibold small">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="badge bg-danger ms-auto" style={{ fontSize: 10 }}>{badge}</span>
          )}
          <i className="fas fa-chevron-right ms-auto small opacity-30" />
        </div>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user }  = useAuth();
  const { data: stats, isLoading } = useMyStatsQuery();
  const { data: earningsData }     = useMyEarningsQuery();
  const { data: pendingData }      = useAstrologerConsultationsQuery({ status: 'pending' }, { pollingInterval: 15000 });
  const { data: activeData }       = useAstrologerConsultationsQuery({ status: 'in_progress' }, { pollingInterval: 10000 });
  const [toggleAvail, { isLoading: toggling }] = useToggleAvailabilityMutation();

  const pendingCount = pendingData?.data?.length ?? 0;
  const activeCount  = activeData?.data?.length  ?? 0;
  const summary      = earningsData?.summary as any;

  const handleToggle = async () => {
    try {
      const res = await toggleAvail().unwrap();
      toast.success(res.is_online ? '✅ You are now Online' : 'You are now Offline');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Today's earnings estimate from recent records
  const todayEarnings = useMemo(() => {
    const today = new Date().toDateString();
    return (earningsData?.data as any[] ?? [])
      .filter((e: any) => {
        // created_at is diffForHumans — check if "ago" is today
        return e.created_at?.includes('second') ||
               e.created_at?.includes('minute') ||
               e.created_at?.includes('hour');
      })
      .reduce((sum: number, e: any) => sum + (e.net_amount ?? 0), 0);
  }, [earningsData]);

  return (
    <>
      {/* Welcome + Online toggle */}
      <div className="app-card mb-4" style={{ transition: 'none' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <Avatar name={user?.name} size={52} />
            <div>
              <h5 className="mb-0 fw-bold">Welcome, {user?.name?.split(' ')[0]} 🙏</h5>
              <small className="t-muted">
                {stats?.is_online
                  ? <><span className="text-success fw-semibold">● Online</span> — receiving new requests</>
                  : <><span className="text-secondary fw-semibold">○ Offline</span> — go online to receive requests</>}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Active session alert */}
            {activeCount > 0 && (
              <Link to="/astrologer/consultations"
                className="btn btn-sm btn-success fw-semibold px-3"
                style={{ animation: 'pulse 1.5s infinite' }}>
                <i className="fas fa-circle me-1" style={{ fontSize: 8 }} />
                {activeCount} Active Session{activeCount > 1 ? 's' : ''}
              </Link>
            )}

            {/* Online toggle */}
            <div className="d-flex align-items-center gap-2">
              <span className="t-muted small fw-semibold">Online:</span>
              <div className="form-check form-switch mb-0">
                <input className="form-check-input" type="checkbox" role="switch"
                  id="onlineToggle" checked={stats?.is_online ?? false}
                  onChange={handleToggle} disabled={toggling}
                  style={{ width: '3em', height: '1.5em', cursor: 'pointer' }} />
                <label className={`form-check-label fw-semibold ${stats?.is_online ? 'text-success' : 'text-secondary'}`}
                  htmlFor="onlineToggle">
                  {toggling ? '...' : stats?.is_online ? 'Yes' : 'No'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {/* Pending request banner */}
          {pendingCount > 0 && (
            <Link to="/astrologer/consultations"
              className="d-flex align-items-center gap-3 mb-4 text-decoration-none p-3 rounded-3"
              style={{ background: 'rgba(234,179,8,.10)', border: '2px solid rgba(234,179,8,.4)' }}>
              <i className="fas fa-bell text-warning fa-lg" style={{ animation: 'pulse 1s infinite' }} />
              <div className="flex-grow-1">
                <div className="fw-bold" style={{ color: '#ca8a04' }}>
                  {pendingCount} New Request{pendingCount > 1 ? 's' : ''} Waiting!
                </div>
                <div className="t-muted small">Respond quickly — users prefer fast responses</div>
              </div>
              <i className="fas fa-arrow-right text-warning" />
            </Link>
          )}

          {/* Stats grid */}
          <div className="row g-3 mb-4">
            <StatCard icon="fa-star"     color="warning" title="Rating"        value={`${(stats?.rating ?? 0).toFixed(1)} ★`}      sub="average from clients" />
            <StatCard icon="fa-phone"    color="primary" title="Consultations" value={stats?.total_consultations ?? 0}               sub="total completed" />
            <StatCard icon="fa-rupee-sign" color="success" title="Total Earned"  value={`₹${(summary?.total_net ?? 0).toFixed(0)}`}  sub="net earnings (80%)" />
            <StatCard icon="fa-bell"     color="danger"  title="Pending"       value={pendingCount}                                   sub="new requests" pulse={pendingCount > 0} />
          </div>

          {/* Earnings overview */}
          {summary && (
            <div className="app-card mb-4">
              <h6 className="fw-bold t-main mb-3">
                <i className="fas fa-rupee-sign me-2 text-success" />Earnings Overview
              </h6>
              <div className="row g-3">
                {[
                  { label: 'Today (approx)',   value: `₹${todayEarnings.toFixed(2)}`, color: '#2563eb' },
                  { label: 'Pending Payout',   value: `₹${(summary.pending_payout ?? 0).toFixed(2)}`, color: '#ca8a04' },
                  { label: 'Total Net',        value: `₹${(summary.total_net ?? 0).toFixed(2)}`,      color: '#16a34a' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="col-md-4">
                    <div className="text-center p-3 rounded-3" style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                      <div className="fw-bold fs-5" style={{ color }}>{value}</div>
                      <div className="t-muted small">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--bdr)' }}>
                <p className="t-muted small mb-0">
                  <i className="fas fa-info-circle me-1" />
                  Payouts processed every Monday. Platform fee: 20%. Your share: 80%.
                </p>
              </div>
            </div>
          )}

          {/* Quick links */}
          <h6 className="fw-bold t-main mb-3">Quick Actions</h6>
          <div className="row g-3">
            <QuickLink to="/astrologer/consultations" icon="fa-phone"      label="Consultations"  badge={pendingCount} />
            <QuickLink to="/astrologer/profile"       icon="fa-user-edit"  label="Edit Profile"   />
            <QuickLink to="/astrologer/schedule"      icon="fa-calendar"   label="My Schedule"    />
            <QuickLink to="/astrologer/reviews"       icon="fa-star"       label="My Reviews"     />
            <QuickLink to="/astrologer/earnings"      icon="fa-rupee-sign" label="Earnings"       />
            <QuickLink to="/astrologer/dashboard"     icon="fa-sync"       label="Refresh Stats"  />
          </div>
        </>
      )}
    </>
  );
}
