import UserPage from '../../components/UserPage';
import { useGetPrivacySettingsQuery } from '../../../../store/settings.api';
import { PageLoader } from '../../../../components/ui/States';

export default function PrivacyPage() {
  const { data: settings, isLoading } = useGetPrivacySettingsQuery();
  const sections = settings?.privacy_content ?? [];

  return (
    <UserPage title="🔒 Privacy Policy">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="app-card mb-4">
            <p className="t-muted small mb-0">
              <strong>Last updated:</strong> January 2025 &nbsp;|&nbsp;
              <strong>Effective:</strong> January 1, 2025
            </p>
          </div>
          <p className="t-muted mb-4">
            Astro ("we", "our", "us") respects your privacy. This policy explains
            what data we collect, how we use it, and your rights regarding your information.
          </p>

          {isLoading ? <PageLoader /> : (
            <>
              {sections.map((s: any) => (
                <div key={s.title} className="app-card mb-3">
                  <h6 className="fw-bold text-danger mb-2">{s.title}</h6>
                  <div className="t-muted small" style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {s.content}
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="app-card text-center">
            <p className="t-muted small mb-2">Have questions about privacy? Contact us.</p>
            <a href="mailto:privacy@astro.in" className="btn btn-sm btn-outline-app">privacy@astro.in</a>
          </div>
        </div>
      </div>
    </UserPage>
  );
}
