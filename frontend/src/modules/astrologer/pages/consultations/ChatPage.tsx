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
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useAstrologerSendTypingMutation,
  useAstrologerGetTypingQuery,
} from '../../../../store/consultation.api';
import { useAuth }   from '../../../auth/hooks/useAuth';
import Avatar        from '../../../../components/ui/Avatar';
import { PageLoader } from '../../../../components/ui/States';
import { toast }        from 'react-toastify';
import SessionTimer      from '../../../../components/ui/SessionTimer';
import MessageBubble     from '../../../../components/ui/MessageBubble';

/* -- End session modal ---------------------------- */
type EndSessionModalProps = {
  consult:   { started_at: string; rate_per_minute: number };
  onConfirm: () => void;
  onCancel:  () => void;
  loading:   boolean;
};

function EndSessionModal({ consult, onConfirm, onCancel, loading }: EndSessionModalProps) {
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
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // -- Queries ------------------------------------
    // FIX: statusRef avoids "Cannot access 'consult' before initialization" crash
  // The original code used consult?.status inside the same hook that defines consult
  const statusRef = useRef<string>('pending');

  const { data: consult, isLoading } = useAstrologerGetConsultationQuery(consultId, {
    skip:            !consultId,
    pollingInterval: 5000, // constant; statusRef is updated via useEffect below
  });

  // Keep statusRef in sync with server status
  useEffect(() => {
    if (consult?.status) statusRef.current = consult.status;
  }, [consult?.status]);


  const { data: messages = [] } = useAstrologerGetMessagesQuery(consultId, {
    skip:            !consultId || !consult,
    pollingInterval: consult?.status === 'in_progress' ? 4000 : 0,
  });

  // -- Mutations ----------------------------------
  const [send,  { isLoading: sending  }] = useAstrologerSendMessageMutation();
  const [accept, { isLoading: accepting }] = useAcceptConsultationMutation();
  const [reject, { isLoading: rejecting }] = useRejectConsultationMutation();
  const [rejectReason, setRejectReason]    = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [start, { isLoading: starting }] = useStartConsultationMutation();
  const [end,   { isLoading: ending   }] = useEndConsultationMutation();
  const [sendTyping]                     = useAstrologerSendTypingMutation();
  const { data: typingData }             = useAstrologerGetTypingQuery(consultId, {
    skip: !consultId || consult?.status !== 'in_progress',
    pollingInterval: 2000,
  });
  const isOtherTyping = (typingData?.typing?.length ?? 0) > 0;
  const typingName    = typingData?.typing?.[0]?.name ?? '';

  // -- Effects ------------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (consult?.status === 'in_progress') textareaRef.current?.focus();
  }, [consult?.status]);

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

  // Accept pending consultation
  const handleAccept = async () => {
    try {
      await accept(consultId).unwrap();
      toast.success('Consultation accepted! You can now start the session.');
    } catch { toast.error('Failed to accept'); }
  };

  // Reject consultation
  const handleReject = async () => {
    try {
      await reject({ id: consultId, reason: rejectReason || 'Not available right now' }).unwrap();
      toast.info('Consultation rejected');
      navigate('/astrologer/consultations');
    } catch { toast.error('Failed to reject'); }
    setShowRejectInput(false);
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
                  <SessionTimer startedAt={consult.started_at} ratePerMinute={consult.rate_per_minute} earningRate={0.8} />
                )}

                {/* -- Action buttons --------------- */}
                <div className="d-flex gap-2 flex-wrap justify-content-end">

                  
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

                  
                  {isCallType && isActive && (
                    <Link to={`/astrologer/consultations/${consultId}/call`}
                      className="btn btn-primary btn-sm px-3 fw-semibold">
                      <i className={`fas ${callIcon} me-1`} />
                      {callLabel} Call Room
                    </Link>
                  )}

                  {/* PENDING state -- Accept / Reject */}
                  {consult.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm px-3 fw-semibold"
                        onClick={handleAccept} disabled={accepting}>
                        {accepting ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="fas fa-check me-1" />}
                        Accept
                      </button>
                      <button className="btn btn-outline-danger btn-sm"
                        onClick={() => setShowRejectInput(v => !v)}>
                        <i className="fas fa-times me-1" />Reject
                      </button>
                    </>
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

        {/* Reject input (shown when reject clicked) */}
        {showRejectInput && (
          <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)' }}>
            <p className="fw-semibold small mb-2" style={{ color: '#dc2626' }}>
              <i className="fas fa-times-circle me-1" />Rejection Reason
            </p>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              {['Not available right now', 'Please reschedule', 'Outside my expertise'].map(r => (
                <button key={r} className={`btn btn-sm ${rejectReason === r ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                  style={{ fontSize: 11 }} onClick={() => setRejectReason(r)}>{r}</button>
              ))}
            </div>
            <textarea className="form-control form-control-sm mb-2" rows={2}
              placeholder="Custom reason (optional)..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => setShowRejectInput(false)}>Cancel</button>
              <button className="btn btn-sm btn-danger flex-grow-1" onClick={handleReject} disabled={rejecting}>
                {rejecting ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Confirm Reject
              </button>
            </div>
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
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} isMe={msg.sender.id === user?.id} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Typing indicator */}
          {!isCallType && isActive && isOtherTyping && (
            <div className="px-3 py-1 d-flex align-items-center gap-2"
              style={{ background: 'var(--surf2)', borderTop: '1px solid var(--bdr)', fontSize: 12 }}>
              <div className="d-flex gap-1 align-items-center">
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)',
                    animation: `pulse ${0.6 + i * 0.15}s ease infinite alternate`,
                    animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
              <span className="t-muted">{typingName} is typing...</span>
            </div>
          )}

          {/* Input -- only for chat type */}
          {!isCallType && canChat ? (
            <form onSubmit={handleSend} className="p-3 d-flex gap-2 align-items-end"
              style={{ borderTop: '1px solid var(--bdr)', background: 'var(--surf)' }}>
              <textarea ref={textareaRef} className="form-control form-control-sm"
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                value={message} onChange={e => {
                  setMessage(e.target.value);
                  if (consult?.status === 'in_progress') sendTyping(consultId);
                }}
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
