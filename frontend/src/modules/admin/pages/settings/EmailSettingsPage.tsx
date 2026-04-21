/**
 * EmailSettingsPage — Configure and test email/SMTP from admin panel.
 */
import { useState } from 'react';
import { toast }    from 'react-toastify';
import AdminPage    from '../../components/AdminPage';
import { baseApi }  from '../../../../store/baseApi';
import api          from '../../../../api/axios';

const emailApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getEmailConfig: b.query<any, void>({
      query: () => '/admin/email/config',
      transformResponse: (res: any) => res.data ?? {},
    }),
  }),
  overrideExisting: false,
});

const { useGetEmailConfigQuery } = emailApi;

const PROVIDERS = [
  {
    name: 'Gmail',
    icon: 'fab fa-google',
    color: '#ea4335',
    host: 'smtp.gmail.com',
    port: 587,
    note: 'Use App Password (not your account password). Enable 2FA first, then create App Password in Google Account → Security.',
    link: 'https://myaccount.google.com/apppasswords',
  },
  {
    name: 'Mailtrap (Testing)',
    icon: 'fas fa-flask',
    color: '#3b82f6',
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    note: 'Free testing tool — emails go to Mailtrap inbox, not real users. Perfect for development.',
    link: 'https://mailtrap.io',
  },
  {
    name: 'Brevo (Free)',
    icon: 'fas fa-paper-plane',
    color: '#0ea5e9',
    host: 'smtp-relay.brevo.com',
    port: 587,
    note: '300 free emails/day. Create account → SMTP & API → Generate SMTP key.',
    link: 'https://app.brevo.com/settings/keys/smtp',
  },
  {
    name: 'Resend (Free)',
    icon: 'fas fa-bolt',
    color: '#6366f1',
    host: 'smtp.resend.com',
    port: 465,
    note: '100 free emails/day with your own domain. Simple modern API.',
    link: 'https://resend.com',
  },
];

export default function EmailSettingsPage() {
  const { data: config, isLoading } = useGetEmailConfigQuery();
  const [testEmail, setTestEmail]   = useState('');
  const [sending, setSending]       = useState(false);
  const [selected, setSelected]     = useState<number | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setSending(true);
    try {
      const res = await api.post('/admin/email/test', { to: testEmail });
      toast.success(res.data?.message ?? 'Test email sent!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPage title="Email / SMTP Settings">

      {/* Current Status */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3">
            <div className={`rounded-circle d-flex align-items-center justify-content-center`}
              style={{
                width: 48, height: 48,
                background: config?.is_configured ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
              }}>
              <i className={`fas fa-${config?.is_configured ? 'check' : 'times'}`}
                style={{ color: config?.is_configured ? '#16a34a' : '#dc2626', fontSize: 20 }} />
            </div>
            <div>
              <h6 className="fw-bold mb-0">
                Email is {config?.is_configured ? '✅ Configured' : '❌ Not Configured'}
              </h6>
              <p className="t-muted small mb-0">
                {config?.is_configured
                  ? `Using ${config.mailer} · From: ${config.from_address}`
                  : 'Current mode: log (emails go to storage/logs/laravel.log, not sent)'}
              </p>
            </div>
          </div>

          {!isLoading && config && (
            <div className="row g-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--bdr)' }}>
              {[
                { label: 'Driver',   value: config.mailer     },
                { label: 'Host',     value: config.host       },
                { label: 'Port',     value: config.port       },
                { label: 'Username', value: config.username   },
                { label: 'From',     value: config.from_address },
              ].map(({ label, value }) => (
                <div key={label} className="col-md-4 col-6">
                  <div className="t-muted small">{label}</div>
                  <div className="fw-semibold small t-main">{value || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Email */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header py-3">
          <h6 className="fw-bold mb-0"><i className="fas fa-vial me-2 text-primary" />Test Email Configuration</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleTest}>
            <div className="d-flex gap-2">
              <input type="email" className="form-control"
                placeholder="Enter email to send test to..."
                value={testEmail} onChange={e => setTestEmail(e.target.value)} required />
              <button type="submit" className="btn btn-primary px-4 text-nowrap" disabled={sending}>
                {sending
                  ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                  : <><i className="fas fa-paper-plane me-2" />Send Test</>}
              </button>
            </div>
          </form>
          <p className="t-muted small mt-2 mb-0">
            <i className="fas fa-info-circle me-1" />
            If you get an error, your SMTP is not configured. Follow the guide below.
          </p>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header py-3">
          <h6 className="fw-bold mb-0"><i className="fas fa-book me-2 text-primary" />Setup Guide</h6>
        </div>
        <div className="card-body">
          <p className="t-muted mb-4">
            Choose an email provider and follow the steps to configure SMTP in your backend <code>.env</code> file.
          </p>

          <div className="row g-3 mb-4">
            {PROVIDERS.map((p, i) => (
              <div key={p.name} className="col-md-6">
                <div
                  className={`p-3 rounded-3 h-100`}
                  style={{
                    border: selected === i ? `2px solid ${p.color}` : '1px solid var(--bdr)',
                    background: selected === i ? `${p.color}08` : 'var(--surf2)',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                  onClick={() => setSelected(selected === i ? null : i)}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className={`${p.icon}`} style={{ color: p.color, fontSize: 18, width: 24 }} />
                    <span className="fw-bold">{p.name}</span>
                    {i === 1 && <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: 10 }}>Dev/Testing</span>}
                    {i === 2 && <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: 10 }}>Free 300/day</span>}
                  </div>
                  <p className="t-muted small mb-2" style={{ fontSize: 12 }}>{p.note}</p>
                  <a href={p.link} target="_blank" rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary" style={{ fontSize: 11 }}
                    onClick={e => e.stopPropagation()}>
                    <i className="fas fa-external-link-alt me-1" />Get credentials
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* .env instructions */}
          {selected !== null && (
            <div>
              <h6 className="fw-semibold mb-3">
                Set these in <code>backend/.env</code>:
              </h6>
              <pre className="p-3 rounded-3 small mb-3" style={{
                background: '#0d1117', color: '#e6edf3',
                border: '1px solid #30363d', overflowX: 'auto',
              }}>{`MAIL_MAILER=smtp
MAIL_HOST=${PROVIDERS[selected].host}
MAIL_PORT=${PROVIDERS[selected].port}
MAIL_USERNAME=your_email_or_username
MAIL_PASSWORD=your_password_or_api_key
MAIL_SCHEME=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="AstroPortal"`}
              </pre>
              <p className="t-muted small">
                After editing <code>.env</code>, run: <code>php artisan config:clear</code> then test again.
              </p>
            </div>
          )}
        </div>
      </div>

    </AdminPage>
  );
}
