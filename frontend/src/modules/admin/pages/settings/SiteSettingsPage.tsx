/**
 * SiteSettingsPage — Admin editor for all site content.
 * Tabs: Contact | About | FAQ | Horoscope | Privacy | Terms
 *
 * FIXES:
 * - Tab switch warns user if unsaved changes exist
 * - formData resets immediately on tab change (not stale data)
 * - 'SiteSettings' properly typed (no `as any`)
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import AdminPage from '../../components/AdminPage';
import {
  useAdminGetSettingsQuery,
  useAdminUpdateSettingsMutation,
} from '../../../../store/settings.api';

/* ── Reusable field ──────────────────────────────── */
function Field({ label, name, value, onChange, type = 'text', rows = 3 }: {
  label: string; name: string; value: string;
  onChange: (k: string, v: string) => void;
  type?: 'text' | 'textarea' | 'email' | 'url'; rows?: number;
}) {
  return (
    <div className="mb-3">
      <label className="form-label small fw-semibold t-main">{label}</label>
      {type === 'textarea'
        ? <textarea className="form-control form-control-sm" rows={rows}
            value={value ?? ''} onChange={e => onChange(name, e.target.value)} />
        : <input type={type} className="form-control form-control-sm"
            value={value ?? ''} onChange={e => onChange(name, e.target.value)} />}
    </div>
  );
}

/* ── FAQ Editor ──────────────────────────────────── */
function FaqEditor({ value = [], onChange }: {
  value: { category: string; items: { q: string; a: string }[] }[];
  onChange: (v: any) => void;
}) {
  const addCat    = () => onChange([...value, { category: 'New Category', items: [] }]);
  const removeCat = (ci: number) => onChange(value.filter((_, i) => i !== ci));
  const updateCat = (ci: number, cat: string) => {
    const n = [...value]; n[ci] = { ...n[ci], category: cat }; onChange(n);
  };
  const addItem    = (ci: number) => {
    const n = [...value]; n[ci] = { ...n[ci], items: [...n[ci].items, { q: '', a: '' }] }; onChange(n);
  };
  const removeItem = (ci: number, ii: number) => {
    const n = [...value]; n[ci] = { ...n[ci], items: n[ci].items.filter((_,i) => i !== ii) }; onChange(n);
  };
  const updateItem = (ci: number, ii: number, field: 'q'|'a', val: string) => {
    const n = [...value], items = [...n[ci].items];
    items[ii] = { ...items[ii], [field]: val }; n[ci] = { ...n[ci], items }; onChange(n);
  };

  return (
    <div>
      {value.map((section, ci) => (
        <div key={ci} className="mb-4 p-3 rounded-3" style={{ border:'1px solid var(--bdr)', background:'var(--surf2)' }}>
          <div className="d-flex gap-2 mb-3">
            <input className="form-control form-control-sm fw-semibold"
              value={section.category} onChange={e => updateCat(ci, e.target.value)} placeholder="Category name" />
            <button className="btn btn-sm btn-outline-danger px-2" onClick={() => removeCat(ci)}>
              <i className="fas fa-trash" />
            </button>
          </div>
          {section.items.map((item, ii) => (
            <div key={ii} className="mb-3 p-2 rounded-2" style={{ background:'var(--surf)', border:'1px solid var(--bdr)' }}>
              <div className="d-flex gap-1 mb-2">
                <input className="form-control form-control-sm" value={item.q}
                  onChange={e => updateItem(ci, ii, 'q', e.target.value)} placeholder="Question" />
                <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => removeItem(ci, ii)}>
                  <i className="fas fa-times" />
                </button>
              </div>
              <textarea className="form-control form-control-sm" rows={2} value={item.a}
                onChange={e => updateItem(ci, ii, 'a', e.target.value)} placeholder="Answer" />
            </div>
          ))}
          <button className="btn btn-sm btn-outline-primary" onClick={() => addItem(ci)}>
            <i className="fas fa-plus me-1" />Add Question
          </button>
        </div>
      ))}
      <button className="btn btn-sm btn-outline-secondary" onClick={addCat}>
        <i className="fas fa-plus me-1" />Add Category
      </button>
    </div>
  );
}

/* ── Generic JSON Array Editor ───────────────────── */
function JsonArrayEditor({ value = [], fields, onChange }: {
  value: Record<string, string>[];
  fields: { key: string; label: string }[];
  onChange: (v: any) => void;
}) {
  const add = () => {
    const blank: Record<string, string> = {};
    fields.forEach(f => { blank[f.key] = ''; });
    onChange([...value, blank]);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, val: string) => {
    const n = [...value]; n[i] = { ...n[i], [key]: val }; onChange(n);
  };
  return (
    <div>
      {value.map((item, i) => (
        <div key={i} className="d-flex gap-2 mb-2 p-2 rounded-2"
          style={{ background:'var(--surf2)', border:'1px solid var(--bdr)' }}>
          {fields.map(f => (
            <input key={f.key} className="form-control form-control-sm"
              value={item[f.key] ?? ''} placeholder={f.label}
              onChange={e => update(i, f.key, e.target.value)} />
          ))}
          <button className="btn btn-sm btn-outline-danger px-2" onClick={() => remove(i)}>
            <i className="fas fa-times" />
          </button>
        </div>
      ))}
      <button className="btn btn-sm btn-outline-primary" onClick={add}>
        <i className="fas fa-plus me-1" />Add Row
      </button>
    </div>
  );
}

/* ── Section Editor (Privacy/Terms) ──────────────── */
function SectionEditor({ value = [], onChange }: {
  value: { title: string; content: string }[];
  onChange: (v: any) => void;
}) {
  const add    = () => onChange([...value, { title: '', content: '' }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'title'|'content', val: string) => {
    const n = [...value]; n[i] = { ...n[i], [field]: val }; onChange(n);
  };
  return (
    <div>
      {value.map((s, i) => (
        <div key={i} className="mb-3 p-3 rounded-3" style={{ border:'1px solid var(--bdr)', background:'var(--surf2)' }}>
          <div className="d-flex gap-2 mb-2">
            <input className="form-control form-control-sm fw-semibold" value={s.title}
              placeholder="Section title" onChange={e => update(i, 'title', e.target.value)} />
            <button className="btn btn-sm btn-outline-danger px-2" onClick={() => remove(i)}>
              <i className="fas fa-trash" />
            </button>
          </div>
          <textarea className="form-control form-control-sm" rows={4} value={s.content}
            placeholder="Section content (use • for bullet points)"
            onChange={e => update(i, 'content', e.target.value)} />
        </div>
      ))}
      <button className="btn btn-sm btn-outline-secondary" onClick={add}>
        <i className="fas fa-plus me-1" />Add Section
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const TABS = [
  { key: 'contact',   label: 'Contact',   icon: 'fa-phone'       },
  { key: 'about',     label: 'About Us',  icon: 'fa-info-circle' },
  { key: 'faq',       label: 'FAQ',       icon: 'fa-question'    },
  { key: 'horoscope', label: 'Horoscope', icon: 'fa-moon'        },
  { key: 'privacy',   label: 'Privacy',   icon: 'fa-lock'        },
  { key: 'terms',     label: 'Terms',     icon: 'fa-file-alt'    },
];

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData,  setFormData]  = useState<Record<string, any>>({});
  const [isDirty,   setIsDirty]   = useState(false);

  const { data: settings, isLoading, isFetching } = useAdminGetSettingsQuery(activeTab);
  const [updateSettings, { isLoading: saving }]   = useAdminUpdateSettingsMutation();

  // Sync form with fetched settings — reset dirty flag
  useEffect(() => {
    if (settings && !isFetching) {
      setFormData({ ...settings });
      setIsDirty(false);
    }
  }, [settings, isFetching]);

  // Tab switch — warn if dirty, reset form immediately to avoid stale data
  const handleTabSwitch = useCallback((tabKey: string) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Switch tab and discard them?')) return;
    }
    setFormData({});   // Clear immediately so old tab data doesn't flash
    setIsDirty(false);
    setActiveTab(tabKey);
  }, [isDirty]);

  const set = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings({ group: activeTab, data: formData }).unwrap();
      toast.success('Settings saved successfully!');
      setIsDirty(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to save settings.');
    }
  };

  const f = formData;
  const loading = isLoading || (isFetching && Object.keys(f).length === 0);

  return (
    <AdminPage title="Site Settings">

      {/* Tab navigation */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {TABS.map(tab => (
          <button key={tab.key}
            className={`btn btn-sm fw-semibold ${activeTab === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ borderRadius: 20, position: 'relative' }}
            onClick={() => handleTabSwitch(tab.key)}>
            <i className={`fas ${tab.icon} me-1`} />{tab.label}
            {activeTab === tab.key && isDirty && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning"
                style={{ fontSize: 8 }}>!</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="t-muted small mt-2">Loading settings...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center py-3">
            <h6 className="mb-0 fw-semibold t-main">
              <i className={`fas ${TABS.find(t => t.key === activeTab)?.icon} me-2`} />
              {TABS.find(t => t.key === activeTab)?.label} Settings
            </h6>
            <div className="d-flex align-items-center gap-3">
              {isDirty && (
                <span className="badge text-warning-emphasis bg-warning-subtle border border-warning-subtle small">
                  ● Unsaved changes
                </span>
              )}
              <button className="btn btn-primary btn-sm px-4"
                onClick={handleSave} disabled={saving || !isDirty}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</>
                  : <><i className="fas fa-save me-1" />Save Changes</>}
              </button>
            </div>
          </div>

          <div className="card-body">

            {/* ── CONTACT ── */}
            {activeTab === 'contact' && (
              <div className="row g-3">
                <div className="col-md-6">
                  <h6 className="fw-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--bdr)' }}>
                    <i className="fas fa-address-card me-2 text-primary" />Contact Information
                  </h6>
                  <Field label="Support Email"   name="contact_email"    value={f.contact_email    ?? ''} onChange={set} type="email" />
                  <Field label="Phone Number"    name="contact_phone"    value={f.contact_phone    ?? ''} onChange={set} />
                  <Field label="Working Hours"   name="contact_hours"    value={f.contact_hours    ?? ''} onChange={set} />
                  <Field label="Office Location" name="contact_location" value={f.contact_location ?? ''} onChange={set} />
                </div>
                <div className="col-md-6">
                  <h6 className="fw-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--bdr)' }}>
                    <i className="fas fa-share-alt me-2 text-primary" />Social Media Links
                  </h6>
                  <Field label="Instagram URL" name="social_instagram" value={f.social_instagram ?? ''} onChange={set} type="url" />
                  <Field label="YouTube URL"   name="social_youtube"   value={f.social_youtube   ?? ''} onChange={set} type="url" />
                  <Field label="Twitter/X URL" name="social_twitter"   value={f.social_twitter   ?? ''} onChange={set} type="url" />
                  <Field label="Facebook URL"  name="social_facebook"  value={f.social_facebook  ?? ''} onChange={set} type="url" />
                </div>
              </div>
            )}

            {/* ── ABOUT ── */}
            {activeTab === 'about' && (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <Field label="Hero Title"       name="about_hero_title" value={f.about_hero_title ?? ''} onChange={set} />
                  </div>
                  <div className="col-12">
                    <Field label="Hero Description" name="about_hero_desc"  value={f.about_hero_desc  ?? ''} onChange={set} type="textarea" rows={3} />
                  </div>
                  <div className="col-12">
                    <Field label="Mission Text (use blank line between paragraphs)"
                      name="about_mission" value={f.about_mission ?? ''} onChange={set} type="textarea" rows={6} />
                  </div>
                  <div className="col-12">
                    <Field label="Founded Text (e.g. Founded in 2024 · India)"
                      name="about_founded" value={f.about_founded ?? ''} onChange={set} />
                  </div>
                </div>
                <h6 className="fw-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <i className="fas fa-chart-bar me-2 text-primary" />Stats (shown on About page)
                </h6>
                <div className="mb-4">
                  <JsonArrayEditor
                    value={Array.isArray(f.about_stats) ? f.about_stats : []}
                    fields={[{ key: 'value', label: 'Value e.g. 500+' }, { key: 'label', label: 'Label' }]}
                    onChange={v => set('about_stats', v)}
                  />
                </div>
                <h6 className="fw-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <i className="fas fa-users me-2 text-primary" />Team Members
                </h6>
                <JsonArrayEditor
                  value={Array.isArray(f.about_team) ? f.about_team : []}
                  fields={[
                    { key: 'name',      label: 'Full Name'  },
                    { key: 'role',      label: 'Role/Title' },
                    { key: 'expertise', label: 'Expertise'  },
                  ]}
                  onChange={v => set('about_team', v)}
                />
              </div>
            )}

            {/* ── FAQ ── */}
            {activeTab === 'faq' && (
              <div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-4 small"
                  style={{ background:'rgba(14,165,233,.08)', border:'1px solid rgba(14,165,233,.2)', color:'#0284c7' }}>
                  <i className="fas fa-info-circle" />
                  Add categories and questions below. Changes appear live on the website after saving.
                </div>
                <FaqEditor
                  value={Array.isArray(f.faq_items) ? f.faq_items : []}
                  onChange={v => set('faq_items', v)}
                />
              </div>
            )}

            {/* ── HOROSCOPE ── */}
            {activeTab === 'horoscope' && (
              <div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-4 small"
                  style={{ background:'rgba(14,165,233,.08)', border:'1px solid rgba(14,165,233,.2)', color:'#0284c7' }}>
                  <i className="fas fa-info-circle" />
                  Edit daily predictions for each zodiac sign. Save when done.
                </div>
                {Object.keys(f.horoscope_predictions ?? {}).map(sign => (
                  <div key={sign} className="mb-4 p-3 rounded-3"
                    style={{ border:'1px solid var(--bdr)', background:'var(--surf2)' }}>
                    <h6 className="fw-bold text-danger mb-3">
                      <i className="fas fa-star-of-david me-2" />{sign}
                    </h6>
                    <div className="row g-2">
                      {(['love','career','health','lucky'] as const).map(field => (
                        <div key={field} className={field === 'lucky' ? 'col-12' : 'col-md-4'}>
                          <label className="form-label small fw-semibold text-capitalize">{field}</label>
                          <input className="form-control form-control-sm"
                            value={f.horoscope_predictions?.[sign]?.[field] ?? ''}
                            onChange={e => {
                              const updated = {
                                ...f.horoscope_predictions,
                                [sign]: { ...f.horoscope_predictions?.[sign], [field]: e.target.value },
                              };
                              set('horoscope_predictions', updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── PRIVACY ── */}
            {activeTab === 'privacy' && (
              <div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-4 small"
                  style={{ background:'rgba(14,165,233,.08)', border:'1px solid rgba(14,165,233,.2)', color:'#0284c7' }}>
                  <i className="fas fa-info-circle" />
                  Use • or * for bullet points in section content.
                </div>
                <SectionEditor
                  value={Array.isArray(f.privacy_content) ? f.privacy_content : []}
                  onChange={v => set('privacy_content', v)}
                />
              </div>
            )}

            {/* ── TERMS ── */}
            {activeTab === 'terms' && (
              <div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-4 small"
                  style={{ background:'rgba(14,165,233,.08)', border:'1px solid rgba(14,165,233,.2)', color:'#0284c7' }}>
                  <i className="fas fa-info-circle" />
                  Use • or * for bullet points in section content.
                </div>
                <SectionEditor
                  value={Array.isArray(f.terms_content) ? f.terms_content : []}
                  onChange={v => set('terms_content', v)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}
