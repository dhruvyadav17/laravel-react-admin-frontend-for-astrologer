import { useState } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import ProfileRoles from "./ProfileRoles";
import UserPage from "../../components/ui/UserPage";

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");

  if (!user) return <div className="text-center mt-5">No user</div>;

  return (
    <UserPage title="My Profile">
      <div className="row g-4">

        {/* LEFT */}
        <div className="col-md-4">
          <div className="app-card text-center">

            <img
              src={`https://ui-avatars.com/api/?name=${user.name}`}
              className="profile-avatar mb-2"
            />

            <h5>{user.name}</h5>
            <p className="small text-muted">{user.email}</p>

            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-outline-app" onClick={() => setTab("profile")}>
                Profile
              </button>
              <button className="btn btn-outline-app" onClick={() => setTab("roles")}>
                Roles
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="col-md-8">
          <div className="app-card">

            {tab === "profile" && (
              <>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </>
            )}

            {tab === "roles" && <ProfileRoles />}

          </div>
        </div>

      </div>
    </UserPage>
  );
}