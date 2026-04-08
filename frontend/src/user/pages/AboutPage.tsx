// PATH: src/user/pages/AboutPage.tsx
// NEW: About Us — static page

import { Link }  from "react-router-dom";
import UserPage  from "../components/ui/UserPage";

const STATS = [
  { value: "500+", label: "Verified Astrologers" },
  { value: "50K+", label: "Happy Users"          },
  { value: "4.8★", label: "Average Rating"       },
  { value: "24/7", label: "Available"            },
];

const STEPS = [
  { icon: "fa-search",      title: "Choose Astrologer", desc: "Browse verified experts. Filter by expertise, language, price, and ratings."        },
  { icon: "fa-phone",       title: "Connect Instantly",  desc: "Talk via chat, call, or video. Get instant answers to your questions."              },
  { icon: "fa-star",        title: "Get Guidance",       desc: "Receive personalized insights on love, career, family, and life decisions."          },
];

const TEAM = [
  { name: "Rajesh Kumar",  role: "Founder & CEO",       expertise: "Vedic Astrology, 15 yrs"   },
  { name: "Priya Sharma",  role: "Head of Astrologers",  expertise: "KP System, 12 yrs"         },
  { name: "Amit Verma",    role: "Technology Head",      expertise: "Astro-tech, 8 yrs"          },
];

export default function AboutPage() {
  return (
    <UserPage title="About Us">

      {/* Hero */}
      <div className="hero-new text-center mb-5">
        <h2 className="fw-bold mb-3">🔱 Bringing Ancient Wisdom to Modern Life</h2>
        <p className="text-muted mb-4" style={{ maxWidth: 600, margin: "0 auto 24px" }}>
          Astro is India's trusted platform connecting seekers with verified Vedic astrologers.
          We believe everyone deserves clear guidance — rooted in tradition, delivered with care.
        </p>
        <Link to="/astrologers" className="btn btn-primary-app px-4">
          <i className="fas fa-star me-2" />Meet Our Astrologers
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-5">
        {STATS.map((s) => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="app-card text-center">
              <div className="fw-bold text-danger" style={{ fontSize: 28 }}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-5">
        <h4 className="fw-bold mb-4 text-center">How It Works</h4>
        <div className="row g-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="col-md-4">
              <div className="app-card text-center h-100">
                <div className="rounded-circle bg-danger text-white d-flex align-items-center
                                justify-content-center fw-bold mx-auto mb-3"
                  style={{ width: 48, height: 48, fontSize: 20 }}>
                  {i + 1}
                </div>
                <i className={`fas ${step.icon} text-danger fa-2x mb-2`} />
                <h6 className="fw-bold">{step.title}</h6>
                <p className="text-muted small mb-0">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="app-card mb-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h4 className="fw-bold mb-3">Our Mission</h4>
            <p className="text-muted mb-3">
              We started Astro with a simple belief: everyone deserves access to authentic astrological
              guidance — not just the privileged few. Our platform brings together India's most trusted
              astrologers and makes their wisdom accessible, affordable, and instant.
            </p>
            <p className="text-muted mb-3">
              Every astrologer on our platform is personally verified, background-checked, and rated
              by real users. No fake profiles, no paid promotions — just genuine expertise.
            </p>
            <Link to="/astrologers" className="btn btn-outline-app btn-sm">
              Browse Astrologers →
            </Link>
          </div>
          <div className="col-md-6 text-center mt-3 mt-md-0">
            <div style={{ fontSize: 80 }}>🔱</div>
            <p className="text-muted small">Founded in 2024 · India</p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mb-5">
        <h4 className="fw-bold mb-4 text-center">Our Team</h4>
        <div className="row g-3">
          {TEAM.map((t) => (
            <div key={t.name} className="col-md-4">
              <div className="app-card text-center">
                <div className="rounded-circle bg-danger text-white d-flex align-items-center
                                justify-content-center fw-bold mx-auto mb-3"
                  style={{ width: 56, height: 56, fontSize: 22 }}>
                  {t.name[0]}
                </div>
                <h6 className="fw-bold mb-0">{t.name}</h6>
                <p className="text-muted small mb-1">{t.role}</p>
                <span className="badge bg-light text-dark border" style={{ fontSize: 10 }}>
                  {t.expertise}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="trust-card text-center">
        <h5 className="fw-bold mb-2">Ready to get started?</h5>
        <p className="text-muted mb-3">Talk to a verified astrologer today.</p>
        <Link to="/astrologers" className="btn btn-primary-app px-4 me-2">
          <i className="fas fa-star me-1" />Find Astrologer
        </Link>
        <Link to="/contact" className="btn btn-outline-app px-4">
          <i className="fas fa-envelope me-1" />Contact Us
        </Link>
      </div>

    </UserPage>
  );
}
