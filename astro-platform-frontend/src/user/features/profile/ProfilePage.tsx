import { useAuth } from "../../../auth/hooks/useAuth";
import { useLogout } from "../../../auth/hooks/useLogout";

import ProfileRoles from "./ProfileRoles";

import {
  Card,
  CardHeader,
  CardBody,
} from "../../../components/ui/Card";

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) {
    return (
      <div className="container mt-5 text-center text-muted">
        No profile data found
      </div>
    );
  }

  return (
    <section className="content pt-3">
      <div className="container-fluid">
        <div className="row">
          {/* ================= LEFT PROFILE CARD ================= */}
          <div className="col-md-4 mb-4">
            <Card className="text-center">
              <CardBody>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=0d6efd&color=fff&size=128`}
                  className="rounded-circle mb-3"
                  alt="Profile"
                />

                <h5 className="mb-1">{user.name}</h5>
                <p className="text-muted mb-2">
                  {user.email}
                </p>

                <span className="badge bg-success">
                  Active User
                </span>
              </CardBody>
            </Card>
          </div>

          {/* ================= RIGHT CONTENT ================= */}
          <div className="col-md-8">
            <Card>
              <CardHeader
                title={
                  <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                      <a
                        className="nav-link active"
                        data-bs-toggle="tab"
                        href="#profile"
                      >
                        Profile Info
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                        className="nav-link"
                        data-bs-toggle="tab"
                        href="#roles"
                      >
                        My Roles
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                        className="nav-link"
                        data-bs-toggle="tab"
                        href="#settings"
                      >
                        Settings
                      </a>
                    </li>
                  </ul>
                }
              />

              <CardBody>
                <div className="tab-content">
                  {/* ===== PROFILE INFO ===== */}
                  <div
                    className="tab-pane fade show active"
                    id="profile"
                  >
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted">
                          Name
                        </label>
                        <div className="fw-bold">
                          {user.name}
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="text-muted">
                          Email
                        </label>
                        <div className="fw-bold">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===== ROLES ===== */}
                  <div
                    className="tab-pane fade"
                    id="roles"
                  >
                    <ProfileRoles />
                  </div>

                  {/* ===== SETTINGS ===== */}
                  <div
                    className="tab-pane fade"
                    id="settings"
                  >
                    <p className="text-muted">
                      Settings section coming soon.
                    </p>

                    <button className="btn btn-outline-secondary btn-sm me-2">
                      Change Password
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => logout("/login")}
                    >
                      <i className="fas fa-sign-out-alt me-1" />
                      Logout
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
