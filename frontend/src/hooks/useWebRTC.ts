// WebRTC hook for peer-to-peer audio/video calls.
//
// Signaling is done via database polling (GET /signals every 1s) — no WebSocket needed.
// SDP is base64-encoded before storage because MySQL JSON strips \r from \r\n in SDP.
// ICE gathering waits for 'complete' before sending offer/answer (non-trickle ICE).
//
// Timer syncs to consultation.started_at when available, otherwise counts locally.
// Recording uploads to the correct endpoint based on isAstrologer (not isInitiator).

import { useCallback, useEffect, useRef, useState } from 'react';

const IS_LOCALHOST =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) console.log(...args);
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: IS_LOCALHOST
    ? []
    : [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
      ],
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

export type WebRTCState =
  | 'idle' | 'requesting' | 'calling' | 'ringing' | 'connected' | 'ended' | 'error';

interface UseWebRTCOptions {
  consultationId: number;
  callType:       'call' | 'video';
  isInitiator:    boolean;
  isAstrologer:   boolean;
  startedAt?:     string | null;
  onSendSignal:   (type: string, data: object) => Promise<void>;
  onCallEnd?:     () => void;
}

function encodeSdp(sdp: string): string {
  return btoa(unescape(encodeURIComponent(sdp)));
}

function decodeSdp(encoded: string): string {
  try { return decodeURIComponent(escape(atob(encoded))); }
  catch { return encoded; }
}

function sanitizeSDP(sdp: string): string {
  return sdp
    .split('\n').map(l => l.replace(/\r$/, ''))
    .filter(l => !l.startsWith('a=ssrc') && !l.startsWith('a=ssrc-group'))
    .join('\r\n');
}

function waitForIceGathering(pc: RTCPeerConnection, ms = 8000): Promise<RTCSessionDescription> {
  return new Promise((resolve, reject) => {
    if (pc.iceGatheringState === 'complete') { resolve(pc.localDescription!); return; }
    const t = setTimeout(() => {
      pc.localDescription ? resolve(pc.localDescription) : reject(new Error('ICE timeout'));
    }, ms);
    pc.addEventListener('icegatheringstatechange', function h() {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(t);
        pc.removeEventListener('icegatheringstatechange', h);
        resolve(pc.localDescription!);
      }
    });
  });
}

async function uploadRecording(
  consultationId: number,
  blob: Blob,
  callType: 'call' | 'video',
  durationSeconds: number,
  isAstrologer: boolean  ): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('recording', blob, `recording-${consultationId}.webm`);
    formData.append('type', callType === 'video' ? 'video' : 'audio');
    formData.append('duration', String(durationSeconds));

    const state = (window as any).__REDUX_STORE__?.getState?.();
    const token = state?.auth?.token;
    if (!token) return;

    const base = isAstrologer
      ? `/api/v1/astrologer/consultations/${consultationId}/recordings`
      : `/api/v1/consultations/${consultationId}/recordings`;

    await fetch(base, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (e) {
    devLog('[WebRTC] Recording upload failed:', e);
  }
}

export function useWebRTC({
  consultationId, callType, isInitiator, isAstrologer, startedAt, onSendSignal, onCallEnd,
}: UseWebRTCOptions) {
  const [state, setState]           = useState<WebRTCState>('idle');
  const [error, setError]           = useState<string | null>(null);
  const [isMuted, setIsMuted]       = useState(false);
  const [isCamOff, setIsCamOff]     = useState(false);
  const [duration, setDuration]     = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const onSendSignalRef = useRef(onSendSignal);
  const onCallEndRef    = useRef(onCallEnd);
  useEffect(() => { onSendSignalRef.current = onSendSignal; }, [onSendSignal]);
  useEffect(() => { onCallEndRef.current = onCallEnd; },    [onCallEnd]);

  const pcRef             = useRef<RTCPeerConnection | null>(null);
  const localStreamRef    = useRef<MediaStream | null>(null);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartedRef = useRef(false);
  const endedRef          = useRef(false);
  const remoteSetRef      = useRef(false);
  const pendingIceRef     = useRef<RTCIceCandidateInit[]>([]);
  const realEndRef        = useRef<(send: boolean) => void>(() => {});
  const timerRunningRef   = useRef(false);
  const connectedRef      = useRef(false);
  const durationRef       = useRef(0);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const recordingChunks   = useRef<Blob[]>([]);

  const syncDurationFromServer = useCallback(() => {
    if (!startedAt) return false;
    const startMs = new Date(startedAt).getTime();
    if (Number.isNaN(startMs)) return false;
    const nextDuration = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    durationRef.current = nextDuration;
    setDuration(nextDuration);
    return true;
  }, [startedAt]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    timerRunningRef.current = false;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRunningRef.current = true;
    const tick = () => {
      if (!syncDurationFromServer()) {
        durationRef.current += 1;
        setDuration(prev => prev + 1);
      }
    };
    syncDurationFromServer();
    timerRef.current = setInterval(tick, 1000);
  }, [stopTimer, syncDurationFromServer]);

  useEffect(() => {
    if (connectedRef.current && timerRunningRef.current) startTimer();
    else if (!connectedRef.current && !startedAt) { durationRef.current = 0; setDuration(0); }
  }, [startedAt, startTimer]);

  const startRecording = useCallback((stream: MediaStream) => {
    if (!window.MediaRecorder) return;
    try {
      const mimeType = callType === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm');
      const mr = new MediaRecorder(stream, { mimeType });
      recordingChunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordingChunks.current.push(e.data); };
      mr.start(5000);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch (e) { devLog('[WebRTC] MediaRecorder init failed:', e); }
  }, [callType]);

  const stopRecordingAndUpload = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === 'inactive') return;
    mr.onstop = async () => {
      setIsRecording(false);
      if (recordingChunks.current.length === 0) return;
      const blob = new Blob(recordingChunks.current, { type: mr.mimeType });
      if (blob.size > 1024) {
        await uploadRecording(consultationId, blob, callType, durationRef.current, isAstrologer);
      }
      recordingChunks.current = [];
      mediaRecorderRef.current = null;
    };
    mr.stop();
  }, [consultationId, callType, isAstrologer]);

  const getMedia = useCallback(async (): Promise<MediaStream> => {
    const constraints = callType === 'video'
      ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
      : { audio: true, video: false };
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e: any) {
      throw new Error(
        e.name === 'NotAllowedError' ? 'Camera/microphone access denied.' :
        e.name === 'NotFoundError'   ? 'No camera/microphone found.' :
        `Media error: ${e.message}`
      );
    }
  }, [callType]);

  const createPC = useCallback((remoteEl: HTMLVideoElement | null) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.ontrack = ({ streams }) => { if (remoteEl && streams[0]) remoteEl.srcObject = streams[0]; };
    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case 'connected':
          connectedRef.current = true;
          setState('connected');
          startTimer();
          if (localStreamRef.current && !mediaRecorderRef.current) startRecording(localStreamRef.current);
          break;
        case 'disconnected':
          connectedRef.current = false;
          stopTimer();
          break;
        case 'failed':
          connectedRef.current = false;
          stopTimer();
          realEndRef.current(false);
          break;
      }
    };
    return pc;
  }, [startTimer, stopTimer, startRecording]);

  const releaseResources = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    stopTimer();
    connectedRef.current = false;
    remoteSetRef.current = false;
    pendingIceRef.current = [];
  }, [stopTimer]);

  const realEnd = useCallback((sendHangUp: boolean) => {
    if (endedRef.current) return;
    endedRef.current = true;
    stopRecordingAndUpload();
    if (sendHangUp) onSendSignalRef.current('hang-up', {}).catch(() => {});
    releaseResources();
    setState('ended');
    if (sessionStartedRef.current) onCallEndRef.current?.();
  }, [releaseResources, stopRecordingAndUpload]);

  useEffect(() => { realEndRef.current = realEnd; }, [realEnd]);

  const applyPendingIce = useCallback(async (pc: RTCPeerConnection) => {
    for (const c of [...pendingIceRef.current]) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    pendingIceRef.current = [];
  }, []);

  const startCall = useCallback(async (
    localEl: HTMLVideoElement | null,
    remoteEl: HTMLVideoElement | null,
  ) => {
    try {
      setState('requesting');
      setError(null);
      endedRef.current = false;
      sessionStartedRef.current = true;
      const stream = await getMedia();
      localStreamRef.current = stream;
      if (localEl) { localEl.srcObject = stream; localEl.muted = true; }
      const pc = createPC(remoteEl);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setState('calling');
      const desc = await waitForIceGathering(pc);
      await onSendSignalRef.current('offer', { type: desc.type, sdp: encodeSdp(sanitizeSDP(desc.sdp!)) });
    } catch (err: any) {
      sessionStartedRef.current = false;
      setError(err.message);
      setState('error');
    }
  }, [getMedia, createPC]);

  const answerCall = useCallback(async (
    offerData: { type: RTCSdpType; sdp: string },
    localEl: HTMLVideoElement | null,
    remoteEl: HTMLVideoElement | null,
  ) => {
    try {
      setState('requesting');
      setError(null);
      endedRef.current = false;
      sessionStartedRef.current = true;
      const stream = await getMedia();
      localStreamRef.current = stream;
      if (localEl) { localEl.srcObject = stream; localEl.muted = true; }
      const pc = createPC(remoteEl);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const rawSdp = decodeSdp(offerData.sdp);
      await pc.setRemoteDescription(new RTCSessionDescription({ type: offerData.type, sdp: sanitizeSDP(rawSdp) }));
      remoteSetRef.current = true;
      await applyPendingIce(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      const desc = await waitForIceGathering(pc);
      await onSendSignalRef.current('answer', { type: desc.type, sdp: encodeSdp(sanitizeSDP(desc.sdp!)) });
    } catch (err: any) {
      sessionStartedRef.current = false;
      setError(err.message);
      setState('error');
    }
  }, [getMedia, createPC, applyPendingIce]);

  const handleSignal = useCallback(async (
    signal: { signal_type: string; signal_data: any },
    localEl: HTMLVideoElement | null,
    remoteEl: HTMLVideoElement | null,
  ) => {
    const { signal_type, signal_data } = signal;
    if (signal_type === 'offer' && !isInitiator) {
      setState('ringing');
      await answerCall(signal_data, localEl, remoteEl);
      return;
    }
    if (signal_type === 'answer' && isInitiator) {
      const pc = pcRef.current;
      if (!pc || pc.signalingState !== 'have-local-offer') return;
      try {
        const rawSdp = decodeSdp(signal_data.sdp);
        await pc.setRemoteDescription(new RTCSessionDescription({ type: signal_data.type, sdp: sanitizeSDP(rawSdp) }));
        remoteSetRef.current = true;
        await applyPendingIce(pc);
      } catch (e: any) { setError(e.message); setState('error'); }
      return;
    }
    if (signal_type === 'ice-candidate' && signal_data?.candidate) {
      const pc = pcRef.current;
      if (!pc) return;
      if (!remoteSetRef.current) { pendingIceRef.current.push(signal_data.candidate); return; }
      try { await pc.addIceCandidate(new RTCIceCandidate(signal_data.candidate)); } catch {}
      return;
    }
    if (signal_type === 'hang-up') realEnd(false);
  }, [isInitiator, answerCall, applyPendingIce, realEnd]);

  const hangUp       = useCallback(() => realEnd(true), [realEnd]);
  const toggleMute   = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(prev => !prev);
  }, []);
  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCamOff(prev => !prev);
  }, []);

  useEffect(() => () => {
    stopRecordingAndUpload();
    releaseResources();
    endedRef.current = false;
    sessionStartedRef.current = false;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { state, error, isMuted, isCamOff, duration, isRecording, startCall, handleSignal, hangUp, toggleMute, toggleCamera };
}
