import { Link } from 'react-router-dom';
import UserPage from '../../components/UserPage';
import { useGetAboutSettingsQuery } from '../../../../store/settings.api';
import { PageLoader } from '../../../../components/ui/States';

const DEFAULT_STEPS = [
  { icon: 'fa-search', title: 'Choose Astrologer', desc: 'Browse verified experts. Filter by expertise, language, price, and ratings.' },
  { icon: 'fa-phone',  title: 'Connect Instantly',  desc: 'Talk via chat, call, or video. Get instant answers to your questions.' },
  { icon: 'fa-star',   title: 'Get Guidance',        desc: 'Receive personalized insights on love, career, family, and life decisions.' },
];

export default function AboutPage() {
  const { data: settings, isLoading } = useGetAboutSettingsQuery();

  const stats = settings?.about_stats ?? [
    { value: '500+', label: 'Verified Astrologers' },
    { value: '50K+', label: 'Happy Users' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '24/7', label: 'Available' },
  ];

  const team = settings?.about_team ?? [
    { name: 'Rajesh Kumar', role: 'Founder & CEO',      expertise: 'Vedic Astrology, 15 yrs' },
    { name: 'Priya Sharma', role: 'Head of Astrologers', expertise: 'KP System, 12 yrs' },
    { name: 'Amit Verma',   role: 'Technology Head',     expertise: 'Astro-tech, 8 yrs' },
  ];

  return (
    <UserPage title="About Us">
      {isLoading ? <PageLoader /> : (
        <>
          {/* Hero */}
          <div className="hero-new text-center mb-5">
            <h2 className="fw-bold mb-3">🔱 {settings?.about_hero_title ?? 'Bringing Ancient Wisdom to Modern Life'}</h2>
            <p className="t-muted mb-4" style={{ maxWidth: 600, margin: '0 auto 24px' }}>
              {settings?.about_hero_desc ?? "Astro is India's trusted platform connecting seekers with verified Vedic astrologers."}
            </p>
            <Link to="/astrologers" className="btn btn-primary-app px-4">
              <i className="fas fa-star me-2" />Meet Our Astrologers
            </Link>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-5">
            {stats.map((s: any) => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="app-card text-center">
                  <div className="fw-bold text-danger" style={{ fontSize: 28 }}>{s.value}</div>
                  <div className="t-muted small">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mb-5">
            <h4 className="fw-bold mb-4 text-center">How It Works</h4>
            <div className="row g-4">
              {DEFAULT_STEPS.map((step, i) => (
                <div key={step.title} className="col-md-4">
                  <div className="app-card text-center h-100">
                    <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
                      style={{ width: 48, height: 48, fontSize: 20 }}>
                      {i + 1}
                    </div>
                    <i className={`fas ${step.icon} text-danger fa-2x mb-2`} />
                    <h6 className="fw-bold">{step.title}</h6>
                    <p className="t-muted small mb-0">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div className="app-card mb-5">
            <div className="row align-items-center">
              <div className="col-md-7">
                <h4 className="fw-bold mb-3">Our Mission</h4>
                {(settings?.about_mission ?? '').split('\n\n').filter(Boolean).map((para: string, i: number) => (
                  <p key={i} className="t-muted mb-3">{para}</p>
                ))}
                <Link to="/astrologers" className="btn btn-outline-app btn-sm">
                  Browse Astrologers
                </Link>
              </div>
              <div className="col-md-5 text-center mt-3 mt-md-0">
                <div style={{ fontSize: 80 }}>🔱</div>
                <p className="t-muted small">{settings?.about_founded ?? 'Founded in 2024 · India'}</p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-5">
            <h4 className="fw-bold mb-4 text-center">Our Team</h4>
            <div className="row g-3">
              {team.map((t: any) => (
                <div key={t.name} className="col-md-4">
                  <div className="app-card text-center">
                    <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
                      style={{ width: 56, height: 56, fontSize: 22 }}>
                      {t.name[0]}
                    </div>
                    <h6 className="fw-bold mb-0">{t.name}</h6>
                    <p className="t-muted small mb-1">{t.role}</p>
                    <span className="badge badge-lang" style={{ fontSize: 10 }}>{t.expertise}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="trust-card text-center">
            <h5 className="fw-bold mb-2">Ready to get started?</h5>
            <p className="t-muted mb-3">Talk to a verified astrologer today.</p>
            <Link to="/astrologers" className="btn btn-primary-app px-4 me-2">
              <i className="fas fa-star me-1" />Find Astrologer
            </Link>
            <Link to="/contact" className="btn btn-outline-app px-4">
              <i className="fas fa-envelope me-1" />Contact Us
            </Link>
          </div>
        </>
      )}
    </UserPage>
  );
}
