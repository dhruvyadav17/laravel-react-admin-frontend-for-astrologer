/**
 * WelcomePage — public landing page for unauthenticated visitors.
 * Sections: Hero, Stats, How It Works, Top Astrologers preview,
 *           Services, Testimonials, CTA.
 */
import { Link }                 from 'react-router-dom';
import { useGetAstrologersQuery } from '../../../../store/astrologer.api';
import StarRating               from '../../../../components/ui/StarRating';
import Avatar                   from '../../../../components/ui/Avatar';

const STEPS = [
  { icon: '🔍', title: 'Browse Experts',      desc: 'Filter 500+ verified astrologers by expertise, language, price, and rating.' },
  { icon: '💬', title: 'Connect Instantly',   desc: 'Chat, voice call, or video call. Get started in under 60 seconds.' },
  { icon: '✨', title: 'Get Real Guidance',   desc: 'Receive personalized insights on love, career, health, and life decisions.' },
];

const SERVICES = [
  { icon: '💝', title: 'Love & Relationships', desc: 'Kundli matching, compatibility, marriage timing' },
  { icon: '💼', title: 'Career & Finance',      desc: 'Job change timing, business decisions, financial planning' },
  { icon: '🏠', title: 'Vastu & Home',          desc: 'Property buying, home direction, office setup' },
  { icon: '🌙', title: 'Daily Horoscope',       desc: '12 rashi daily, weekly, monthly predictions' },
  { icon: '👶', title: 'Birth Chart (Kundli)',   desc: 'Detailed natal chart, dasha analysis, predictions' },
  { icon: '📅', title: 'Muhurat',               desc: 'Auspicious timing for wedding, travel, new ventures' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Mumbai',
    rating: 5,
    text: 'The guidance I received about my career change was spot on. The astrologer was very knowledgeable and patient.',
  },
  {
    name: 'Rahul Verma',
    city: 'Delhi',
    rating: 5,
    text: 'Got Kundli matching done before my marriage. Very detailed analysis and the call quality was crystal clear.',
  },
  {
    name: 'Anita Patel',
    city: 'Ahmedabad',
    rating: 4,
    text: 'Daily horoscope readings have been accurate. I consult every week now. Great platform!',
  },
];

const STATS = [
  { value: '500+',  label: 'Verified Astrologers' },
  { value: '50K+',  label: 'Happy Users'          },
  { value: '4.8★',  label: 'Average Rating'       },
  { value: '24/7',  label: 'Available'             },
];

export default function WelcomePage() {
  const { data } = useGetAstrologersQuery({ sort: 'top_rated', page: 1 });
  const topAstros = (data?.data ?? []).slice(0, 3);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 100%)' }}
        className="d-flex align-items-center justify-content-between px-4 py-3 sticky-top">
        <span className="fw-bold text-white fs-5">🔱 Astro</span>
        <div className="d-flex gap-2">
          <Link to="/login"    className="btn btn-sm btn-outline-light px-3">Sign In</Link>
          <Link to="/register" className="btn btn-sm px-3 fw-semibold"
            style={{ background: '#e63946', color: '#fff', border: 'none' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)', padding: '80px 16px' }}>
        <div className="container text-center" style={{ maxWidth: 700 }}>
          <div style={{ fontSize: 64, lineHeight: 1 }} className="mb-3">🔱</div>
          <h1 className="fw-bold text-white mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.2 }}>
            Talk to Expert Astrologers<br />
            <span style={{ color: '#f59e0b' }}>Anytime, Anywhere</span>
          </h1>
          <p className="text-white mb-5" style={{ opacity: 0.8, fontSize: 18, maxWidth: 500, margin: '0 auto 32px' }}>
            Get real guidance on love, career & life from India's top verified Vedic astrologers.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap mb-5">
            <Link to="/register"
              className="btn btn-lg fw-semibold px-5 py-3"
              style={{ background: '#e63946', color: '#fff', borderRadius: 12, fontSize: 16 }}>
              ✨ Start Free Consultation
            </Link>
            <Link to="/home"
              className="btn btn-lg btn-outline-light fw-semibold px-5 py-3"
              style={{ borderRadius: 12, fontSize: 16 }}>
              Browse Astrologers
            </Link>
          </div>

          {/* Stats */}
          <div className="d-flex justify-content-center gap-4 flex-wrap">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="fw-bold text-white fs-4">{value}</div>
                <div className="small" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-5" style={{ background: 'var(--surf)' }}>
        <div className="container">
          <h2 className="fw-bold text-center mb-2">How It Works</h2>
          <p className="t-muted text-center mb-5">Start in under 60 seconds</p>
          <div className="row g-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="col-md-4">
                <div className="text-center p-4 h-100 rounded-4" style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                  <div className="mb-3">
                    <div className="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center fw-bold mb-2"
                      style={{ width: 48, height: 48, fontSize: 18 }}>{i + 1}</div>
                    <div style={{ fontSize: 40 }}>{step.icon}</div>
                  </div>
                  <h5 className="fw-bold t-main mb-2">{step.title}</h5>
                  <p className="t-muted mb-0" style={{ fontSize: 14 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-2">Our Services</h2>
          <p className="t-muted text-center mb-5">Everything you need under one roof</p>
          <div className="row g-3">
            {SERVICES.map(({ icon, title, desc }) => (
              <div key={title} className="col-md-4 col-6">
                <Link to="/register" className="text-decoration-none d-block h-100">
                  <div className="p-3 h-100 rounded-3 d-flex align-items-start gap-3"
                    style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)', transition: 'border-color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bdr)')}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div className="fw-semibold t-main" style={{ fontSize: 14 }}>{title}</div>
                      <div className="t-muted" style={{ fontSize: 12 }}>{desc}</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP ASTROLOGERS ─────────────────────────── */}
      {topAstros.length > 0 && (
        <section className="py-5" style={{ background: 'var(--surf)' }}>
          <div className="container">
            <h2 className="fw-bold text-center mb-2">Meet Our Top Astrologers</h2>
            <p className="t-muted text-center mb-5">Verified experts with thousands of happy clients</p>
            <div className="row g-4 justify-content-center">
              {topAstros.map((a: any) => (
                <div key={a.id} className="col-md-4">
                  <div className="text-center p-4 rounded-4 h-100"
                    style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                    <Avatar name={a.name} src={a.profile_image} size={72} />
                    <h5 className="fw-bold mt-3 mb-1 t-main">{a.name}</h5>
                    <p className="t-muted small mb-2">{a.expertise}</p>
                    <StarRating rating={a.rating} size={14} />
                    <div className="t-muted small mt-1 mb-3">
                      {a.rating.toFixed(1)} · {a.total_reviews} reviews · {a.experience}yrs exp
                    </div>
                    <div className="d-flex gap-2 justify-content-center flex-wrap mb-3">
                      {(a.languages ?? []).slice(0, 3).map((l: string) => (
                        <span key={l} className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: 11 }}>{l}</span>
                      ))}
                    </div>
                    <div className="fw-bold" style={{ color: 'var(--primary)', fontSize: 16 }}>
                      ₹{a.price_per_minute}<span className="t-muted fw-normal" style={{ fontSize: 12 }}>/min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/home" className="btn btn-outline-app px-5">
                View All {data?.pagination?.total ?? 500}+ Astrologers
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-2">What Our Users Say</h2>
          <p className="t-muted text-center mb-5">Thousands of happy users across India</p>
          <div className="row g-4">
            {TESTIMONIALS.map(({ name, city, rating, text }) => (
              <div key={name} className="col-md-4">
                <div className="p-4 rounded-4 h-100" style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                  <StarRating rating={rating} size={14} />
                  <p className="t-muted my-3" style={{ fontSize: 14, lineHeight: 1.7, fontStyle: 'italic' }}>
                    "{text}"
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    <Avatar name={name} size={36} />
                    <div>
                      <div className="fw-semibold t-main" style={{ fontSize: 14 }}>{name}</div>
                      <div className="t-muted" style={{ fontSize: 12 }}>{city}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f3460 100%)', padding: '60px 16px' }}>
        <div className="container text-center" style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 48 }} className="mb-3">🌟</div>
          <h2 className="fw-bold text-white mb-3">Ready to get guidance?</h2>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>
            Join 50,000+ users who trust AstroPortal for life decisions. First consultation free!
          </p>
          <Link to="/register"
            className="btn btn-lg fw-semibold px-5 py-3"
            style={{ background: '#e63946', color: '#fff', borderRadius: 12 }}>
            ✨ Create Free Account
          </Link>
          <p className="mt-3 small" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No credit card required · Instant access · 24/7 support
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{ background: '#0d1117', padding: '24px 16px' }} className="text-center">
        <p className="mb-1" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          © 2024 AstroPortal · All rights reserved
        </p>
        <div className="d-flex justify-content-center gap-3">
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact'], ['FAQ', '/faq']].map(([label, path]) => (
            <Link key={path} to={path} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
