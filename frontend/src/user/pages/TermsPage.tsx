// PATH: src/user/pages/TermsPage.tsx
// NEW: Terms of Service — static

import UserPage from "../components/ui/UserPage";

const SECTIONS = [
  {
    title: "Platform Usage",
    content: `Astro ek intermediary platform hai jo users aur independent astrologers ko connect karta hai.
• Aap 18 saal ya usse zyada umra ke hone chahiye
• Ek person, ek account — multiple accounts allowed nahi
• Sahi information provide karein — galat data ke liye account ban ho sakta hai
• Platform ka use sirf legal purposes ke liye karein`,
  },
  {
    title: "Consultation Disclaimer",
    content: `Astrology ek belief system hai, scientific fact nahi. Yeh samjhein:
• Astrologers ke paas professional qualifications (doctor, lawyer, financial advisor) nahi hote
• Consultation ki information ko professional medical/legal/financial advice ki jagah mat samjhein
• Bade decisions (surgery, investment, legal matters) ke liye qualified professionals se milein
• Predictions personal opinion hain — guaranteed results nahi`,
  },
  {
    title: "Payments & Refunds",
    content: `Payment policy:
• Consultation per-minute charged hoti hai as stated on astrologer profile
• Payment debit hota hai consultation start hone se pehle (prepaid)
• Agar connection drop ho jaaye hamare technical issue se — refund milega
• Agar aap consultation beech mein choden — jo time use hua uska charge hoga
• Refund disputes: 7 din ke andar support@astro.in pe report karein`,
  },
  {
    title: "Prohibited Conduct",
    content: `Yeh cheezein allowed nahi hain:
• Astrologers ko harass karna ya inappropriate language use karna
• Fake reviews likhna
• Platform ke bahar payment karna (security risk)
• Automated tools ya bots use karna
• Copyright content share karna
Violation pe account permanently ban ho sakta hai`,
  },
  {
    title: "Limitation of Liability",
    content: `Astro ki liability limited hai:
• Hum astrologer ki accuracy ya predictions ke liye responsible nahi hain
• Technical issues (downtime, connection problems) ke liye liability limited hai
• Maximum liability: us consultation ki fee jisme issue hua
• Indirect, consequential damages ke liye hum responsible nahi hain`,
  },
  {
    title: "Changes to Terms",
    content: `Hum yeh terms update kar sakte hain:
• Major changes ke liye 30 din pehle email notice diya jaayega
• Chhoti changes bina notice ke ho sakti hain
• Continued use = new terms accept karna
• Agar terms nahi accept karni hain toh account delete kar sakte hain`,
  },
];

export default function TermsPage() {
  return (
    <UserPage title="📄 Terms of Service">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="app-card mb-4">
            <p className="text-muted small mb-0">
              <strong>Last updated:</strong> January 2025 &nbsp;|&nbsp;
              <strong>Jurisdiction:</strong> New Delhi, India (Indian law applicable)
            </p>
          </div>

          <p className="text-muted mb-4">
            Astro platform use karke aap in Terms of Service se agree karte hain.
            Kripya inhe dhyan se padhein.
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
              Terms se related koi sawaal? Legal team se contact karein.
            </p>
            <a href="mailto:legal@astro.in" className="btn btn-sm btn-outline-app">
              legal@astro.in
            </a>
          </div>
        </div>
      </div>
    </UserPage>
  );
}
