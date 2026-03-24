import { useAuth } from "../../../auth/hooks/useAuth";

export default function ProfileRoles() {
  const { user } = useAuth();

  const roles = user?.roles || [];

  if (!roles.length) {
    return (
      <div className="text-center py-4 text-muted">
        <i className="fas fa-user-shield mb-2" />
        <p className="mb-0">No roles assigned</p>
      </div>
    );
  }

  return (
    <div>

      {/* TITLE */}
      <div className="mb-3">
        <h6 className="fw-bold mb-1">Your Roles</h6>
        <p className="text-muted small mb-0">
          Roles define your access & permissions
        </p>
      </div>

      {/* ROLES GRID */}
      <div className="row g-2">

        {roles.map((role) => (
          <div key={role} className="col-md-6">

            <div className="app-card d-flex justify-content-between align-items-center p-2">

              {/* ROLE NAME */}
              <div className="fw-medium">
                {formatRole(role)}
              </div>

              {/* STATUS */}
              <span className="badge bg-success">
                Active
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

/* 🔥 HELPER (REUSABLE) */
function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}