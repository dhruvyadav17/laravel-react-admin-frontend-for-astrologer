/**
 * PayoutsPage — Admin marks astrologer earnings as settled.
 * Shows pending payouts, per-astrologer summary, bulk settle.
 */
import { useState } from 'react';
import { toast }    from 'react-toastify';
import AdminPage    from '../../components/AdminPage';
import { baseApi }  from '../../../../store/baseApi';
import api          from '../../../../api/axios';

// RTK Query endpoints
const payoutApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getPayouts: b.query<any, { status?: string; page?: number }>({
      query: (p) => ({ url: '/admin/payouts', params: p }),
      transformResponse: (r: any) => r,
      providesTags: ['Payout' as any],
    }),
    getPayoutSummary: b.query<any[], void>({
      query: () => '/admin/payouts/summary',
      transformResponse: (r: any) => r.data ?? [],
      providesTags: ['Payout' as any],
    }),
  }),
  overrideExisting: false,
});

const { useGetPayoutsQuery, useGetPayoutSummaryQuery } = payoutApi;

export default function PayoutsPage() {
  const [status,   setStatus]   = useState('pending');
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [settling, setSettling] = useState(false);
  const [view,     setView]     = useState<'list' | 'summary'>('list');

  const { data, isLoading, refetch }   = useGetPayoutsQuery({ status, page });
  const { data: summary = [], isLoading: loadingSummary } = useGetPayoutSummaryQuery();

  const payouts    = data?.data      ?? [];
  const pagination = data?.pagination ?? null;
  const totals     = data?.summary   ?? {};

  const toggleSelect = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(s => s.length === payouts.length ? [] : payouts.map((p: any) => p.id));

  const handleSettle = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Mark ${selected.length} earning(s) as settled?`)) return;
    setSettling(true);
    try {
      const res = await api.post('/admin/payouts/settle', { ids: selected });
      toast.success(res.data?.message ?? 'Settled!');
      setSelected([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to settle');
    } finally {
      setSettling(false);
    }
  };

  const fmtRs = (n: number) => `₹${n.toFixed(2)}`;

  return (
    <AdminPage title="Astrologer Payouts">

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, background: 'rgba(234,179,8,.12)' }}>
                <i className="fas fa-clock" style={{ color: '#ca8a04', fontSize: 20 }} />
              </div>
              <div>
                <div className="fw-bold fs-4">{fmtRs(totals.pending_total ?? 0)}</div>
                <div className="t-muted small">Pending Payouts</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, background: 'rgba(34,197,94,.12)' }}>
                <i className="fas fa-check-circle" style={{ color: '#16a34a', fontSize: 20 }} />
              </div>
              <div>
                <div className="fw-bold fs-4">{fmtRs(totals.settled_total ?? 0)}</div>
                <div className="t-muted small">Total Settled</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, background: 'rgba(37,99,235,.12)' }}>
                <i className="fas fa-users" style={{ color: '#2563eb', fontSize: 20 }} />
              </div>
              <div>
                <div className="fw-bold fs-4">{summary.length}</div>
                <div className="t-muted small">Astrologers with Earnings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="d-flex gap-2 mb-4">
        {(['list', 'summary'] as const).map(v => (
          <button key={v}
            className={`btn btn-sm fw-semibold ${view === v ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ borderRadius: 20 }}
            onClick={() => setView(v)}>
            <i className={`fas fa-${v === 'list' ? 'list' : 'chart-bar'} me-1`} />
            {v === 'list' ? 'Earnings List' : 'Per Astrologer'}
          </button>
        ))}
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="card shadow-sm border-0">
          <div className="card-header py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex gap-2">
              {(['pending', 'settled', 'all'] as const).map(s => (
                <button key={s}
                  className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: 20, fontSize: 12 }}
                  onClick={() => { setStatus(s); setPage(1); setSelected([]); }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {selected.length > 0 && status === 'pending' && (
              <button className="btn btn-sm btn-success fw-semibold"
                onClick={handleSettle} disabled={settling}>
                {settling
                  ? <><span className="spinner-border spinner-border-sm me-1" />Settling...</>
                  : <><i className="fas fa-check me-1" />Settle {selected.length} selected</>}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-5 t-muted">
              <i className="fas fa-rupee-sign fa-3x d-block mb-3 opacity-25" />
              No {status} payouts found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: 'var(--surf2)', fontSize: 12 }}>
                  <tr>
                    {status === 'pending' && (
                      <th className="px-3 py-3">
                        <input type="checkbox" className="form-check-input"
                          checked={selected.length === payouts.length && payouts.length > 0}
                          onChange={toggleAll} />
                      </th>
                    )}
                    <th className={status !== 'pending' ? 'px-3 py-3' : 'py-3'}>Astrologer</th>
                    <th>Consultation</th>
                    <th>Gross</th>
                    <th>Fee (20%)</th>
                    <th>Net (80%)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 13 }}>
                  {payouts.map((p: any) => (
                    <tr key={p.id}
                      className={selected.includes(p.id) ? 'table-primary' : ''}
                      style={{ cursor: status === 'pending' ? 'pointer' : 'default' }}
                      onClick={() => status === 'pending' && toggleSelect(p.id)}>
                      {status === 'pending' && (
                        <td className="px-3" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" className="form-check-input"
                            checked={selected.includes(p.id)}
                            onChange={() => toggleSelect(p.id)} />
                        </td>
                      )}
                      <td className={`py-2 ${status !== 'pending' ? 'px-3' : ''}`}>
                        <div className="fw-semibold">{p.astrologer?.name}</div>
                        <div className="t-muted" style={{ fontSize: 11 }}>{p.astrologer?.email}</div>
                      </td>
                      <td className="py-2">
                        <div className="small">#{p.consultation_id}</div>
                        <div className="t-muted" style={{ fontSize: 11 }}>
                          {p.consultation?.type} · {p.consultation?.duration_minutes}min
                        </div>
                      </td>
                      <td className="py-2 fw-semibold">{fmtRs(p.gross_amount)}</td>
                      <td className="py-2 text-danger">{fmtRs(p.platform_fee)}</td>
                      <td className="py-2 fw-bold text-success">{fmtRs(p.net_amount)}</td>
                      <td className="py-2">
                        <span className={`badge ${p.status === 'settled' ? 'bg-success' : 'bg-warning text-dark'} bg-opacity-15`}
                          style={{ fontSize: 11, fontWeight: 600 }}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 t-muted" style={{ fontSize: 11 }}>{p.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="card-footer d-flex justify-content-between align-items-center py-2">
              <span className="t-muted small">{pagination.from}–{pagination.to} of {pagination.total}</span>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary"
                  disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button className="btn btn-sm btn-outline-secondary"
                  disabled={page === pagination.last_page} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUMMARY VIEW ── */}
      {view === 'summary' && (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loadingSummary ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background: 'var(--surf2)', fontSize: 12 }}>
                    <tr>
                      <th className="px-3 py-3">Astrologer</th>
                      <th>Pending</th>
                      <th>Settled</th>
                      <th>Total Sessions</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 13 }}>
                    {summary.map((a: any) => (
                      <tr key={a.id}>
                        <td className="px-3 py-2">
                          <div className="fw-semibold">{a.name}</div>
                          <div className="t-muted" style={{ fontSize: 11 }}>{a.email}</div>
                        </td>
                        <td className="py-2">
                          <span className="fw-bold" style={{ color: a.pending_amount > 0 ? '#ca8a04' : 'var(--txt-l)' }}>
                            {fmtRs(a.pending_amount)}
                          </span>
                        </td>
                        <td className="py-2 fw-semibold text-success">{fmtRs(a.settled_amount)}</td>
                        <td className="py-2 t-muted">{a.total_earnings}</td>
                        <td className="py-2">
                          <button className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: 11 }}
                            onClick={() => { setView('list'); setStatus('pending'); }}>
                            View Pending
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}
