/**
 * BroadcastPage — Send notifications to users/astrologers from admin.
 */
import { useState }  from 'react';
import { toast }     from 'react-toastify';
import AdminPage     from '../../components/AdminPage';
import api           from '../../../../api/axios';

const TARGETS = [
  { value: 'all',        label: 'All Users',     icon: 'fa-users',          desc: 'Send to everyone on the platform' },
  { value: 'users',      label: 'Users Only',    icon: 'fa-user',           desc: 'Send only to regular users (customers)' },
  { value: 'astrologers',label: 'Astrologers',   icon: 'fa-user-astronaut', desc: 'Send only to astrologers' },
];

const ICONS = [
  { value: 'fa-bullhorn',       label: '📢 Announcement' },
  { value: 'fa-gift',           label: '🎁 Offer/Reward'  },
  { value: 'fa-star',           label: '⭐ New Feature'   },
  { value: 'fa-exclamation',    label: '⚠️ Alert'         },
  { value: 'fa-info-circle',    label: 'ℹ️ Info'          },
  { value: 'fa-check-circle',   label: '✅ Success'        },
];

const COLORS = [
  { value: 'primary', label: 'Blue'   },
  { value: 'success', label: 'Green'  },
  { value: 'warning', label: 'Yellow' },
  { value: 'danger',  label: 'Red'    },
  { value: 'info',    label: 'Cyan'   },
];

const COLOR_HEX: Record<string, string> = {
  primary: '#2563eb', success: '#16a34a',
  warning: '#ca8a04', danger: '#dc2626', info: '#0284c7',
};

export default function BroadcastPage() {
  const [form, setForm] = useState({
    target: 'all', title: '', message: '',
    icon: 'fa-bullhorn', color: 'primary',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`Send "${form.title}" to all ${form.target}? This cannot be undone.`)) return;

    setSending(true);
    setSent(null);
    try {
      const res = await api.post('/admin/broadcast', form);
      const msg = res.data?.message ?? 'Notification sent!';
      toast.success(msg);
      setSent(msg);
      setForm(p => ({ ...p, title: '', message: '' }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  // Live preview
  const preview = {
    icon: form.icon, color: COLOR_HEX[form.color],
    title: form.title || 'Your notification title',
    message: form.message || 'Your notification message will appear here...',
  };

  return (
    <AdminPage title="Broadcast Notification">
      <div className="row g-4">

        {/* Form */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0">
            <div className="card-header py-3">
              <h6 className="fw-bold mb-0">
                <i className="fas fa-bullhorn me-2 text-primary" />Send Notification
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSend}>

                {/* Target */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">Send To</label>
                  <div className="d-flex flex-column gap-2">
                    {TARGETS.map(t => (
                      <label key={t.value}
                        className="d-flex align-items-center gap-3 p-3 rounded-3"
                        style={{
                          border: `1px solid ${form.target === t.value ? '#2563eb' : 'var(--bdr)'}`,
                          background: form.target === t.value ? 'rgba(37,99,235,.06)' : 'var(--surf2)',
                          cursor: 'pointer', transition: 'all .15s',
                        }}>
                        <input type="radio" name="target" value={t.value}
                          checked={form.target === t.value}
                          onChange={e => set('target', e.target.value)}
                          className="form-check-input mt-0" />
                        <i className={`fas ${t.icon}`} style={{ color: '#2563eb', width: 20 }} />
                        <div>
                          <div className="fw-semibold small">{t.label}</div>
                          <div className="t-muted" style={{ fontSize: 11 }}>{t.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Title *</label>
                  <input className="form-control" placeholder="e.g. New Feature Available!"
                    value={form.title} onChange={e => set('title', e.target.value)}
                    required maxLength={100} />
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">Message *</label>
                  <textarea className="form-control" rows={3}
                    placeholder="Describe what's new or what users should know..."
                    value={form.message} onChange={e => set('message', e.target.value)}
                    required maxLength={500} />
                  <div className="t-muted small mt-1 text-end">{form.message.length}/500</div>
                </div>

                {/* Icon + Color */}
                <div className="row g-3 mb-4">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold small">Icon</label>
                    <div className="d-flex flex-wrap gap-2">
                      {ICONS.map(ic => (
                        <button key={ic.value} type="button"
                          className={`btn btn-sm ${form.icon === ic.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                          style={{ fontSize: 11 }}
                          onClick={() => set('icon', ic.value)}>
                          <i className={`fas ${ic.value} me-1`} />{ic.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fw-semibold small">Color</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c.value} type="button"
                          className="rounded-circle border-0"
                          style={{
                            width: 28, height: 28,
                            background: COLOR_HEX[c.value],
                            outline: form.color === c.value ? `3px solid ${COLOR_HEX[c.value]}` : 'none',
                            outlineOffset: 2,
                          }}
                          onClick={() => set('color', c.value)}
                          title={c.label} />
                      ))}
                    </div>
                  </div>
                </div>

                {sent && (
                  <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 small mb-3"
                    style={{ background: 'rgba(34,197,94,.10)', border: '1px solid rgba(34,197,94,.3)', color: '#16a34a' }}>
                    <i className="fas fa-check-circle" />{sent}
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100 fw-semibold py-2" disabled={sending}>
                  {sending
                    ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                    : <><i className="fas fa-paper-plane me-2" />Send Notification</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header py-3">
              <h6 className="fw-bold mb-0"><i className="fas fa-eye me-2 text-primary" />Live Preview</h6>
            </div>
            <div className="card-body">
              <p className="t-muted small mb-3">How users will see this notification:</p>

              {/* Notification bell preview */}
              <div className="p-3 rounded-3" style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 36, height: 36, background: `${preview.color}18` }}>
                    <i className={`fas ${preview.icon}`} style={{ color: preview.color, fontSize: 14 }} />
                  </div>
                  <div>
                    <div className="fw-semibold small">{preview.title}</div>
                    <div className="t-muted small">{preview.message}</div>
                    <div className="t-muted mt-1" style={{ fontSize: 10 }}>Just now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-semibold mb-3"><i className="fas fa-lightbulb me-2 text-warning" />Tips</h6>
              <ul className="t-muted small mb-0" style={{ paddingLeft: 16 }}>
                <li className="mb-2">Keep title short and action-oriented</li>
                <li className="mb-2">Use Offer/Reward icon for promotions</li>
                <li className="mb-2">Users see notification in the bell icon</li>
                <li className="mb-2">Cannot be undone once sent</li>
                <li>Test with a small group first if possible</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </AdminPage>
  );
}
