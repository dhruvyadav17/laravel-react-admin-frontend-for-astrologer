// PATH: src/user/components/Footer.tsx
// FIX: Sare # links real routes se replace kiye

import { useState } from "react";
import { Link }     from "react-router-dom";
import { toast }    from "react-toastify";

export default function Footer() {
  const [email,      setEmail]      = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes("@")) { toast.error("Please enter a valid email"); return; }
    setSubscribed(true); setEmail("");
    toast.success("Subscribed successfully! 🎉");
  };

  return (
    <footer className="footer mt-5">
      <div className="container">
        <div className="row g-4">

          <div className="col-md-3">
            <h5 className="fw-bold">🔱 Astro</h5>
            <p className="small opacity-75">Discover your future with trusted astrologers.</p>
            <Link to="/about" className="btn btn-sm btn-outline-light mt-1">About Us</Link>
          </div>

          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Horoscope</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/horoscope">Daily Horoscope</Link></li>
              <li><Link to="/horoscope">Weekly Horoscope</Link></li>
              <li><Link to="/horoscope">Monthly Horoscope</Link></li>
              <li><Link to="/panchang">Panchang</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Quick Links</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/astrologers">Talk to Astrologer</Link></li>
              <li><Link to="/favorites">Saved Astrologers</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h6 className="fw-semibold mb-3">Stay Updated</h6>
            {subscribed ? (
              <p className="small opacity-75">✅ You're subscribed!</p>
            ) : (
              <div className="d-flex gap-2">
                <input type="email" className="form-control form-control-sm"
                  placeholder="Enter email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()} />
                <button className="btn btn-light btn-sm text-nowrap" onClick={handleSubscribe}>
                  Subscribe
                </button>
              </div>
            )}
            <small className="d-block mt-2 opacity-75">Get daily astrology insights</small>
          </div>

        </div>

        <hr className="my-4 opacity-25" />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p className="m-0 small opacity-75">
            © {new Date().getFullYear()} Astro. All rights reserved.
          </p>
          <div className="d-flex gap-3 small opacity-75">
            <Link to="/privacy" className="text-white">Privacy</Link>
            <Link to="/terms"   className="text-white">Terms</Link>
            <Link to="/contact" className="text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
