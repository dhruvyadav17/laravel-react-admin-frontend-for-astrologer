import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer mt-5">

      <div className="container">

        <div className="row g-4">

          {/* BRAND */}
          <div className="col-md-3">
            <h5 className="fw-bold">🔱 AstroPandit</h5>
            <p className="small">
              Discover your future with trusted astrologers.
              Get guidance on love, career, and life.
            </p>
          </div>

          {/* HOROSCOPE */}
          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Horoscope</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="#">Daily Horoscope</Link></li>
              <li><Link to="#">Weekly Horoscope</Link></li>
              <li><Link to="#">Monthly Horoscope</Link></li>
            </ul>
          </div>

          {/* SERVICES */}
          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Services</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/panchang">Panchang</Link></li>
              <li><Link to="/astrologers">Astrologers</Link></li>
              <li><Link to="#">Kundli Matching</Link></li>
              <li><Link to="#">Live Chat</Link></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Stay Updated</h6>

            <div className="d-flex gap-2">
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
              />
              <button className="btn btn-light btn-sm">
                Subscribe
              </button>
            </div>

            <small className="d-block mt-2 text-light">
              Get daily astrology insights
            </small>
          </div>

        </div>

        {/* DIVIDER */}
        <hr className="my-4 opacity-50" />

        {/* BOTTOM */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

          <p className="m-0 small">
            © {new Date().getFullYear()} AstroPandit. All rights reserved.
          </p>

          <div className="d-flex gap-3 small">
            <Link to="#">Privacy</Link>
            <Link to="#">Terms</Link>
            <Link to="#">Contact</Link>
          </div>

        </div>

      </div>

    </footer>
  );
}