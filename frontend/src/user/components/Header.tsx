// PATH: src/user/components/Header.tsx
// IMPROVED: Wallet balance in user dropdown
// IMPROVED: Notification bell in user header
// IMPROVED: Dark mode toggle

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }                         from '../../auth/hooks/useAuth';
import { useLogout }                       from '../../auth/hooks/useLogout';
import { useFavorites }                    from '../../hooks/useFavorites';
import { useTheme }                        from '../../hooks/useTheme';
import { useGetWalletQuery }               from '../../store/api/wallet.api';
import { useState, useRef, useEffect }     from 'react';
import Avatar                              from '../../components/ui/Avatar';
import NotificationBell                    from '../../components/ui/NotificationBell';

const NAV_LINKS = [
  { to: '/home',        label: 'Home'        },
  { to: '/astrologers', label: 'Astrologers' },
  { to: '/horoscope',   label: 'Horoscope'   },
  { to: '/panchang',    label: 'Panchang'    },
];

export default function Header() {
  const { user, isAuth }             = useAuth();
  const logout                       = useLogout();
  const navigate                     = useNavigate();
  const location                     = useLocation();
  const { favorites }                = useFavorites();
  const { isDark, toggle: toggleDark } = useTheme();
  const { data: wallet }             = useGetWalletQuery(undefined, { skip: !isAuth });

  const [dropOpen, setDropOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';
  const navTo    = (path: string) => { navigate(path); setDropOpen(false); setNavOpen(false); };

  return (
    <header className="app-header shadow-sm sticky-top">
      <div className="container py-2">
        <div className="d-flex justify-content-between align-items-center">

          {/* Logo */}
          <Link to="/home" className="fw-bold fs-5 text-decoration-none">
            🔱 Astro
          </Link>

          {/* Desktop nav */}
          <nav className="d-none d-md-flex gap-4 fw-medium">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`text-decoration-none small fw-semibold ${isActive(to) ? 'text-primary' : 'text-body'}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">

            {/* Dark mode */}
            <button className="btn btn-link btn-sm p-1" onClick={toggleDark}
              title={isDark ? 'Light Mode' : 'Dark Mode'}>
              <i className={`fas ${isDark ? 'fa-sun text-warning' : 'fa-moon'}`} />
            </button>

            {/* Notifications — only when logged in */}
            {isAuth && <NotificationBell pollingMs={30000} />}

            {!isAuth ? (
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm" onClick={() => navTo('/login')}>
                  Login
                </button>
                <button className="btn btn-primary btn-sm d-none d-md-block"
                  onClick={() => navTo('/register')}>
                  Register
                </button>
              </div>
            ) : (
              <div ref={dropRef} className="position-relative">
                <button
                  className="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none"
                  onClick={() => setDropOpen((v) => !v)}
                >
                  <Avatar name={user?.name} size={32} />
                  <span className="d-none d-md-inline small fw-semibold">{user?.name}</span>
                </button>

                {dropOpen && (
                  <div className="card shadow position-absolute end-0"
                    style={{ minWidth: 200, zIndex: 1000, top: '110%' }}>
                    <div className="card-body p-2">
                      {/* Wallet balance */}
                      <div className="px-2 py-2 border-bottom mb-1">
                        <div className="small text-muted">Wallet Balance</div>
                        <div className="fw-bold text-success">
                          ₹{(wallet?.balance ?? 0).toFixed(2)}
                        </div>
                      </div>

                      {[
                        { icon: 'fa-home',        label: 'Home',           path: '/home'           },
                        { icon: 'fa-user',         label: 'Profile',        path: '/profile'        },
                        { icon: 'fa-phone',        label: 'Consultations',  path: '/consultations'  },
                        { icon: 'fa-wallet',       label: 'My Wallet',      path: '/wallet'         },
                        { icon: 'fa-heart',        label: `Favorites (${favorites.length})`, path: '/favorites' },
                      ].map(({ icon, label, path }) => (
                        <button key={path} className="btn btn-link w-100 text-start text-body
                          text-decoration-none px-2 py-1 small"
                          onClick={() => navTo(path)}>
                          <i className={`fas ${icon} me-2 text-muted`} />{label}
                        </button>
                      ))}

                      <div className="border-top mt-1 pt-1">
                        <button className="btn btn-link w-100 text-start text-danger
                          text-decoration-none px-2 py-1 small"
                          onClick={() => { logout('/login'); setDropOpen(false); }}>
                          <i className="fas fa-sign-out-alt me-2" />Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="btn btn-link p-1 d-md-none"
              onClick={() => setNavOpen((v) => !v)}>
              <i className={`fas ${navOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {navOpen && (
          <nav className="d-md-none border-top mt-2 pt-2">
            {NAV_LINKS.map(({ to, label }) => (
              <button key={to} className="btn btn-link w-100 text-start text-body
                text-decoration-none py-2 px-0 small fw-semibold"
                onClick={() => navTo(to)}>
                {label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
