import { Link } from "react-router-dom";

const services = [
  {
    title: "Panchang",
    desc: "Daily Panchang",
    icon: "📅",
    path: "/panchang",
  },
  {
    title: "Astrologers",
    desc: "Talk to experts",
    icon: "🔮",
    path: "/astrologers",
  },
  {
    title: "Horoscope",
    desc: "Daily Predictions",
    icon: "🌙",
    path: "/horoscope",
  },
  {
    title: "Call Now",
    desc: "Talk instantly",
    icon: "📞",
    path: "/consult",
  },
];

export default function HomePage() {
  return (
    <div>

      {/* ================= HERO ================= */}
      <section className="bg-light py-5 text-center rounded">
        <div className="container">
          <h1 className="text-danger fw-bold mb-3">
            Welcome to AstroPandit 🔱
          </h1>

          <p className="text-muted fs-5">
            Talk to astrologers & know your future
          </p>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="container py-5">
        <div className="row g-4">

          {services.map((item) => (
            <div className="col-md-3" key={item.title}>
              <Link to={item.path} className="text-decoration-none">

                <div className="card p-4 text-center shadow-sm h-100 service-card">

                  <div style={{ fontSize: "40px" }}>
                    {item.icon}
                  </div>

                  <h5 className="text-danger mt-3">
                    {item.title}
                  </h5>

                  <p className="text-muted small">
                    {item.desc}
                  </p>

                </div>

              </Link>
            </div>
          ))}

        </div>
      </section>

      {/* ================= EXTRA SECTION (ASTRO STYLE) ================= */}
      <section className="bg-danger text-white text-center py-5 rounded">
        <div className="container">
          <h3 className="fw-bold mb-3">
            🔮 Get Personalized Guidance
          </h3>

          <p>
            Connect with top astrologers and get solutions for love,
            career, health and more.
          </p>

          <Link to="/astrologers" className="btn btn-light mt-3">
            Talk to Astrologer
          </Link>
        </div>
      </section>

    </div>
  );
}