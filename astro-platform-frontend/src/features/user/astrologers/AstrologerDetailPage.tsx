// PATH: src/user/features/astrologers/AstrologerDetailPage.tsx
// FIX: useGetAstrologerQuery import astrologer.api se (not user.api)
//      Reviews section add kiya
//      Skills rendering bug fix kiya

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetAstrologerQuery,
  useGetAstrologerReviewsQuery,
  useSubmitReviewMutation,
} from "../../../store/api/astrologer.api";
import { useAuth } from "../../../auth/hooks/useAuth";
import { toast } from "react-toastify";
import BookingModal from "../../../user/components/BookingModal";
import StarRating from "../../../components/ui/StarRating";
import Avatar from "../../../components/ui/Avatar";

/* ── Consultation label ───────────────────────────── */
const CONSULT_LABELS: Record<string, string> = {
  chat: "Chat",
  call: "Call",
  video: "Video",
  all: "Chat, Call & Video",
};

/* ── Main component ───────────────────────────────── */
export default function AstrologerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuth, hasRole } = useAuth();

  const astroId = id && !isNaN(Number(id)) ? Number(id) : null;

  const {
    data: astro,
    isLoading,
    isError,
  } = useGetAstrologerQuery(astroId, {
    skip: !astroId,
  });
  const { data: reviewsData } = useGetAstrologerReviewsQuery(
    { id: astroId!, page: 1 },
    { skip: !astroId },
  );
  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation();

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [showForm, setShowForm] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuth) {
      navigate("/login");
      return;
    }
    try {
      await submitReview({ astrologerId: astroId, ...reviewForm }).unwrap();
      toast.success("Review submitted!");
      setShowForm(false);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to submit review.");
    }
  };

  /* ── Loading ──────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          style={{ width: 48, height: 48 }}
          role="status"
        />
        <p className="text-muted mt-3">Loading astrologer profile...</p>
      </div>
    );
  }

  /* ── Error / Not found ────────────────────────────── */
  if (isError || !astro) {
    return (
      <div className="container py-5 text-center">
        <i className="fas fa-exclamation-triangle text-danger fa-3x d-block mb-3" />
        <h4>Astrologer not found</h4>
        <button
          className="btn btn-outline-primary mt-3"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left me-2" />
          Go Back
        </button>
      </div>
    );
  }

  const reviews = reviewsData?.data ?? [];
  const available = astro.is_online && astro.is_available;
  const avatar =
    astro.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(astro.name)}&background=e63946&color=fff`;

  return (
    <div className="container py-4">
      {/* Back button */}
      <button
        className="btn btn-link ps-0 mb-3 text-muted text-decoration-none"
        onClick={() => navigate(-1)}
      >
        <i className="fas fa-arrow-left me-2" />
        Back to Astrologers
      </button>

      <div className="row g-4">
        {/* ── LEFT: Profile card ─────────────────────── */}
        <div className="col-lg-4">
          <div className="app-card text-center sticky-top astro-detail-card">
            {/* Avatar + online dot */}
            <div
              className="astro-img-wrap mb-3 mx-auto"
              style={{ width: "fit-content" }}
            >
              <img src={avatar} alt={astro.name} />
              <span className={`online-dot ${available ? "on" : ""}`} />
            </div>

            <h4 className="fw-bold mb-1">{astro.name}</h4>

            <p className="text-muted mb-2">
              {astro.expertise || "Astrology Expert"}
            </p>

            {/* Rating */}
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <StarRating rating={astro.rating} size={18} />
              <span className="fw-semibold">{astro.rating?.toFixed(1)}</span>
              <span className="text-muted small">
                ({astro.total_reviews} reviews)
              </span>
            </div>

            <div className="small text-muted mb-1">
              {astro.experience || 0}+ years experience
            </div>

            {/* Quick stats */}
            <div className="row g-0 text-center border rounded my-3">
              <div className="col-4 py-2">
                <div className="fw-bold">{astro.experience}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  Yrs Exp
                </div>
              </div>
              <div className="col-4 py-2 border-start border-end">
                <div className="fw-bold">{astro.total_consultations ?? 0}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  Consults
                </div>
              </div>
              <div className="col-4 py-2">
                <div className="fw-bold">{astro.total_reviews}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  Reviews
                </div>
              </div>
            </div>

            {/* Price */}
            <h4 className="text-danger fw-bold mb-1">
              ₹{astro.price_per_minute}
              <span className="fs-6 text-muted fw-normal">/min</span>
            </h4>

            {/* Verified badge */}
            {astro.is_verified && (
              <span className="badge bg-success mb-3 d-inline-block">
                <i className="fas fa-check-circle me-1" />
                Verified
              </span>
            )}

            {/* Status */}
            <div className="mb-3">
              <span
                className={`badge px-3 py-2 ${available ? "bg-success" : "bg-secondary"}`}
              >
                <i className="fas fa-circle me-1" style={{ fontSize: 8 }} />
                {available ? "Available Now" : "Currently Offline"}
              </span>
            </div>

            {/* CTA */}
            {available ? (
              <button
                className="btn btn-call w-100"
                onClick={() => setShowBooking(true)}
              >
                <i className="fas fa-phone me-2" />
                Talk Now
              </button>
            ) : (
              <button className="btn btn-outline-secondary w-100" disabled>
                <i className="fas fa-clock me-2" />
                Currently Offline
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Details + Reviews ───────────────── */}
        <div className="col-lg-8">
          {/* About */}
          <div className="app-card mb-4">
            <h5 className="section-title mb-3">About</h5>
            <p className="text-muted mb-0" style={{ lineHeight: 1.8 }}>
              {astro.bio || "No bio available."}
            </p>
          </div>

          {/* Specialization */}
          {astro.skills && astro.skills.length > 0 && (
            <div className="app-card mb-4">
              <h5 className="section-title mb-3">Specialization</h5>
              <div className="d-flex flex-wrap gap-2">
                {astro.skills.map((skill: string, i: number) => (
                  <span key={i} className="badge badge-accent px-3 py-2">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {astro.languages && astro.languages.length > 0 && (
            <div className="app-card mb-4">
              <h5 className="section-title mb-3">
                <i className="fas fa-language me-2" />
                Languages
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {astro.languages.map((lang: string, i: number) => (
                  <span
                    key={i}
                    className="badge bg-primary-subtle text-primary border px-3 py-2"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Consultation type */}
          <div className="app-card mb-4">
            <h5 className="section-title mb-3">
              <i className="fas fa-video me-2" />
              Consultation Via
            </h5>
            <span className="badge bg-info-subtle text-info border px-3 py-2">
              {CONSULT_LABELS[astro.consultation_type] ?? "All Modes"}
            </span>
          </div>

          {/* ── Reviews ─────────────────────────────── */}
          <div className="app-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="section-title mb-0">
                <i className="fas fa-star text-warning me-2" />
                Reviews ({astro.total_reviews})
              </h5>
              {/* Show write-review button only for logged-in users with role:user */}
              {isAuth && hasRole("user") && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowForm((v) => !v)}
                >
                  <i className="fas fa-pen me-1" />
                  {showForm ? "Cancel" : "Write Review"}
                </button>
              )}
            </div>

            {/* Review form */}
            {showForm && (
              <form
                onSubmit={handleSubmitReview}
                className="border rounded p-3 mb-4 bg-light"
              >
                <div className="mb-3">
                  <label className="form-label fw-semibold">Your Rating</label>
                  <div>
                    <StarRating
                      rating={reviewForm.rating}
                      size={16}
                      interactive
                      onChange={(star) =>
                        setReviewForm((p) => ({ ...p, rating: star }))
                      }
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Comment{" "}
                    <span className="text-muted small fw-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((p) => ({ ...p, comment: e.target.value }))
                    }
                    minLength={10}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting && (
                    <span className="spinner-border spinner-border-sm me-1" />
                  )}
                  Submit Review
                </button>
              </form>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-star fa-2x d-block mb-2 opacity-25" />
                <p className="mb-0">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div>
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-bottom py-3">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Avatar
                        name={review.user?.name}
                        src={review.user?.profile_image}
                        size={36}
                        color="secondary"
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold small">
                          {review.user?.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {review.created_at}
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    {review.comment && (
                      <p
                        className="mb-0 text-muted ps-5"
                        style={{ fontSize: 14 }}
                      >
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && astro && (
        <BookingModal
          astrologer={{
            id: astro.id,
            name: astro.name,
            price_per_minute: astro.price_per_minute,
            consultation_type: astro.consultation_type,
          }}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
