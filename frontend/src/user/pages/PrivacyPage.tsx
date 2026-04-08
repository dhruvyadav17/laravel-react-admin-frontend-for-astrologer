// PATH: src/user/pages/PrivacyPage.tsx
// NEW: Privacy Policy — static

import UserPage from "../components/ui/UserPage";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: `Hum sirf woh information collect karte hain jo aapko better service dene ke liye zaroori hai:
• Account information: naam, email address, password (encrypted)
• Profile information: date of birth (optional, kundli ke liye)
• Usage data: app usage patterns, consultation history
• Payment information: payment processor ke through handle hoti hai — hum card details store nahi karte`,
  },
  {
    title: "How We Use Your Information",
    content: `Aapki information ka use sirf in kaamom ke liye hota hai:
• Account manage karna aur consultation provide karna
• Platform ki security maintain karna
• Service improvements aur personalization
• Support provide karna jab aap contact karein
• Hum aapka data kabhi bhi advertisers ko nahi bechte`,
  },
  {
    title: "Data Security",
    content: `Aapki privacy hamare liye important hai:
• Sabhi data SSL/TLS encryption ke saath transmit hota hai
• Passwords bcrypt hash ke saath store hote hain
• Consultations end-to-end encrypted hain
• Regular security audits kiye jaate hain
• Unauthorized access ke case mein aapko immediately notify kiya jaayega`,
  },
  {
    title: "Third Party Sharing",
    content: `Hum aapka personal data kisi third party ko nahi bechte. Limited sharing sirf:
• Payment processors (Razorpay/PayU) — sirf payment complete karne ke liye
• Legal requirements — agar court order ya law enforcement request ho
• Aapki consent se — agar aap explicitly allow karein`,
  },
  {
    title: "Your Rights",
    content: `Aapke paas yeh rights hain:
• Apna data access karne ka right
• Galat information correct karne ka right
• Account delete karne ka right (data erasure)
• Data export karne ka right
• Marketing emails se opt-out karne ka right
In rights ke liye support@astro.in pe contact karein.`,
  },
  {
    title: "Cookies",
    content: `Hum essential cookies use karte hain:
• Session cookies: login session maintain karne ke liye
• Preference cookies: aapki settings yaad rakhne ke liye
• Analytics cookies: platform improve karne ke liye (anonymized data)
Browser settings mein cookies disable kar sakte hain — kuch features kaam nahi karenge.`,
  },
];

export default function PrivacyPage() {
  return (
    <UserPage title="🔒 Privacy Policy">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="app-card mb-4">
            <p className="text-muted small mb-0">
              <strong>Last updated:</strong> January 2025 &nbsp;|&nbsp;
              <strong>Effective:</strong> January 1, 2025
            </p>
          </div>

          <p className="text-muted mb-4">
            Astro ("hum", "hamara") aapki privacy ki respect karta hai. Yeh policy explain karti hai
            ki hum kya data collect karte hain, kaise use karte hain, aur aapke rights kya hain.
          </p>

          {SECTIONS.map((s) => (
            <div key={s.title} className="app-card mb-3">
              <h6 className="fw-bold text-danger mb-2">{s.title}</h6>
              <div className="text-muted small" style={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {s.content}
              </div>
            </div>
          ))}

          <div className="app-card text-center">
            <p className="text-muted small mb-2">
              Privacy se related koi sawaal hai? Humse baat karein.
            </p>
            <a href="mailto:privacy@astro.in" className="btn btn-sm btn-outline-app">
              privacy@astro.in
            </a>
          </div>
        </div>
      </div>
    </UserPage>
  );
}
