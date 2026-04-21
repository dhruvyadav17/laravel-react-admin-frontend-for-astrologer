/**
 * User ProfilePage — account info, photo upload, password change, roles.
 *
 * Tabs:
 *   Profile Info  — name edit + profile photo upload
 *   Security      — password change
 *   My Roles      — role list
 */
import { useState, useRef }  from 'react';
import { useDispatch }        from 'react-redux';
import type { AppDispatch }   from '../../../../store';
import { fetchProfileThunk }  from '../../../../store/authSlice';
import { Link }               from 'react-router-dom';
import { useAuth }            from '../../../auth/hooks/useAuth';
import Avatar                 from '../../../../components/ui/Avatar';
import ImageUpload            from '../../../../components/ui/ImageUpload';
import { useFavorites }       from '../../hooks/useFavorites';
import UserPage               from '../../components/UserPage';
import { useGetUserStatsQuery }    from '../../../../store/consultation.api';
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from '../../../../store/user.api';
import { toast } from 'react-toastify';

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

type Tab = 'profile' | 'security' | 'roles';

export default function ProfilePage() {
  const { user }    = useAuth();
  const dispatch    = useDispatch<AppDispatch>();
  const { favorites } = useFavorites();

  const [tab, setTab]           = useState<Tab>('profile');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName]   = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Password fields
  const [pwForm, setPwForm] = useState({
    current_password: '', new_password: '', new_password_confirmation: '',
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const { data: stats }                          = useGetUserStatsQuery();
  const [updateProfile, { isLoading: saving }]   = useUpdateProfileMutation();
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();

  if (!user) return <div className="text-center mt-5 t-muted">Not logged in</div>;

  const roles: string[] = user.roles ?? [];
  const avatarUrl = (user as any).profile_image || profileImage;

  // ── Name save ──────────────────────────────────
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || name.length < 2) { toast.error('Name must be at least 2 characters'); return; }
    try {
      await updateProfile({ name }).unwrap();
      setEditingName(false);
      toast.success('Name updated!');
      await dispatch(fetchProfileThunk());
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Update failed');
    }
  };

  // ── Photo upload callback ───────────────────────
  const handlePhotoUpload = async (url: string) => {
    try {
      await updateProfile({ profile_image: url }).unwrap();
      setProfileImage(url);
      toast.success('Profile photo updated!');
      await dispatch(fetchProfileThunk());
    } catch {
      toast.error('Failed to save photo');
    }
  };

  // ── Password change ─────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      toast.error('New passwords do not match'); return;
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    try {
      await changePassword(pwForm).unwrap();
      toast.success('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.data?.errors?.current_password?.[0] ?? 'Failed to change password');
    }
  };

  // ── Password strength ───────────────────────────
  const getStrength = (pw: string) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: 'Weak',   color: '#dc2626', width: '25%'  },
      { label: 'Fair',   color: '#f97316', width: '50%'  },
      { label: 'Good',   color: '#eab308', width: '75%'  },
      { label: 'Strong', color: '#22c55e', width: '100%' },
    ];
    return levels[score - 1] ?? levels[0];
  };
  const strength = getStrength(pwForm.new_password);

  // ── PwInput helper ──────────────────────────────
  const PwInput = ({ field, label, showKey }: {
    field: keyof typeof pwForm;
    label: string;
    showKey: keyof typeof showPw;
  }) => (
    <div className="mb-3">
      <label className="form-label small fw-semibold">{label}</label>
      <div className="input-group">
        <input
          type={showPw[showKey] ? 'text' : 'password'}
          className="form-control"
          value={pwForm[field]}
          onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
          required minLength={field === 'current_password' ? 1 : 8}
          autoComplete={field === 'current_password' ? 'current-password' : 'new-password'}
        />
        <button type="button" className="btn btn-outline-secondary"
          onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}>
          <i className={`fas fa-${showPw[showKey] ? 'eye-slash' : 'eye'}`} />
        </button>
      </div>
    </div>
  );

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile',  label: 'Profile Info', icon: 'fa-user'          },
    { key: 'security', label: 'Security',      icon: 'fa-shield-alt'   },
    { key: 'roles',    label: 'My Roles',      icon: 'fa-id-badge'     },
  ];

  return (
    <UserPage title="My Profile">
      <div className="row g-4">

        {/* ── LEFT SIDEBAR ─────────────────────────── */}
        <div className="col-md-4">
          <div className="app-card text-center">

            {/* Avatar with upload */}
            <div className="d-flex justify-content-center mb-3">
              <ImageUpload
                currentUrl={avatarUrl}
                onUpload={handlePhotoUpload}
                name={user.name}
                size={88}
              />
            </div>

            <h5 className="fw-bold mb-0 t-main">{user.name}</h5>
            <p className="t-muted mb-3" style={{ fontSize: 13 }}>{user.email}</p>

            {/* Role badges */}
            <div className="d-flex flex-wrap justify-content-center gap-1 mb-4">
              {roles.map(r => (
                <span key={r} style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                  fontSize: 11, fontWeight: 600,
                  background: ROLE_BADGE[r]?.bg ?? 'rgba(100,116,139,.12)',
                  color: ROLE_BADGE[r]?.color ?? '#475569',
                  border: `1px solid ${ROLE_BADGE[r]?.color ?? '#475569'}44`,
                }}>
                  {r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>

            {/* Stats */}
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

            {stats && stats.total_spent > 0 && (
              <p className="t-muted mb-2" style={{ fontSize: 12 }}>
                Total spent: <strong>₹{stats.total_spent.toFixed(0)}</strong>
              </p>
            )}

            <p className="t-muted mb-4" style={{ fontSize: 13 }}>
              <i className="fas fa-calendar-alt me-1" />
              Member since {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>

            {/* Tab buttons */}
            <div className="d-grid gap-2">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`btn btn-sm fw-semibold ${tab === t.key ? 'btn-primary-app' : 'btn-outline-secondary'}`}>
                  <i className={`fas ${t.icon} me-2`} />{t.label}
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
                { to: '/wallet',        icon: 'fa-wallet', label: 'My Wallet' },
                { to: '/horoscope',     icon: 'fa-moon',   label: 'Horoscope' },
                { to: '/astrologers',   icon: 'fa-search', label: 'Find Astrologer' },
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

        {/* ── RIGHT PANEL ──────────────────────────── */}
        <div className="col-md-8">
          <div className="app-card">

            {/* ── PROFILE TAB ── */}
            {tab === 'profile' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h6 className="fw-bold t-main mb-0">Account Information</h6>
                    <p className="t-muted mb-0" style={{ fontSize: 13 }}>Your personal account details</p>
                  </div>
                  {!editingName && (
                    <button className="btn btn-sm btn-outline-secondary"
                      onClick={() => { setNewName(user.name); setEditingName(true); }}>
                      <i className="fas fa-edit me-1" />Edit Name
                    </button>
                  )}
                </div>

                {/* Name edit form */}
                {editingName && (
                  <form onSubmit={handleSaveName} className="mb-4 p-3 rounded-3"
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
                        onClick={() => setEditingName(false)} disabled={saving}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Full Name', value: user.name,  icon: 'fa-user',        color: '' },
                    { label: 'Email',     value: user.email, icon: 'fa-envelope',     color: '' },
                    { label: 'Account',   value: 'Active',   icon: 'fa-check-circle', color: 'text-success' },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="info-row">
                      <div className="ir-icon">
                        <i className={`fas ${icon} ${color}`} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="ir-lbl">{label}</div>
                        <div className="ir-val" style={color ? { color: '#16a34a' } : {}}>
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
                    You can update your name and photo above. For email changes, contact{' '}
                    <Link to="/contact" style={{ color: '#0dcaf0' }}>support</Link>.
                    To change your password, go to the{' '}
                    <button className="btn btn-link p-0" style={{ fontSize: 13, color: '#0dcaf0', verticalAlign: 'baseline' }}
                      onClick={() => setTab('security')}>Security tab</button>.
                  </p>
                </div>
              </>
            )}

            {/* ── SECURITY TAB ── */}
            {tab === 'security' && (
              <>
                <div className="mb-4">
                  <h6 className="fw-bold t-main mb-0">Change Password</h6>
                  <p className="t-muted mb-0" style={{ fontSize: 13 }}>
                    Keep your account secure with a strong password
                  </p>
                </div>

                <form onSubmit={handleChangePassword}>
                  <PwInput field="current_password" label="Current Password" showKey="current" />
                  <PwInput field="new_password"     label="New Password"     showKey="new"     />

                  {/* Password strength bar */}
                  {pwForm.new_password && strength && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="t-muted" style={{ fontSize: 12 }}>Password strength</span>
                        <span style={{ fontSize: 12, color: strength.color, fontWeight: 600 }}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="rounded-pill" style={{ height: 4, background: 'var(--bdr2)' }}>
                        <div className="rounded-pill" style={{
                          height: '100%', width: strength.width,
                          background: strength.color, transition: 'width .3s',
                        }} />
                      </div>
                    </div>
                  )}

                  <PwInput field="new_password_confirmation" label="Confirm New Password" showKey="confirm" />

                  {/* Match indicator */}
                  {pwForm.new_password && pwForm.new_password_confirmation && (
                    <div className="mb-3 small">
                      {pwForm.new_password === pwForm.new_password_confirmation
                        ? <span className="text-success"><i className="fas fa-check me-1" />Passwords match</span>
                        : <span className="text-danger"><i className="fas fa-times me-1" />Passwords do not match</span>
                      }
                    </div>
                  )}

                  <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-4 small"
                    style={{ background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.2)' }}>
                    <i className="fas fa-shield-alt text-warning" />
                    <span className="t-muted">
                      Use at least 8 characters with uppercase letters, numbers, and symbols for best security.
                    </span>
                  </div>

                  <button type="submit" className="btn btn-primary-app fw-semibold px-4" disabled={changing}>
                    {changing
                      ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</>
                      : <><i className="fas fa-key me-2" />Change Password</>}
                  </button>
                </form>
              </>
            )}

            {/* ── ROLES TAB ── */}
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
                        <span style={{
                          display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                          fontSize: 12, fontWeight: 600, flexShrink: 0,
                          background: ROLE_BADGE[role]?.bg ?? 'rgba(100,116,139,.12)',
                          color: ROLE_BADGE[role]?.color ?? '#475569',
                          border: `1px solid ${ROLE_BADGE[role]?.color ?? '#475569'}44`,
                        }}>
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
