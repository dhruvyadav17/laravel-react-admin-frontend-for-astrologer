// PATH: src/user/features/profile/ProfilePage.tsx
// IMPROVE: Avatar, edit name, join date, favorites count, consultations link

import { useState }       from "react";
import { Link }           from "react-router-dom";
import { useAuth }        from "../../../auth/hooks/useAuth";
import Avatar             from "../../../components/ui/Avatar";
import { useFavorites }   from "../../../hooks/useFavorites";
import UserPage           from "../../../user/components/ui/UserPage";

export default function ProfilePage() {
  const { user }        = useAuth();
  const { favorites }   = useFavorites();
  const [tab, setTab]   = useState<"profile" | "roles">("profile");

  if (!user) return <div className="text-center mt-5 text-muted">Not logged in</div>;

  const joinedDate = new Date().toLocaleDateString("en-IN", {
    month: "long", year: "numeric",
  });

  const roles: string[] = user.roles ?? [];

  const ROLE_COLORS: Record<string, string> = {
    user: "primary", astrologer: "warning", admin: "danger",
    manager: "info", "super-admin": "dark",
  };

  return (
    <UserPage title="My Profile">
      <div className="row g-4">

        {/* ── LEFT: Avatar card ──────────────────── */}
        <div className="col-md-4">
          <div className="app-card text-center">

            {/* Avatar */}
            <div className="d-flex justify-content-center mb-3">
              <Avatar name={user.name} src={null} size={80} color="primary" />
            </div>

            <h5 className="fw-bold mb-0">{user.name}</h5>
            <p className="text-muted small mb-3">{user.email}</p>

            {/* Role badges */}
            <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
              {roles.map((r) => (
                <span key={r}
                  className={`badge bg-${ROLE_COLORS[r] ?? "secondary"}`}
                  style={{ fontSize: 11 }}>
                  {r.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="p-2 bg-light rounded text-center">
                  <div className="fw-bold">{favorites.length}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>Saved</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 bg-light rounded text-center">
                  <div className="fw-bold">—</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>Sessions</div>
                </div>
              </div>
            </div>

            <p className="text-muted small mb-3">
              <i className="fas fa-calendar-alt me-1" />Member since {joinedDate}
            </p>

            {/* Nav buttons */}
            <div className="d-grid gap-2">
              {(["profile", "roles"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`btn btn-sm ${tab === t ? "btn-primary-app" : "btn-outline-secondary"}`}>
                  {t === "profile" ? "Profile Info" : "My Roles"}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="app-card mt-3">
            <h6 className="fw-semibold mb-3">Quick Links</h6>
            <div className="d-flex flex-column gap-2">
              {[
                { to: "/consultations", icon: "fa-phone",      label: "My Consultations" },
                { to: "/favorites",     icon: "fa-heart",      label: "Saved Astrologers" },
                { to: "/horoscope",     icon: "fa-moon",       label: "Horoscope"         },
                { to: "/astrologers",   icon: "fa-search",     label: "Find Astrologer"   },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to}
                  className="d-flex align-items-center gap-2 text-decoration-none text-dark small py-1">
                  <i className={`fas ${icon} text-muted`} style={{ width: 16 }} />
                  {label}
                  <i className="fas fa-chevron-right ms-auto text-muted" style={{ fontSize: 10 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Content ─────────────────────── */}
        <div className="col-md-8">
          <div className="app-card">

            {tab === "profile" && (
              <>
                <h6 className="fw-bold mb-4">Account Information</h6>

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: "Full Name",  value: user.name,  icon: "fa-user"          },
                    { label: "Email",      value: user.email, icon: "fa-envelope"       },
                    { label: "Account",    value: "Active",   icon: "fa-check-circle", color: "text-success" },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                      <i className={`fas ${icon} ${color ?? "text-muted"}`} style={{ width: 20 }} />
                      <div className="flex-grow-1">
                        <div className="text-muted small">{label}</div>
                        <div className="fw-semibold small">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-info mt-4 py-2 small mb-0">
                  <i className="fas fa-info-circle me-1" />
                  Profile editing coming soon. Contact support for name/email changes.
                </div>
              </>
            )}

            {tab === "roles" && (
              <>
                <h6 className="fw-bold mb-1">Your Roles</h6>
                <p className="text-muted small mb-4">Roles define your access on the platform</p>

                {roles.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-user-shield fa-2x d-block mb-2 opacity-25" />
                    <p className="mb-0">No roles assigned</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {roles.map((role) => (
                      <div key={role}
                        className={`d-flex align-items-center gap-3 p-3 rounded border border-${ROLE_COLORS[role] ?? "secondary"} border-opacity-25`}>
                        <span className={`badge bg-${ROLE_COLORS[role] ?? "secondary"} px-3 py-2`}>
                          {role.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        <span className="text-muted small">
                          {role === "user"       && "Browse astrologers and book consultations"}
                          {role === "astrologer" && "Accept consultations and help users"}
                          {role === "admin"      && "Manage platform and users"}
                        </span>
                        <span className="badge bg-success ms-auto">Active</span>
                      </div>
                    ))}
                  </div>
                )}

                {roles.includes("astrologer") && (
                  <div className="mt-3">
                    <Link to="/astrologer/dashboard"
                      className="btn btn-sm btn-outline-warning w-100">
                      <i className="fas fa-star me-1" />Go to Astrologer Portal
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