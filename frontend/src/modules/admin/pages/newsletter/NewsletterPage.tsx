/**
 * NewsletterPage — Admin view of all newsletter subscribers.
 */
import { useState } from 'react';
import { baseApi }  from '../../../../store/baseApi';
import AdminPage    from '../../components/AdminPage';

const newsletterApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getSubscribers: b.query<any, { page?: number }>({
      query: (params) => ({ url: '/admin/newsletter', params }),
      transformResponse: (res: any) => res,
    }),
  }),
  overrideExisting: false,
});

const { useGetSubscribersQuery } = newsletterApi;

export default function NewsletterPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetSubscribersQuery({ page });

  const subscribers = data?.data ?? [];
  const pagination  = data?.pagination ?? null;

  return (
    <AdminPage title="Newsletter Subscribers">
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body py-2 d-flex align-items-center justify-content-between">
          <span className="fw-semibold">
            Total subscribers: <strong>{pagination?.total ?? subscribers.length}</strong>
          </span>
          <span className="badge bg-success bg-opacity-10 text-success">
            <i className="fas fa-users me-1" />Active
          </span>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-5 t-muted">
              <i className="fas fa-envelope fa-2x d-block mb-3 opacity-25" />
              No subscribers yet
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: 'var(--surf2)', fontSize: 12 }}>
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Subscribed On</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 13 }}>
                  {subscribers.map((s: any, i: number) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2 t-muted">{(page - 1) * 20 + i + 1}</td>
                      <td className="py-2 fw-semibold">{s.email}</td>
                      <td className="py-2">
                        <span className={`badge ${s.active ? 'bg-success' : 'bg-secondary'} bg-opacity-10 ${s.active ? 'text-success' : 'text-secondary'}`}
                          style={{ fontSize: 11 }}>
                          {s.active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="py-2 t-muted" style={{ fontSize: 11 }}>{s.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center py-2">
            <span className="t-muted small">
              {pagination.from}–{pagination.to} of {pagination.total}
            </span>
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
