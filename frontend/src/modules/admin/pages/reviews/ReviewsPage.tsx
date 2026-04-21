/**
 * ReviewsPage — Admin moderates user reviews.
 * Approve genuine reviews, reject fake/spam ones.
 */
import { useState } from 'react';
import { toast }    from 'react-toastify';
import AdminPage    from '../../components/AdminPage';
import { baseApi }  from '../../../../store/baseApi';
import api          from '../../../../api/axios';

const reviewApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getReviews: b.query<any, { status?: string; page?: number }>({
      query: (p) => ({ url: '/admin/reviews', params: p }),
      transformResponse: (r: any) => r,
      providesTags: ['Review'],
    }),
  }),
  overrideExisting: false,
});

const { useGetReviewsQuery } = reviewApi;

const STATUS_TABS = [
  { value: 'pending',  label: 'Pending',  color: '#ca8a04' },
  { value: 'approved', label: 'Approved', color: '#16a34a' },
  { value: 'rejected', label: 'Rejected', color: '#dc2626' },
  { value: 'all',      label: 'All',      color: '#475569' },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => (
        <i key={s} className="fas fa-star" style={{ color: s <= rating ? '#f59e0b' : '#e2e8f0', fontSize: 12 }} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [status, setStatus] = useState('pending');
  const [page,   setPage]   = useState(1);
  const [acting, setActing] = useState<number | null>(null);

  const { data, isLoading, refetch } = useGetReviewsQuery({ status, page });

  const reviews    = data?.data      ?? [];
  const pagination = data?.pagination ?? null;
  const summary    = data?.summary   ?? {};

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActing(id);
    try {
      const res = await api.post(`/admin/reviews/${id}/${action}`);
      toast.success(res.data?.message ?? `Review ${action}d`);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <AdminPage title="Review Moderation">

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending',  count: summary.pending,  color: '#ca8a04', bg: 'rgba(234,179,8,.10)',  icon: 'fa-clock'         },
          { label: 'Approved', count: summary.approved, color: '#16a34a', bg: 'rgba(34,197,94,.10)',  icon: 'fa-check-circle'  },
          { label: 'Rejected', count: summary.rejected, color: '#dc2626', bg: 'rgba(239,68,68,.10)',  icon: 'fa-times-circle'  },
          { label: 'Total',    count: summary.total,    color: '#475569', bg: 'rgba(100,116,139,.10)',icon: 'fa-list'          },
        ].map(({ label, count, color, bg, icon }) => (
          <div key={label} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, background: bg }}>
                  <i className={`fas ${icon}`} style={{ color, fontSize: 18 }} />
                </div>
                <div>
                  <div className="fw-bold fs-5">{count ?? 0}</div>
                  <div className="t-muted small">{label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t.value}
            className={`btn btn-sm fw-semibold ${status === t.value ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ borderRadius: 20 }}
            onClick={() => { setStatus(t.value); setPage(1); }}>
            {t.label}
            {t.value === 'pending' && summary.pending > 0 && (
              <span className="badge bg-danger ms-1" style={{ fontSize: 10 }}>{summary.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-5 t-muted">
              <i className="fas fa-star fa-3x d-block mb-3 opacity-25" />
              No {status} reviews
            </div>
          ) : (
            <div>
              {reviews.map((r: any, i: number) => (
                <div key={r.id} className="p-3 d-flex gap-3"
                  style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--bdr)' : 'none' }}>

                  {/* Rating + content */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <StarDisplay rating={r.rating} />
                      <span className="fw-semibold small">{r.user?.name}</span>
                      <span className="t-muted small">→</span>
                      <span className="t-muted small">{r.astrologer?.name}</span>
                      <span className="t-light" style={{ fontSize: 11 }}>{r.created_at}</span>

                      {/* Status badge */}
                      {r.is_rejected ? (
                        <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: 10 }}>Rejected</span>
                      ) : r.is_approved ? (
                        <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: 10 }}>Approved</span>
                      ) : (
                        <span className="badge bg-warning bg-opacity-10 text-warning" style={{ fontSize: 10 }}>Pending</span>
                      )}
                    </div>

                    {r.comment ? (
                      <p className="t-muted small mb-0" style={{ lineHeight: 1.6 }}>
                        "{r.comment}"
                      </p>
                    ) : (
                      <p className="t-light small mb-0 fst-italic">No comment</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-1 flex-shrink-0 align-items-start">
                    {!r.is_approved && !r.is_rejected && (
                      <button className="btn btn-sm btn-success"
                        disabled={acting === r.id}
                        onClick={() => handleAction(r.id, 'approve')}
                        title="Approve">
                        {acting === r.id
                          ? <span className="spinner-border spinner-border-sm" />
                          : <i className="fas fa-check" />}
                      </button>
                    )}
                    {!r.is_rejected && (
                      <button className="btn btn-sm btn-outline-danger"
                        disabled={acting === r.id}
                        onClick={() => handleAction(r.id, 'reject')}
                        title="Reject">
                        <i className="fas fa-times" />
                      </button>
                    )}
                    {r.is_rejected && (
                      <button className="btn btn-sm btn-outline-success"
                        disabled={acting === r.id}
                        onClick={() => handleAction(r.id, 'approve')}
                        title="Restore & Approve">
                        <i className="fas fa-undo me-1" />Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
    </AdminPage>
  );
}
