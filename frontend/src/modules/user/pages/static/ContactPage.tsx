import { useState } from 'react';
import UserPage from '../../components/UserPage';
import {
  useGetContactSettingsQuery,
  useSubmitContactFormMutation,
} from '../../../../store/settings.api';

export default function ContactPage() {
  const { data: settings, isLoading } = useGetContactSettingsQuery();
  const [submitForm, { isLoading: submitting }] = useSubmitContactFormMutation();

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await submitForm(form).unwrap();
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to send message. Please try again.');
    }
  };

  const CONTACTS = [
    { icon: 'fa-envelope text-danger',      label: 'Email',    value: settings?.contact_email    ?? 'support@astro.in'      },
    { icon: 'fa-phone text-success',        label: 'Phone',    value: settings?.contact_phone    ?? '+91 98765 43210'        },
    { icon: 'fa-clock text-primary',        label: 'Hours',    value: settings?.contact_hours    ?? '24/7 Support Available' },
    { icon: 'fa-map-marker-alt text-warning',label: 'Location',value: settings?.contact_location ?? 'New Delhi, India'       },
  ];

  const socials = [
    { icon: 'fa-instagram', href: settings?.social_instagram ?? '#' },
    { icon: 'fa-youtube',   href: settings?.social_youtube   ?? '#' },
    { icon: 'fa-twitter',   href: settings?.social_twitter   ?? '#' },
    { icon: 'fa-facebook',  href: settings?.social_facebook  ?? '#' },
  ];

  return (
    <UserPage title="📞 Contact Us">
      <div className="row g-4">

        {/* Left — contact info */}
        <div className="col-md-4">
          <div className="app-card h-100">
            <h5 className="fw-bold mb-4">Get in Touch</h5>

            {CONTACTS.map(({ icon, label, value }) => (
              <div key={label} className="d-flex align-items-start gap-3 mb-3">
                <i className={`fas ${icon} mt-1`} style={{ width: 20 }} />
                <div>
                  <div className="small fw-semibold t-main">{label}</div>
                  <div className="t-muted small">{value}</div>
                </div>
              </div>
            ))}

            <hr />

            <div className="fw-semibold small mb-2">Follow Us</div>
            <div className="d-flex gap-2">
              {socials.map(({ icon, href }) => (
                <a key={icon} href={href} target="_blank" rel="noopener noreferrer"
                  className="btn btn-sm d-flex align-items-center justify-content-center"
                  style={{
                    borderRadius: '50%', width: 36, height: 36,
                    border: '1px solid var(--bdr2)', background: 'var(--surf2)',
                    color: 'var(--txt-m)',
                  }}>
                  <i className={`fab ${icon}`} style={{ fontSize: 14 }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right — contact form */}
        <div className="col-md-8">
          <div className="app-card">
            {submitted ? (
              <div className="text-center py-5">
                <i className="fas fa-check-circle text-success fa-3x d-block mb-3" />
                <h5 className="fw-bold t-main">Message Sent!</h5>
                <p className="t-muted mb-4">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button className="btn btn-outline-secondary btn-sm"
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h5 className="fw-bold mb-4">Send us a Message</h5>

                {error && (
                  <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 small mb-3"
                    style={{ background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.3)', color: '#dc2626' }}>
                    <i className="fas fa-exclamation-circle" />{error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Your Name</label>
                      <input className="form-control" placeholder="Rahul Sharma"
                        required value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input type="email" className="form-control" placeholder="rahul@email.com"
                        required value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Subject</label>
                      <select className="form-select" required
                        value={form.subject} onChange={e => set('subject', e.target.value)}>
                        <option value="">Select a topic</option>
                        <option>Consultation related</option>
                        <option>Account issue</option>
                        <option>Payment related</option>
                        <option>Astrologer feedback</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Message</label>
                      <textarea className="form-control" rows={5}
                        placeholder="Describe your question or issue..."
                        required minLength={20} value={form.message}
                        onChange={e => set('message', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary-app px-4" disabled={submitting}>
                        {submitting
                          ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                          : <><i className="fas fa-paper-plane me-2" />Send Message</>}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </UserPage>
  );
}
