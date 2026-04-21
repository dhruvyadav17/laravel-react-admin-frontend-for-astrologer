import UserPage from '../../components/UserPage';
import { useGetTermsSettingsQuery } from '../../../../store/settings.api';
import { PageLoader } from '../../../../components/ui/States';

export default function TermsPage() {
  const { data: settings, isLoading } = useGetTermsSettingsQuery();
  const sections = settings?.terms_content ?? [];

  return (
    <UserPage title="📄 Terms of Service">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="app-card mb-4">
            <p className="t-muted small mb-0">
              <strong>Last updated:</strong> January 2025 &nbsp;|&nbsp;
              <strong>Jurisdiction:</strong> New Delhi, India (Indian law applicable)
            </p>
          </div>
          <p className="t-muted mb-4">
            By using the Astro platform, you agree to these Terms of Service.
            Please read them carefully before proceeding.
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
            <p className="t-muted small mb-2">Have questions about these terms? Contact our legal team.</p>
            <a href="mailto:legal@astro.in" className="btn btn-sm btn-outline-app">legal@astro.in</a>
          </div>
        </div>
      </div>
    </UserPage>
  );
}
