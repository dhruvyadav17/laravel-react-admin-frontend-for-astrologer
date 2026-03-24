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

  return (
    <div className="container page">

      <div className="row g-4">

        {/* ================= LEFT SIDEBAR ================= */}
        <div className="col-md-4">

          <div className="app-card profile-sidebar position-sticky" style={{ top: 100 }}>

            {/* AVATAR */}
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=e63946&color=fff&size=128`}
              className="profile-avatar mb-3"
              width={110}
              height={110}
              alt="Profile"
            />

            {/* NAME */}
            <h5 className="fw-bold mb-1">{user.name}</h5>

            {/* EMAIL */}
            <p className="text-muted small mb-2">{user.email}</p>

            {/* STATUS */}
            <span className="badge bg-success mb-3 px-3 py-2">
              Active User
            </span>

            {/* MENU */}
            <div className="d-grid gap-2 mt-3">

              <button
                className={`btn btn-app ${
                  tab === "profile"
                    ? "btn-primary-app"
                    : "btn-outline-app"
                }`}
                onClick={() => setTab("profile")}
              >
                👤 Profile
              </button>

              <button
                className={`btn btn-app ${
                  tab === "roles"
                    ? "btn-primary-app"
                    : "btn-outline-app"
                }`}
                onClick={() => setTab("roles")}
              >
                🛡️ My Roles
              </button>

              <button
                className={`btn btn-app ${
                  tab === "settings"
                    ? "btn-primary-app"
                    : "btn-outline-app"
                }`}
                onClick={() => setTab("settings")}
              >
                ⚙️ Settings
              </button>

            </div>

          </div>

        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="col-md-8">

          <div className="app-card">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="section-title m-0">
                My Account
              </h5>
            </div>

            {/* ================= PROFILE ================= */}
            {tab === "profile" && (
              <div className="row">

                <div className="col-md-6 mb-3">
                  <label className="text-muted small">
                    Full Name
                  </label>
                  <div className="fw-semibold fs-6">
                    {user.name}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="text-muted small">
                    Email Address
                  </label>
                  <div className="fw-semibold fs-6">
                    {user.email}
                  </div>
                </div>

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
                    onClick={() => logout("/") }
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