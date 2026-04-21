import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetAstrologerQuery,
  useGetAstrologerReviewsQuery,
  useSubmitReviewMutation,
} from '../../../../store/astrologer.api';
import { useAuth } from '../../../auth/hooks/useAuth';
import { toast } from 'react-toastify';
import BookingModal from '../../components/BookingModal';
import StarRating from '../../../../components/ui/StarRating';
import Avatar from '../../../../components/ui/Avatar';

const LANG_STYLE: Record<string, { bg: string; color: string }> = {
  Hindi: { bg: 'rgba(234,88,12,.12)', color: '#ea580c' },
  English: { bg: 'rgba(37,99,235,.12)', color: '#2563eb' },
  Tamil: { bg: 'rgba(124,58,237,.12)', color: '#7c3aed' },
  Telugu: { bg: 'rgba(5,150,105,.12)', color: '#059669' },
  Marathi: { bg: 'rgba(220,38,38,.12)', color: '#dc2626' },
  Bengali: { bg: 'rgba(217,119,6,.12)', color: '#d97706' },
  Gujarati: { bg: 'rgba(15,118,110,.12)', color: '#0f766e' },
  Kannada: { bg: 'rgba(147,51,234,.12)', color: '#9333ea' },
  default: { bg: 'rgba(71,85,105,.12)', color: '#475569' },
};

const CONSULT_LABELS: Record<string, string> = {
  chat: '💬 Chat',
  call: '📞 Call',
  video: '🎥 Video',
  all: '💬 Chat · 📞 Call · 🎥 Video',
};

export default function AstrologerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuth, hasRole } = useAuth();

  const astroId = id && !isNaN(Number(id)) ? Number(id) : undefined;
  const { data: astro, isLoading, isError } = useGetAstrologerQuery(astroId ?? skipToken);
  const { data: reviewsData } = useGetAstrologerReviewsQuery(astroId ? { id: astroId, page: 1 } : skipToken);
  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation();

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showForm, setShowForm] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuth) {
      navigate('/login');
      return;
    }
    if (!astroId) return;

    try {
      await submitReview({ astrologerId: astroId, ...reviewForm }).unwrap();
      toast.success('Review submitted!');
      setShowForm(false);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to submit review.');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ width: 48, height: 48, color: 'var(--primary)' }} role="status" />
        <p className="t-muted mt-3">Loading profile...</p>
      </div>
    );
  }

  if (isError || !astro) {
    return (
      <div className="container py-5 text-center">
        <i className="fas fa-exclamation-triangle fa-3x d-block mb-3" style={{ color: 'var(--primary)' }} />
        <h4 className="t-main">Astrologer not found</h4>
        <button className="btn btn-outline-secondary mt-3" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left me-2" />Go Back
        </button>
      </div>
    );
  }

  const reviews = reviewsData?.data ?? [];
  const available = astro.is_online && astro.is_available;
  const avatar = astro.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(astro.name)}&background=e63946&color=fff&size=200`;

  return (
    <div className="container py-4">
      <button className="btn btn-sm btn-outline-secondary mb-4 d-inline-flex align-items-center gap-2" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left" />Back to Astrologers
      </button>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="app-card text-center astro-detail-card" style={{ transition: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'none'; }}>
            <div className="astro-img-wrap mb-3 mx-auto" style={{ width: 'fit-content' }}>
              <img src={avatar} alt={astro.name} style={{ width: 96, height: 96 }} />
              <span className={`online-dot ${available ? 'on' : ''}`} />
            </div>

            <h4 className="fw-bold mb-1 t-main">{astro.name}</h4>
            <p className="t-muted mb-2" style={{ fontSize: 14 }}>{astro.expertise || 'Astrology Expert'}</p>

            <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
              <StarRating rating={astro.rating} size={16} />
              <span className="fw-semibold t-main">{astro.rating?.toFixed(1)}</span>
              <span className="t-muted" style={{ fontSize: 13 }}>({astro.total_reviews} reviews)</span>
            </div>

            <p className="t-muted mb-3" style={{ fontSize: 13 }}>{astro.experience || 0}+ years experience</p>

            <div className="d-flex gap-2 mb-3">
              {[
                { num: astro.experience, lbl: 'Yrs Exp' },
                { num: astro.total_consultations ?? 0, lbl: 'Consults' },
                { num: astro.total_reviews, lbl: 'Reviews' },
              ].map(({ num, lbl }) => (
                <div key={lbl} className="stat-box">
                  <div className="num">{num}</div>
                  <div className="lbl">{lbl}</div>
                </div>
              ))}
            </div>

            <div className="mb-2">
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>₹{astro.price_per_minute}</span>
              <span className="t-muted" style={{ fontSize: 13 }}>/min</span>
            </div>

            {astro.is_verified && (
              <div className="mb-2">
                <span className="badge bg-success px-3 py-2">
                  <i className="fas fa-check-circle me-1" />Verified
                </span>
              </div>
            )}

            <div className="mb-3">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: available ? 'rgba(34,197,94,.12)' : 'rgba(100,116,139,.12)',
                  color: available ? '#16a34a' : '#64748b',
                  border: `1px solid ${available ? 'rgba(34,197,94,.3)' : 'rgba(100,116,139,.3)'}`,
                }}
              >
                <i className="fas fa-circle me-1" style={{ fontSize: 8 }} />
                {available ? 'Available Now' : 'Currently Offline'}
              </span>
            </div>

            {available ? (
              <button className="btn-call btn w-100 fw-semibold" onClick={() => setShowBooking(true)}>
                <i className="fas fa-phone me-2" />Talk Now
              </button>
            ) : (
              <button className="btn btn-outline-secondary w-100" disabled>
                <i className="fas fa-clock me-2" />Offline
              </button>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="app-card mb-3">
            <h5 className="section-title mb-3">
              <i className="fas fa-user-circle me-2" />About
            </h5>
            <p className="t-muted mb-0" style={{ lineHeight: 1.85, fontSize: 15 }}>{astro.bio || 'No bio available.'}</p>
          </div>

          {astro.skills && astro.skills.length > 0 && (
            <div className="app-card mb-3">
              <h5 className="section-title mb-3">
                <i className="fas fa-star me-2" />Specialization
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {astro.skills.map((skill: string, i: number) => (
                  <span key={i} style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(230,57,70,.10)', color: '#e63946', border: '1px solid rgba(230,57,70,.25)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {astro.languages && astro.languages.length > 0 && (
            <div className="app-card mb-3">
              <h5 className="section-title mb-3">
                <i className="fas fa-language me-2" />Languages
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {astro.languages.map((lang: string, i: number) => {
                  const s = LANG_STYLE[lang] ?? LANG_STYLE.default;
                  return (
                    <span key={i} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.color}44` }}>
                      {lang}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="app-card mb-3">
            <h5 className="section-title mb-3">
              <i className="fas fa-comments me-2" />Consultation Via
            </h5>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(230,57,70,.10)', color: '#e63946', border: '1px solid rgba(230,57,70,.25)' }}>
              {CONSULT_LABELS[astro.consultation_type] ?? 'All Modes'}
            </span>
          </div>

          {/* Schedule Section */}
          {Array.isArray(astro.schedules) && astro.schedules.length > 0 && (
            <div className="app-card mb-3">
              <h5 className="section-title mb-3">
                <i className="fas fa-calendar-alt me-2 text-primary" />Availability Schedule
              </h5>
              <div className="d-flex flex-column gap-2">
                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, i) => {
                  const slot = astro.schedules!.find((s: any) => s.day_of_week === i);
                  const active = slot?.is_active;
                  return (
                    <div key={day} className="d-flex align-items-center gap-3 py-1"
                      style={{ borderBottom: '1px solid var(--bdr)', opacity: active ? 1 : 0.4 }}>
                      <div style={{ width: 90, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--txt)' : 'var(--txt-l)' }}>
                        {day.slice(0,3)}
                      </div>
                      {active ? (
                        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
                          <i className="fas fa-clock me-1" style={{ fontSize: 11 }} />
                          {slot.start_time} – {slot.end_time}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--txt-l)' }}>Not available</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="t-muted small mt-3 mb-0">
                <i className="fas fa-info-circle me-1" />Times are in Indian Standard Time (IST)
              </p>
            </div>
          )}

          <div className="app-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="section-title mb-0">
                <i className="fas fa-star text-warning me-2" />
                Reviews ({astro.total_reviews})
              </h5>
              {isAuth && hasRole('user') && (
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm((v) => !v)}>
                  <i className={`fas fa-${showForm ? 'times' : 'pen'} me-1`} />
                  {showForm ? 'Cancel' : 'Write Review'}
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleSubmitReview} className="review-form-box">
                <div className="mb-3">
                  <label className="form-label fw-semibold t-muted" style={{ fontSize: 13 }}>Your Rating</label>
                  <div>
                    <StarRating rating={reviewForm.rating} size={20} interactive onChange={(star) => setReviewForm((p) => ({ ...p, rating: star }))} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold t-muted" style={{ fontSize: 13 }}>
                    Comment <span className="t-light fw-normal">(optional)</span>
                  </label>
                  <textarea className="form-control" rows={3} placeholder="Share your experience..." value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} minLength={10} />
                </div>
                <button type="submit" className="btn btn-sm btn-primary-app" disabled={submitting || !astroId}>
                  {submitting && <span className="spinner-border spinner-border-sm me-1" />}
                  Submit Review
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-star fa-2x d-block mb-2" style={{ color: 'var(--bdr2)' }} />
                <p className="t-muted mb-1">No verified reviews yet.</p>
                <p className="t-muted" style={{ fontSize: 13 }}>Book a consultation and be the first to share your experience!</p>
              </div>
            ) : (
              <div>
                {reviews.map((review: any) => (
                  <div key={review.id} className="review-item">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Avatar name={review.user?.name} src={review.user?.profile_image} size={36} color="secondary" />
                      <div className="flex-grow-1">
                        <div className="fw-semibold t-main" style={{ fontSize: 14 }}>{review.user?.name}</div>
                        <div className="t-light" style={{ fontSize: 11 }}>{review.created_at}</div>
                      </div>
                      <StarRating rating={review.rating} size={13} />
                    </div>
                    {review.comment && (
                      <p className="t-muted mb-0 ps-5" style={{ fontSize: 14, lineHeight: 1.6 }}>
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

      {showBooking && (
        <BookingModal
          astrologer={{ id: astro.id, name: astro.name, price_per_minute: astro.price_per_minute, consultation_type: astro.consultation_type }}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
