import { useMemo } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import AdminPage from '../../../admin/components/page/AdminPage';
import AdminCard from '../../../admin/components/ui/AdminCard';

function groupPermissions(permissions: string[]) {
  const groups: Record<string, string[]> = {};
  permissions.forEach((p) => {
    const [prefix] = p.split('-');
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(p);
  });
  return groups;
}

const PREFIX_COLORS: Record<string, string> = {
  user: 'primary',
  astrologer: 'success',
  role: 'warning',
  permission: 'danger',
};

export default function AdminProfilePage() {
  const { user, roles, permissions, isSuperAdmin } = useAuth();
  const grouped = useMemo(() => groupPermissions(permissions), [permissions]);
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <AdminPage title="Admin Profile">
      <div className="row g-4">
        <div className="col-md-4">
          <AdminCard>
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
                style={{ width: 72, height: 72, fontSize: 26 }}
              >
                {initials}
              </div>
              <h5 className="fw-bold mb-1">{user?.name ?? '--'}</h5>
              <p className="text-muted small mb-2">{user?.email ?? '--'}</p>
              <span className={`badge ${isSuperAdmin ? 'bg-danger' : 'bg-warning'}`}>
                <i className="fas fa-shield-alt me-1" />
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </span>
            </div>

            <hr />

            <div>
              <p className="small text-muted fw-semibold mb-2">ROLES</p>
              <div className="d-flex flex-wrap gap-1">
                {roles.length ? roles.map((r) => (
                  <span
                    key={r}
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: r === 'super-admin' ? 'rgba(109,40,217,.12)' : r === 'admin' ? 'rgba(234,179,8,.12)' : r === 'astrologer' ? 'rgba(14,165,233,.12)' : r === 'manager' ? 'rgba(34,197,94,.12)' : 'rgba(37,99,235,.12)',
                      color: r === 'super-admin' ? '#6d28d9' : r === 'admin' ? '#ca8a04' : r === 'astrologer' ? '#0284c7' : r === 'manager' ? '#16a34a' : '#2563eb',
                      border: '1px solid currentColor',
                    }}
                  >
                    {r}
                  </span>
                )) : <span className="text-muted small">--</span>}
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="col-md-8">
          <AdminCard>
            <h6 className="fw-bold mb-4">
              <i className="fas fa-key me-2 text-warning" />
              Permissions
              <span
                className="ms-2"
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 500,
                  background: 'rgba(100,116,139,.12)',
                  color: '#475569',
                  border: '1px solid rgba(100,116,139,.25)',
                }}
              >
                {permissions.length}
              </span>
            </h6>

            {permissions.length === 0 ? (
              <p className="text-muted">No permissions assigned.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {Object.entries(grouped).map(([prefix, perms]) => {
                  const color = PREFIX_COLORS[prefix] ?? 'secondary';
                  return (
                    <div key={prefix}>
                      <p className="small text-muted fw-semibold mb-2 text-uppercase">{prefix}</p>
                      <div className="d-flex flex-wrap gap-1">
                        {perms.map((p) => {
                          const action = p.replace(`${prefix}-`, '');
                          return (
                            <span
                              key={p}
                              className="badge"
                              style={{
                                background: `rgba(var(--bs-${color}-rgb, 37,99,235), .10)`,
                                color: `var(--bs-${color}, #2563eb)`,
                                border: `1px solid rgba(var(--bs-${color}-rgb, 37,99,235), .25)`,
                                fontSize: 11,
                              }}
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
