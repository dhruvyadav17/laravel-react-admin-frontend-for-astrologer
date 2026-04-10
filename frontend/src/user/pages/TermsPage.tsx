// PATH: src/user/pages/TermsPage.tsx
// Terms of Service — static

import UserPage from "../components/ui/UserPage";

const SECTIONS = [
  {
    title: "Platform Usage",
    content: `Astro is an intermediary platform that connects users with independent astrologers.
• You must be at least 18 years of age to use the platform
• One person is allowed only one account — multiple accounts are not permitted
• You must provide accurate information — false data may lead to account suspension
• The platform must be used only for lawful purposes`,
  },
  {
    title: "Consultation Disclaimer",
    content: `Astrology is a belief system and not a scientific discipline. Please note:
• Astrologers are not licensed professionals (such as doctors, lawyers, or financial advisors)
• Consultation content should not be treated as professional medical, legal, or financial advice
• For important decisions (e.g., surgery, investments, legal matters), consult qualified professionals
• Predictions are personal opinions and are not guaranteed outcomes`,
  },
  {
    title: "Payments & Refunds",
    content: `Payment policy:
• Consultations are charged per minute as stated on the astrologer’s profile
• Payments are deducted before the consultation begins (prepaid model)
• In case of technical issues from our side (e.g., connection drop), a refund will be provided
• If you end the consultation early, you will be charged for the time used
• Refund disputes must be reported within 7 days at support@astro.in`,
  },
  {
    title: "Prohibited Conduct",
    content: `The following activities are strictly prohibited:
• Harassing astrologers or using inappropriate language
• Posting fake reviews
• Making payments outside the platform (security risk)
• Using automated tools or bots
• Sharing copyrighted content without permission
Violation of these rules may result in permanent account suspension`,
  },
  {
    title: "Limitation of Liability",
    content: `Astro’s liability is limited as follows:
• We are not responsible for the accuracy of astrologers’ predictions
• Liability for technical issues (e.g., downtime, connectivity problems) is limited
• Maximum liability is restricted to the fee paid for the affected consultation
• We are not liable for indirect or consequential damages`,
  },
  {
    title: "Changes to Terms",
    content: `We may update these terms from time to time:
• Major changes will be notified via email at least 30 days in advance
• Minor changes may occur without prior notice
• Continued use of the platform implies acceptance of updated terms
• If you do not agree, you may choose to delete your account`,
  },
];

export default function TermsPage() {
  return (
    <UserPage title="📄 Terms of Service">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          {/* Header */}
          <div className="app-card mb-4">
            <p className="text-muted small mb-0">
              <strong>Last updated:</strong> January 2025 &nbsp;|&nbsp;
              <strong>Jurisdiction:</strong> New Delhi, India (Indian law applicable)
            </p>
          </div>

          {/* Intro */}
          <p className="text-muted mb-4">
            By using the Astro platform, you agree to these Terms of Service.
            Please read them carefully before proceeding.
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
              Have questions about these terms? Contact our legal team.
            </p>
            <a
              href="mailto:legal@astro.in"
              className="btn btn-sm btn-outline-app"
            >
              legal@astro.in
            </a>
          </div>

        </div>
      </div>
    </UserPage>
  );
}