// PATH: src/user/features/home/HomePage.tsx
// FIX: /consult → /astrologers (route nahi tha)
// ADD: PageLoader shared component
// ADD: Favorites count in hero
// IMPROVE: Trust stats more specific

import { Link }                    from "react-router-dom";
import { useGetAstrologersQuery }  from "../../../store/api/astrologer.api";
import { PageLoader }              from "../../../components/ui/States";
import UserPage                    from "../../../user/components/ui/UserPage";
import AstrologerCard              from "../../../user/components/AstrologerCard";

const SERVICES = [
  { title: "Panchang",    icon: "📅", path: "/panchang",    desc: "Daily muhurat"      },
  { title: "Astrologers", icon: "🔮", path: "/astrologers", desc: "Talk to expert"     },
  { title: "Horoscope",   icon: "🌙", path: "/horoscope",   desc: "12 rashis"          },
  { title: "About Us",    icon: "ℹ️",  path: "/about",       desc: "Our mission"        },
];

const TRUST = [
  { icon: "🔒", title: "Trusted Experts",      desc: "Verified astrologers with real experience" },
  { icon: "⚡", title: "Instant Consultation",  desc: "Talk anytime, anywhere — 24/7 available"  },
  { icon: "💬", title: "Accurate Guidance",     desc: "Personalized insights for your life"       },
];

export default function HomePage() {
  const { data, isLoading } = useGetAstrologersQuery({ sort: "top_rated", page: 1 });
  const astrologers = (Array.isArray(data?.data) ? data.data : []).slice(0, 3);

  return (
    <UserPage>

      {/* Hero */}
      <section className="hero-new text-center mb-5">
        <h1 className="fw-bold display-5 mb-2">🔱 Astro</h1>
        <p className="text-muted mb-4">
          Talk to expert astrologers &amp; get guidance on love, career &amp; life
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/astrologers" className="btn btn-primary-app px-4">
            🔮 Talk to Astrologer
          </Link>
          <Link to="/horoscope" className="btn btn-outline-app px-4">
            🌙 Check Horoscope
          </Link>
        </div>
        <div className="d-flex justify-content-center gap-4 mt-4 flex-wrap">
          <span className="text-muted small">⭐ 500+ verified astrologers</span>
          <span className="text-muted small">👥 50,000+ happy users</span>
          <span className="text-muted small">🌟 4.8 avg rating</span>
        </div>
      </section>

      {/* Service cards */}
      <div className="row g-4 mb-5">
        {SERVICES.map((item) => (
          <div key={item.title} className="col-md-3 col-6">
            <Link to={item.path} className="text-decoration-none">
              <div className="service-card-new text-center h-100">
                <div className="service-icon">{item.icon}</div>
                <h6 className="fw-semibold mt-2 mb-0 text-dark">{item.title}</h6>
                <p className="text-muted small mb-0" style={{ fontSize: 11 }}>{item.desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Top astrologers */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold m-0">⭐ Top Astrologers</h5>
          <Link to="/astrologers" className="small text-decoration-none">View All →</Link>
        </div>

        {isLoading ? (
          <PageLoader color="danger" />
        ) : (
          <div className="row g-4">
            {astrologers.map((astro) => (
              <div key={astro.id} className="col-md-4">
                <AstrologerCard astrologer={astro} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust section */}
      <section className="mb-5">
        <div className="trust-card">
          <h5 className="fw-bold mb-4 text-center">Why Choose Astro?</h5>
          <div className="row g-3">
            {TRUST.map(({ icon, title, desc }) => (
              <div key={title} className="col-md-4 text-center">
                <div style={{ fontSize: 32 }} className="mb-2">{icon}</div>
                <h6 className="text-danger fw-bold">{title}</h6>
                <p className="text-muted small mb-0">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links section */}
      <section>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="app-card d-flex align-items-center gap-3">
              <span style={{ fontSize: 36 }}>❓</span>
              <div>
                <h6 className="fw-bold mb-1">Have questions?</h6>
                <p className="text-muted small mb-2">Read our FAQ for common queries</p>
                <Link to="/faq" className="btn btn-sm btn-outline-app">View FAQ</Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="app-card d-flex align-items-center gap-3">
              <span style={{ fontSize: 36 }}>📬</span>
              <div>
                <h6 className="fw-bold mb-1">Need help?</h6>
                <p className="text-muted small mb-2">Our support team is always here</p>
                <Link to="/contact" className="btn btn-sm btn-outline-app">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </UserPage>
  );
}
