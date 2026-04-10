// PATH: src/user/pages/PrivacyPage.tsx
// Privacy Policy — static

import UserPage from "../components/ui/UserPage";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: `We only collect information necessary to provide and improve our services:
• Account information: name, email address, password (encrypted)
• Profile information: date of birth (optional, for kundli/horoscope)
• Usage data: app usage patterns, consultation history
• Payment information: handled securely by payment processors — we do not store card details`,
  },
  {
    title: "How We Use Your Information",
    content: `Your information is used only for the following purposes:
• To manage your account and provide consultations
• To maintain platform security
• To improve and personalize services
• To provide support when you contact us
• We never sell your data to advertisers`,
  },
  {
    title: "Data Security",
    content: `Your privacy and security are important to us:
• All data is transmitted using SSL/TLS encryption
• Passwords are stored using secure bcrypt hashing
• Consultations are end-to-end encrypted
• Regular security audits are conducted
• You will be notified immediately in case of unauthorized access`,
  },
  {
    title: "Third-Party Sharing",
    content: `We do not sell your personal data to any third party. Limited sharing occurs only in the following cases:
• Payment processors (e.g., Razorpay/PayU) — to process payments securely
• Legal requirements — if required by law or court order
• With your consent — if you explicitly allow it`,
  },
  {
    title: "Your Rights",
    content: `You have the following rights:
• Right to access your data
• Right to correct inaccurate information
• Right to delete your account (data erasure)
• Right to export your data
• Right to opt out of marketing emails
To exercise these rights, contact us at support@astro.in`,
  },
  {
    title: "Cookies",
    content: `We use essential cookies for the following purposes:
• Session cookies: to maintain your login session
• Preference cookies: to remember your settings
• Analytics cookies: to improve the platform (using anonymized data)
You can disable cookies in your browser settings, but some features may not function properly.`,
  },
];

export default function PrivacyPage() {
  return (
    <UserPage title="🔒 Privacy Policy">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          {/* Header */}
          <div className="app-card mb-4">
            <p className="text-muted small mb-0">
              <strong>Last updated:</strong> January 2025 &nbsp;|&nbsp;
              <strong>Effective:</strong> January 1, 2025
            </p>
          </div>

          {/* Intro */}
          <p className="text-muted mb-4">
            Astro ("we", "our", "us") respects your privacy. This policy explains
            what data we collect, how we use it, and your rights regarding your information.
          </p>

          {/* Sections */}
          {SECTIONS.map((s) => (
            <div key={s.title} className="app-card mb-3">
              <h6 className="fw-bold text-danger mb-2">{s.title}</h6>
              <div
                className="text-muted small"
                style={{ lineHeight: 1.8, whiteSpace: "pre-line" }}
              >
                {s.content}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="app-card text-center">
            <p className="text-muted small mb-2">
              Have questions about privacy? Contact us.
            </p>
            <a
              href="mailto:privacy@astro.in"
              className="btn btn-sm btn-outline-app"
            >
              privacy@astro.in
            </a>
          </div>

        </div>
      </div>
    </UserPage>
  );
}