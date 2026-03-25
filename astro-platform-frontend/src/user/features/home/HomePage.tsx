import { Link } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/user.api";

/* ================= STATIC SERVICES ================= */
const services = [
  { title: "Panchang", icon: "📅", path: "/panchang" },
  { title: "Astrologers", icon: "🔮", path: "/astrologers" },
  { title: "Horoscope", icon: "🌙", path: "/horoscope" },
  { title: "Call Now", icon: "📞", path: "/consult" },
];

/* ================= STATIC FALLBACK ================= */
const fallbackAstros = [
  {
    name: "Astrologer",
    expertise: "Vedic Astrology",
    rating: 4.5,
  },
];

export default function HomePage() {
  const { data = [], isLoading } = useGetAstrologersQuery();

  /* ================= DYNAMIC + FALLBACK ================= */
  const astrologers = data.length ? data.slice(0, 3) : fallbackAstros;

  return (
    <div className="page">

      {/* ================= HERO ================= */}
      <section className="text-center mb-5">

        <h1 className="display-4 fw-bold mb-3">
          🔱 Astro
        </h1>

        <p className="text-muted mb-4">
          Talk to expert astrologers & get guidance on love, career & life
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">

          <Link to="/astrologers">
            <button className="btn btn-primary-app btn-app px-4">
              🔮 Talk to Astrologer
            </button>
          </Link>

          <Link to="/panchang">
            <button className="btn btn-outline-app btn-app px-4">
              📅 View Panchang
            </button>
          </Link>

        </div>

      </section>

      {/* ================= SERVICES ================= */}
      <div className="container">

        <div className="row g-4">

          {services.map((item) => (
            <div key={item.title} className="col-md-3 col-6">

              <Link to={item.path} className="text-decoration-none">

                <div className="service-card h-100">

                  <div style={{ fontSize: 40 }}>{item.icon}</div>

                  <h6 className="fw-semibold text-dark mt-2">
                    {item.title}
                  </h6>

                </div>

              </Link>

            </div>
          ))}

        </div>

      </div>

      {/* ================= FEATURED ASTROLOGERS ================= */}
      <section className="mt-5">

        <div className="container">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">⭐ Top Astrologers</h5>

            <Link to="/astrologers" className="small text-decoration-none">
              View All →
            </Link>
          </div>

          <div className="row g-4">

            {astrologers.map((astro: any, i: number) => {

              const rating = astro.rating || 4.5;

              return (
                <div key={i} className="col-md-4">

                  <div className="app-card text-center h-100">

                    {/* IMAGE */}
                    <img
                      src={
                        astro.profile_image ||
                        `https://ui-avatars.com/api/?name=${astro.name}`
                      }
                      className="astro-img mb-2"
                    />

                    {/* NAME */}
                    <h6 className="fw-bold mb-1">{astro.name}</h6>

                    {/* EXPERTISE */}
                    <p className="text-muted small mb-1">
                      {astro.expertise || "Astrology Expert"}
                    </p>

                    {/* RATING */}
                    <div className="small">
                      ⭐ {rating}
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* ================= TRUST SECTION ================= */}
      <section className="text-center mt-5">

        <div className="container">

          <div className="app-card">

            <h5 className="fw-bold mb-3">
              Why Choose Astro?
            </h5>

            <div className="row text-center">

              <div className="col-md-4">
                <h6 className="text-danger">🔒 Trusted Experts</h6>
                <p className="text-muted small">
                  Verified astrologers with real experience
                </p>
              </div>

              <div className="col-md-4">
                <h6 className="text-danger">⚡ Instant Consultation</h6>
                <p className="text-muted small">
                  Talk anytime, anywhere
                </p>
              </div>

              <div className="col-md-4">
                <h6 className="text-danger">💬 Accurate Guidance</h6>
                <p className="text-muted small">
                  Personalized astrology insights
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}