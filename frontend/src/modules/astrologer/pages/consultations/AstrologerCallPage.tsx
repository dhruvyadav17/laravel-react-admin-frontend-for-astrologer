// Astrologer is always the WebRTC initiator (sends the SDP offer).
// Flow: Start Call → set in_progress + ringing → send offer → user auto-answers.
// callStarted ref prevents double-trigger in React Strict Mode dev remounts.
import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate }                    from 'react-router-dom';
import {
  useAstrologerGetConsultationQuery,
  useAstrologerSendSignalMutation,
  useAstrologerGetSignalsQuery,
  useAstrologerUpdateCallStatusMutation,
  useStartConsultationMutation,
} from '../../../../store/consultation.api';
import { useWebRTC }  from '../../../../hooks/useWebRTC';
import { PageLoader } from '../../../../components/ui/States';
import Avatar         from '../../../../components/ui/Avatar';
import { fmtDuration } from '../../../../utils/format';
import { toast }      from 'react-toastify';

import CallBtn from '../../../../components/ui/CallBtn';
export default function AstrologerCallPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const consultId = parseInt(id ?? '0', 10);

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const processedSigs  = useRef<Set<number>>(new Set());
  const callStarted    = useRef(false);

  // Reset guard on every mount so re-navigation to the page works correctly
  useEffect(() => { callStarted.current = false; }, []);

  const [sigAfter, setSigAfter] = useState(-1); // -1 = fetch all on first poll

  const { data: consult, isLoading } = useAstrologerGetConsultationQuery(consultId, {
    skip: !consultId, pollingInterval: 2000,
  });

  const [sendSignalApi]     = useAstrologerSendSignalMutation();
  const [updateCallStatus]  = useAstrologerUpdateCallStatusMutation();
  const [startConsultation] = useStartConsultationMutation();

  const { data: signals = [] } = useAstrologerGetSignalsQuery(
    { consultationId: consultId, after: sigAfter },
    { skip: !consultId, pollingInterval: 1000, refetchOnMountOrArgChange: true },
  );

  const onSendSignal = useCallback(async (type: string, data: object) => {
    await sendSignalApi({ consultationId: consultId, signal_type: type as any, signal_data: data }).unwrap();
  }, [sendSignalApi, consultId]);

  const { state, error, isMuted, isCamOff, duration, isRecording,
          startCall, handleSignal, hangUp, toggleMute, toggleCamera } =
    useWebRTC({
      consultationId: consultId,
      callType:       (consult?.type ?? 'call') as 'call' | 'video',
      isInitiator:    true,
      isAstrologer:   true,
      startedAt:      consult?.started_at ?? null,
      onSendSignal,
      onCallEnd: async () => {
        // Hang-up ends the WebRTC session, not the consultation itself.
        // Use "End Session" in the chat view to finalize the consultation.
        try { await updateCallStatus({ consultationId: consultId, call_status: 'ended' }); } catch {}
        navigate(`/astrologer/consultations/${consultId}`);
      },
    });

  // Deduplicate signals by id, pass only new ones to useWebRTC
  useEffect(() => {
    if (!signals.length) return;
    const newSigs = (signals as any[]).filter(s => !processedSigs.current.has(s.id));
    if (!newSigs.length) return;
    newSigs.forEach(s => processedSigs.current.add(s.id));
    setSigAfter(Math.max(...newSigs.map(s => s.id)));
    newSigs.forEach(sig => handleSignal(sig, localVideoRef.current, remoteVideoRef.current));
  }, [signals, handleSignal]);

  const initiateCall = useCallback(async () => {
    if (callStarted.current) return;
    callStarted.current = true;
    try {
      // Start the consultation on backend only if it hasn't been started yet
      if (consult?.status === 'accepted') await startConsultation(consultId).unwrap();
      await updateCallStatus({ consultationId: consultId, call_status: 'ringing' });
      await startCall(localVideoRef.current, remoteVideoRef.current);
      toast.info('Calling — waiting for user to connect...');
    } catch (err: any) {
      callStarted.current = false;
      toast.error(err?.message ?? 'Failed to start call.');
    }
  }, [consult?.status, startConsultation, consultId, updateCallStatus, startCall]);

  if (isLoading) return <div className="container py-5"><PageLoader /></div>;
  if (!consult)  return <div className="container py-5 text-center t-muted">Consultation not found</div>;

  const isVideo  = consult.type === 'video';
  const canStart = ['accepted', 'in_progress'].includes(consult.status);

  const statusText: Record<string, string> = {
    idle:       isVideo ? 'Click "Start Video Call" below' : 'Click "Start Voice Call" to connect',
    requesting: 'Getting camera/microphone access...',
    calling:    '📡 Waiting for user to connect...',
    ended:      'Call ended',
    error:      'Connection failed',
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 800 }}>
      <button className="btn btn-sm btn-outline-secondary mb-3"
        onClick={() => navigate(`/astrologer/consultations/${consultId}`)}>
        <i className="fas fa-arrow-left me-1" />Back to Chat
      </button>

      {/* Consultation header */}
      <div className="app-card mb-3" style={{ transition: 'none' }}>
        <div className="d-flex align-items-center gap-3">
          <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={52} />
          <div className="flex-grow-1">
            <div className="fw-bold t-main">{consult.user?.name}</div>
            <div className="t-muted small">
              <i className={`fas fa-${isVideo ? 'video' : 'phone'} me-1`} />
              {isVideo ? 'Video' : 'Voice'} · ₹{consult.rate_per_minute}/min
            </div>
          </div>
          {state === 'connected' && (
            <div className="text-center">
              <div className="fw-bold font-monospace fs-5 text-success">{fmtDuration(duration)}</div>
              <span className="badge bg-success" style={{ fontSize: 10 }}>● LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Connection error */}
      {state === 'error' && (
        <div className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 mb-3 small"
          style={{ background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.3)', color: '#dc2626' }}>
          <span><strong>Failed:</strong> {error}</span>
          <button className="btn btn-sm btn-danger ms-auto"
            onClick={() => { callStarted.current = false; initiateCall(); }}>
            <i className="fas fa-redo me-1" />Retry
          </button>
        </div>
      )}

      <div className="app-card" style={{ transition: 'none' }}>
        {isVideo ? (
          /* ── Video view ── */
          <div className="position-relative rounded-3 overflow-hidden mb-2"
            style={{ background: '#0d0d1a', aspectRatio: '16/9' }}>
            <video ref={remoteVideoRef} autoPlay playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {isRecording && state === 'connected' && (
              <div className="position-absolute" style={{ top: 12, left: 12, zIndex: 10 }}>
                <span className="badge d-flex align-items-center gap-1"
                  style={{ background: 'rgba(239,68,68,0.9)', fontSize: 11, padding: '4px 8px' }}>
                  <i className="fas fa-circle" style={{ fontSize: 8 }} /> REC
                </span>
              </div>
            )}

            {state !== 'connected' && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                style={{ background: 'rgba(0,0,0,0.8)' }}>
                <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={80} />
                <div className="text-white fw-bold mt-3 fs-5">{consult.user?.name}</div>
                <div className="text-white opacity-75 small mt-1">{statusText[state]}</div>
              </div>
            )}

            {/* Local picture-in-picture */}
            <div className="position-absolute" style={{ bottom: 12, right: 12, width: 140, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255,255,255,.7)' }}>
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        ) : (
          /* ── Audio view ── */
          <div className="text-center py-5">
            <div className="mb-4">
              <div style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: state === 'connected' ? 'rgba(34,197,94,.1)' : 'rgba(230,57,70,.08)', border: `3px solid ${state === 'connected' ? '#22c55e' : 'var(--primary)'}`, animation: state === 'calling' ? 'pulse 1.5s infinite' : 'none' }}>
                <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={90} />
              </div>
            </div>
            <h5 className="fw-bold t-main">{consult.user?.name}</h5>
            <p className="t-muted">
              {state === 'connected' ? `🟢 Connected · ${fmtDuration(duration)}` : statusText[state]}
            </p>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ display: 'none' }} />
            <video ref={localVideoRef}  autoPlay playsInline muted style={{ display: 'none' }} />
          </div>
        )}

        {/* Controls */}
        <div className="d-flex justify-content-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--bdr)' }}>
          {state === 'idle' && canStart && (
            <button className="btn btn-success px-4 fw-semibold py-2" onClick={initiateCall}>
              <i className={`fas fa-${isVideo ? 'video' : 'phone'} me-2`} />
              Start {isVideo ? 'Video' : 'Voice'} Call
            </button>
          )}
          {['connected', 'calling'].includes(state) && (
            <>
              <CallBtn onClick={toggleMute}   active={isMuted}  icon={`fa-microphone${isMuted ? '-slash' : ''}`} />
              {isVideo && <CallBtn onClick={toggleCamera} active={isCamOff} icon={`fa-video${isCamOff ? '-slash' : ''}`} />}
              <CallBtn onClick={hangUp}       danger            icon="fa-phone-slash" />
            </>
          )}
        </div>

        {state === 'ended' && <p className="text-center mt-3 t-muted small">Redirecting...</p>}
      </div>
    </div>
  );
}
