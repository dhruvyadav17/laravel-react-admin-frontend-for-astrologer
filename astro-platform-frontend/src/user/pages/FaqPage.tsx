// PATH: src/user/pages/FaqPage.tsx
// NEW: FAQ page — accordion, static

import { useState } from "react";
import { Link }     from "react-router-dom";
import UserPage     from "../components/ui/UserPage";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      { q: "Astro kya hai?", a: "Astro ek online platform hai jahan aap verified Vedic astrologers se chat, call ya video call ke zariye baat kar sakte hain. 24/7 available, genuine experts ke saath." },
      { q: "Account kaise banayein?", a: "Homepage pe 'Register' button click karein. Apna naam, email aur password daalein. Account turant banta hai — koi OTP ya wait nahi." },
      { q: "Kya yeh platform free hai?", a: "Registration aur astrologers browse karna bilkul free hai. Consultation ke liye astrologer ka price per minute lagta hai jo unke profile pe clearly mention hota hai." },
    ],
  },
  {
    category: "Consultation Process",
    items: [
      { q: "Astrologer se kaise baat karein?", a: "Astrologers page pe jayen, apni pasand ka astrologer chunein, unka profile dekhen aur 'Talk Now' (agar online ho) ya 'View Profile' click karein." },
      { q: "Kaun se modes available hain?", a: "Astrologer ke setup ke hisaab se Chat, Voice Call, ya Video Call available hote hain. Har astrologer ke card pe yeh clearly dikhta hai." },
      { q: "Consultation kitni der ki honi chahiye?", a: "Yeh aap pe depend karta hai. 5-10 minute mein ek specific sawaal ka jawab mil sakta hai. Deep kundli reading ke liye 30-60 minute better hai. Price per minute hota hai, aap decide karein." },
      { q: "Agar astrologer offline ho toh?", a: "Aap unka profile dekh sakte hain, review padh sakte hain, aur jab woh online ho tab baat kar sakte hain. Filter mein 'Online Only' select karke sirf available astrologers dekh sakte hain." },
    ],
  },
  {
    category: "Privacy & Safety",
    items: [
      { q: "Kya meri baat-chit private rahti hai?", a: "Haan, bilkul. Aapki consultation 100% private hoti hai. Hamara platform end-to-end encrypted hai. Koi bhi third party aapki conversations access nahi kar sakta." },
      { q: "Kya mera personal data safe hai?", a: "Haan. Hum sirf zaroori information store karte hain — naam, email, aur consultation history (sirf aapke liye visible). Koi bhi third party ko data nahi becha jaata." },
      { q: "Astrologers verified hain?", a: "Haan — sabhi astrologers ko platform pe aane se pehle ID verification aur experience verification se guzarna padta hai. Unki ratings real users ke reviews pe based hain." },
    ],
  },
  {
    category: "Technical",
    items: [
      { q: "App mobile pe kaam karti hai?", a: "Haan, hamari website mobile-friendly hai. Sabhi features phone browser pe bhi perfectly kaam karte hain." },
      { q: "Internet connection kaisa chahiye?", a: "Chat ke liye normal 2G/3G enough hai. Voice call ke liye 4G ya WiFi better hai. Video call ke liye stable broadband ya 4G recommended hai." },
      { q: "Password bhul gaye toh?", a: "Login page pe 'Forgot Password' click karein, apna email daalein — reset link aayega. 5 minute mein naya password set kar sakte hain." },
    ],
  },
];

export default function FaqPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <UserPage title="❓ Frequently Asked Questions">

      <div className="row justify-content-center">
        <div className="col-lg-8">

          <p className="text-muted text-center mb-5">
            Koi sawaal hai? Hamare common questions dekhen.
            Nahi mila jawab toh{" "}
            <Link to="/contact" className="text-decoration-none">humse contact karein</Link>.
          </p>

          {FAQS.map((section) => (
            <div key={section.category} className="mb-4">
              <h5 className="fw-bold mb-3 text-danger">{section.category}</h5>
              <div className="d-flex flex-column gap-2">
                {section.items.map((item, idx) => {
                  const id  = `${section.category}-${idx}`;
                  const open = openItem === id;
                  return (
                    <div key={id} className={`app-card p-0 overflow-hidden ${open ? "border-danger border" : ""}`}>
                      <button
                        className="w-100 text-start p-3 border-0 bg-transparent fw-semibold d-flex justify-content-between align-items-center"
                        onClick={() => setOpenItem(open ? null : id)}
                      >
                        <span style={{ fontSize: 14 }}>{item.q}</span>
                        <i className={`fas fa-chevron-${open ? "up" : "down"} text-muted ms-3 flex-shrink-0`}
                          style={{ fontSize: 12 }} />
                      </button>
                      {open && (
                        <div className="px-3 pb-3 text-muted small border-top" style={{ lineHeight: 1.7 }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="trust-card text-center mt-4">
            <p className="mb-2 fw-semibold">Abhi bhi sawaal hai?</p>
            <Link to="/contact" className="btn btn-primary-app btn-sm">
              <i className="fas fa-envelope me-1" />Contact Support
            </Link>
          </div>

        </div>
      </div>
    </UserPage>
  );
}
