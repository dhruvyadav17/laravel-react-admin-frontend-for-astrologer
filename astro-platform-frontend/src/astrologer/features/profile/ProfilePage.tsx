import { useEffect, useState } from "react";
import {
  useMyAstrologerProfileQuery,
  useUpdateMyProfileMutation,
} from "../../../store/api/astrologer.api";
import { toast } from "react-toastify";
import type { ConsultationType } from "../../../types/models";

const EXPERTISE_LIST = [
  "Vedic Astrology","KP Astrology","Numerology","Tarot Reading",
  "Vastu Shastra","Palmistry","Lal Kitab","Nadi Astrology",
];

const LANGUAGE_LIST = [
  "Hindi","English","Tamil","Telugu","Marathi","Bengali","Gujarati","Kannada",
];

const SKILL_LIST = [
  "Kundli","Match Making","Career","Finance","Health","Love","Marriage","Education","Business",
];

/* =====================================================
 | CHIP TOGGLE BUTTON
 ===================================================== */
function ChipButton({
  label,
  checked,
  onToggle,
  color,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`btn btn-sm ${
        checked ? `btn-${color}` : "btn-outline-secondary"
      }`}
      style={{ fontSize: 12 }}
    >
      {checked && <i className="fas fa-check me-1" style={{ fontSize: 10 }} />}
      {label}
    </button>
  );
}

/* =====================================================
 | MAIN PAGE
 ===================================================== */
export default function ProfilePage() {
  const { data, isLoading }            = useMyAstrologerProfileQuery();
  const [update, { isLoading: saving }] = useUpdateMyProfileMutation();

  const [form, setForm] = useState({
    bio:               "",
    expertise:         "",
    experience:        0,
    price_per_minute:  0,
    consultation_type: "all" as ConsultationType,
    languages:         [] as string[],
    skills:            [] as string[],
  });

  /* Sync with fetched data */
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
      });
    }
  }, [data]);

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleChip = (key: "languages" | "skills", val: string) => {
    const arr = form[key];
    set(key, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update(form).unwrap();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <section className="content pt-3">
      <div className="container-fluid">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-user-edit me-2 text-primary" />
              Edit My Profile
            </h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card-body">
              <div className="row g-3">

                {/* BIO */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Bio <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Describe your expertise and experience in detail..."
                    minLength={20}
                    required
                  />
                  <div className="form-text">
                    {form.bio.length} characters (min 20)
                  </div>
                </div>

                {/* EXPERTISE */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Expertise <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.expertise}
                    onChange={(e) => set("expertise", e.target.value)}
                    required
                  >
                    <option value="">Select your main expertise</option>
                    {EXPERTISE_LIST.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                {/* CONSULTATION TYPE */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Consultation Type
                  </label>
                  <select
                    className="form-select"
                    value={form.consultation_type}
                    onChange={(e) =>
                      set("consultation_type", e.target.value as ConsultationType)
                    }
                  >
                    <option value="all">All — Chat, Call & Video</option>
                    <option value="chat">Chat Only</option>
                    <option value="call">Call Only</option>
                    <option value="video">Video Only</option>
                  </select>
                </div>

                {/* EXPERIENCE */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Experience (years) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.experience}
                    min={0}
                    max={50}
                    required
                    onChange={(e) =>
                      set("experience", parseInt(e.target.value, 10))
                    }
                  />
                </div>

                {/* PRICE */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Price per Minute (₹) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      value={form.price_per_minute}
                      min={1}
                      max={10000}
                      step={0.5}
                      required
                      onChange={(e) =>
                        set("price_per_minute", parseFloat(e.target.value))
                      }
                    />
                    <span className="input-group-text">/min</span>
                  </div>
                </div>

                {/* LANGUAGES */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Languages Spoken
                  </label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {LANGUAGE_LIST.map((lang) => (
                      <ChipButton
                        key={lang}
                        label={lang}
                        checked={form.languages.includes(lang)}
                        onToggle={() => toggleChip("languages", lang)}
                        color="primary"
                      />
                    ))}
                  </div>
                  {form.languages.length === 0 && (
                    <div className="text-muted small mt-1">
                      Select at least one language
                    </div>
                  )}
                </div>

                {/* SKILLS */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Skills</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {SKILL_LIST.map((skill) => (
                      <ChipButton
                        key={skill}
                        label={skill}
                        checked={form.skills.includes(skill)}
                        onToggle={() => toggleChip("skills", skill)}
                        color="success"
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div className="card-footer d-flex align-items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2" />
                    Save Profile
                  </>
                )}
              </button>
              {!saving && (
                <small className="text-muted">
                  Changes are saved immediately and visible to users.
                </small>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}