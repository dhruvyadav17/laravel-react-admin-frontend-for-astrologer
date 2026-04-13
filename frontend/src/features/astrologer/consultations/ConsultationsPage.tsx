// FEATURE: Pending requests tab highlighted with badge
// FEATURE: Reject with reason modal
// FEATURE: Sound/visual alert for new pending requests
// FEATURE: Quick accept/reject directly from list (no need to open chat)

import { useState, useEffect, useRef }  from 'react';
import { Link }                          from 'react-router-dom';
import {
  useAstrologerConsultationsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useStartConsultationMutation,
  useEndConsultationMutation,
} from '../../../store/api/consultation.api';
import { PageLoader }   from '../../../components/ui/States';
import Avatar            from '../../../components/ui/Avatar';
import { toast }         from 'react-toastify';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:     { label: 'Pending',     color: 'warning',   icon: 'fa-clock'     },
  accepted:    { label: 'Accepted',    color: 'info',      icon: 'fa-check'     },
  in_progress: { label: 'Live',        color: 'success',   icon: 'fa-circle'    },
  completed:   { label: 'Completed',   color: 'secondary', icon: 'fa-check-double' },
  rejected:    { label: 'Rejected',    color: 'danger',    icon: 'fa-times'     },
  cancelled:   { label: 'Cancelled',   color: 'secondary', icon: 'fa-ban'       },
};

const FILTERS = [
  { value: '',            label: 'All'         },
  { value: 'pending',     label: 'Pending'     },
  { value: 'in_progress', label: 'Live'        },
  { value: 'accepted',    label: 'Accepted'    },
  { value: 'completed',   label: 'Completed'   },
];

/* -- Reject reason modal ------------------------ */
function RejectModal({ onConfirm, onClose, loading }: {
  onConfirm: (reason: string) => void; onClose: () => void; loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const QUICK = ['Not available right now', 'Please reschedule', 'Outside my expertise'];

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-4 shadow-lg p-4" style={{ width: 380, background: "var(--surf)", border: "1px solid var(--bdr)" }}>
        <div className="fw-semibold t-main mb-3" style={{ color: "var(--primary)" }}>
          <i className="fas fa-times-circle me-2" style={{ color: "#ef4444" }} />Reject Request
        </div>
        <div>
          <p className="t-muted small mb-2">Quick reasons:</p>
          <div className="d-flex flex-wrap gap-1 mb-3">
            {QUICK.map(q => (
              <button key={q} className={`btn btn-xs btn-sm ${reason === q ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                style={{ fontSize: 11 }} onClick={() => setReason(q)}>
                {q}
              </button>
            ))}
          </div>
          <textarea className="form-control form-control-sm mb-3" rows={3}
            placeholder="Custom reason (optional)..."
            value={reason} onChange={e => setReason(e.target.value)} />
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger btn-sm flex-grow-1" disabled={loading}
              onClick={() => onConfirm(reason)}>
              {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -- Main page ---------------------------------- */
function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; fg: string; label: string; icon: string }> = {
    pending:     { bg: 'rgba(234,179,8,.15)',   fg: '#ca8a04', label: 'Pending',     icon: 'fa-clock'       },
    accepted:    { bg: 'rgba(59,130,246,.15)',  fg: '#2563eb', label: 'Accepted',    icon: 'fa-check'       },
    in_progress: { bg: 'rgba(34,197,94,.15)',   fg: '#16a34a', label: 'Live',        icon: 'fa-circle'      },
    completed:   { bg: 'rgba(100,116,139,.15)', fg: '#475569', label: 'Completed',   icon: 'fa-check-double'},
    rejected:    { bg: 'rgba(239,68,68,.15)',   fg: '#dc2626', label: 'Rejected',    icon: 'fa-times'       },
    cancelled:   { bg: 'rgba(100,116,139,.15)', fg: '#475569', label: 'Cancelled',   icon: 'fa-ban'         },
  };
  const s = cfg[status] ?? cfg.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.fg,
      border: `1px solid ${s.fg}44`, borderRadius: 20,
      padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }}>
      <i className={`fas ${s.icon}`} style={{ fontSize: 9 }} /> {s.label}
    </span>
  );
}

export default function ConsultationsPage() {
  const [filter, setFilter]       = useState('');
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const prevPendingCount = useRef(0);

  const { data, isLoading, refetch } = useAstrologerConsultationsQuery(
    { status: filter || undefined },
    { pollingInterval: 8000 } // poll for new requests
  );

  const [accept, { isLoading: accepting }] = useAcceptConsultationMutation();
  const [reject, { isLoading: rejecting }] = useRejectConsultationMutation();
  const [start,  { isLoading: starting  }] = useStartConsultationMutation();
  const [end,    { isLoading: ending    }] = useEndConsultationMutation();

  const consultations = data?.data ?? [];

  // Pending requests count for badge
  const { data: pendingData } = useAstrologerConsultationsQuery({ status: 'pending' });
  const pendingCount = pendingData?.data?.length ?? 0;

  // Alert on new pending request
  useEffect(() => {
    if (pendingCount > prevPendingCount.current && prevPendingCount.current > 0) {
      toast.info(`🔔 New consultation request!`, { autoClose: 8000 });
    }
    prevPendingCount.current = pendingCount;
  }, [pendingCount]);

  const handleAccept = async (id: number) => {
    try {
      await accept(id).unwrap();
      toast.success('Request accepted!');
      refetch();
    } catch { toast.error('Action failed'); }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await reject({ id: rejectTarget, reason }).unwrap();
      toast.info('Request rejected');
      setRejectTarget(null);
      refetch();
    } catch { toast.error('Action failed'); }
  };

  const handleStart = async (id: number) => {
    try {
      await start(id).unwrap();
      toast.success('Session started!');
      refetch();
    } catch { toast.error('Failed to start'); }
  };

  const handleEnd = async (id: number) => {
    if (!confirm('End this session? Billing will be calculated.')) return;
    try {
      const res = await end(id).unwrap();
      toast.success(`Session ended -- ₹${res.total_amount} (${res.duration_minutes} min)`);
      refetch();
    } catch { toast.error('Failed to end'); }
  };

  return (
    <>
      {rejectTarget && (
        <RejectModal
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
          loading={rejecting}
        />
      )}

      <div>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Consultation Requests</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={refetch}>
            <i className="fas fa-sync-alt me-1" />Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="d-flex gap-1 flex-wrap mb-4">
          {FILTERS.map(tab => (
            <button key={tab.value}
              className={`btn btn-sm position-relative ${filter === tab.value ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(tab.value)}>
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: 9 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? <PageLoader /> : consultations.length === 0 ? (
          <div className="text-center py-5 t-muted">
            <i className="fas fa-inbox fa-3x d-block mb-3 opacity-25" />
            <p className="fw-semibold mb-1">No consultations</p>
            <p className="small">Make sure you are Online to receive requests</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {consultations.map((c: any) => {
              const st = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
              return (
                <div key={c.id}
                  className={`app-card ${c.status === 'pending' ? 'border-warning border' : ''}`} style={{ transition: "none" }}>
                  {c.status === 'pending' && (
                    <div className="py-1 small px-3" style={{ background: "rgba(255,193,7,0.1)", borderBottom: "1px solid rgba(255,193,7,0.3)" }}>
                      <i className="fas fa-bell text-warning me-1" />
                      New request -- please respond quickly!
                    </div>
                  )}
                  <div className="p-3">
                    <div className="d-flex align-items-start gap-3 flex-wrap">
                      <Avatar name={c.user?.name} src={c.user?.profile_image} size={44} />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span className="fw-bold">{c.user?.name}</span>
                          <StatusChip status={c.status} />
                        </div>
                        <div className="t-muted small">
                          <i className={`fas fa-${c.type === 'chat' ? 'comment' : c.type === 'call' ? 'phone' : 'video'} me-1`} />
                          {c.type} . ₹{c.rate_per_minute}/min
                        </div>
                        {c.user_note && (
                          <div className="t-muted small mt-1 fst-italic">
                            <i className="fas fa-quote-left me-1 opacity-50" />{c.user_note}
                          </div>
                        )}
                        {c.status === 'completed' && (
                          <div className="small t-muted mt-1">
                            {c.duration_minutes} min . ₹{c.total_amount} charged
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2 flex-wrap">
                        {c.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm"
                              onClick={() => handleAccept(c.id)} disabled={accepting}>
                              <i className="fas fa-check me-1" />Accept
                            </button>
                            <button className="btn btn-outline-danger btn-sm"
                              onClick={() => setRejectTarget(c.id)}>
                              <i className="fas fa-times me-1" />Reject
                            </button>
                          </>
                        )}
                        {c.status === 'accepted' && (
                          <button className="btn btn-primary btn-sm"
                            onClick={() => handleStart(c.id)} disabled={starting}>
                            <i className="fas fa-play me-1" />Start Session
                          </button>
                        )}
                        {c.status === 'in_progress' && (
                          <>
                            <Link to={`/astrologer/consultations/${c.id}`}
                              className="btn btn-success btn-sm">
                              <i className="fas fa-comment me-1" />Chat
                            </Link>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => handleEnd(c.id)} disabled={ending}>
                              <i className="fas fa-stop me-1" />End
                            </button>
                          </>
                        )}
                        {(c.status === 'accepted' || c.status === 'completed') && (
                          <Link to={`/astrologer/consultations/${c.id}`}
                            className="btn btn-outline-secondary btn-sm">
                            <i className="fas fa-eye me-1" />View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
