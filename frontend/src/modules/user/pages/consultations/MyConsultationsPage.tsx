/**
 * MyConsultationsPage — user ka consultation history.
 * Features: filter tabs, search by astrologer name, rate completed consultations.
 */
import { useState, useCallback, useMemo } from 'react';
import { Link }                           from 'react-router-dom';
import {
  useMyConsultationsQuery,
  useCancelConsultationMutation,
} from '../../../../store/consultation.api';
import { useSubmitReviewMutation } from '../../../../store/astrologer.api';
import { PageLoader }   from '../../../../components/ui/States';
import Avatar           from '../../../../components/ui/Avatar';
import UserPage         from '../../components/UserPage';
import ReceiptModal     from './ReceiptModal';
import StarRating       from '../../../../components/ui/StarRating';
import { toast }        from 'react-toastify';

const TYPE_ICON: Record<string, string> = {
  chat: 'fa-comment', call: 'fa-phone', video: 'fa-video',
};

const TABS = [
  { value: '',            label: 'All'       },
  { value: 'in_progress', label: '🔴 Active' },
  { value: 'pending',     label: 'Pending'   },
  { value: 'completed',   label: 'Completed' },
  { value: 'rejected',    label: 'Rejected'  },
  { value: 'cancelled',   label: 'Cancelled' },
];

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string; icon: string }> = {
    pending:     { bg: 'rgba(234,179,8,0.15)',   color: '#ca8a04', label: 'Pending',     icon: 'fa-clock'        },
    accepted:    { bg: 'rgba(59,130,246,0.15)',  color: '#2563eb', label: 'Accepted',    icon: 'fa-check'        },
    in_progress: { bg: 'rgba(34,197,94,0.15)',   color: '#16a34a', label: 'In Progress', icon: 'fa-circle'       },
    completed:   { bg: 'rgba(100,116,139,0.15)', color: '#475569', label: 'Completed',   icon: 'fa-check-double' },
    rejected:    { bg: 'rgba(239,68,68,0.15)',   color: '#dc2626', label: 'Rejected',    icon: 'fa-times-circle' },
    cancelled:   { bg: 'rgba(100,116,139,0.15)', color: '#475569', label: 'Cancelled',   icon: 'fa-ban'          },
  };
  const s = cfg[status] ?? cfg.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.color, border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }}>
      <i className={`fas ${s.icon}`} style={{ fontSize: 9 }} />
      {s.label}
    </span>
  );
}

/* ── Rating Modal ──────────────────────────────────── */
function RatingModal({ consultationId, astrologerId, astrologerName, onClose }: {
  consultationId: number; astrologerId: number; astrologerName: string; onClose: () => void;
}) {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [submit, { isLoading }] = useSubmitReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submit({ astrologerId, rating, comment: comment || undefined }).unwrap();
      toast.success('Review submitted! Thank you.');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to submit review');
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.55)', zIndex: 1060 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="app-card shadow-lg" style={{ width: 420, borderRadius: 16 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h6 className="fw-bold t-main mb-0">Rate Your Experience</h6>
            <p className="t-muted small mb-0">with {astrologerName}</p>
          </div>
          <button className="btn-close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star selector */}
          <div className="text-center mb-4">
            <p className="t-muted small mb-2">How would you rate this consultation?</p>
            <div className="d-flex justify-content-center gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button"
                  onClick={() => setRating(s)}
                  style={{
                    fontSize: 32, background: 'none', border: 'none',
                    cursor: 'pointer', color: s <= rating ? '#f59e0b' : 'var(--bdr2)',
                    transition: 'color .15s, transform .1s',
                    transform: s <= rating ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  ★
                </button>
              ))}
            </div>
            <p className="t-muted small mt-1">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">
              Comment <span className="t-muted fw-normal">(optional)</span>
            </label>
            <textarea className="form-control" rows={3}
              placeholder="Share your experience..."
              value={comment} onChange={e => setComment(e.target.value)}
              maxLength={500} />
          </div>

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-app flex-grow-1 fw-semibold" disabled={isLoading}>
              {isLoading
                ? <><span className="spinner-border spinner-border-sm me-1" />Submitting...</>
                : <><i className="fas fa-star me-1" />Submit Review</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────── */
export default function MyConsultationsPage() {
  const [filter,    setFilter]    = useState('');
  const [search,    setSearch]    = useState('');
  const [receiptId, setReceiptId] = useState<number | null>(null);
  const [ratingTarget, setRatingTarget] = useState<{
    consultationId: number; astrologerId: number; astrologerName: string;
  } | null>(null);

  const needsPoll = filter === '' || filter === 'in_progress' || filter === 'pending';
  const { data, isLoading, refetch } = useMyConsultationsQuery(
    { status: filter || undefined },
    { pollingInterval: needsPoll ? 8000 : 0 }
  );

  const [cancel, { isLoading: cancelling }] = useCancelConsultationMutation();

  const allConsultations = data?.data ?? [];

  // Client-side search by astrologer name
  const consultations = useMemo(() => {
    if (!search.trim()) return allConsultations;
    const q = search.toLowerCase();
    return allConsultations.filter((c: any) =>
      c.astrologer?.name?.toLowerCase().includes(q)
    );
  }, [allConsultations, search]);

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

      {ratingTarget && (
        <RatingModal
          {...ratingTarget}
          onClose={() => setRatingTarget(null)}
        />
      )}

      {/* Search + Filter */}
      <div className="d-flex gap-2 flex-wrap mb-4 align-items-center">
        {/* Filter tabs */}
        <div className="d-flex gap-2 flex-wrap">
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

        {/* Search */}
        <div className="ms-auto" style={{ minWidth: 200 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text" style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
              <i className="fas fa-search t-muted" style={{ fontSize: 12 }} />
            </span>
            <input type="search" className="form-control"
              placeholder="Search by astrologer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)', color: 'var(--txt)' }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? <PageLoader /> : consultations.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-phone-slash fa-3x d-block mb-3" style={{ color: 'var(--bdr2)' }} />
          <p className="fw-semibold t-main mb-1">
            {search ? `No results for "${search}"` : 'No consultations yet'}
          </p>
          <p className="t-muted small mb-3">
            {search ? 'Try a different search term' : 'Talk to an expert astrologer today'}
          </p>
          {!search && (
            <Link to="/astrologers" className="btn btn-call px-4">Browse Astrologers</Link>
          )}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {consultations.map((c: any) => {
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
                      <span>·</span>
                      <span>₹{c.rate_per_minute}/min</span>
                      {c.astrologer?.expertise && (
                        <><span>·</span><span>{c.astrologer.expertise}</span></>
                      )}
                    </div>

                    {c.status === 'completed' && (
                      <div className="small mt-1">
                        <span className="t-muted">{c.duration_minutes} min · </span>
                        <span className="fw-semibold" style={{ color: 'var(--primary)' }}>₹{c.total_amount}</span>
                      </div>
                    )}

                    {c.status === 'rejected' && c.rejection_reason && (
                      <div className="small mt-1" style={{ color: '#ef4444' }}>
                        <i className="fas fa-info-circle me-1" />{c.rejection_reason}
                      </div>
                    )}

                    <div className="t-light mt-1" style={{ fontSize: 11 }}>{c.created_at}</div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-column gap-2 align-items-end flex-shrink-0">

                    {/* Active */}
                    {isActive && (
                      <Link
                        to={isCall && c.status === 'in_progress'
                          ? `/consultations/${c.id}/call`
                          : `/consultations/${c.id}`}
                        className="btn btn-sm fw-semibold"
                        style={{
                          background: c.status === 'in_progress' ? '#22c55e' : 'var(--primary)',
                          color: '#fff', border: 'none', borderRadius: 8,
                        }}>
                        <i className={`fas ${c.status === 'in_progress' && isCall ? 'fa-phone' : 'fa-arrow-right'} me-1`} />
                        {c.status === 'in_progress' ? (isCall ? 'Join Call' : 'Rejoin Chat') : 'Open'}
                      </Link>
                    )}

                    {/* Completed: Chat + Receipt + Rate */}
                    {c.status === 'completed' && (
                      <div className="d-flex gap-1 flex-wrap justify-content-end">
                        <Link to={`/consultations/${c.id}`}
                          className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 8 }}>
                          <i className="fas fa-history me-1" />Chat
                        </Link>
                        <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8 }}
                          onClick={() => setReceiptId(c.id)}>
                          <i className="fas fa-receipt me-1" />Receipt
                        </button>
                        <button className="btn btn-sm fw-semibold" style={{
                          borderRadius: 8, background: 'rgba(245,158,11,.12)',
                          color: '#f59e0b', border: '1px solid rgba(245,158,11,.3)',
                        }}
                          onClick={() => setRatingTarget({
                            consultationId: c.id,
                            astrologerId: c.astrologer?.id,
                            astrologerName: c.astrologer?.name,
                          })}>
                          <i className="fas fa-star me-1" />Rate
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
