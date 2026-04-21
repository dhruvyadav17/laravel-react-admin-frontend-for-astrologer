// audit_logs table already exists in DB -- this is its UI
// Shows: user, action, IP, timestamp, subject type

import { useState }           from 'react';
import { useGetActivityLogsQuery } from '../../../../store/admin.api';
import { usePagination }       from '../../../../hooks/usePagination';
import Pagination              from '../../../../components/table/Pagination';
import { TableSearch }         from '../../../../components/table/table.helpers';
import Avatar                  from '../../../../components/ui/Avatar';

const ACTION_COLORS: Record<string, string> = {
  login:              'success',
  logout:             'secondary',
  'role-assigned':    'primary',
  'permission-sync':  'info',
  'user-created':     'success',
  'user-deleted':     'danger',
  'user-restored':    'warning',
};

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] ?? 'secondary';
  return (
    <span className={`badge bg-${color}-subtle text-${color} border`} style={{ fontSize: 11 }}>
      {action}
    </span>
  );
}

export default function ActivityPage() {
  const { page, setPage, search, setSearch } = usePagination();
  const [actionFilter, setActionFilter]       = useState('');

  const { data, isLoading, isError, refetch } = useGetActivityLogsQuery({
    page,
    search,
    action: actionFilter || undefined,
  });

  const logs       = data?.data       ?? [];
  const pagination = data?.pagination ?? null;

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold">
          <i className="fas fa-history me-2 text-muted" />Activity Log
        </h5>
        <button className="btn btn-outline-secondary btn-sm" onClick={refetch}>
          <i className="fas fa-sync-alt me-1" />Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card-body border-bottom py-2">
        <div className="d-flex gap-2 flex-wrap">
          <div className="flex-grow-1" style={{ minWidth: 200 }}>
            <TableSearch value={search} onChange={setSearch} placeholder="Search by user or IP..." />
          </div>
          <select className="form-select w-auto" value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="role-assigned">Role Assigned</option>
            <option value="permission-sync">Permission Sync</option>
            <option value="user-created">User Created</option>
            <option value="user-deleted">User Deleted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-body p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-exclamation-triangle text-danger fa-2x d-block mb-2" />
            Failed to load logs
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-inbox fa-2x d-block mb-2" />
            No activity logs found
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: "var(--surf2, #f6f7fb)" }}>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Subject</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={log.user?.name ?? 'System'} size={28} />
                        <span className="small fw-semibold">
                          {log.user?.name ?? <span className="text-muted">System</span>}
                        </span>
                      </div>
                    </td>
                    <td><ActionBadge action={log.action} /></td>
                    <td>
                      {log.subject_type && (
                        <span className="small text-muted">
                          {log.subject_type.split('\\').pop()} #{log.subject_id}
                        </span>
                      )}
                    </td>
                    <td>
                      <code className="small">{log.ip_address ?? '--'}</code>
                    </td>
                    <td className="small text-muted">
                      {log.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="card-footer">
          <Pagination meta={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
