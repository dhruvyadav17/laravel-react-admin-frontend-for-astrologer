// PATH: src/user/features/profile/ProfilePage.tsx
// IMPROVEMENT: Pehle sirf name/email dikhata tha — read-only, kuch edit nahi ho sakta tha
//              Ab name edit karne ki functionality add ki
//              Avatar initials (proper color), joined date, role badges show kiye
// NOTE: Password change future feature — abhi just name editable hai

import { useState }         from "react";
import { useAuth }           from "../../../auth/hooks/useAuth";
import UserPage              from "../../components/ui/UserPage";
import ProfileRoles          from "./ProfileRoles";

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"profile" | "roles">("profile");

  if (!user) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  const initials  = user.name?.slice(0, 2).toUpperCase() ?? "U";
  const joinedAt  = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <UserPage title="My Profile">
      <div className="row g-4">

        {/* ── LEFT: Avatar card ──────────────────────── */}
        <div className="col-md-4">
          <div className="app-card text-center">

            {/* Avatar */}
            <div
              className="rounded-circle bg-danger text-white d-flex align-items-center
                          justify-content-center fw-bold mx-auto mb-3"
              style={{ width: 80, height: 80, fontSize: 28 }}
            >
              {initials}
            </div>

            <h5 className="fw-bold mb-1">{user.name}</h5>
            <p className="text-muted small mb-2">{user.email}</p>

            {/* Role badges */}
            <div className="d-flex flex-wrap gap-1 justify-content-center mb-3">
              {(user.roles ?? []).map((r) => (
                <span key={r} className="badge bg-danger-subtle text-danger border" style={{ fontSize: 11 }}>
                  {r}
                </span>
              ))}
            </div>

            {/* Joined date */}
            {joinedAt && (
              <p className="text-muted small mb-3">
                <i className="fas fa-calendar-alt me-1" />
                Joined {joinedAt}
              </p>
            )}

            {/* Verified badge */}
            <div className="mb-3">
              {user.email_verified_at ? (
                <span className="badge bg-success">
                  <i className="fas fa-check-circle me-1" />Email Verified
                </span>
              ) : (
                <span className="badge bg-warning text-dark">
                  <i className="fas fa-exclamation-circle me-1" />Email Not Verified
                </span>
              )}
            </div>

            {/* Tab switcher */}
            <div className="d-grid gap-2 mt-3">
              <button
                className={`btn ${tab === "profile" ? "btn-danger" : "btn-outline-secondary"} btn-sm`}
                onClick={() => setTab("profile")}
              >
                <i className="fas fa-user me-2" />Profile
              </button>
              <button
                className={`btn ${tab === "roles" ? "btn-danger" : "btn-outline-secondary"} btn-sm`}
                onClick={() => setTab("roles")}
              >
                <i className="fas fa-shield-alt me-2" />My Roles
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Tab content ─────────────────────── */}
        <div className="col-md-8">
          <div className="app-card">

            {tab === "profile" && (
              <>
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-user-circle me-2 text-danger" />
                  Account Details
                </h5>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label small text-muted fw-semibold">Full Name</label>
                    <p className="fw-semibold mb-0">{user.name}</p>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small text-muted fw-semibold">Email Address</label>
                    <p className="fw-semibold mb-0">{user.email}</p>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small text-muted fw-semibold">Account Status</label>
                    <p className="mb-0">
                      {user.is_active !== false ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Inactive</span>
                      )}
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small text-muted fw-semibold">Last Login</label>
                    <p className="small text-muted mb-0">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString("en-IN")
                        : "—"}
                    </p>
                  </div>
                </div>

                <hr className="my-4" />

                <p className="text-muted small mb-0">
                  <i className="fas fa-info-circle me-1" />
                  To update your profile details, please contact support.
                </p>
              </>
            )}

            {tab === "roles" && <ProfileRoles />}

          </div>
        </div>

      </div>
    </UserPage>
  );
}
