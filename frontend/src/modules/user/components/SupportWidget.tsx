/**
 * SupportWidget — floating support button (WhatsApp / Contact).
 * Shows bottom-right corner on all user pages.
 */
import { useState } from 'react';
import { Link }     from 'react-router-dom';

const WA_NUMBER = '919876543210'; // Change to real number in admin settings

export default function SupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
    }}>
      {/* Options popup */}
      {open && (
        <div className="d-flex flex-column gap-2 mb-1">
          {/* WhatsApp */}
          <a href={`https://wa.me/${WA_NUMBER}?text=Hello! I need help with AstroPortal.`}
            target="_blank" rel="noopener noreferrer"
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow fw-semibold text-decoration-none"
            style={{ background: '#25d366', color: '#fff', fontSize: 13, whiteSpace: 'nowrap' }}
            onClick={() => setOpen(false)}>
            <i className="fab fa-whatsapp" style={{ fontSize: 18 }} />
            WhatsApp Support
          </a>

          {/* Contact page */}
          <Link to="/contact"
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow fw-semibold text-decoration-none"
            style={{ background: 'var(--surf)', color: 'var(--txt)', border: '1px solid var(--bdr)', fontSize: 13, whiteSpace: 'nowrap' }}
            onClick={() => setOpen(false)}>
            <i className="fas fa-envelope" style={{ color: 'var(--primary)' }} />
            Send a Message
          </Link>

          {/* FAQ */}
          <Link to="/faq"
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow fw-semibold text-decoration-none"
            style={{ background: 'var(--surf)', color: 'var(--txt)', border: '1px solid var(--bdr)', fontSize: 13, whiteSpace: 'nowrap' }}
            onClick={() => setOpen(false)}>
            <i className="fas fa-question-circle" style={{ color: 'var(--primary)' }} />
            View FAQ
          </Link>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="d-flex align-items-center justify-content-center rounded-circle shadow-lg border-0"
        style={{
          width: 56, height: 56,
          background: open ? 'var(--primary)' : 'linear-gradient(135deg,#25d366,#128c7e)',
          color: '#fff',
          fontSize: 22,
          transition: 'all .2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
        }}
        title="Support">
        <i className={`fas ${open ? 'fa-times' : 'fa-headset'}`} />
      </button>
    </div>
  );
}
