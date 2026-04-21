// Consultation receipt -- printable / save as PDF
// Used when consultation is complete -- shows printable receipt

import { useRef }             from 'react';
import { useGetReceiptQuery, useGetRecordingsQuery } from '../../../../store/consultation.api';

interface Props { consultationId: number; onClose: () => void; }

export default function ReceiptModal({ consultationId, onClose }: Props) {
  const { data: receipt, isLoading } = useGetReceiptQuery(consultationId);
  const { data: recordings = [] }    = useGetRecordingsQuery(consultationId);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML ?? '';
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Receipt</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#333}
        .row{display:flex;justify-content:space-between;margin:8px 0;font-size:14px}
        .total{font-size:18px;border-top:2px solid #333;padding-top:12px;margin-top:12px}
        .hdr{text-align:center;border-bottom:2px solid #e63946;padding-bottom:16px;margin-bottom:24px}
        .badge{background:#22c55e;color:white;padding:2px 10px;border-radius:12px;font-size:12px}
      </style></head><body>${content}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="app-card shadow-lg" style={{ width: 420, maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, overflow: 'hidden' }}>
        <div className="d-flex justify-content-between align-items-center p-3 fw-semibold t-main" style={{ borderBottom: "1px solid var(--bdr)", background: "var(--surf2)" }}>
          <span className="fw-semibold"><i className="fas fa-receipt me-2" />Consultation Receipt</span>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="p-3">
          {isLoading ? <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          : !receipt ? <div className="text-center py-4 t-muted">Receipt not available</div>
          : <>
            <div ref={printRef}>
              <div className="text-center mb-4 pb-3" style={{ borderBottom: '2px solid #e63946' }}>
                <div style={{ fontSize: 32 }}>🔱</div>
                <h5 className="fw-bold mb-1">AstroPortal</h5>
                <p className="t-muted small mb-1">Official Consultation Receipt</p>
                <span style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:700, background:"rgba(34,197,94,.15)", color:"#16a34a", border:"1px solid rgba(34,197,94,.3)" }}>OK PAID</span>
              </div>

              <div className="d-flex flex-column gap-2 mb-4">
                {([
                  ['Receipt No.',  receipt.receipt_number],
                  ['Date',         receipt.date],
                  ['Client',       receipt.user_name],
                  ['Astrologer',   receipt.astrologer_name],
                  ['Expertise',    receipt.astrologer_expertise],
                  ['Session Type', receipt.consultation_type],
                  ['Duration',     `${receipt.duration_minutes} minutes`],
                  ['Rate',         `₹${receipt.rate_per_minute}/min`],
                  ['Payment',      receipt.payment_mode],
                ] as [string, string][]).map(([l, v]) => (
                  <div key={l} className="d-flex justify-content-between small">
                    <span className="t-muted">{l}</span>
                    <span className="fw-semibold">{v}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between border-top pt-3 mt-1">
                  <span className="fw-bold fs-6">Total Charged</span>
                  <span className="fw-bold fs-5 text-danger">₹{receipt.gross_amount}</span>
                </div>
              </div>

              <div className="text-center t-muted" style={{ fontSize: 11 }}>
                <p className="mb-0">Thank you for choosing AstroPortal!</p>
              </div>
            </div>
            {/* Session Recordings */}
            {recordings.length > 0 && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--bdr)' }}>
                <h6 className="fw-semibold t-main mb-3">
                  <i className="fas fa-video me-2" style={{ color: 'var(--primary)' }} />
                  Session Recordings ({recordings.length})
                </h6>
                {(recordings as any[]).map((r: any) => (
                  <div key={r.id} className="d-flex align-items-center gap-3 mb-2 p-2 rounded-3"
                    style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                    <i className={`fas fa-${r.type === 'video' ? 'video' : 'microphone'} t-muted`} />
                    <div className="flex-grow-1">
                      <div className="fw-semibold t-main" style={{ fontSize: 13 }}>
                        {r.type === 'video' ? 'Video' : 'Audio'} Recording
                      </div>
                      <div className="t-muted" style={{ fontSize: 11 }}>
                        {Math.floor(r.duration_seconds / 60)}m {r.duration_seconds % 60}s
                        {' . '}{(r.size_bytes / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-sm" style={{ fontSize: 11, padding: '3px 8px', background: 'var(--primary)', color: '#fff', borderRadius: 6 }}>
                        <i className="fas fa-play me-1" />Play
                      </a>
                      <a href={r.url} download
                        className="btn btn-sm btn-outline-secondary" style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>
                        <i className="fas fa-download" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="d-grid mt-4">
              <button className="btn btn-outline-primary btn-sm" onClick={handlePrint}>
                <i className="fas fa-print me-2" />Print / Save as PDF
              </button>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
