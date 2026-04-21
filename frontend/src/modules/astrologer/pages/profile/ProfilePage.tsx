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
import React, { useEffect, useState } from "react";
import { useChangePasswordMutation }     from "../../../../store/user.api";
import { useMyAstrologerProfileQuery, useUpdateMyProfileMutation } from "../../../../store/astrologer.api";
import { toast }                          from "react-toastify";
import ImageUpload                        from "../../../../components/ui/ImageUpload";
import { PageLoader }                     from "../../../../components/ui/States";
import {
  EXPERTISE_OPTIONS, LANGUAGE_OPTIONS, SKILL_OPTIONS, CONSULTATION_TYPE_OPTIONS,
} from "../../../../constants/astrologer";
import type { ConsultationType } from "../../../../types/models";

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

// Gallery image upload button
function GalleryUploadBtn({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await (await import("../../../../api/axios")).default.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.url;
      if (url) onUpload(url);
    } catch { } finally { setUploading(false); }
  };

  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="d-none"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button type="button"
        className="d-flex align-items-center justify-content-center flex-column gap-1"
        style={{ width: 80, height: 80, border: '2px dashed var(--bdr2)', borderRadius: 8,
                 background: 'var(--surf2)', cursor: 'pointer', color: 'var(--txt-m)', fontSize: 11 }}
        onClick={() => ref.current?.click()} disabled={uploading}>
        {uploading
          ? <span className="spinner-border spinner-border-sm" />
          : <><i className="fas fa-plus" style={{ fontSize: 20 }} /><span>Add Photo</span></>}
      </button>
    </>
  );
}

const EMPTY_FORM = {
  bio: "", expertise: "", experience: 0, price_per_minute: 0,
  consultation_type: "all" as ConsultationType,
  languages: [] as string[], skills: [] as string[], profile_image: "",
  gallery: [] as string[],
};

export default function ProfilePage() {
  const { data, isLoading }             = useMyAstrologerProfileQuery();
  const [update, { isLoading: saving }] = useUpdateMyProfileMutation();
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [isDirty, setIsDirty]           = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      import("react-toastify").then(m => m.toast.error("Passwords do not match"));
      return;
    }
    try {
      await changePassword(pwForm).unwrap();
      import("react-toastify").then(m => m.toast.success("Password changed successfully!"));
      setShowPasswordModal(false);
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err: any) {
      import("react-toastify").then(m => m.toast.error(err?.data?.message ?? "Failed to change password"));
    }
  };

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
        gallery:           Array.isArray(data.gallery) ? data.gallery : [],
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
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.55)", zIndex: 1050 }}
          onClick={e => e.target === e.currentTarget && setShowPasswordModal(false)}>
          <div className="rounded-4 p-4 shadow-lg" style={{ width: 380, background: "var(--surf)", border: "1px solid var(--bdr)" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold t-main mb-0"><i className="fas fa-key me-2" />Change Password</h6>
              <button className="btn-close" onClick={() => setShowPasswordModal(false)} />
            </div>
            <form onSubmit={handleChangePw}>
              {[
                { field: 'current_password', label: 'Current Password' },
                { field: 'new_password', label: 'New Password (min 8)' },
                { field: 'new_password_confirmation', label: 'Confirm New Password' },
              ].map(({ field, label }) => (
                <div key={field} className="mb-3">
                  <label className="form-label small fw-semibold">{label}</label>
                  <input type="password" className="form-control"
                    value={(pwForm as any)[field]}
                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                    required minLength={field === 'current_password' ? 1 : 8} />
                </div>
              ))}
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary flex-grow-1"
                  onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-grow-1" disabled={changingPw}>
                  {changingPw ? <span className="spinner-border spinner-border-sm" /> : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

                {/* Gallery Images */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Gallery Photos</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {(form.gallery ?? []).map((url, i) => (
                      <div key={i} className="position-relative" style={{ width: 80, height: 80 }}>
                        <img src={url} alt="gallery"
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--bdr)' }}
                          onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                        />
                        <button type="button"
                          className="position-absolute top-0 end-0 btn btn-danger btn-sm p-0 d-flex align-items-center justify-content-center"
                          style={{ width: 20, height: 20, borderRadius: '50%', fontSize: 10 }}
                          onClick={() => set("gallery", form.gallery.filter((_: string, idx: number) => idx !== i))}>
                          ×
                        </button>
                      </div>
                    ))}
                    {(form.gallery ?? []).length < 6 && (
                      <GalleryUploadBtn onUpload={(url) => set("gallery", [...(form.gallery ?? []), url])} />
                    )}
                  </div>
                  <div className="t-muted small mt-1">
                    Add up to 6 photos to showcase your workspace ({(form.gallery ?? []).length}/6)
                  </div>
                </div>

            <div className="d-flex align-items-center justify-content-between gap-3 pt-3 mt-3" style={{ borderTop: "1px solid var(--bdr)" }}>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                          : <><i className="fas fa-save me-2" />Save Profile</>}
                </button>
                <small className="t-muted d-flex align-items-center">
                  {saving ? "Saving..." : isDirty ? "You have unsaved changes." : "All changes saved."}
                </small>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowPasswordModal(true)}>
                <i className="fas fa-key me-1" />Change Password
              </button>
            </div>
          </form>
        </div>
    </>
  );
}
