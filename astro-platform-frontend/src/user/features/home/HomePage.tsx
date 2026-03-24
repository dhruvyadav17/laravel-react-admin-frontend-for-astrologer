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

      <section className="text-center mb-5">
        <h1 className="section-title display-5">
          🔱 AstroPandit
        </h1>
        <p className="text-muted">
          Connect with expert astrologers & discover your future
        </p>
      </section>

      <div className="container">
        <div className="row g-4">

          {services.map((item) => (
            <div key={item.title} className="col-md-3">
              <Link to={item.path}>

                <div className="service-card shadow-sm">
                  <div style={{ fontSize: 42 }}>{item.icon}</div>
                  <h5 className="mt-3 text-danger">{item.title}</h5>
                </div>

              </Link>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}