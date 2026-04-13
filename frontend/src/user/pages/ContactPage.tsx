import { useState } from 'react';
import UserPage from '../components/ui/UserPage';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmit] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmit(true);
  };

  return (
    <UserPage title="?? Contact Us">
      <div className="row g-4">
        <div className="col-md-4">
          <div className="app-card h-100">
            <h5 className="fw-bold mb-4">Get in Touch</h5>

            {[
              { icon: 'fa-envelope text-danger', label: 'Email', value: 'support@astro.in' },
              { icon: 'fa-phone text-success', label: 'Phone', value: '+91 98765 43210' },
              { icon: 'fa-clock text-primary', label: 'Hours', value: '24/7 Support Available' },
              { icon: 'fa-map-marker-alt text-warning', label: 'Location', value: 'New Delhi, India' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="d-flex align-items-start gap-3 mb-3">
                <i className={`fas ${icon} mt-1`} style={{ width: 18 }} />
                <div>
                  <div className="small fw-semibold">{label}</div>
                  <div className="t-muted small">{value}</div>
                </div>
              </div>
            ))}

            <hr />

            <div className="fw-semibold small mb-2">Follow Us</div>
            <div className="d-flex gap-2">
              {[
                { icon: 'fa-instagram' },
                { icon: 'fa-youtube' },
                { icon: 'fa-twitter' },
                { icon: 'fa-facebook' },
              ].map(({ icon }) => (
                <button
                  key={icon}
                  className="btn btn-sm"
                  style={{
                    borderRadius: 20,
                    width: 36,
                    height: 36,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid var(--bdr2)',
                    background: 'var(--surf2)',
                    color: 'var(--txt-m)',
                    cursor: 'pointer',
                  }}
                >
                  <i className={`fab ${icon}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="app-card">
            {submitted ? (
              <div className="text-center py-4">
                <i className="fas fa-check-circle text-success fa-3x d-block mb-3" />
                <h5 className="fw-bold">Message Sent!</h5>
                <p className="t-muted">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setSubmit(false);
                    setForm({ name: '', email: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h5 className="fw-bold mb-4">Send us a Message</h5>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Your Name</label>
                      <input className="form-control" placeholder="Rahul Sharma" required value={form.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input type="email" className="form-control" placeholder="rahul@email.com" required value={form.email} onChange={(e) => set('email', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Subject</label>
                      <select className="form-select" required value={form.subject} onChange={(e) => set('subject', e.target.value)}>
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
                      <textarea className="form-control" rows={5} placeholder="Describe your question or issue..." required value={form.message} onChange={(e) => set('message', e.target.value)} minLength={20} />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary-app px-4">
                        <i className="fas fa-paper-plane me-2" />Send Message
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
