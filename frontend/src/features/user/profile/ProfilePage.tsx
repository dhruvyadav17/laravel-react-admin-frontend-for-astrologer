/**
 * User ProfilePage -- shows account info, stats, and role assignments.
 *
 * Tabs:
 *   Profile Info -- editable display name, email (read-only), joined date
 *   My Roles     -- assigned roles with descriptions
 *
 * STATS
 * ------
 * Fetches GET /consultations/stats for completed session count + total spent.
 * Fetches GET /favorites for saved astrologer count.
 *
 * TO ADD AVATAR UPLOAD:
 * 1. Add an <ImageUpload> component (components/ui/ImageUpload.tsx exists).
 * 2. POST /upload/image -> returns image URL.
 * 3. PATCH /me with profile_image field.
 */
import { useState }      from 'react';
import { Link }          from 'react-router-dom';
import { useAuth }       from '../../../auth/hooks/useAuth';
import Avatar            from '../../../components/ui/Avatar';
import { useFavorites }  from '../../../hooks/useFavorites';
import UserPage          from '../../../user/components/ui/UserPage';
import { useGetUserStatsQuery } from '../../../store/api/consultation.api';
import { useUpdateProfileMutation } from '../../../store/api/user.api';
import { toast }         from 'react-toastify';

const ROLE_COLORS: Record<string, string> = {
  user:          'primary',
  astrologer:    'warning',
  admin:         'danger',
  manager:       'info',
  'super-admin': 'dark',
};

// Explicit dark-mode-safe role badge styles
const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  user:          { bg: 'rgba(37,99,235,.12)',  color: '#2563eb' },
  astrologer:    { bg: 'rgba(234,179,8,.12)',  color: '#ca8a04' },
  admin:         { bg: 'rgba(239,68,68,.12)',  color: '#dc2626' },
  manager:       { bg: 'rgba(14,165,233,.12)', color: '#0284c7' },
  'super-admin': { bg: 'rgba(109,40,217,.12)', color: '#6d28d9' },
};

const ROLE_DESC: Record<string, string> = {
  user:          'Browse astrologers and book consultations',
  astrologer:    'Accept consultations and help users',
  admin:         'Manage platform and users',
  manager:       'Platform operations and support',
  'super-admin': 'Full platform access',
};

export default function ProfilePage() {
  const { user, refetchUser }  = useAuth() as any;
  const { favorites }          = useFavorites();
  const [tab, setTab]          = useState<'profile' | 'roles'>('profile');
  const [editing, setEditing]  = useState(false);
  const [newName, setNewName]  = useState('');

  const { data: stats }                        = useGetUserStatsQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  if (!user) return <div className="text-center mt-5 t-muted">Not logged in</div>;

  const roles: string[] = user.roles ?? [];

  const handleEditStart = () => {
    setNewName(user.name);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    try {
      await updateProfile({ name }).unwrap();
      setEditing(false);
      toast.success('Name updated successfully!');
      // Refresh auth user if possible
      if (typeof refetchUser === 'function') refetchUser();
      else window.location.reload();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Update failed');
    }
  };

  return (
    <UserPage title="My Profile">
      <div className="row g-4">

        {/* == LEFT ================================== */}
        <div className="col-md-4">
          <div className="app-card text-center">

            {/* Avatar */}
            <div className="d-flex justify-content-center mb-3">
              <div style={{
                padding: 4, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #ff6b7a)',
              }}>
                <Avatar name={user.name} src={null} size={80} color="primary" />
              </div>
            </div>

            <h5 className="fw-bold mb-0 t-main">{user.name}</h5>
            <p className="t-muted mb-3" style={{ fontSize: 13 }}>{user.email}</p>

            {/* Role badges */}
            <div className="d-flex flex-wrap justify-content-center gap-1 mb-4">
              {roles.map(r => (
                <span key={r} style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background: ROLE_BADGE[r]?.bg ?? "rgba(100,116,139,.12)", color: ROLE_BADGE[r]?.color ?? "#475569", border: `1px solid ${ROLE_BADGE[r]?.color ?? "#475569"}44` }}>
                  {r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>

            {/* Stat boxes */}
            <div className="d-flex gap-2 mb-4">
              <div className="stat-box">
                <div className="num">{favorites.length}</div>
                <div className="lbl">Saved</div>
              </div>
              <div className="stat-box">
                <div className="num">{stats?.completed_sessions ?? '--'}</div>
                <div className="lbl">Sessions</div>
              </div>
            </div>

            {/* Total spent */}
            {stats && stats.total_spent > 0 && (
              <p className="t-muted mb-2" style={{ fontSize: 12 }}>
                <i className="fas fa-rupee-sign me-1" />
                Total spent: <strong>₹{stats.total_spent.toFixed(0)}</strong>
              </p>
            )}

            {/* Member since */}
            <p className="t-muted mb-4" style={{ fontSize: 13 }}>
              <i className="fas fa-calendar-alt me-1" />
              Member since{' '}
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>

            {/* Tabs */}
            <div className="d-grid gap-2">
              {(['profile', 'roles'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`btn btn-sm fw-semibold ${tab === t ? 'btn-primary-app' : 'btn-outline-secondary'}`}>
                  {t === 'profile' ? 'Profile Info' : 'My Roles'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="app-card mt-3">
            <h6 className="fw-semibold t-main mb-3">Quick Links</h6>
            <div className="d-flex flex-column gap-1">
              {[
                { to: '/consultations', icon: 'fa-phone',  label: 'My Consultations' },
                { to: '/favorites',     icon: 'fa-heart',  label: 'Saved Astrologers' },
                { to: '/wallet',        icon: 'fa-wallet', label: 'My Wallet'         },
                { to: '/horoscope',     icon: 'fa-moon',   label: 'Horoscope'         },
                { to: '/astrologers',   icon: 'fa-search', label: 'Find Astrologer'   },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="quick-link">
                  <span className="ql-icon"><i className={`fas ${icon}`} /></span>
                  <span>{label}</span>
                  <i className="fas fa-chevron-right ms-auto t-light" style={{ fontSize: 10 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* == RIGHT ================================ */}
        <div className="col-md-8">
          <div className="app-card">

            {/* -- Profile tab ---------------------- */}
            {tab === 'profile' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h6 className="fw-bold t-main mb-0">Account Information</h6>
                    <p className="t-muted mb-0" style={{ fontSize: 13 }}>Your personal account details</p>
                  </div>
                  {!editing && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleEditStart}>
                      <i className="fas fa-edit me-1" />Edit Name
                    </button>
                  )}
                </div>

                {/* Edit form */}
                {editing && (
                  <form onSubmit={handleSave} className="mb-4 p-3 rounded-3"
                    style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                    <label className="form-label fw-semibold t-main" style={{ fontSize: 13 }}>
                      Display Name
                    </label>
                    <div className="d-flex gap-2">
                      <input type="text" className="form-control"
                        value={newName} onChange={e => setNewName(e.target.value)}
                        placeholder="Your name" minLength={2} maxLength={100} autoFocus />
                      <button type="submit" className="btn btn-primary-app fw-semibold" disabled={saving}>
                        {saving ? <span className="spinner-border spinner-border-sm" /> : 'Save'}
                      </button>
                      <button type="button" className="btn btn-outline-secondary"
                        onClick={() => setEditing(false)} disabled={saving}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Full Name', value: user.name,  icon: 'fa-user',        color: ''             },
                    { label: 'Email',     value: user.email, icon: 'fa-envelope',     color: ''             },
                    { label: 'Account',   value: 'Active',   icon: 'fa-check-circle', color: 'text-success' },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="info-row">
                      <div className="ir-icon">
                        <i className={`fas ${icon} ${color}`} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="ir-lbl">{label}</div>
                        <div className="ir-val" style={color ? { color: 'var(--bs-success)' } : {}}>
                          {value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-3 d-flex align-items-start gap-3"
                  style={{ background: 'rgba(13,202,240,0.08)', border: '1px solid rgba(13,202,240,0.2)' }}>
                  <i className="fas fa-info-circle mt-1" style={{ color: '#0dcaf0' }} />
                  <p className="mb-0 t-muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                    You can update your display name above. For email changes, contact{' '}
                    <Link to="/contact" style={{ color: '#0dcaf0' }}>support</Link>.
                  </p>
                </div>
              </>
            )}

            {/* -- Roles tab ------------------------ */}
            {tab === 'roles' && (
              <>
                <h6 className="fw-bold t-main mb-1">Your Roles</h6>
                <p className="t-muted mb-4" style={{ fontSize: 13 }}>
                  Roles define your access on AstroPortal
                </p>

                {roles.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-user-shield fa-2x d-block mb-3" style={{ color: 'var(--bdr2)' }} />
                    <p className="t-muted mb-0">No roles assigned</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {roles.map(role => (
                      <div key={role} className="info-row">
                        <span style={{ display:"inline-block", padding:"4px 12px", borderRadius:8, fontSize:12, fontWeight:600, flexShrink:0, background: ROLE_BADGE[role]?.bg ?? "rgba(100,116,139,.12)", color: ROLE_BADGE[role]?.color ?? "#475569", border: `1px solid ${ROLE_BADGE[role]?.color ?? "#475569"}44` }}>
                          {role.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="t-muted flex-grow-1" style={{ fontSize: 14 }}>
                          {ROLE_DESC[role] ?? 'Platform access'}
                        </span>
                        <span className="badge bg-success" style={{ fontSize: 11 }}>Active</span>
                      </div>
                    ))}
                  </div>
                )}

                {roles.includes('astrologer') && (
                  <div className="mt-4">
                    <Link to="/astrologer/dashboard"
                      className="btn btn-sm btn-outline-warning w-100 fw-semibold">
                      <i className="fas fa-star me-2" />Go to Astrologer Portal
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </UserPage>
  );
}
