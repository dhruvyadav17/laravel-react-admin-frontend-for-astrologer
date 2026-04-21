import Avatar      from '../../../../components/ui/Avatar';
import StarRating  from '../../../../components/ui/StarRating';
import { PageLoader } from '../../../../components/ui/States';
import {
  useMyAstrologerProfileQuery,
  useGetAstrologerReviewsQuery,
} from '../../../../store/astrologer.api';
import type { Review } from '../../../../types/models';

function ReviewCard({ review }: { review: Review }) {
  // FIX: backend returns human-readable strings e.g. '17 minutes ago'
  const date = review.created_at || '';
  return (
    <div className="app-card mb-3" style={{ transition: 'none' }}>
      <div className="d-flex align-items-center gap-3 mb-2">
        <Avatar name={review.user.name} src={review.user.profile_image} size={40} color="secondary" />
        <div className="flex-grow-1">
          <div className="fw-semibold t-main">{review.user.name}</div>
          <div className="t-muted" style={{ fontSize: 12 }}>{date}</div>
        </div>
        <StarRating rating={review.rating} size={15} />
      </div>
      {review.comment && (
        <p className="mb-0 t-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

export default function MyReviewsPage() {
  const { data: profile }   = useMyAstrologerProfileQuery();
  const { data, isLoading } = useGetAstrologerReviewsQuery(
    { id: profile?.id ?? 0 },
    { skip: !profile?.id }
  );

  const reviews         = data?.data ?? [];
  const positiveCount   = reviews.filter(r => r.rating >= 4).length;
  const positivePercent = reviews.length > 0
    ? Math.round((positiveCount / reviews.length) * 100)
    : 0;

  const stats = [
    {
      icon:  'fa-star',
      color: 'warning',
      value: profile ? profile.rating.toFixed(1) : '--',
      label: 'Average Rating',
    },
    {
      icon:  'fa-comments',
      color: 'primary',
      value: profile?.total_reviews ?? 0,
      label: 'Total Reviews',
    },
    {
      icon:  'fa-thumbs-up',
      color: 'success',
      value: `${positivePercent}%`,
      label: 'Positive Reviews (4★+)',
    },
  ];

  return (
    <>
      {/* Stats */}
      {profile && (
        <div className="row g-3 mb-4">
          {stats.map(({ icon, color, value, label }) => (
            <div key={label} className="col-md-4">
              <div className="app-card text-center py-3" style={{ transition: 'none' }}>
                <div style={{ fontSize: 28, color: color === "warning" ? "#ca8a04" : color === "primary" ? "var(--primary)" : "#16a34a" }}>
                  <i className={`fas ${icon}`} />
                </div>
                <div className="fw-bold t-main" style={{ fontSize: 28 }}>{value}</div>
                <div className="t-muted small">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews list */}
      <div className="app-card" style={{ transition: 'none' }}>
        <h5 className="fw-bold t-main mb-4">
          <i className="fas fa-star me-2 text-warning" />Client Reviews
        </h5>

        {isLoading ? (
          <PageLoader />
        ) : reviews.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-star fa-2x d-block mb-3" style={{ opacity: 0.2, color: 'var(--txt-m)' }} />
            <p className="t-muted mb-1">No client reviews yet.</p>
            <p className="t-muted" style={{ fontSize: 13 }}>
              Keep providing great consultations -- your first review is just a session away!
            </p>
          </div>
        ) : (
          reviews.map((review: Review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </>
  );
}
