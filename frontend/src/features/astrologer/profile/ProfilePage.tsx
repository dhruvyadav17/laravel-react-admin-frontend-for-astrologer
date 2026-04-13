/**
 * Astrologer ProfilePage -- editable profile and settings.
 *
 * Fields: photo, bio, expertise, consultation type, experience,
 * price per minute, languages (multi-select), skills (multi-select).
 *
 * All changes are submitted as PATCH /astrologer/me.
 * Photo upload uses POST /upload/image which returns a storage URL.
 *
 * TO ADD A NEW PROFILE FIELD:
 * 1. Add the column to the astrologers migration + $fillable in Astrologer model.
 * 2. Add the field to AstrologerProfileController@update validation.
 * 3. Add an input below and include the key in the formData submission.
 */
import { useEffect, useState }           from "react";
import { useMyAstrologerProfileQuery, useUpdateMyProfileMutation } from "../../../store/api/astrologer.api";
import { toast }                          from "react-toastify";
import ImageUpload                        from "../../../components/ui/ImageUpload";
import { PageLoader }                     from "../../../components/ui/States";
import {
  EXPERTISE_OPTIONS, LANGUAGE_OPTIONS, SKILL_OPTIONS, CONSULTATION_TYPE_OPTIONS,
} from "../../../constants/astrologer";
import type { ConsultationType } from "../../../types/models";

function ChipButton({ label, checked, onToggle, color }: {
  label: string; checked: boolean; onToggle: () => void; color: string;
}) {
  return (
    <button type="button" onClick={onToggle}
      className={`btn btn-sm ${checked ? `btn-${color}` : "btn-outline-secondary"}`}
      style={{ fontSize: 12 }}>
      {checked && <i className="fas fa-check me-1" style={{ fontSize: 10 }} />}
      {label}
    </button>
  );
}

const EMPTY_FORM = {
  bio: "", expertise: "", experience: 0, price_per_minute: 0,
  consultation_type: "all" as ConsultationType,
  languages: [] as string[], skills: [] as string[], profile_image: "",
};

export default function ProfilePage() {
  const { data, isLoading }             = useMyAstrologerProfileQuery();
  const [update, { isLoading: saving }] = useUpdateMyProfileMutation();
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [isDirty, setIsDirty]           = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        bio:               data.bio               ?? "",
        expertise:         data.expertise         ?? "",
        experience:        data.experience        ?? 0,
        price_per_minute:  data.price_per_minute  ?? 0,
        consultation_type: data.consultation_type ?? "all",
        languages:         data.languages         ?? [],
        skills:            data.skills            ?? [],
        profile_image:     data.profile_image     ?? "",
      });
      setIsDirty(false);
    }
  }, [data]);

  const set = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const toggleChip = (key: "languages" | "skills", val: string) => {
    const arr = form[key];
    set(key, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update(form).unwrap();
      toast.success("Profile updated successfully!");
      setIsDirty(false);
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>

        <div className="app-card">
          <div className="d-flex align-items-center justify-content-between pb-3 mb-3" style={{ borderBottom: "1px solid var(--bdr)" }}>
            <h5 className="fw-bold t-main mb-0">
              <i className="fas fa-user-edit me-2 text-primary" />Edit My Profile
            </h5>
            {isDirty && (
              <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(234,179,8,.15)", color:"#ca8a04", border:"1px solid rgba(234,179,8,.3)" }}>
                <i className="fas fa-circle me-1" style={{ fontSize: 8 }} />Unsaved changes
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <div className="row g-4">

                {/* Profile image upload -- NEW FEATURE */}
                <div className="col-12 text-center">
                  <label className="form-label fw-semibold d-block mb-3">Profile Photo</label>
                  <ImageUpload
                    currentUrl={form.profile_image || null}
                    onUpload={(url) => set("profile_image", url)}
                    name={data?.name ?? ""}
                    size={96}
                  />
                </div>

                {/* Bio */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Bio <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows={4} value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Describe your expertise and experience..." minLength={20} required />
                  <div className={`form-text ${form.bio.length < 20 ? "text-danger" : "t-muted"}`}>
                    {form.bio.length} characters (min 20)
                  </div>
                </div>

                {/* Expertise */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Expertise <span className="text-danger">*</span></label>
                  <select className="form-select" value={form.expertise}
                    onChange={(e) => set("expertise", e.target.value)} required>
                    <option value="">Select your main expertise</option>
                    {EXPERTISE_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* Consultation type */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Consultation Type</label>
                  <select className="form-select" value={form.consultation_type}
                    onChange={(e) => set("consultation_type", e.target.value as ConsultationType)}>
                    {CONSULTATION_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Experience */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Experience (years) <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={form.experience}
                    min={0} max={50} required
                    onChange={(e) => set("experience", parseInt(e.target.value, 10))} />
                </div>

                {/* Price */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Price per Minute (₹) <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input type="number" className="form-control" value={form.price_per_minute}
                      min={1} max={10000} step={0.5} required
                      onChange={(e) => set("price_per_minute", parseFloat(e.target.value))} />
                    <span className="input-group-text">/min</span>
                  </div>
                </div>

                {/* Languages */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Languages Spoken</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <ChipButton key={lang} label={lang} checked={form.languages.includes(lang)}
                        onToggle={() => toggleChip("languages", lang)} color="primary" />
                    ))}
                  </div>
                  {form.languages.length === 0 && (
                    <div className="t-muted small mt-1">Select at least one language</div>
                  )}
                </div>

                {/* Skills */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Skills</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {SKILL_OPTIONS.map((skill) => (
                      <ChipButton key={skill} label={skill} checked={form.skills.includes(skill)}
                        onToggle={() => toggleChip("skills", skill)} color="success" />
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div className="d-flex align-items-center gap-3 pt-3 mt-3" style={{ borderTop: "1px solid var(--bdr)" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        : <><i className="fas fa-save me-2" />Save Profile</>}
              </button>
              <small className="t-muted">
                {saving ? "Saving..." : isDirty ? "You have unsaved changes." : "All changes saved."}
              </small>
            </div>
          </form>
        </div>
    </>
  );
}
