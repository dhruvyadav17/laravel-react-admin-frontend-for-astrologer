/**
 * ConsultationsPage — Astrologer's consultation request list.
 * NEW: Browser notification + sound alert for new pending requests.
 */
import { useState, useEffect, useRef } from 'react';
import { Link }                         from 'react-router-dom';
import {
  useAstrologerConsultationsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useStartConsultationMutation,
  useEndConsultationMutation,
} from '../../../../store/consultation.api';
import { PageLoader } from '../../../../components/ui/States';
import Avatar         from '../../../../components/ui/Avatar';
import { toast }      from 'react-toastify';

const FILTERS = [
  { value: '',            label: 'All'       },
  { value: 'pending',     label: 'Pending'   },
  { value: 'in_progress', label: '🔴 Live'   },
  { value: 'accepted',    label: 'Accepted'  },
  { value: 'completed',   label: 'Completed' },
];

/* ── Reject Modal ───────────────────────────────── */
function RejectModal({ onConfirm, onClose, loading }: {
  onConfirm: (reason: string) => void; onClose: () => void; loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const QUICK = ['Not available right now', 'Please reschedule', 'Outside my expertise'];

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-4 shadow-lg p-4" style={{ width: 380, background: 'var(--surf)', border: '1px solid var(--bdr)' }}>
        <div className="fw-semibold t-main mb-3">
          <i className="fas fa-times-circle me-2 text-danger" />Reject Request
        </div>
        <div className="d-flex flex-wrap gap-1 mb-3">
          {QUICK.map(q => (
            <button key={q} className={`btn btn-xs btn-sm ${reason === q ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
              style={{ fontSize: 11 }} onClick={() => setReason(q)}>{q}</button>
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
  );
}

/* ── Sound Alert ────────────────────────────────── */
function playAlert() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Play 3 beeps
    [0, 200, 400].forEach(delay => {
      const osc   = ctx.createOscillator();
      const gain  = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay / 1000);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + 0.3);
      osc.start(ctx.currentTime + delay / 1000);
      osc.stop(ctx.currentTime + delay / 1000 + 0.3);
    });
  } catch {}
}

/* ── Browser notification ───────────────────────── */
async function showBrowserNotif(userName: string, type: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'granted') {
    const n = new Notification('New Consultation Request! 🔔', {
      body: `${userName} wants a ${type} consultation`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
    setTimeout(() => n.close(), 8000);
  }
}

/* ── Status chip ────────────────────────────────── */
function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; fg: string; label: string; icon: string }> = {
    pending:     { bg: 'rgba(234,179,8,.15)',   fg: '#ca8a04', label: 'Pending',   icon: 'fa-clock'       },
    accepted:    { bg: 'rgba(59,130,246,.15)',  fg: '#2563eb', label: 'Accepted',  icon: 'fa-check'       },
    in_progress: { bg: 'rgba(34,197,94,.15)',   fg: '#16a34a', label: 'Live',      icon: 'fa-circle'      },
    completed:   { bg: 'rgba(100,116,139,.15)', fg: '#475569', label: 'Completed', icon: 'fa-check-double'},
    rejected:    { bg: 'rgba(239,68,68,.15)',   fg: '#dc2626', label: 'Rejected',  icon: 'fa-times'       },
    cancelled:   { bg: 'rgba(100,116,139,.15)', fg: '#475569', label: 'Cancelled', icon: 'fa-ban'         },
  };
  const s = cfg[status] ?? cfg.pending;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:s.bg, color:s.fg,
      border:`1px solid ${s.fg}44`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>
      <i className={`fas ${s.icon}`} style={{ fontSize:9 }} /> {s.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════ */
export default function ConsultationsPage() {
  const [filter, setFilter]             = useState('');
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const prevPendingRef                  = useRef<number>(0);
  const prevIdsRef                      = useRef<Set<number>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { data, isLoading, refetch } = useAstrologerConsultationsQuery(
    { status: filter || undefined },
    { pollingInterval: 6000 }
  );

  const [accept,  { isLoading: accepting }] = useAcceptConsultationMutation();
  const [reject,  { isLoading: rejecting }] = useRejectConsultationMutation();
  const [start,   { isLoading: starting  }] = useStartConsultationMutation();
  const [end,     { isLoading: ending    }] = useEndConsultationMutation();

  const consultations = data?.data ?? [];

  // Pending requests badge (separate query always running)
  const { data: pendingData } = useAstrologerConsultationsQuery(
    { status: 'pending' },
    { pollingInterval: 6000 }
  );
  const pendingList  = pendingData?.data ?? [];
  const pendingCount = pendingList.length;

  // Detect NEW pending requests → sound + browser notification
  useEffect(() => {
    if (pendingCount > prevPendingRef.current && prevPendingRef.current > 0) {
      // Find actually new ones
      const currentIds = new Set(pendingList.map((c: any) => c.id));
      const newOnes    = pendingList.filter((c: any) => !prevIdsRef.current.has(c.id));

      if (newOnes.length > 0) {
        const newest = newOnes[0] as any;
        if (soundEnabled) playAlert();
        showBrowserNotif(newest.user?.name ?? 'Someone', newest.type);
        toast.info(`🔔 New ${newest.type} request from ${newest.user?.name ?? 'a user'}!`, {
          autoClose: 10000,
          position: 'top-right',
        });
      }
      prevIdsRef.current = currentIds;
    } else if (pendingCount !== prevPendingRef.current) {
      prevIdsRef.current = new Set(pendingList.map((c: any) => c.id));
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount, pendingList, soundEnabled]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleAccept = async (id: number) => {
    try { await accept(id).unwrap(); toast.success('Accepted!'); refetch(); }
    catch { toast.error('Failed'); }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try { await reject({ id: rejectTarget, reason }).unwrap(); toast.info('Rejected'); setRejectTarget(null); refetch(); }
    catch { toast.error('Failed'); }
  };

  const handleStart = async (id: number) => {
    try { await start(id).unwrap(); toast.success('Session started!'); refetch(); }
    catch { toast.error('Failed to start'); }
  };

  const handleEnd = async (id: number) => {
    if (!confirm('End this session? Billing will be calculated.')) return;
    try {
      const res = await end(id).unwrap();
      toast.success(`Session ended — ₹${res.total_amount} (${res.duration_minutes} min)`);
      refetch();
    } catch { toast.error('Failed to end'); }
  };

  return (
    <>
      {rejectTarget && (
        <RejectModal onConfirm={handleReject} onClose={() => setRejectTarget(null)} loading={rejecting} />
      )}

      <div>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Consultation Requests</h5>
          <div className="d-flex gap-2 align-items-center">
            {/* Sound toggle */}
            <button className={`btn btn-sm ${soundEnabled ? 'btn-outline-success' : 'btn-outline-secondary'}`}
              onClick={() => setSoundEnabled(v => !v)}
              title={soundEnabled ? 'Sound alerts ON' : 'Sound alerts OFF'}
              style={{ borderRadius: 20, fontSize: 12 }}>
              <i className={`fas fa-volume-${soundEnabled ? 'up' : 'mute'} me-1`} />
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => refetch()}>
              <i className="fas fa-sync-alt me-1" />Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="d-flex gap-1 flex-wrap mb-4">
          {FILTERS.map(tab => (
            <button key={tab.value}
              className={`btn btn-sm position-relative ${filter === tab.value ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ borderRadius: 20 }}
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

        {/* Live sessions banner */}
        {filter === '' && consultations.some((c: any) => c.status === 'in_progress') && (
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-3 small"
            style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)', color: '#16a34a' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 1s infinite' }} />
            <strong>Live session in progress</strong> — scroll down or use "Live" filter
          </div>
        )}

        {/* List */}
        {isLoading ? <PageLoader /> : consultations.length === 0 ? (
          <div className="text-center py-5 t-muted">
            <i className="fas fa-inbox fa-3x d-block mb-3 opacity-25" />
            <p className="fw-semibold mb-1">No consultations</p>
            <p className="small">Go online to receive requests</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {consultations.map((c: any) => (
              <div key={c.id}
                className={`app-card ${c.status === 'pending' ? 'border border-warning' : c.status === 'in_progress' ? 'border border-success' : ''}`}
                style={{ transition: 'none' }}>

                {c.status === 'pending' && (
                  <div className="py-1 small px-3 d-flex align-items-center gap-2"
                    style={{ background: 'rgba(255,193,7,0.10)', borderBottom: '1px solid rgba(255,193,7,0.3)', marginBottom: 12, margin: '-16px -16px 12px' }}>
                    <i className="fas fa-bell text-warning" style={{ animation: 'pulse 1.5s infinite' }} />
                    <span style={{ color: '#ca8a04', fontWeight: 600 }}>New request — respond quickly!</span>
                  </div>
                )}

                <div className="d-flex align-items-start gap-3 flex-wrap">
                  <Avatar name={c.user?.name} src={c.user?.profile_image} size={44} />

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span className="fw-bold">{c.user?.name}</span>
                      <StatusChip status={c.status} />
                    </div>
                    <div className="t-muted small">
                      <i className={`fas fa-${c.type === 'chat' ? 'comment' : c.type === 'call' ? 'phone' : 'video'} me-1`} />
                      {c.type} · ₹{c.rate_per_minute}/min
                    </div>
                    {c.user_note && (
                      <div className="t-muted small mt-1 fst-italic">
                        <i className="fas fa-quote-left me-1 opacity-50" />{c.user_note}
                      </div>
                    )}
                    {c.status === 'completed' && (
                      <div className="small t-muted mt-1">
                        {c.duration_minutes} min · ₹{c.total_amount}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="d-flex gap-2 flex-wrap">
                    {c.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleAccept(c.id)} disabled={accepting}>
                          <i className="fas fa-check me-1" />Accept
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => setRejectTarget(c.id)}>
                          <i className="fas fa-times me-1" />Reject
                        </button>
                      </>
                    )}
                    {c.status === 'accepted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStart(c.id)} disabled={starting}>
                        <i className="fas fa-play me-1" />Start
                      </button>
                    )}
                    {c.status === 'in_progress' && (
                      <>
                        <Link to={`/astrologer/consultations/${c.id}`} className="btn btn-success btn-sm">
                          <i className="fas fa-comment me-1" />Open Chat
                        </Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleEnd(c.id)} disabled={ending}>
                          <i className="fas fa-stop me-1" />End
                        </button>
                      </>
                    )}
                    {(c.status === 'accepted' || c.status === 'completed') && (
                      <Link to={`/astrologer/consultations/${c.id}`} className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-eye me-1" />View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
