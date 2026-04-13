/**
 * AstrologerCallPage -- WebRTC call room for the astrologer (initiator).
 *
 * The astrologer is ALWAYS the offer initiator. On clicking "Start Call":
 * 1. Consultation status is set to in_progress (if not already).
 * 2. call_status is set to "ringing".
 * 3. useWebRTC.startCall() creates an SDP offer and sends it to the DB.
 * 4. The user's CallPage polls and auto-answers the offer.
 *
 * The callStarted ref prevents double-call in React Strict Mode.
 *
 * RECORDING
 * ----------
 * MediaRecorder starts automatically when P2P connection is "connected".
 * The recording is uploaded to /astrologer/consultations/:id/recordings
 * when the call ends. Both parties upload their own local stream.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate }                    from 'react-router-dom';
import {
  useAstrologerGetConsultationQuery,
  useAstrologerSendSignalMutation,
  useAstrologerGetSignalsQuery,
  useAstrologerUpdateCallStatusMutation,
  useStartConsultationMutation,
} from '../../../store/api/consultation.api';
import { useWebRTC }  from '../../../hooks/useWebRTC';
import { PageLoader } from '../../../components/ui/States';
import Avatar         from '../../../components/ui/Avatar';
import { toast }      from 'react-toastify';

const fmt = (s: number) =>
  `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

export default function AstrologerCallPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const consultId = parseInt(id ?? '0', 10);

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const processedSigs  = useRef<Set<number>>(new Set());
  const callStarted    = useRef(false);
  // Reset call guard on mount (prevents double-call in dev mode remounts)
  useEffect(() => { callStarted.current = false; }, []);

  // sigAfter = -1 means "give me everything" (first poll)
  // After first signals, update to max seen id
  const [sigAfter, setSigAfter]           = useState(-1);
  const [consultStatus, setConsultStatus] = useState('pending');

  const { data: consult, isLoading } = useAstrologerGetConsultationQuery(consultId, {
    skip: !consultId, pollingInterval: 2000,
  });

  useEffect(() => {
    if (consult?.status) setConsultStatus(consult.status);
  }, [consult?.status]);

  const [sendSignalApi]     = useAstrologerSendSignalMutation();
  const [updateCallStatus]  = useAstrologerUpdateCallStatusMutation();
  const [startConsultation] = useStartConsultationMutation();

  // Poll signals every 800ms (slightly faster than before)
  const { data: signals = [] } = useAstrologerGetSignalsQuery(
    { consultationId: consultId, after: sigAfter },
    {
      skip:                      !consultId,
      pollingInterval:           1000,
      refetchOnMountOrArgChange: true,
    }
  );

  const onSendSignal = useCallback(async (type: string, data: object) => {
    await sendSignalApi({
      consultationId: consultId,
      signal_type:    type as any,
      signal_data:    data,
    }).unwrap();
  }, [sendSignalApi, consultId]);

  const { state, error, isMuted, isCamOff, duration, isRecording,
          startCall, handleSignal, hangUp, toggleMute, toggleCamera } =
    useWebRTC({
      consultationId: consultId,
      callType:       (consult?.type ?? 'call') as 'call' | 'video',
      isInitiator:    true,
      startedAt:      consult?.started_at ?? null,
      onSendSignal,
      onCallEnd: async () => {
        // User explicitly hung up -- update call_status and go back to chat
        // Consultation itself is NOT ended here (use End Session button for that)
        try { await updateCallStatus({ consultationId: consultId, call_status: 'ended' }); } catch {}
        navigate(`/astrologer/consultations/${consultId}`);
      },
    });

  // Process NEW signals only
  useEffect(() => {
    if (!signals.length) return;

    const newSigs = (signals as any[]).filter(s => !processedSigs.current.has(s.id));
    if (!newSigs.length) return;

    const maxId = Math.max(...newSigs.map(s => s.id));
    newSigs.forEach(s => processedSigs.current.add(s.id));
    setSigAfter(maxId); // next poll: only fetch after this id

    newSigs.forEach(sig => {
      handleSignal(sig, localVideoRef.current, remoteVideoRef.current);
    });
  }, [signals, handleSignal]);

  // Initiate call
  const initiateCall = useCallback(async () => {
    if (callStarted.current) return;
    callStarted.current = true;

    try {
      if (consultStatus === 'accepted') {
        await startConsultation(consultId).unwrap();
      }
      await updateCallStatus({ consultationId: consultId, call_status: 'ringing' });
      await startCall(localVideoRef.current, remoteVideoRef.current);
      toast.info('Calling user -- waiting for them to connect...');
    } catch (err: any) {
      callStarted.current = false;
      toast.error(err?.message ?? 'Failed to start call.');
    }
  }, [consultStatus, startConsultation, consultId, updateCallStatus, startCall]);

  if (isLoading) return <div className="container py-5"><PageLoader /></div>;
  if (!consult)  return <div className="container py-5 text-center t-muted">Consultation not found</div>;

  const isVideo  = consult.type === 'video';
  const canStart = ['accepted','in_progress'].includes(consult.status);

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 800 }}>
      <button className="btn btn-sm btn-outline-secondary mb-3"
        onClick={() => navigate(`/astrologer/consultations/${consultId}`)}>
        <i className="fas fa-arrow-left me-1" />Back to Chat
      </button>

      {/* Header */}
      <div className="app-card mb-3" style={{ transition:'none' }}>
        <div className="d-flex align-items-center gap-3">
          <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={52} />
          <div className="flex-grow-1">
            <div className="fw-bold t-main">{consult.user?.name}</div>
            <div className="t-muted small">
              <i className={`fas fa-${isVideo?'video':'phone'} me-1`} />
              {isVideo ? 'Video' : 'Voice'} . ₹{consult.rate_per_minute}/min
            </div>
          </div>
          {state === 'connected' && (
            <div className="text-center">
              <div className="fw-bold font-monospace fs-5 text-success">{fmt(duration)}</div>
              <span className="badge bg-success" style={{fontSize:10}}>* LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {state === 'error' && (
        <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 mb-3 small" style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.3)", color: "#dc2626" }}>
          <strong>Failed:</strong> {error}
          <button className="btn btn-sm btn-danger ms-3"
            onClick={() => { callStarted.current = false; initiateCall(); }}>
            <i className="fas fa-redo me-1" />Retry
          </button>
        </div>
      )}

      {/* Call UI */}
      <div className="app-card" style={{ transition:'none' }}>

        {/* VIDEO mode */}
        {isVideo && (
          <div className="position-relative rounded-3 overflow-hidden mb-2"
            style={{ background:'#0d0d1a', aspectRatio:'16/9' }}>
            <video ref={remoteVideoRef} autoPlay playsInline
              style={{ width:'100%', height:'100%', objectFit:'cover' }} />

            {/* Recording indicator -- top-left when active */}
            {isRecording && state === 'connected' && (
              <div className="position-absolute" style={{top:12,left:12,zIndex:10}}>
                <span className="badge d-flex align-items-center gap-1"
                  style={{background:'rgba(239,68,68,0.9)',fontSize:11,padding:'4px 8px'}}>
                  <i className="fas fa-circle" style={{fontSize:8,animation:'pulse 1s infinite'}} />
                  REC
                </span>
              </div>
            )}

            {state !== 'connected' && (
              <div className="position-absolute top-0 start-0 w-100 h-100
                d-flex flex-column align-items-center justify-content-center"
                style={{ background:'rgba(0,0,0,0.8)' }}>
                <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={80} />
                <div className="text-white fw-bold mt-3 fs-5">{consult.user?.name}</div>
                <div className="text-white opacity-75 small mt-1">
                  {state==='idle'       && 'Click "Start Video Call" below'}
                  {state==='requesting' && '... Getting camera access...'}
                  {state==='calling'    && '📡 Waiting for user to connect...'}
                  {state==='ended'      && 'Call ended'}
                  {state==='error'      && 'Connection failed'}
                </div>
              </div>
            )}

            {/* Local PiP */}
            <div className="position-absolute"
              style={{ bottom:12, right:12, width:140, borderRadius:8,
                       overflow:'hidden', border:'2px solid rgba(255,255,255,.7)' }}>
              <video ref={localVideoRef} autoPlay playsInline muted
                style={{ width:'100%', display:'block' }} />
            </div>
          </div>
        )}

        {/* AUDIO mode */}
        {!isVideo && (
          <div className="text-center py-5">
            <div className="mb-4">
              <div style={{ width:120, height:120, borderRadius:'50%', margin:'0 auto',
                display:'flex', alignItems:'center', justifyContent:'center',
                background: state==='connected' ? 'rgba(34,197,94,.1)' : 'rgba(230,57,70,.08)',
                border:`3px solid ${state==='connected' ? '#22c55e' : 'var(--primary)'}`,
                animation: state==='calling' ? 'pulse 1.5s infinite' : 'none' }}>
                <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={90} />
              </div>
            </div>
            <h5 className="fw-bold t-main">{consult.user?.name}</h5>
            <p className="t-muted">
              {state==='idle'      && 'Click "Start Voice Call" to connect'}
              {state==='requesting'&& 'Getting microphone...'}
              {state==='calling'   && '📡 Calling -- waiting for user...'}
              {state==='connected' && `🟢 Connected -- ${fmt(duration)}`}
              {state==='ended'     && '✅ Call ended'}
              {state==='error'     && `❌ ${error}`}
            </p>
            <video ref={remoteVideoRef} autoPlay playsInline style={{display:'none'}} />
            <video ref={localVideoRef}  autoPlay playsInline muted style={{display:'none'}} />
          </div>
        )}

        {/* Controls */}
        <div className="d-flex justify-content-center gap-3 mt-3 pt-3"
          style={{ borderTop:'1px solid var(--bdr)' }}>

          {/* Start button -- idle */}
          {state === 'idle' && canStart && (
            <button className="btn btn-success px-4 fw-semibold py-2" onClick={initiateCall}>
              <i className={`fas fa-${isVideo?'video':'phone'} me-2`} />
              Start {isVideo ? 'Video' : 'Voice'} Call
            </button>
          )}

          {/* In-call controls */}
          {['connected','calling'].includes(state) && (
            <>
              <button
                className={`btn rounded-circle d-flex align-items-center justify-content-center ${isMuted?'btn-danger':'btn-outline-secondary'}`}
                style={{width:56,height:56}} onClick={toggleMute}>
                <i className={`fas fa-microphone${isMuted?'-slash':''} fs-5`} />
              </button>
              {isVideo && (
                <button
                  className={`btn rounded-circle d-flex align-items-center justify-content-center ${isCamOff?'btn-danger':'btn-outline-secondary'}`}
                  style={{width:56,height:56}} onClick={toggleCamera}>
                  <i className={`fas fa-video${isCamOff?'-slash':''} fs-5`} />
                </button>
              )}
              <button
                className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center"
                style={{width:56,height:56}} onClick={hangUp}>
                <i className="fas fa-phone-slash fs-5" />
              </button>
            </>
          )}
        </div>

        {state === 'ended' && (
          <p className="text-center mt-3 t-muted small">Redirecting...</p>
        )}
      </div>
    </div>
  );
}


