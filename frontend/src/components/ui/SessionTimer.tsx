// Live billing timer shown during an active consultation.
// Both user (ConsultationPage) and astrologer (ChatPage) use this component —
// the `earningRate` prop controls whether to show gross cost or 80% earning.
import { useState, useEffect } from 'react';
import { fmtDuration, fmtCost } from '../../utils/format';

type Props = {
  startedAt:    string;
  ratePerMinute: number;
  earningRate?:  number; // fraction of rate shown (default 1.0 = full cost; astrologer uses 0.8)
};

export default function SessionTimer({ startedAt, ratePerMinute, earningRate = 1 }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick  = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const cost = fmtCost((elapsed / 60) * ratePerMinute * earningRate);

  return (
    <div className="d-flex align-items-center gap-3 px-3 py-2 rounded-3"
      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
      <div className="d-flex align-items-center gap-2">
        <span className="badge bg-danger" style={{ fontSize: 9, padding: '3px 6px', animation: 'pulse 1s infinite' }}>
          ● LIVE
        </span>
        <span className="fw-bold font-monospace" style={{ fontSize: 18 }}>
          {fmtDuration(elapsed)}
        </span>
      </div>
      <div className="t-muted small">
        <span className="fw-semibold text-success">₹{cost}</span>
        {earningRate < 1 ? ' earning' : ' charged'}
      </div>
    </div>
  );
}
