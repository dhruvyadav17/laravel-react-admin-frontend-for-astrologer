// PATH: src/user/features/home/HomePage.tsx
// FIX: useGetAstrologersQuery import user.api → astrologer.api
//      data structure fix: { data: [...] } → .data array

import { Link } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/astrologer.api";
import UserPage from "../../components/ui/UserPage";
import AstrologerCard from "../../components/AstrologerCard";

const services = [
  { title: "Panchang",    icon: "📅", path: "/panchang"    },
  { title: "Astrologers", icon: "🔮", path: "/astrologers" },
  { title: "Horoscope",   icon: "🌙", path: "/horoscope"   },
  { title: "Call Now",    icon: "📞", path: "/consult"     },
];

export default function HomePage() {
  // FIX: useGetAstrologersQuery ab filters object expect karta hai
  const { data, isLoading } = useGetAstrologersQuery({ sort: "top_rated", page: 1 });

  // FIX: data = { data: [...], pagination: ... } — .data se array nikalo
  const astrologers = (Array.isArray(data?.data) ? data.data : []).slice(0, 3);

  return (
    <UserPage>

      {/* HERO */}
      <section className="hero-new text-center mb-5">
        <h1 className="fw-bold display-5 mb-2">🔱 Astro</h1>
        <p className="text-muted mb-4">
          Talk to expert astrologers &amp; get guidance on love, career &amp; life
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/astrologers">
            <button className="btn btn-primary-app px-4">🔮 Talk to Astrologer</button>
          </Link>
          <Link to="/panchang">
            <button className="btn btn-outline-app px-4">📅 View Panchang</button>
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <div className="row g-4 mb-5">
        {services.map((item) => (
          <div key={item.title} className="col-md-3 col-6">
            <Link to={item.path} className="text-decoration-none">
              <div className="service-card-new text-center h-100">
                <div className="service-icon">{item.icon}</div>
                <h6 className="fw-semibold mt-2 text-dark">{item.title}</h6>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* TOP ASTROLOGERS */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold m-0">⭐ Top Astrologers</h5>
          <Link to="/astrologers" className="small text-decoration-none">View All →</Link>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger" />
          </div>
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

      {/* TRUST */}
      <section>
        <div className="trust-card text-center">
          <h5 className="fw-bold mb-3">Why Choose Astro?</h5>
          <div className="row">
            <div className="col-md-4">
              <h6 className="text-danger">🔒 Trusted Experts</h6>
              <p className="text-muted small">Verified astrologers with real experience</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-danger">⚡ Instant Consultation</h6>
              <p className="text-muted small">Talk anytime, anywhere</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-danger">💬 Accurate Guidance</h6>
              <p className="text-muted small">Personalized astrology insights</p>
            </div>
          </div>
        </div>
      </section>

    </UserPage>
  );
}