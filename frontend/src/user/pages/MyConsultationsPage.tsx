/**
 * MyConsultationsPage -- paginated list of the user's consultation history.
 *
 * Filter tabs: All | Active | Pending | Completed | Rejected
 *
 * Each card shows: astrologer, type, rate, duration, total cost,
 * and action buttons (Open / Join Call / Receipt / Cancel).
 *
 * TO ADD PAGINATION: the backend already supports ?page= and ?per_page=.
 * Wrap the list in a Pagination component and pass filters.page.
 *
 * TO ADD DATE RANGE FILTER: extend MyConsultationsQuery params with
 * from_date / to_date and add date pickers to the filter row.
 */
import { useState, useCallback }           from 'react';
import { Link }                             from 'react-router-dom';
import {
  useMyConsultationsQuery,
  useCancelConsultationMutation,
} from '../../store/api/consultation.api';
import { PageLoader }                       from '../../components/ui/States';
import Avatar                               from '../../components/ui/Avatar';
import UserPage                             from '../components/ui/UserPage';
import ReceiptModal                         from '../../features/user/consultation/ReceiptModal';
import { toast }                            from 'react-toastify';

const STATUS_CFG: Record<string, { label: string; color: string; icon: string }> = {
  pending:     { label: 'Pending',     color: 'warning',   icon: 'fa-clock'       },
  accepted:    { label: 'Accepted',    color: 'info',      icon: 'fa-check'       },
  in_progress: { label: 'In Progress', color: 'success',   icon: 'fa-circle'      },
  completed:   { label: 'Completed',   color: 'secondary', icon: 'fa-check-circle'},
  rejected:    { label: 'Rejected',    color: 'danger',    icon: 'fa-times-circle'},
  cancelled:   { label: 'Cancelled',   color: 'secondary', icon: 'fa-ban'         },
};

const TYPE_ICON: Record<string, string> = {
  chat: 'fa-comment', call: 'fa-phone', video: 'fa-video',
};

const TABS = [
  { value: '',            label: 'All'       },
  { value: 'in_progress', label: '🔴 Active' },
  { value: 'pending',     label: 'Pending'   },
  { value: 'completed',   label: 'Completed' },
  { value: 'rejected',    label: 'Rejected'  },
];

// Visible status badge with proper colors
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string; icon: string }> = {
    pending:     { bg: 'rgba(234,179,8,0.15)',    color: '#ca8a04',  label: 'Pending',     icon: 'fa-clock'        },
    accepted:    { bg: 'rgba(59,130,246,0.15)',   color: '#2563eb',  label: 'Accepted',    icon: 'fa-check'        },
    in_progress: { bg: 'rgba(34,197,94,0.15)',    color: '#16a34a',  label: 'In Progress', icon: 'fa-circle'       },
    completed:   { bg: 'rgba(100,116,139,0.15)',  color: '#475569',  label: 'Completed',   icon: 'fa-check-double' },
    rejected:    { bg: 'rgba(239,68,68,0.15)',    color: '#dc2626',  label: 'Rejected',    icon: 'fa-times-circle' },
    cancelled:   { bg: 'rgba(100,116,139,0.15)',  color: '#475569',  label: 'Cancelled',   icon: 'fa-ban'          },
  };
  const s = cfg[status] ?? cfg.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: '3px 10px',
      fontSize: 11, fontWeight: 600,
    }}>
      <i className={`fas ${s.icon}`} style={{ fontSize: 9 }} />
      {s.label}
    </span>
  );
}

export default function MyConsultationsPage() {
  const [filter,    setFilter]    = useState('');
  const [receiptId, setReceiptId] = useState<number | null>(null);

  // Only poll when filter is active/pending (those change frequently)
  const needsPoll = filter === '' || filter === 'in_progress' || filter === 'pending';

  const { data, isLoading, refetch } = useMyConsultationsQuery(
    { status: filter || undefined },
    { pollingInterval: needsPoll ? 8000 : 0 }
  );

  const [cancel, { isLoading: cancelling }] = useCancelConsultationMutation();
  const consultations = data?.data ?? [];

  const handleCancel = useCallback(async (id: number) => {
    if (!confirm('Cancel this consultation request?')) return;
    try {
      await cancel(id).unwrap();
      toast.success('Consultation cancelled');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Cancel failed');
    }
  }, [cancel, refetch]);

  return (
    <UserPage title="📞 My Consultations">

      {receiptId !== null && (
        <ReceiptModal consultationId={receiptId} onClose={() => setReceiptId(null)} />
      )}

      {/* Filter tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {TABS.map(tab => (
          <button key={tab.value}
            onClick={() => setFilter(tab.value)}
            className="btn btn-sm fw-semibold"
            style={{
              background: filter === tab.value ? 'var(--primary)' : 'var(--surf2)',
              color:      filter === tab.value ? '#fff' : 'var(--txt-m)',
              border:     `1px solid ${filter === tab.value ? 'var(--primary)' : 'var(--bdr)'}`,
              borderRadius: 20,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? <PageLoader /> : consultations.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-phone-slash fa-3x d-block mb-3" style={{ color: 'var(--bdr2)' }} />
          <p className="fw-semibold t-main mb-1">No consultations yet</p>
          <p className="t-muted small mb-3">Talk to an expert astrologer today</p>
          <Link to="/astrologers" className="btn btn-call px-4">
            Browse Astrologers
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {consultations.map((c: any) => {
            const st       = STATUS_CFG[c.status] ?? STATUS_CFG.pending;
            const isActive = ['pending', 'accepted', 'in_progress'].includes(c.status);
            const isCall   = c.type !== 'chat';

            return (
              <div key={c.id} className="app-card"
                style={{ border: c.status === 'in_progress' ? '1px solid rgba(34,197,94,0.35)' : undefined }}>
                <div className="d-flex align-items-start gap-3 flex-wrap">

                  <Link to={`/astrologers/${c.astrologer?.id}`}>
                    <Avatar name={c.astrologer?.name} src={c.astrologer?.profile_image} size={46} />
                  </Link>

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span className="fw-bold t-main">{c.astrologer?.name}</span>
                      <StatusBadge status={c.status} />
                    </div>

                    <div className="t-muted small d-flex align-items-center gap-2 flex-wrap">
                      <span>
                        <i className={`fas ${TYPE_ICON[c.type] ?? 'fa-comment'} me-1`} />
                        {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                      </span>
                      <span>.</span>
                      <span>₹{c.rate_per_minute}/min</span>
                      {c.astrologer?.expertise && (
                        <><span>.</span><span>{c.astrologer.expertise}</span></>
                      )}
                    </div>

                    {c.status === 'completed' && (
                      <div className="small mt-1">
                        <span className="t-muted">{c.duration_minutes} min . </span>
                        <span className="fw-semibold" style={{ color: 'var(--primary)' }}>₹{c.total_amount}</span>
                      </div>
                    )}

                    {c.status === 'rejected' && c.rejection_reason && (
                      <div className="small mt-1" style={{ color: '#ef4444' }}>
                        <i className="fas fa-info-circle me-1" />
                        {c.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-column gap-2 align-items-end flex-shrink-0">
                    {/* Active: open chat or join call */}
                    {isActive && (
                      <Link
                        to={isCall && c.status === 'in_progress'
                          ? `/consultations/${c.id}/call`
                          : `/consultations/${c.id}`}
                        className="btn btn-sm fw-semibold"
                        style={{
                          background: c.status === 'in_progress' ? '#22c55e' : 'var(--primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                        }}>
                        <i className={`fas ${c.status === 'in_progress' && isCall ? 'fa-phone' : 'fa-arrow-right'} me-1`} />
                        {c.status === 'in_progress'
                          ? (isCall ? 'Join Call' : 'Rejoin Chat')
                          : 'Open'}
                      </Link>
                    )}

                    {/* Completed: view chat + receipt */}
                    {c.status === 'completed' && (
                      <div className="d-flex gap-1">
                        <Link to={`/consultations/${c.id}`}
                          className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 8 }}>
                          <i className="fas fa-history me-1" />Chat
                        </Link>
                        <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8 }}
                          onClick={() => setReceiptId(c.id)}>
                          <i className="fas fa-receipt me-1" />Receipt
                        </button>
                      </div>
                    )}

                    {/* Pending: cancel */}
                    {c.status === 'pending' && (
                      <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8 }}
                        onClick={() => handleCancel(c.id)} disabled={cancelling}>
                        Cancel
                      </button>
                    )}

                    <div className="t-light" style={{ fontSize: 11 }}>{c.created_at}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </UserPage>
  );
}
