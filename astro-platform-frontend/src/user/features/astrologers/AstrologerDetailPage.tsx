// PATH: src/user/features/astrologers/AstrologerDetailPage.tsx
// FEATURE: Review pagination — Load More button
// FEATURE: Weekly schedule display
// FEATURE: Price estimate (5min/10min/15min cost)

import { useState }           from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetAstrologerQuery,
  useGetAstrologerReviewsQuery,
  useSubmitReviewMutation,
} from "../../../store/api/astrologer.api";
import { useAuth }    from "../../../auth/hooks/useAuth";
import { toast }      from "react-toastify";
import { CONSULTATION_LABELS, DAY_NAMES } from "../../../constants/astrologer";
import type { Review, AstrologerSchedule } from "../../../types/models";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.round(Math.min(Math.max(rating, 0), 5));
  return (
    <span style={{ fontSize: size }}>
      {"★".repeat(full)}
      <span className="text-muted">{"☆".repeat(5 - full)}</span>
    </span>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="border-bottom py-3">
      <div className="d-flex align-items-center gap-2 mb-1">
        {review.user.profile_image ? (
          <img src={review.user.profile_image} alt={review.user.name}
            className="rounded-circle flex-shrink-0"
            style={{ width: 36, height: 36, objectFit: "cover" }} />
        ) : (
          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 36, height: 36, fontSize: 14 }}>
            {review.user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-grow-1">
          <div className="fw-semibold small">{review.user.name}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{review.created_at}</div>
        </div>
        <Stars rating={review.rating} size={14} />
      </div>
      {review.comment && (
        <p className="mb-0 text-muted ps-5" style={{ fontSize: 14 }}>{review.comment}</p>
      )}
    </div>
  );
}

function WeeklySchedule({ schedules }: { schedules: AstrologerSchedule[] }) {
  const active = schedules.filter((s) => s.is_active);
  if (!active.length) return null;

  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="app-card mb-4">
      <h5 className="section-title mb-3">
        <i className="fas fa-calendar-alt me-2" />Weekly Availability
      </h5>
      <div className="d-flex flex-column gap-1">
        {DAY_NAMES.map((day, idx) => {
          const slot = active.find((s) => s.day_of_week === idx);
          return (
            <div key={day} className="d-flex align-items-center justify-content-between py-2 border-bottom">
              <span className={`fw-semibold small ${slot ? "" : "text-muted"}`} style={{ width: 100 }}>
                {day}
              </span>
              {slot ? (
                <span className="badge bg-success-subtle text-success border px-3" style={{ fontSize: 12 }}>
                  <i className="fas fa-check me-1" style={{ fontSize: 10 }} />
                  {fmt(slot.start_time)} – {fmt(slot.end_time)}
                </span>
              ) : (
                <span className="badge bg-secondary-subtle text-secondary border px-3" style={{ fontSize: 12 }}>
                  Day off
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AstrologerDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuth, hasRole } = useAuth();
  const astroId  = parseInt(id ?? "0", 10);

  const { data: astro, isLoading, isError } = useGetAstrologerQuery(astroId, { skip: !astroId });

  const [reviewPage, setReviewPage]     = useState(1);
  const [accumulated, setAccumulated]   = useState<Review[]>([]);

  const { data: reviewsData, isFetching: reviewsFetching } = useGetAstrologerReviewsQuery(
    { id: astroId, page: reviewPage }, { skip: !astroId }
  );

  const pageReviews = reviewsData?.data ?? [];
  const pagination  = reviewsData?.pagination ?? null;
  const hasMore     = pagination ? pagination.current_page < pagination.last_page : false;

  const displayed = (() => {
    const merged = [...accumulated];
    pageReviews.forEach((r) => { if (!merged.find((m) => m.id === r.id)) merged.push(r); });
    return merged;
  })();

  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation();
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [showForm, setShowForm]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuth) { navigate("/login", { state: { from: { pathname: `/astrologers/${astroId}` } } }); return; }
    try {
      await submitReview({ astrologerId: astroId, ...reviewForm }).unwrap();
      toast.success("Review submitted!");
      setShowForm(false);
      setReviewForm({ rating: 5, comment: "" });
      setAccumulated([]); setReviewPage(1);
    } catch (err: any) { toast.error(err?.data?.message ?? "Failed to submit."); }
  };

  if (isLoading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} role="status" />
      <p className="text-muted mt-3">Loading profile...</p>
    </div>
  );

  if (isError || !astro) return (
    <div className="container py-5 text-center">
      <i className="fas fa-exclamation-triangle text-danger fa-3x d-block mb-3" />
      <h4>Astrologer not found</h4>
      <button className="btn btn-outline-primary mt-3" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left me-2" />Go Back
      </button>
    </div>
  );

  const available = astro.is_online && astro.is_available;
  const avatar    = astro.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(astro.name)}&background=e63946&color=fff`;
  const schedules = (astro.schedules ?? []) as AstrologerSchedule[];

  return (
    <div className="container py-4">
      <button className="btn btn-link ps-0 mb-3 text-muted text-decoration-none" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left me-2" />Back
      </button>

      <div className="row g-4">
        {/* LEFT */}
        <div className="col-lg-4">
          <div className="app-card text-center sticky-top astro-detail-card">
            <div className="astro-img-wrap mb-3 mx-auto" style={{ width: "fit-content" }}>
              <img src={avatar} alt={astro.name} />
              <span className={`online-dot ${available ? "on" : ""}`} />
            </div>
            <h4 className="fw-bold mb-1">{astro.name}</h4>
            <p className="text-muted mb-2">{astro.expertise || "Astrology Expert"}</p>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <Stars rating={astro.rating} size={18} />
              <span className="fw-semibold">{astro.rating?.toFixed(1)}</span>
              <span className="text-muted small">({astro.total_reviews})</span>
            </div>
            <div className="row g-0 text-center border rounded my-3">
              <div className="col-4 py-2">
                <div className="fw-bold">{astro.experience}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Yrs Exp</div>
              </div>
              <div className="col-4 py-2 border-start border-end">
                <div className="fw-bold">{astro.total_consultations ?? 0}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Consults</div>
              </div>
              <div className="col-4 py-2">
                <div className="fw-bold">{astro.total_reviews}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Reviews</div>
              </div>
            </div>

            {/* Price + estimates */}
            <div className="mb-2">
              <span className="text-danger fw-bold fs-4">₹{astro.price_per_minute}</span>
              <span className="text-muted small"> / min</span>
            </div>
            <div className="d-flex justify-content-center gap-3 mb-3">
              {[5, 10, 15].map((min) => (
                <div key={min} className="text-center">
                  <div className="small fw-semibold">₹{astro.price_per_minute * min}</div>
                  <div className="text-muted" style={{ fontSize: 10 }}>{min} min</div>
                </div>
              ))}
            </div>

            {astro.is_verified && (
              <span className="badge bg-success mb-3 d-inline-block">
                <i className="fas fa-check-circle me-1" />Verified
              </span>
            )}
            <div className="mb-3">
              <span className={`badge px-3 py-2 ${available ? "bg-success" : "bg-secondary"}`}>
                {available ? "Available Now" : "Currently Offline"}
              </span>
            </div>
            {available ? (
              <button className="btn btn-call w-100"><i className="fas fa-phone me-2" />Talk Now</button>
            ) : (
              <button className="btn btn-outline-secondary w-100" disabled>
                <i className="fas fa-clock me-2" />Offline
              </button>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-8">
          <div className="app-card mb-4">
            <h5 className="section-title mb-3">About</h5>
            <p className="text-muted mb-0" style={{ lineHeight: 1.8 }}>{astro.bio || "No bio available."}</p>
          </div>

          {astro.skills?.length > 0 && (
            <div className="app-card mb-4">
              <h5 className="section-title mb-3">Specialization</h5>
              <div className="d-flex flex-wrap gap-2">
                {astro.skills.map((s, i) => <span key={i} className="badge badge-accent px-3 py-2">{s}</span>)}
              </div>
            </div>
          )}

          {astro.languages?.length > 0 && (
            <div className="app-card mb-4">
              <h5 className="section-title mb-3"><i className="fas fa-language me-2" />Languages</h5>
              <div className="d-flex flex-wrap gap-2">
                {astro.languages.map((l, i) => (
                  <span key={i} className="badge bg-primary-subtle text-primary border px-3 py-2">{l}</span>
                ))}
              </div>
            </div>
          )}

          <div className="app-card mb-4">
            <h5 className="section-title mb-3"><i className="fas fa-video me-2" />Consultation Via</h5>
            <span className="badge bg-info-subtle text-info border px-3 py-2">
              {CONSULTATION_LABELS[astro.consultation_type] ?? "All Modes"}
            </span>
          </div>

          {/* FEATURE: Weekly schedule */}
          <WeeklySchedule schedules={schedules} />

          {/* Reviews */}
          <div className="app-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="section-title mb-0">
                <i className="fas fa-star text-warning me-2" />Reviews ({astro.total_reviews})
              </h5>
              {!isAuth ? (
                <Link to="/login" className="btn btn-sm btn-outline-primary">Login to Review</Link>
              ) : hasRole("user") ? (
                <button className="btn btn-sm btn-outline-primary" onClick={() => setShowForm((v) => !v)}>
                  {showForm ? "Cancel" : "Write Review"}
                </button>
              ) : null}
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="border rounded p-3 mb-4 bg-light">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Your Rating</label>
                  <div className="d-flex gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <button key={star} type="button" className="btn btn-sm border-0 p-0"
                        onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                        style={{ fontSize: 32, lineHeight: 1 }}>
                        <span className={star <= reviewForm.rating ? "text-warning" : "text-muted"}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Comment <span className="text-muted small fw-normal">(optional)</span></label>
                  <textarea className="form-control" rows={3} placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                    minLength={10} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting && <span className="spinner-border spinner-border-sm me-1" />}Submit
                </button>
              </form>
            )}

            {displayed.length === 0 && !reviewsFetching ? (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-star fa-2x d-block mb-2 opacity-25" />
                <p className="mb-0">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <>
                {displayed.map((r: Review) => <ReviewItem key={r.id} review={r} />)}

                {/* FEATURE: Load more */}
                {hasMore && (
                  <div className="text-center mt-3">
                    <button className="btn btn-outline-secondary btn-sm"
                      onClick={() => { setAccumulated(displayed); setReviewPage((p) => p + 1); }}
                      disabled={reviewsFetching}>
                      {reviewsFetching
                        ? <><span className="spinner-border spinner-border-sm me-1" />Loading...</>
                        : <>Load More ({pagination!.total - displayed.length} remaining)</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
