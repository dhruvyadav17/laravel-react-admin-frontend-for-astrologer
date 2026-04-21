import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserPage from '../../components/UserPage';
import { useGetFaqSettingsQuery } from '../../../../store/settings.api';
import { PageLoader } from '../../../../components/ui/States';

export default function FaqPage() {
  const { data: settings, isLoading } = useGetFaqSettingsQuery();
  const [openItem, setOpenItem] = useState<string | null>(null);

  const faqs = settings?.faq_items ?? [];

  return (
    <UserPage title="❓ Frequently Asked Questions">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <p className="t-muted text-center mb-5">
            Have a question? Check out our common FAQs. If you can't find your answer,{' '}
            <Link to="/contact" className="text-decoration-none">contact us</Link>.
          </p>

          {isLoading ? <PageLoader /> : (
            <>
              {faqs.map((section: any) => (
                <div key={section.category} className="mb-4">
                  <h5 className="fw-bold mb-3 text-danger">{section.category}</h5>
                  <div className="d-flex flex-column gap-2">
                    {section.items.map((item: any, idx: number) => {
                      const id = `${section.category}-${idx}`;
                      const open = openItem === id;
                      return (
                        <div key={id}
                          className={`app-card p-0 overflow-hidden ${open ? 'border-danger border' : ''}`}>
                          <button
                            className="w-100 text-start p-3 border-0 bg-transparent fw-semibold d-flex justify-content-between align-items-center"
                            onClick={() => setOpenItem(open ? null : id)}>
                            <span className="t-main" style={{ fontSize: 14 }}>{item.q}</span>
                            <i className={`fas fa-chevron-${open ? 'up' : 'down'} t-muted ms-3 flex-shrink-0`}
                              style={{ fontSize: 12 }} />
                          </button>
                          {open && (
                            <div className="px-3 pb-3 t-muted small border-top" style={{ lineHeight: 1.7 }}>
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
                <p className="mb-2 fw-semibold">Still have questions?</p>
                <Link to="/contact" className="btn btn-primary-app btn-sm">
                  <i className="fas fa-envelope me-1" />Contact Support
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </UserPage>
  );
}
