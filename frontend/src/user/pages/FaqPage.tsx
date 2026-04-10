import { useState } from "react";
import { Link } from "react-router-dom";
import UserPage from "../components/ui/UserPage";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is Astro?",
        a: "Astro is an online platform where you can connect with verified Vedic astrologers through chat, call, or video call. Available 24/7 with genuine experts.",
      },
      {
        q: "How can I create an account?",
        a: "Click on the 'Register' button on the homepage. Enter your name, email, and password. Your account will be created instantly — no OTP or waiting required.",
      },
      {
        q: "Is this platform free?",
        a: "Registration and browsing astrologers are completely free. For consultations, charges are based on the astrologer’s per-minute rate, which is clearly mentioned on their profile.",
      },
    ],
  },
  {
    category: "Consultation Process",
    items: [
      {
        q: "How can I talk to an astrologer?",
        a: "Go to the Astrologers page, choose your preferred astrologer, view their profile, and click 'Talk Now' (if online) or 'View Profile'.",
      },
      {
        q: "What communication modes are available?",
        a: "Depending on the astrologer’s setup, Chat, Voice Call, or Video Call options are available. These are clearly displayed on each astrologer’s card.",
      },
      {
        q: "How long should a consultation be?",
        a: "It depends on your needs. A specific question can often be answered within 5–10 minutes. For detailed kundli readings, 30–60 minutes is recommended. Pricing is per minute, so you can decide accordingly.",
      },
      {
        q: "What if the astrologer is offline?",
        a: "You can view their profile, read reviews, and connect when they come online. You can also use the 'Online Only' filter to see currently available astrologers.",
      },
    ],
  },
  {
    category: "Privacy & Safety",
    items: [
      {
        q: "Are my conversations private?",
        a: "Yes, absolutely. Your consultations are 100% private. Our platform is end-to-end encrypted, and no third party can access your conversations.",
      },
      {
        q: "Is my personal data safe?",
        a: "Yes. We only store essential information such as your name, email, and consultation history (visible only to you). Your data is never sold to third parties.",
      },
      {
        q: "Are astrologers verified?",
        a: "Yes. All astrologers go through ID and experience verification before joining the platform. Their ratings are based on real user reviews.",
      },
    ],
  },
  {
    category: "Technical",
    items: [
      {
        q: "Does the app work on mobile?",
        a: "Yes, our website is fully mobile-friendly. All features work smoothly on mobile browsers.",
      },
      {
        q: "What kind of internet connection is required?",
        a: "For chat, a normal 2G/3G connection is sufficient. For voice calls, 4G or Wi-Fi is recommended. For video calls, a stable broadband or 4G connection is required.",
      },
      {
        q: "What if I forget my password?",
        a: "Click on 'Forgot Password' on the login page, enter your email, and you will receive a reset link. You can set a new password within minutes.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <UserPage title="❓ Frequently Asked Questions">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          {/* Top Text */}
          <p className="text-muted text-center mb-5">
            Have a question? Check out our common FAQs.
            If you can’t find your answer,{" "}
            <Link to="/contact" className="text-decoration-none">
              contact us
            </Link>.
          </p>

          {FAQS.map((section) => (
            <div key={section.category} className="mb-4">
              <h5 className="fw-bold mb-3 text-danger">
                {section.category}
              </h5>

              <div className="d-flex flex-column gap-2">
                {section.items.map((item, idx) => {
                  const id = `${section.category}-${idx}`;
                  const open = openItem === id;

                  return (
                    <div
                      key={id}
                      className={`app-card p-0 overflow-hidden ${
                        open ? "border-danger border" : ""
                      }`}
                    >
                      <button
                        className="w-100 text-start p-3 border-0 bg-transparent fw-semibold d-flex justify-content-between align-items-center"
                        onClick={() => setOpenItem(open ? null : id)}
                      >
                        <span style={{ fontSize: 14 }}>{item.q}</span>
                        <i
                          className={`fas fa-chevron-${
                            open ? "up" : "down"
                          } text-muted ms-3 flex-shrink-0`}
                          style={{ fontSize: 12 }}
                        />
                      </button>

                      {open && (
                        <div
                          className="px-3 pb-3 text-muted small border-top"
                          style={{ lineHeight: 1.7 }}
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bottom Section */}
          <div className="trust-card text-center mt-4">
            <p className="mb-2 fw-semibold">Still have questions?</p>
            <Link to="/contact" className="btn btn-primary-app btn-sm">
              <i className="fas fa-envelope me-1" />
              Contact Support
            </Link>
          </div>

        </div>
      </div>
    </UserPage>
  );
}