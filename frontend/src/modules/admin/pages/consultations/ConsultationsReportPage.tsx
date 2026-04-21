/**
 * ConsultationsReportPage — Admin view of all consultations.
 * Filter by status, type, date range. See totals and details.
 */
import { useState }   from 'react';
import { baseApi }    from '../../../../store/baseApi';
import AdminPage      from '../../components/AdminPage';
import { PageLoader } from '../../../../components/ui/States';

// Inject report endpoint
const reportApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getConsultationsReport: b.query<any, {
      status?: string; type?: string;
      from?: string; to?: string; page?: number;
    }>({
      query: (params) => ({ url: '/admin/consultations', params }),
      transformResponse: (res: any) => res,
    }),
  }),
  overrideExisting: false,
});

const { useGetConsultationsReportQuery } = reportApi;

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:     { bg: 'rgba(234,179,8,.15)',   color: '#ca8a04' },
  accepted:    { bg: 'rgba(59,130,246,.15)',  color: '#2563eb' },
  in_progress: { bg: 'rgba(34,197,94,.15)',   color: '#16a34a' },
  completed:   { bg: 'rgba(100,116,139,.15)', color: '#475569' },
  rejected:    { bg: 'rgba(239,68,68,.15)',   color: '#dc2626' },
  cancelled:   { bg: 'rgba(100,116,139,.15)', color: '#475569' },
};

export default function ConsultationsReportPage() {
  const [filters, setFilters] = useState<{
    status: string; type: string; from: string; to: string; page: number;
  }>({ status: '', type: '', from: '', to: '', page: 1 });

  const { data, isLoading, isError } = useGetConsultationsReportQuery({
    status: filters.status || undefined,
    type:   filters.type   || undefined,
    from:   filters.from   || undefined,
    to:     filters.to     || undefined,
    page:   filters.page,
  });

  const consultations = data?.data ?? [];
  const pagination    = data?.pagination ?? null;
  const summary       = data?.summary ?? null;

  const set = (key: keyof typeof filters, value: string | number) =>
    setFilters(p => ({ ...p, [key]: value, page: 1 }));

  return (
    <AdminPage title="Consultations Report">

      {/* Summary cards */}
      {summary && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Total',      value: summary.total,      color: 'primary', icon: 'fa-list'      },
            { label: 'Completed',  value: summary.completed,  color: 'success', icon: 'fa-check'     },
            { label: 'Pending',    value: summary.pending,    color: 'warning', icon: 'fa-clock'     },
            { label: 'Revenue',    value: `₹${(summary.revenue ?? 0).toFixed(0)}`, color: 'info', icon: 'fa-rupee-sign' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="col-6 col-md-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className={`rounded-3 bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center`}
                      style={{ width: 44, height: 44 }}>
                      <i className={`fas ${icon} text-${color}`} />
                    </div>
                    <div>
                      <div className="fw-bold fs-5">{value}</div>
                      <div className="t-muted small">{label}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Status</label>
              <select className="form-select form-select-sm"
                value={filters.status} onChange={e => set('status', e.target.value)}>
                <option value="">All Statuses</option>
                {['pending','accepted','in_progress','completed','rejected','cancelled'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Type</label>
              <select className="form-select form-select-sm"
                value={filters.type} onChange={e => set('type', e.target.value)}>
                <option value="">All Types</option>
                <option value="chat">Chat</option>
                <option value="call">Call</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">From Date</label>
              <input type="date" className="form-control form-control-sm"
                value={filters.from} onChange={e => set('from', e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">To Date</label>
              <input type="date" className="form-control form-control-sm"
                value={filters.to} onChange={e => set('to', e.target.value)} />
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <button className="btn btn-sm btn-outline-secondary w-100"
                onClick={() => setFilters({ status: '', type: '', from: '', to: '', page: 1 })}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {isLoading ? <div className="p-4"><PageLoader /></div>
          : isError ? (
            <div className="text-center py-5 t-muted">
              <i className="fas fa-exclamation-triangle fa-2x d-block mb-2 text-warning" />
              Failed to load. This page needs backend route /admin/consultations.
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-5 t-muted">
              <i className="fas fa-inbox fa-3x d-block mb-3 opacity-25" />
              No consultations found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: 'var(--surf2)', fontSize: 12 }}>
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th>User</th>
                    <th>Astrologer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 13 }}>
                  {consultations.map((c: any) => {
                    const sc = STATUS_COLORS[c.status] ?? STATUS_COLORS.pending;
                    return (
                      <tr key={c.id}>
                        <td className="px-3 py-2 t-muted">#{c.id}</td>
                        <td className="py-2">
                          <div className="fw-semibold">{c.user?.name ?? '—'}</div>
                          <div className="t-muted" style={{ fontSize: 11 }}>{c.user?.email}</div>
                        </td>
                        <td className="py-2">
                          <div className="fw-semibold">{c.astrologer?.name ?? '—'}</div>
                          <div className="t-muted" style={{ fontSize: 11 }}>₹{c.rate_per_minute}/min</div>
                        </td>
                        <td className="py-2">
                          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold" style={{ fontSize: 11 }}>
                            <i className={`fas fa-${c.type === 'chat' ? 'comment' : c.type === 'call' ? 'phone' : 'video'} me-1`} />
                            {c.type}
                          </span>
                        </td>
                        <td className="py-2">
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                            fontSize: 11, fontWeight: 600,
                            background: sc.bg, color: sc.color,
                          }}>
                            {c.status.replace('_',' ')}
                          </span>
                        </td>
                        <td className="py-2 t-muted">
                          {c.duration_minutes ? `${c.duration_minutes} min` : '—'}
                        </td>
                        <td className="py-2 fw-semibold" style={{ color: c.total_amount ? 'var(--primary)' : 'var(--txt-l)' }}>
                          {c.total_amount ? `₹${c.total_amount}` : '—'}
                        </td>
                        <td className="py-2 t-muted" style={{ fontSize: 11 }}>{c.created_at}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center py-2">
            <span className="t-muted small">
              Showing {pagination.from}–{pagination.to} of {pagination.total}
            </span>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-secondary"
                disabled={filters.page === 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>
                ← Prev
              </button>
              <button className="btn btn-sm btn-outline-secondary"
                disabled={filters.page === pagination.last_page}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminPage>
  );
}
