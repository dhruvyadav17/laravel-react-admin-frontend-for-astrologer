/**
 * ConsultationPage -- real-time consultation view for the user.
 *
 * Handles all consultation states:
 *   pending     -> spinner, cancel button
 *   accepted    -> spinner, waiting for astrologer to start
 *   in_progress -> live chat (text) OR join-call button (call/video)
 *                 + live billing timer + balance warning
 *   completed   -> message history, total cost, rate-astrologer link
 *   rejected    -> reason shown, find-another link
 *   cancelled   -> redirected to /consultations
 *
 * POLLING STRATEGY
 * -----------------
 * Consultation: every 6 s while pending/accepted, stops on terminal status.
 * Messages:     every 4 s while in_progress (chat type only).
 * Wallet:       every 30 s while in_progress (for balance warning).
 *
 * STATUS CHANGE NOTIFICATIONS
 * ----------------------------
 * Toast fires when status changes from pending -> accepted / in_progress / rejected.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link }              from 'react-router-dom';
import {
  useGetConsultationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCancelConsultationMutation,
  useSendTypingMutation,
  useGetTypingQuery,
} from '../../../../store/consultation.api';
import { useGetWalletQuery } from '../../../../store/wallet.api';
import { useAuth }           from '../../../auth/hooks/useAuth';
import Avatar                from '../../../../components/ui/Avatar';
import { PageLoader }        from '../../../../components/ui/States';
import { toast }             from 'react-toastify';
import SessionTimer          from '../../../../components/ui/SessionTimer';
import MessageBubble         from '../../../../components/ui/MessageBubble';
import { getStatusConfig }   from '../../../../constants/consultationStatus';

/* -- Balance warning ------------------------------ */
function BalanceWarning({ balance, ratePerMinute }: { balance: number; ratePerMinute: number }) {
  if (ratePerMinute <= 0) return null;
  const minsLeft = Math.floor(balance / ratePerMinute);
  if (minsLeft > 5) return null;
  const isUrgent = minsLeft <= 1;
  return (
    <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 small mb-3" style={{ background: isUrgent ? 'rgba(239,68,68,.10)' : 'rgba(234,179,8,.10)', border: isUrgent ? '1px solid rgba(239,68,68,.3)' : '1px solid rgba(234,179,8,.3)', color: isUrgent ? '#dc2626' : '#ca8a04' }}>
      <i className="fas fa-exclamation-triangle flex-shrink-0" />
      <span>
        {isUrgent ? 'Your balance is very low -- session may end soon. ' : `~${minsLeft} minute(s) of balance remaining -- `}
        <Link to="/wallet" className="fw-semibold text-decoration-underline" style={{color:'inherit'}}>Recharge now</Link>
      </span>
    </div>
  );
}

/* -- Main ----------------------------------------- */
export default function ConsultationPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const consultId = parseInt(id ?? '0', 10);

  const [message, setMessage]   = useState('');
  const [status,  setStatus]    = useState('pending'); // local copy avoids self-ref in RTK
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // -- Consultation query -------------------------
  // Poll rate depends on current known status (stored in local state)
  const consultPoll = ['completed','rejected','cancelled'].includes(status) ? 0 : 6000;

  const { data: consult, isLoading } = useGetConsultationQuery(consultId, {
    skip:            !consultId,
    pollingInterval: consultPoll,
  });

  // Sync local status and notify on status changes
  useEffect(() => {
    if (!consult?.status) return;
    const prev = status;
    setStatus(consult.status);

    if (consult.status === 'accepted' && prev === 'pending') {
      toast.success('✅ Astrologer accepted your request! Session starting soon...');
    }
    if (consult.status === 'in_progress' && prev === 'accepted') {
      toast.info('🟢 Session has started!');
    }
    if (consult.status === 'rejected' && prev === 'pending') {
      toast.warning('❌ Request was declined. Try another astrologer.');
    }
  }, [consult?.status]); // eslint-disable-line

  // -- Messages query -----------------------------
  // Only poll when session is actively in_progress (chat type)
  // For call/video type, no chat polling needed at all
  const messagesEnabled = ['accepted','in_progress','completed'].includes(status);
  const messagesPoll    = status === 'in_progress' ? 4000 : 0;

  const { data: messages = [] } = useGetMessagesQuery(consultId, {
    skip:            !consultId || !messagesEnabled,
    pollingInterval: messagesPoll,
  });

  // -- Wallet query -------------------------------
  const { data: wallet } = useGetWalletQuery(undefined, {
    skip:            status !== 'in_progress',
    pollingInterval: 30000,
  });

  const [send,   { isLoading: sending    }] = useSendMessageMutation();
  const [cancel, { isLoading: cancelling }] = useCancelConsultationMutation();
  const [sendTyping]          = useSendTypingMutation();
  const { data: typingData }  = useGetTypingQuery(consultId, {
    skip: !consultId || status !== 'in_progress',
    pollingInterval: 2000,
  });
  const isOtherTyping = (typingData?.typing?.length ?? 0) > 0;
  const typingName    = typingData?.typing?.[0]?.name ?? '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (status === 'in_progress') textareaRef.current?.focus();
  }, [status]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg || sending) return;
    setMessage('');
    try {
      await send({ consultationId: consultId, message: msg }).unwrap();
    } catch {
      toast.error('Failed to send message. Please try again.');
      setMessage(msg);
    }
  }, [message, sending, send, consultId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await cancel(consultId).unwrap();
      toast.success('Consultation cancelled.');
      navigate('/consultations');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Cancellation failed.');
    }
  };

  if (isLoading) return <div className="container py-5"><PageLoader /></div>;
  if (!consult) return (
    <div className="container py-5 text-center">
      <p className="t-muted">Consultation not found.</p>
      <Link to="/consultations" className="btn btn-outline-secondary btn-sm">{'<- Back'}</Link>
    </div>
  );

  const st         = getStatusConfig(consult.status);
  const canChat    = ['accepted', 'in_progress'].includes(consult.status);
  const isActive   = consult.status === 'in_progress';
  const isComplete = consult.status === 'completed';
  const isPending  = consult.status === 'pending';
  const isAccepted = consult.status === 'accepted';
  const isCall     = consult.type !== 'chat';

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <Link to="/consultations" className="btn btn-sm btn-outline-secondary mb-3">
        <i className="fas fa-arrow-left me-1" />My Consultations
      </Link>

      {/* Header */}
      <div className="app-card mb-3" style={{ transition: 'none' }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <Link to={`/astrologers/${consult.astrologer?.id}`}>
            <Avatar name={consult.astrologer?.name} src={consult.astrologer?.profile_image} size={48} />
          </Link>
          <div className="flex-grow-1">
            <div className="fw-bold t-main">{consult.astrologer?.name}</div>
            <div className="t-muted small">{consult.astrologer?.expertise}</div>
            <div className="small mt-1">
              <span className="badge-lang me-1">
                <i className={`fas fa-${consult.type === 'chat' ? 'comment' : consult.type === 'call' ? 'phone' : 'video'} me-1`} />
                {consult.type.charAt(0).toUpperCase() + consult.type.slice(1)}
              </span>
              <span className="t-muted">₹{consult.rate_per_minute}/min</span>
            </div>
          </div>
          {isActive && consult.started_at && (
            <SessionTimer startedAt={consult.started_at} ratePerMinute={consult.rate_per_minute} />
          )}
          {isComplete && (
            <div className="text-end small">
              <div className="fw-bold text-success">₹{consult.total_amount}</div>
              <div className="t-muted">{consult.duration_minutes} min</div>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      {/* Status badge */}
      <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-3 small"
        style={{ background: `rgba(var(--bs-${getStatusConfig(consult.status).color}-rgb),.08)`, border: `1px solid rgba(var(--bs-${getStatusConfig(consult.status).color}-rgb),.3)` }}>
        <i className={`fas ${getStatusConfig(consult.status).icon} flex-shrink-0`} />
        <span>{getStatusConfig(consult.status).label}</span>
      </div>

      {/* Balance warning */}
      {isActive && wallet && (
        <BalanceWarning balance={wallet.balance} ratePerMinute={consult.rate_per_minute} />
      )}

      {/* Call/Video join button */}
      {isCall && (canChat || isComplete) && (
        <div className="mb-3">
          <Link to={`/consultations/${consultId}/call`} className="btn w-100 fw-semibold"
            style={{ background: isActive ? '#22c55e' : 'var(--surf2)', color: isActive ? '#fff' : 'var(--txt)', border: `1px solid ${isActive ? '#22c55e' : 'var(--bdr)'}`, borderRadius: 12 }}>
            <i className={`fas fa-${consult.type === 'video' ? 'video' : 'phone'} me-2`} />
            {isActive ? `Join ${consult.type === 'video' ? 'Video' : 'Voice'} Call` : 'View Call'}
          </Link>
        </div>
      )}

      {/* Pending */}
      {isPending && (
        <div className="app-card text-center py-5" style={{ transition: 'none' }}>
          <div className="spinner-border text-warning mb-3" style={{ width: 40, height: 40 }} />
          <h6 className="fw-bold t-main mb-1">Request Sent!</h6>
          <p className="t-muted small mb-3">The astrologer has been notified. Chat will begin once accepted.</p>
          {consult.user_note && (
            <div className="py-2 small text-start mx-auto" style={{ maxWidth: 340, background: "var(--surf2)", border: "1px solid var(--bdr)", borderRadius: 8, padding: "8px 12px" }}>
              <i className="fas fa-quote-left t-muted me-1" />{consult.user_note}
            </div>
          )}
          <button className="btn btn-outline-danger btn-sm mt-2" onClick={handleCancel} disabled={cancelling}>
            {cancelling && <span className="spinner-border spinner-border-sm me-1" />}Cancel Request
          </button>
        </div>
      )}

      {/* Accepted */}
      {isAccepted && (
        <div className="app-card text-center py-4" style={{ transition: 'none' }}>
          <div className="spinner-border text-info mb-3" style={{ width: 36, height: 36 }} />
          <h6 className="fw-bold t-main mb-1">Accepted!</h6>
          <p className="t-muted small mb-0">Waiting for the astrologer to start the session...</p>
        </div>
      )}

      {/* Chat window -- only for chat type */}
      {(canChat || isComplete) && !isCall && (
        <div className="app-card overflow-hidden p-0" style={{ transition: 'none' }}>
          <div style={{ height: 420, overflowY: 'auto', background: 'var(--surf2)' }} className="p-3">
            {messages.length === 0 ? (
              <div className="text-center py-5 t-muted">
                <i className="fas fa-comment fa-2x d-block mb-2 opacity-25" />
                <p className="small mb-0">{canChat ? 'Send your first message!' : 'No messages in this session'}</p>
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
          {isActive && isOtherTyping && (
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

          {canChat ? (
            <form onSubmit={handleSend} className="p-3 d-flex gap-2 align-items-end"
              style={{ borderTop: '1px solid var(--bdr)', background: 'var(--surf)' }}>
              <textarea ref={textareaRef} className="form-control form-control-sm"
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                value={message} onChange={e => {
                  setMessage(e.target.value);
                  if (status === 'in_progress') sendTyping(consultId);
                }}
                onKeyDown={handleKeyDown} rows={2} style={{ resize: 'none' }}
                maxLength={2000} disabled={sending} />
              <div className="d-flex flex-column gap-1 flex-shrink-0">
                <button type="submit" className="btn btn-danger btn-sm"
                  disabled={!message.trim() || sending} title="Send">
                  {sending ? <span className="spinner-border spinner-border-sm" /> : <i className="fas fa-paper-plane" />}
                </button>
                <span className="t-light text-center" style={{ fontSize: 10 }}>{message.length}/2000</span>
              </div>
            </form>
          ) : (
            <div className="p-3 text-center t-muted small" style={{ borderTop: '1px solid var(--bdr)', background: 'var(--surf)' }}>
              {isComplete
                ? <><i className="fas fa-check-circle text-success me-1" />Session ended . {consult.duration_minutes} min . ₹{consult.total_amount}
                    <Link to={`/astrologers/${consult.astrologer?.id}`} className="ms-3 small">Rate Astrologer</Link></>
                : 'Chat unavailable'}
            </div>
          )}
        </div>
      )}

      {/* Completed -- call type */}
      {isCall && isComplete && (
        <div className="app-card text-center py-4" style={{ transition: 'none' }}>
          <i className="fas fa-check-circle fa-3x text-success mb-3 d-block" />
          <h6 className="fw-bold t-main">Session Complete</h6>
          <p className="t-muted small">Duration: {consult.duration_minutes} min . Total: ₹{consult.total_amount}</p>
          <Link to={`/astrologers/${consult.astrologer?.id}`} className="btn btn-sm btn-outline-primary">
            Rate your experience
          </Link>
        </div>
      )}
    </div>
  );
}

