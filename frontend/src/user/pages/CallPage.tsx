/**
 * CallPage -- WebRTC call room for the user (receiver / non-initiator).
 *
 * The user does NOT start the call -- they wait for the astrologer to send
 * an SDP offer via the signals endpoint. This page auto-answers when an
 * offer arrives (handleSignal dispatches to useWebRTC.answerCall).
 *
 * SIGNAL POLLING
 * ---------------
 * Polls GET /consultations/:id/signals every 1 s.
 * Deduplication via processedSigs Set prevents double-processing.
 * sigAfter starts at -1 so the first poll fetches ALL signals.
 *
 * PAGE VISIBILITY
 * ----------------
 * A toast warns the user when the tab is hidden (timer paused).
 * useWebRTC handles the actual pause/resume via Page Visibility API.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate, Link }              from 'react-router-dom';
import {
  useGetConsultationQuery,
  useSendSignalMutation,
  useGetSignalsQuery,
  useUpdateCallStatusMutation,
} from '../../store/api/consultation.api';
import { useWebRTC }  from '../../hooks/useWebRTC';
import { PageLoader } from '../../components/ui/States';
import Avatar         from '../../components/ui/Avatar';
import { toast }      from 'react-toastify';

const fmt = (s: number) =>
  `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

export default function CallPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const consultId = parseInt(id ?? '0', 10);

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const processedSigs  = useRef<Set<number>>(new Set());

  // sigAfter = -1 -> first poll fetches all signals from this consultation
  const [sigAfter, setSigAfter]           = useState(-1);
  const [consultStatus, setConsultStatus] = useState('pending');

  const { data: consult, isLoading } = useGetConsultationQuery(consultId, {
    skip: !consultId, pollingInterval: 2000,
  });

  useEffect(() => {
    if (consult?.status) setConsultStatus(consult.status);
  }, [consult?.status]);

  const [sendSignalApi]    = useSendSignalMutation();
  const [updateCallStatus] = useUpdateCallStatusMutation();

  const { data: signals = [] } = useGetSignalsQuery(
    { consultationId: consultId, after: sigAfter },
    {
      // Poll signals immediately -- don't wait for consultStatus
      // Signals are filtered server-side by sender
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
          handleSignal, hangUp, toggleMute, toggleCamera } =
    useWebRTC({
      consultationId: consultId,
      callType:       (consult?.type ?? 'call') as 'call' | 'video',
      isInitiator:    false,
      startedAt:      consult?.started_at ?? null,
      onSendSignal,
      onCallEnd: () => {
        // User hung up -- update status and go back to consultation page
        try { updateCallStatus({ consultationId: consultId, call_status: 'ended' }); } catch {}
        navigate(`/consultations/${consultId}`);
      },
    });

  // Process new signals only (dedup by id)
  useEffect(() => {
    if (!signals.length) return;

    const newSigs = (signals as any[]).filter(s => !processedSigs.current.has(s.id));
    if (!newSigs.length) return;

    const maxId = Math.max(...newSigs.map(s => s.id));
    newSigs.forEach(s => processedSigs.current.add(s.id));
    setSigAfter(maxId);

    newSigs.forEach(sig => {
      handleSignal(sig, localVideoRef.current, remoteVideoRef.current);
    });
  }, [signals, handleSignal]);

  // Toast when astrologer starts calling
  useEffect(() => {
    if (consult?.call_status === 'ringing' && state === 'idle') {
      toast.info(`📞 ${consult.astrologer?.name} is calling!`);
    }
  }, [consult?.call_status, state, consult?.astrologer?.name]);

  if (isLoading) return <div className="container py-5"><PageLoader /></div>;
  if (!consult)  return <div className="container py-5 t-muted text-center">Consultation not found</div>;

  const isVideo    = consult.type === 'video';
  const isPending  = consult.status === 'pending';
  const isAccepted = consult.status === 'accepted';

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <Link to={`/consultations/${consultId}`}
        className="btn btn-sm btn-outline-secondary mb-3">
        <i className="fas fa-arrow-left me-1" />Back
      </Link>

      {/* Header */}
      <div className="app-card mb-3" style={{transition:'none'}}>
        <div className="d-flex align-items-center gap-3">
          <Avatar name={consult.astrologer?.name} src={consult.astrologer?.profile_image} size={52} />
          <div className="flex-grow-1">
            <div className="fw-bold t-main">{consult.astrologer?.name}</div>
            <div className="t-muted small">{consult.astrologer?.expertise}</div>
            <div className="small" style={{color:'var(--primary)'}}>₹{consult.rate_per_minute}/min</div>
          </div>
          {state === 'connected' && (
            <div className="text-center">
              <div className="fw-bold font-monospace fs-5" style={{color:'var(--primary)'}}>{fmt(duration)}</div>
              <span className="badge bg-success" style={{fontSize:10}}>* LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {state === 'error' && (
        <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 mb-3 small" style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.3)", color: "#dc2626" }}>
          <i className="fas fa-exclamation-triangle me-2" />
          <strong>Connection failed:</strong> {error}
          <div className="small mt-1 opacity-75">
            Allow camera/microphone in your browser, then reload the page.
          </div>
        </div>
      )}

      {/* Call UI */}
      <div className="app-card" style={{transition:'none'}}>

        {/* VIDEO */}
        {isVideo && (
          <div className="position-relative rounded-3 overflow-hidden mb-2"
            style={{background:'#0d0d1a', aspectRatio:'16/9'}}>
            <video ref={remoteVideoRef} autoPlay playsInline
              style={{width:'100%',height:'100%',objectFit:'cover'}} />

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
                style={{background:'rgba(0,0,0,0.75)'}}>
                <Avatar name={consult.astrologer?.name} src={consult.astrologer?.profile_image} size={80} />
                <div className="text-white fw-bold mt-3 fs-5">{consult.astrologer?.name}</div>
                <div className="text-white opacity-75 small mt-1 text-center px-3">
                  {state==='idle'      && 'Waiting for astrologer to start the call...'}
                  {state==='requesting'&& '... Getting camera access...'}
                  {state==='ringing'   && '📞 Connecting -- please wait up to 10 seconds...'}
                  {state==='ended'     && 'Call ended'}
                  {state==='error'     && 'Connection failed'}
                </div>
                {state === 'idle' && (
                  <div className="d-flex gap-2 mt-3">
                    {['0s','.2s','.4s'].map(d => (
                      <div key={d} className="spinner-grow spinner-grow-sm text-light"
                        style={{animationDelay:d}} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Local PiP */}
            <div className="position-absolute"
              style={{bottom:12,right:12,width:140,borderRadius:8,
                      overflow:'hidden',border:'2px solid rgba(255,255,255,.7)'}}>
              <video ref={localVideoRef} autoPlay playsInline muted
                style={{width:'100%',display:'block'}} />
            </div>
          </div>
        )}

        {/* AUDIO */}
        {!isVideo && (
          <div className="text-center py-5">
            <div className="mb-4">
              <div style={{width:120,height:120,borderRadius:'50%',margin:'0 auto',
                display:'flex',alignItems:'center',justifyContent:'center',
                background: state==='connected' ? 'rgba(34,197,94,.1)' : 'rgba(230,57,70,.08)',
                border:`3px solid ${state==='connected'?'#22c55e':'var(--primary)'}`,
                animation:['ringing','calling'].includes(state)?'pulse 1.5s infinite':'none'}}>
                <Avatar name={consult.astrologer?.name} src={consult.astrologer?.profile_image} size={90} />
              </div>
            </div>
            <h5 className="fw-bold t-main">{consult.astrologer?.name}</h5>
            <p className="t-muted">
              {state==='idle'      && 'Waiting for astrologer to start the call...'}
              {state==='requesting'&& 'Getting microphone...'}
              {state==='ringing'   && '📞 Connecting -- please wait up to 10 seconds...'}
              {state==='connected' && `🟢 Connected -- ${fmt(duration)}`}
              {state==='ended'     && '✅ Call ended'}
              {state==='error'     && `❌ ${error}`}
            </p>
            {state==='connected' && (
              <div className="d-flex justify-content-center gap-1 mb-2">
                {[1,2,3,4,5].map(i=>(
                  <div key={i} style={{width:4,height:12+i*6,borderRadius:2,
                    background:'var(--primary)',
                    animation:`pulse ${0.4+i*.1}s ease infinite alternate`}} />
                ))}
              </div>
            )}
            <video ref={remoteVideoRef} autoPlay playsInline style={{display:'none'}} />
            <video ref={localVideoRef}  autoPlay playsInline muted style={{display:'none'}} />
          </div>
        )}

        {/* Controls */}
        {['connected','ringing','calling'].includes(state) && (
          <div className="d-flex justify-content-center gap-3 mt-3 pt-3"
            style={{borderTop:'1px solid var(--bdr)'}}>
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
          </div>
        )}

        {state==='idle' && (isPending||isAccepted) && (
          <div className="text-center mt-3 pt-3 t-muted small"
            style={{borderTop:'1px solid var(--bdr)'}}>
            <i className="fas fa-info-circle me-1" />
            Call connects automatically when the astrologer starts it.
          </div>
        )}
        {state==='ended' && (
          <p className="text-center mt-3 t-muted small">Redirecting...</p>
        )}
      </div>
    </div>
  );
}


