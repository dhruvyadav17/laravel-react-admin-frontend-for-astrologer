import { Link } from "react-router-dom";

const services = [
  { title: "Panchang", icon: "📅", path: "/panchang" },
  { title: "Astrologers", icon: "🔮", path: "/astrologers" },
  { title: "Horoscope", icon: "🌙", path: "/horoscope" },
  { title: "Call Now", icon: "📞", path: "/consult" },
];

export default function HomePage() {
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

        {/* CTA */}
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

                  {/* ICON */}
                  <div
                    className="mb-2"
                    style={{ fontSize: 40 }}
                  >
                    {item.icon}
                  </div>

                  {/* TITLE */}
                  <h6 className="fw-semibold text-dark">
                    {item.title}
                  </h6>

                </div>

              </Link>

            </div>
          ))}

        </div>

      </div>

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