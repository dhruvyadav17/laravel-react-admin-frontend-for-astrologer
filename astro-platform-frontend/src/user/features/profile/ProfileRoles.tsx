import { useAuth } from "../../../auth/hooks/useAuth";

/* ================= ROLE META CONFIG ================= */
const roleMeta: Record<string, any> = {
  admin: {
    label: "Admin",
    icon: "fas fa-user-shield",
    color: "danger",
  },
  astrologer: {
    label: "Astrologer",
    icon: "fas fa-star",
    color: "warning",
  },
  user: {
    label: "User",
    icon: "fas fa-user",
    color: "primary",
  },
};

export default function ProfileRoles() {
  const { user } = useAuth();

  const roles = user?.roles || [];

  /* ================= EMPTY ================= */
  if (!roles.length) {
    return (
      <div className="text-center py-4 text-muted">
        <i className="fas fa-user-shield mb-2 fs-4" />
        <p className="mb-0">No roles assigned</p>
      </div>
    );
  }

  return (
    <div>

      {/* ================= HEADER ================= */}
      <div className="mb-3">
        <h6 className="fw-bold mb-1">Your Roles</h6>
        <p className="text-muted small mb-0">
          Roles define your access & permissions
        </p>
      </div>

      {/* ================= ROLES GRID ================= */}
      <div className="row g-3">

        {roles.map((role: string) => {
          const meta = roleMeta[role] || {
            label: formatRole(role),
            icon: "fas fa-user",
            color: "secondary",
          };

          return (
            <div key={role} className="col-md-6">

              <div className="app-card d-flex justify-content-between align-items-center px-3 py-2">

                {/* LEFT */}
                <div className="d-flex align-items-center gap-2">

                  {/* ICON */}
                  <span className={`text-${meta.color}`}>
                    <i className={meta.icon} />
                  </span>

                  {/* ROLE NAME */}
                  <div className="fw-semibold">
                    {meta.label}
                  </div>

                </div>

                {/* STATUS */}
                <span className={`badge bg-${meta.color}`}>
                  Active
                </span>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

/* ================= HELPER ================= */
function formatRole(role: string) {
  if (!role) return "User";

  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}