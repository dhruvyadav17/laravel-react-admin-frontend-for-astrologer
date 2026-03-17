import { useAuth } from "../../../auth/hooks/useAuth";

import AdminPage from "../../components/page/AdminPage";
import AdminCard from "../../components/ui/AdminCard";

export default function AdminProfilePage() {
  const { user, roles, permissions, isSuperAdmin } = useAuth();

  return (
    <AdminPage title="Admin Profile">
      <AdminCard>
        <div className="mb-3">
          <strong>Name:</strong> {user?.name ?? "—"}
        </div>

        <div className="mb-3">
          <strong>Email:</strong> {user?.email ?? "—"}
        </div>

        <div className="mb-3">
          <strong>Roles:</strong>{" "}
          {roles.length ? roles.join(", ") : "—"}
        </div>

        <div className="mb-3">
          <strong>Account Type:</strong>{" "}
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </div>

        <hr />

        <h6 className="mb-3">Permissions</h6>

        {permissions.length ? (
          <ul className="list-group list-group-flush">
            {permissions.map((permission) => (
              <li key={permission} className="list-group-item px-0">
                {permission}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">
            No permissions assigned
          </p>
        )}
      </AdminCard>
    </AdminPage>
  );
}
