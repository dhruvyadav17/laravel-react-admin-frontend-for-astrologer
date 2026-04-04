// PATH: src/user/components/Footer.tsx
// IMPROVEMENT: Newsletter subscribe button ke pehle koi state/handler nahi tha
//              Ab email validate karta hai aur success message dikhata hai
//              (Future: API call add karna hoga)

import { useState } from "react";
import { Link }     from "react-router-dom";
import { toast }    from "react-toastify";

export default function Footer() {
  const [email, setEmail]   = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    // TODO: API call karo yahan
    setSubscribed(true);
    setEmail("");
    toast.success("Subscribed successfully! 🎉");
  };

  return (
    <footer className="footer mt-5">
      <div className="container">
        <div className="row g-4">

          {/* Brand */}
          <div className="col-md-3">
            <h5 className="fw-bold">🔱 Astro</h5>
            <p className="small">
              Discover your future with trusted astrologers.
              Get guidance on love, career, and life.
            </p>
          </div>

          {/* Horoscope */}
          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Horoscope</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="#">Daily Horoscope</Link></li>
              <li><Link to="#">Weekly Horoscope</Link></li>
              <li><Link to="#">Monthly Horoscope</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Services</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/panchang">Panchang</Link></li>
              <li><Link to="/astrologers">Astrologers</Link></li>
              <li><Link to="#">Kundli Matching</Link></li>
              <li><Link to="#">Live Chat</Link></li>
            </ul>
          </div>

          {/* Newsletter — IMPROVEMENT: working state */}
          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Stay Updated</h6>
            {subscribed ? (
              <p className="text-light small">
                ✅ You're subscribed! Thank you.
              </p>
            ) : (
              <div className="d-flex gap-2">
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                />
                <button
                  className="btn btn-light btn-sm text-nowrap"
                  onClick={handleSubscribe}
                >
                  Subscribe
                </button>
              </div>
            )}
            <small className="d-block mt-2 text-light">
              Get daily astrology insights
            </small>
          </div>

        </div>

        <hr className="my-4 opacity-50" />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p className="m-0 small">
            © {new Date().getFullYear()} Astro. All rights reserved.
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
