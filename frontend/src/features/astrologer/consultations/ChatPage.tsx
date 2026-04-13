/**
 * ChatPage (Astrologer) -- main consultation management page.
 *
 * Shows the current state of a single consultation and lets the
 * astrologer start sessions, chat, and end billing.
 *
 * STATES HANDLED
 * ---------------
 * pending     -> Accept / Reject buttons
 * accepted    -> Start Session (chat) or Start Video/Voice Call
 * in_progress -> Live chat interface + End Session button (with billing modal)
 *               OR "Join Call Room" button for call/video type
 * completed   -> Read-only message history + earnings shown
 *
 * END SESSION FLOW
 * -----------------
 * End Session -> EndSessionModal (shows duration + cost estimate) ->
 * PATCH /astrologer/consultations/:id/end -> WalletService.deductForConsultation()
 * -> AstrologerEarning created (80% of gross) -> navigate to /astrologer/consultations
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link }              from 'react-router-dom';
import {
  useAstrologerGetConsultationQuery,
  useAstrologerGetMessagesQuery,
  useAstrologerSendMessageMutation,
  useStartConsultationMutation,
  useEndConsultationMutation,
} from '../../../store/api/consultation.api';
import { useAuth }   from '../../../auth/hooks/useAuth';
import Avatar        from '../../../components/ui/Avatar';
import { PageLoader } from '../../../components/ui/States';
import { toast }     from 'react-toastify';

/* -- Live timer ----------------------------------- */
function AstrologerTimer({ startedAt, ratePerMinute }: { startedAt: string; ratePerMinute: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick  = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const mins    = Math.floor(elapsed / 60);
  const secs    = elapsed % 60;
  const earning = ((elapsed / 60) * ratePerMinute * 0.8).toFixed(2);
  return (
    <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-3"
      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 13 }}>
      <span className="badge bg-danger" style={{ fontSize: 9, animation: 'pulse 1s infinite' }}>* LIVE</span>
      <span className="fw-bold font-monospace">
        {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
      </span>
      <span className="t-muted small">+₹{earning}</span>
    </div>
  );
}

/* -- End session modal ---------------------------- */
function EndSessionModal({ consult, onConfirm, onCancel, loading }: any) {
  const startedAt = new Date(consult.started_at).getTime();
  const elapsed   = Math.floor((Date.now() - startedAt) / 1000);
  const mins      = Math.max(1, Math.ceil(elapsed / 60));
  const gross     = (mins * consult.rate_per_minute).toFixed(2);
  const earning   = (mins * consult.rate_per_minute * 0.8).toFixed(2);
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.55)', zIndex: 1055 }}>
      <div className="rounded-4 p-4 shadow-lg" style={{ maxWidth: 380, width: '100%', background: 'var(--surf)', border: '1px solid var(--bdr)' }}>
        <h6 className="fw-bold t-main mb-1">End Session?</h6>
        <p className="t-muted small mb-3">Billing summary before ending:</p>
        <div className="d-flex flex-column gap-2 mb-4">
          {[
            ['Duration',    `~${mins} min`],
            ['Rate',        `₹${consult.rate_per_minute}/min`],
            ['Total billed', `₹${gross}`],
            ['Your earning (80%)', `₹${earning}`],
          ].map(([label, val]) => (
            <div key={label} className="d-flex justify-content-between small">
              <span className="t-muted">{label}</span>
              <span className="fw-semibold t-main">{val}</span>
            </div>
          ))}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary flex-grow-1" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger flex-grow-1 fw-semibold" onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner-border spinner-border-sm me-1" />}
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

/* -- Message bubble ------------------------------- */
function MessageBubble({ msg, isMe }: { msg: any; isMe: boolean }) {
  const time = new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`d-flex gap-2 align-items-end ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
      {!isMe && <Avatar name={msg.sender.name} src={msg.sender.profile_image} size={28} />}
      <div style={{ maxWidth: '72%' }}>
        <div className="px-3 py-2 rounded-3" style={{ background: isMe ? 'var(--primary)' : 'var(--surf3)', color: isMe ? '#fff' : 'var(--txt)', border: isMe ? 'none' : '1px solid var(--bdr)', wordBreak: 'break-word', lineHeight: 1.5, fontSize: 14 }}>
          {msg.message}
        </div>
        <div className={`mt-1 ${isMe ? 'text-end' : ''}`} style={{ fontSize: 10, color: 'var(--txt-l)' }}>
          {time}
          {isMe && <i className={`fas ms-1 ${msg.is_read ? 'fa-check-double text-primary' : 'fa-check'}`} style={{ fontSize: 9 }} />}
        </div>
      </div>
      {isMe && <Avatar name={msg.sender.name} src={msg.sender.profile_image} size={28} />}
    </div>
  );
}

/* ==================================================
   MAIN COMPONENT
================================================== */
export default function ChatPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const consultId = parseInt(id ?? '0', 10);

  const [message,       setMessage]       = useState('');
  const [showEndModal,  setShowEndModal]   = useState(false);
  const [consultStatus, setConsultStatus] = useState('pending');
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // -- Queries ------------------------------------
  // FIX: pollingInterval uses local state, not self-referencing consult
  const { data: consult, isLoading } = useAstrologerGetConsultationQuery(consultId, {
    skip:            !consultId,
    pollingInterval: ['completed','rejected','cancelled'].includes(consultStatus) ? 0 : 5000,
  });

  useEffect(() => {
    if (consult?.status) setConsultStatus(consult.status);
  }, [consult?.status]);

  const { data: messages = [] } = useAstrologerGetMessagesQuery(consultId, {
    skip:            !consultId || !['accepted','in_progress','completed'].includes(consultStatus),
    pollingInterval: consultStatus === 'in_progress' ? 4000 : 0,
  });

  // -- Mutations ----------------------------------
  const [send,  { isLoading: sending  }] = useAstrologerSendMessageMutation();
  const [start, { isLoading: starting }] = useStartConsultationMutation();
  const [end,   { isLoading: ending   }] = useEndConsultationMutation();

  // -- Effects ------------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (consultStatus === 'in_progress') textareaRef.current?.focus();
  }, [consultStatus]);

  // -- Handlers -----------------------------------
  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg || sending) return;
    setMessage('');
    try {
      await send({ consultationId: consultId, message: msg }).unwrap();
    } catch {
      toast.error('Message could not be sent.');
      setMessage(msg);
    }
  }, [message, sending, send, consultId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); }
  };

  // Start session (chat type) -- marks in_progress
  const handleStart = async () => {
    try {
      await start(consultId).unwrap();
      toast.success('Session started!');
    } catch { toast.error('Failed to start session'); }
  };

  // End session
  const handleEndConfirm = async () => {
    try {
      const res = await end(consultId).unwrap();
      toast.success(`Session ended -- You earned ₹${((res.total_amount ?? 0) * 0.8).toFixed(2)} (${res.duration_minutes} min)`);
      navigate('/astrologer/consultations');
    } catch { toast.error('Failed to end session'); }
    setShowEndModal(false);
  };

  // -- Render guards ------------------------------
  if (isLoading) return <div className="container py-5"><PageLoader /></div>;
  if (!consult)  return <div className="container py-5 text-center t-muted">Consultation not found</div>;

  const canChat    = ['accepted', 'in_progress'].includes(consult.status);
  const isActive   = consult.status === 'in_progress';
  const isComplete = consult.status === 'completed';
  const isAccepted = consult.status === 'accepted';

  // ★ KEY: is this a call/video type?
  const isCallType = consult.type === 'call' || consult.type === 'video';
  const callIcon   = consult.type === 'video' ? 'fa-video' : 'fa-phone';
  const callLabel  = consult.type === 'video' ? 'Video' : 'Voice';

  return (
    <>
      {showEndModal && (
        <EndSessionModal consult={consult} onConfirm={handleEndConfirm}
          onCancel={() => setShowEndModal(false)} loading={ending} />
      )}

      <div className="container-fluid" style={{ maxWidth: 760 }}>

        {/* Back */}
        <button className="btn btn-sm btn-outline-secondary mb-3"
          onClick={() => navigate('/astrologer/consultations')}>
          <i className="fas fa-arrow-left me-1" />Back to Requests
        </button>

        {/* -- Header card ------------------------- */}
        <div className="app-card mb-3" style={{ transition: "none" }}>
          <div className="p-0">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={48} />

              <div className="flex-grow-1">
                <div className="fw-bold t-main">{consult.user?.name}</div>
                <div className="t-muted small">
                  <i className={`fas ${callIcon} me-1`} />
                  {consult.type} . ₹{consult.rate_per_minute}/min
                </div>
                {consult.user_note && (
                  <div className="t-muted small mt-1">
                    <i className="fas fa-quote-left me-1 opacity-50" />{consult.user_note}
                  </div>
                )}
              </div>

              <div className="d-flex flex-column align-items-end gap-2">
                {/* Live timer -- only when in_progress */}
                {isActive && consult.started_at && (
                  <AstrologerTimer startedAt={consult.started_at} ratePerMinute={consult.rate_per_minute} />
                )}

                {/* -- Action buttons --------------- */}
                <div className="d-flex gap-2 flex-wrap justify-content-end">

                  {/* ★ CALL/VIDEO TYPE -- accepted state: Start + navigate to call page */}
                  {isCallType && isAccepted && (
                    <button className="btn btn-success btn-sm px-3 fw-semibold"
                      disabled={starting}
                      onClick={async () => {
                        try {
                          await start(consultId).unwrap();
                          navigate(`/astrologer/consultations/${consultId}/call`);
                        } catch { toast.error('Failed to start session'); }
                      }}>
                      {starting
                        ? <span className="spinner-border spinner-border-sm me-1" />
                        : <i className={`fas ${callIcon} me-1`} />}
                      Start {callLabel} Call
                    </button>
                  )}

                  {/* ★ CALL/VIDEO TYPE -- in_progress: go to call page */}
                  {isCallType && isActive && (
                    <Link to={`/astrologer/consultations/${consultId}/call`}
                      className="btn btn-primary btn-sm px-3 fw-semibold">
                      <i className={`fas ${callIcon} me-1`} />
                      {callLabel} Call Room
                    </Link>
                  )}

                  {/* CHAT TYPE -- accepted state: Start Session */}
                  {!isCallType && isAccepted && (
                    <button className="btn btn-success btn-sm px-3 fw-semibold"
                      onClick={handleStart} disabled={starting}>
                      {starting
                        ? <span className="spinner-border spinner-border-sm me-1" />
                        : <i className="fas fa-play me-1" />}
                      Start Session
                    </button>
                  )}

                  {/* End Session -- always shown when in_progress */}
                  {isActive && (
                    <button className="btn btn-danger btn-sm px-3"
                      onClick={() => setShowEndModal(true)}>
                      <i className="fas fa-stop me-1" />End Session
                    </button>
                  )}

                  {/* Completed earning */}
                  {isComplete && (
                    <div className="text-end small">
                      <div className="fw-bold text-success">
                        Earned ₹{((consult.total_amount ?? 0) * 0.8).toFixed(2)}
                      </div>
                      <div className="t-muted">{consult.duration_minutes} min</div>
                    </div>
                  )}

                  {/* Status badge */}
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, background: ['accepted','in_progress'].includes(consult.status) ? 'rgba(34,197,94,.12)' : 'rgba(100,116,139,.12)', color: ['accepted','in_progress'].includes(consult.status) ? '#16a34a' : '#475569', border:'1px solid currentColor' }}>
                    {consult.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ★ CALL/VIDEO: show big call room button when in_progress -- */}
        {isCallType && isActive && (
          <div className="mb-3">
            <Link to={`/astrologer/consultations/${consultId}/call`}
              className="btn w-100 fw-semibold py-3"
              style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16 }}>
              <i className={`fas ${callIcon} me-2`} />
              Join {callLabel} Call Room
            </Link>
          </div>
        )}

        {/* -- Chat window ------------------------ */}
        <div className="app-card overflow-hidden" style={{ transition: "none", padding: 0 }}>
          {/* Messages */}
          <div style={{ height: 460, overflowY: 'auto', background: 'var(--surf2)' }} className="p-3">
            {messages.length === 0 ? (
              <div className="text-center py-5 t-muted">
                <i className="fas fa-comment fa-2x d-block mb-2 opacity-25" />
                <p className="small mb-0">
                  {isCallType
                    ? `Start the ${callLabel} Call using the button above`
                    : canChat ? 'Start the session and send your first message' : 'No messages'}
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {messages.map((msg: any) => (
                  <MessageBubble key={msg.id} msg={msg} isMe={msg.sender.id === user?.id} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input -- only for chat type */}
          {!isCallType && canChat ? (
            <form onSubmit={handleSend} className="p-3 d-flex gap-2 align-items-end"
              style={{ borderTop: '1px solid var(--bdr)', background: 'var(--surf)' }}>
              <textarea ref={textareaRef} className="form-control form-control-sm"
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown} rows={2} style={{ resize: 'none' }}
                maxLength={2000} disabled={sending} />
              <div className="d-flex flex-column gap-1">
                <button type="submit" className="btn btn-primary btn-sm"
                  disabled={!message.trim() || sending} title="Send">
                  {sending ? <span className="spinner-border spinner-border-sm" /> : <i className="fas fa-paper-plane" />}
                </button>
                <span className="t-muted text-center" style={{ fontSize: 10 }}>{message.length}</span>
              </div>
            </form>
          ) : !isCallType && isComplete ? (
            <div className="p-3 text-center t-muted small"
              style={{ borderTop: '1px solid var(--bdr)', background: 'var(--surf)' }}>
              <i className="fas fa-check-circle text-success me-1" />
              Session ended . {consult.duration_minutes} min . ₹{consult.total_amount}
            </div>
          ) : isCallType ? (
            /* For call/video -- show link to call room in input area */
            <div className="p-3 d-flex align-items-center justify-content-center gap-3"
              style={{ borderTop: '1px solid var(--bdr)', background: 'var(--surf)' }}>
              <i className={`fas ${callIcon} t-muted`} />
              <span className="t-muted small">
                This is a {callLabel} consultation --
              </span>
              {(isActive || isAccepted) && (
                <Link to={`/astrologer/consultations/${consultId}/call`}
                  className="btn btn-sm fw-semibold"
                  style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8 }}>
                  Open Call Room
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
