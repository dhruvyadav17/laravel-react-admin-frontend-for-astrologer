/**
 * User portal header -- navigation + dark-mode toggle + wallet chip +
 * notification bell + user avatar dropdown.
 *
 * The wallet balance chip polls GET /wallet every 60 s.
 * The notification bell polls every 30 s.
 *
 * TO ADD A NEW NAV ITEM: add a <Link> inside the nav list below.
 * TO ADD A LANGUAGE SWITCHER: add it next to the dark-mode toggle button.
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }                         from '../../auth/hooks/useAuth';
import { useLogout }                       from '../../auth/hooks/useLogout';
import { useFavorites }                    from '../hooks/useFavorites';
import { useTheme }                        from '../../../hooks/useTheme';
import { useGetWalletQuery }               from '../../../store/wallet.api';
import { useState, useRef, useEffect }     from 'react';
import Avatar                              from '../../../components/ui/Avatar';
import NotificationBell                    from '../../../components/ui/NotificationBell';
import { useLang }                            from '../../../i18n/useLang';

const NAV_LINKS = [
  { to: '/home',        label: 'Home'        },
  { to: '/astrologers', label: 'Astrologers' },
  { to: '/horoscope',   label: 'Horoscope'   },
  { to: '/panchang',    label: 'Panchang'    },
];

const DROPDOWN_ITEMS = [
  { icon: 'fa-home',   label: 'Home',          path: '/home'         },
  { icon: 'fa-user',   label: 'Profile',        path: '/profile'      },
  { icon: 'fa-phone',  label: 'Consultations',  path: '/consultations'},
  { icon: 'fa-wallet', label: 'My Wallet',      path: '/wallet'       },
  { icon: 'fa-heart',  label: 'Favorites',      path: '/favorites'    },
];

export default function Header() {
  const { user, isAuth }               = useAuth();
  const logout                         = useLogout();
  const navigate                       = useNavigate();
  const location                       = useLocation();
  const { favorites }                  = useFavorites();
  const { isDark, toggle: toggleDark } = useTheme();
  const { data: wallet }               = useGetWalletQuery(undefined, { skip: !isAuth });

  const { lang, toggle: toggleLang } = useLang();
  const [dropOpen, setDropOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const navTo    = (path: string) => { navigate(path); setDropOpen(false); setNavOpen(false); };

  return (
    <header className="app-header shadow-sm sticky-top">
      <div className="container py-2">
        <div className="d-flex justify-content-between align-items-center">

          {/* Logo */}
          <Link to="/home" className="fw-bold fs-5 text-decoration-none text-white">
            🔱 Astro
          </Link>

          {/* Desktop nav */}
          <nav className="d-none d-md-flex gap-4">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className="nav-link-custom text-decoration-none"
                style={{
                  color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.85)',
                  fontWeight: isActive(to) ? 600 : 400,
                  fontSize: 14,
                  borderBottom: isActive(to) ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                  paddingBottom: 2,
                }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">

            {/* Language toggle */}
            <button
              className="btn btn-link p-1 text-white-50"
              onClick={toggleLang}
              title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
              style={{ fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              {lang === 'en' ? 'हि' : 'EN'}
            </button>

            {/* Dark mode toggle */}
            <button
              className="btn p-1 border-0"
              style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', width: 32, height: 32 }}
              onClick={toggleDark}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`} style={{ fontSize: 13 }} />
            </button>

            {/* Wallet chip -- quick access to wallet balance */}
            {isAuth && wallet !== undefined && (
              <button
                className="btn btn-sm border-0 d-none d-md-flex align-items-center gap-1 fw-semibold"
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', borderRadius: 20, fontSize: 13, padding: '4px 12px' }}
                onClick={() => navTo('/wallet')}
                title="My Wallet">
                <i className="fas fa-wallet" style={{ fontSize: 11 }} />
                ₹{(wallet.balance ?? 0).toFixed(0)}
              </button>
            )}

            {/* Notification bell */}
            {isAuth && <NotificationBell pollingMs={30000} />}

            {!isAuth ? (
              <div className="d-flex gap-2">
                <button className="btn btn-sm border-0 fw-semibold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}
                  onClick={() => navTo('/login')}>
                  Login
                </button>
                <button className="btn btn-sm d-none d-md-block fw-semibold"
                  style={{ background: '#fff', color: 'var(--primary)', borderRadius: 8 }}
                  onClick={() => navTo('/register')}>
                  Register
                </button>
              </div>
            ) : (
              /* User avatar + dropdown */
              <div ref={dropRef} className="position-relative">
                <button
                  className="btn p-0 border-0 d-flex align-items-center gap-2"
                  onClick={() => setDropOpen(v => !v)}
                >
                  <Avatar name={user?.name} size={34} />
                  <span className="d-none d-md-inline small fw-semibold text-white"
                    style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name}
                  </span>
                  <i className="fas fa-chevron-down text-white" style={{ fontSize: 10, opacity: 0.8 }} />
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div className="position-absolute end-0 shadow-lg rounded-3 overflow-hidden"
                    style={{
                      minWidth: 210,
                      zIndex: 1050,
                      top: 'calc(100% + 8px)',
                      background: 'var(--surf)',
                      border: '1px solid var(--bdr)',
                    }}>

                    {/* Wallet balance */}
                    <div className="px-3 py-3"
                      style={{ borderBottom: '1px solid var(--bdr)', background: 'var(--surf2)' }}>
                      <div style={{ fontSize: 11, color: 'var(--txt-m)', fontWeight: 500, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                        Wallet Balance
                      </div>
                      <div className="fw-bold mt-1" style={{ color: 'var(--primary)', fontSize: 18 }}>
                        ₹{(wallet?.balance ?? 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Nav items */}
                    <div className="p-1">
                      {DROPDOWN_ITEMS.map(({ icon, label, path }) => {
                        const displayLabel = path === '/favorites'
                          ? `Favorites (${favorites.length})`
                          : label;
                        return (
                          <button key={path}
                            className="btn w-100 text-start d-flex align-items-center gap-2 rounded-2 py-2 px-2 border-0"
                            style={{ fontSize: 13, color: 'var(--txt)', background: 'transparent' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surf2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => navTo(path)}>
                            <i className={`fas ${icon}`} style={{ width: 16, color: 'var(--txt-m)' }} />
                            {displayLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="p-1" style={{ borderTop: '1px solid var(--bdr)' }}>
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-2 rounded-2 py-2 px-2 border-0"
                        style={{ fontSize: 13, color: '#ef4444', background: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => { logout('/login'); setDropOpen(false); }}>
                        <i className="fas fa-sign-out-alt" style={{ width: 16 }} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="btn p-1 border-0 d-md-none"
              style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', borderRadius: 8, width: 32, height: 32 }}
              onClick={() => setNavOpen(v => !v)}>
              <i className={`fas ${navOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {navOpen && (
          <nav className="d-md-none"
            style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 8, paddingTop: 8 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <button key={to}
                className="btn w-100 text-start fw-semibold py-2 px-1 border-0"
                style={{
                  color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.8)',
                  fontSize: 14,
                  background: isActive(to) ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderRadius: 8,
                }}
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
