// PATH: src/admin/features/profile/AdminProfilePage.tsx
// IMPROVEMENT: Permissions list-group → grouped badges (prefix se group karo)
//              Roles plain text → colored badges
//              Better card layout with avatar initials

import { useMemo }    from "react";
import { useAuth }    from "../../../auth/hooks/useAuth";
import AdminPage      from "../../../admin/components/page/AdminPage";
import AdminCard      from "../../../admin/components/ui/AdminCard";

/* ── Role badge colors ──────────────────────────── */
const ROLE_COLORS: Record<string, string> = {
  "super-admin": "danger",
  "admin":       "warning",
  "manager":     "info",
};

/* ── Group permissions by prefix ───────────────── */
function groupPermissions(permissions: string[]) {
  const groups: Record<string, string[]> = {};
  permissions.forEach((p) => {
    const [prefix] = p.split("-");
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(p);
  });
  return groups;
}

const PREFIX_COLORS: Record<string, string> = {
  user:       "primary",
  astrologer: "success",
  role:       "warning",
  permission: "danger",
};

export default function AdminProfilePage() {
  const { user, roles, permissions, isSuperAdmin } = useAuth();

  const grouped = useMemo(
    () => groupPermissions(permissions),
    [permissions]
  );

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <AdminPage title="Admin Profile">
      <div className="row g-4">

        {/* ── Left: identity card ─────────────────── */}
        <div className="col-md-4">
          <AdminCard>
            {/* Avatar */}
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center
                            justify-content-center fw-bold mx-auto mb-3"
                style={{ width: 72, height: 72, fontSize: 26 }}
              >
                {initials}
              </div>
              <h5 className="fw-bold mb-1">{user?.name ?? "—"}</h5>
              <p className="text-muted small mb-2">{user?.email ?? "—"}</p>

              {/* Account type badge */}
              <span className={`badge ${isSuperAdmin ? "bg-danger" : "bg-warning text-dark"}`}>
                <i className="fas fa-shield-alt me-1" />
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </span>
            </div>

            <hr />

            {/* Roles */}
            <div>
              <p className="small text-muted fw-semibold mb-2">ROLES</p>
              <div className="d-flex flex-wrap gap-1">
                {roles.length ? roles.map((r) => (
                  <span
                    key={r}
                    className={`badge bg-${ROLE_COLORS[r] ?? "secondary"}-subtle
                                text-${ROLE_COLORS[r] ?? "secondary"} border`}
                    style={{ fontSize: 12 }}
                  >
                    {r}
                  </span>
                )) : <span className="text-muted small">—</span>}
              </div>
            </div>
          </AdminCard>
        </div>

        {/* ── Right: permissions ──────────────────── */}
        <div className="col-md-8">
          <AdminCard>
            <h6 className="fw-bold mb-4">
              <i className="fas fa-key me-2 text-warning" />
              Permissions
              <span className="badge bg-secondary ms-2 fw-normal">
                {permissions.length}
              </span>
            </h6>

            {permissions.length === 0 ? (
              <p className="text-muted">No permissions assigned.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {Object.entries(grouped).map(([prefix, perms]) => {
                  const color = PREFIX_COLORS[prefix] ?? "secondary";
                  return (
                    <div key={prefix}>
                      <p className="small text-muted fw-semibold mb-2 text-uppercase">
                        {prefix}
                      </p>
                      <div className="d-flex flex-wrap gap-1">
                        {perms.map((p) => {
                          const action = p.replace(`${prefix}-`, "");
                          return (
                            <span
                              key={p}
                              className={`badge bg-${color}-subtle text-${color} border`}
                              style={{ fontSize: 11 }}
                              title={p}
                            >
                              {action}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AdminCard>
        </div>

      </div>
    </AdminPage>
  );
}
