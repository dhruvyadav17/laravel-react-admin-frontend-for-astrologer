import { useState } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useLogout } from "../../../auth/hooks/useLogout";
import ProfileRoles from "./ProfileRoles";

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();

  const [tab, setTab] = useState<"profile" | "roles" | "settings">("profile");

  if (!user) {
    return (
      <div className="container mt-5 text-center text-muted">
        No profile data found
      </div>
    );
  }

  /* ================= SAFE DATA ================= */
  const name = user.name || "User";
  const email = user.email || "No Email";

  return (
    <div className="container page">

      <div className="row g-4">

        {/* ================= LEFT ================= */}
        <div className="col-md-4">

          <div className="app-card profile-sidebar position-sticky" style={{ top: 100 }}>

            {/* AVATAR */}
            <div className="position-relative mb-3">

              <img
                src={
                  user.profile_image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e63946&color=fff&size=128`
                }
                className="profile-avatar"
                width={110}
                height={110}
                alt="Profile"
              />

              {/* ONLINE DOT */}
              {user.is_online && (
                <span
                  className="position-absolute bg-success rounded-circle"
                  style={{
                    width: 14,
                    height: 14,
                    bottom: 8,
                    right: 8,
                    border: "2px solid #fff",
                  }}
                />
              )}
            </div>

            {/* NAME */}
            <h5 className="fw-bold mb-1">{name}</h5>

            {/* EMAIL */}
            <p className="text-muted small mb-2">{email}</p>

            {/* STATUS */}
            <span className="badge bg-success mb-3 px-3 py-2">
              Active User
            </span>

            {/* MENU */}
            <div className="d-grid gap-2 mt-3">

              <TabButton
                active={tab === "profile"}
                onClick={() => setTab("profile")}
              >
                👤 Profile
              </TabButton>

              <TabButton
                active={tab === "roles"}
                onClick={() => setTab("roles")}
              >
                🛡️ My Roles
              </TabButton>

              <TabButton
                active={tab === "settings"}
                onClick={() => setTab("settings")}
              >
                ⚙️ Settings
              </TabButton>

            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-md-8">

          <div className="app-card">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="section-title m-0">My Account</h5>

              {/* EDIT BUTTON (future use) */}
              {tab === "profile" && (
                <button className="btn btn-outline-app btn-sm">
                  ✏️ Edit
                </button>
              )}
            </div>

            {/* ================= PROFILE ================= */}
            {tab === "profile" && (
              <div className="row">

                <InfoItem label="Full Name" value={name} />
                <InfoItem label="Email Address" value={email} />

              </div>
            )}

            {/* ================= ROLES ================= */}
            {tab === "roles" && (
              <div>
                <h6 className="mb-3 text-muted">
                  Your Assigned Roles
                </h6>
                <ProfileRoles />
              </div>
            )}

            {/* ================= SETTINGS ================= */}
            {tab === "settings" && (
              <div>

                <h6 className="text-muted mb-3">
                  Account Settings
                </h6>

                <div className="d-flex flex-wrap gap-2">

                  <button className="btn btn-outline-app btn-app btn-sm">
                    🔑 Change Password
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => logout("/")}
                  >
                    🚪 Logout
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* ================= REUSABLE TAB BUTTON ================= */
function TabButton({ active, children, ...props }: any) {
  return (
    <button
      {...props}
      className={`btn btn-app ${
        active ? "btn-primary-app" : "btn-outline-app"
      }`}
    >
      {children}
    </button>
  );
}

/* ================= REUSABLE INFO ITEM ================= */
function InfoItem({ label, value }: any) {
  return (
    <div className="col-md-6 mb-3">
      <label className="text-muted small">{label}</label>
      <div className="fw-semibold fs-6">{value}</div>
    </div>
  );
}