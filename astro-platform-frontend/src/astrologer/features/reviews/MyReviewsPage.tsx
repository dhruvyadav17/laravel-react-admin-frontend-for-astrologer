// PATH: src/astrologer/features/reviews/MyReviewsPage.tsx
// REFACTOR: Stars() function hata diya → StarRating component use kiya
//           Avatar pattern hata diya  → Avatar component use kiya
//           PageLoader inline hata diya → States.tsx se import kiya

import Avatar                          from "../../../components/ui/Avatar";
import StarRating                      from "../../../components/ui/StarRating";
import { PageLoader }                  from "../../../components/ui/States";
import {
  useMyAstrologerProfileQuery,
  useGetAstrologerReviewsQuery,
} from "../../../store/api/astrologer.api";
import type { Review }                 from "../../../types/models";

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border rounded p-3 mb-3">
      <div className="d-flex align-items-center gap-3 mb-2">
        {/* BEFORE: 10-line image/initials block | AFTER: 1 line */}
        <Avatar name={review.user.name} src={review.user.profile_image} size={40} color="secondary" />
        <div className="flex-grow-1">
          <div className="fw-semibold">{review.user.name}</div>
          <div className="text-muted" style={{ fontSize: 12 }}>{review.created_at}</div>
        </div>
        {/* BEFORE: Stars() local function | AFTER: shared component */}
        <StarRating rating={review.rating} size={15} />
      </div>
      {review.comment && (
        <p className="mb-0 text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {review.comment}
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

  const reviews        = data?.data ?? [];
  const positiveCount  = reviews.filter((r) => r.rating >= 4).length;
  const positivePercent = reviews.length > 0
    ? Math.round((positiveCount / reviews.length) * 100)
    : 0;

  return (
    <>


        {/* Summary stats */}
        {profile && (
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card text-center py-4">
                <div className="mb-2">
                  <StarRating rating={profile.rating} size={24} />
                </div>
                <div className="fw-bold" style={{ fontSize: 32 }}>{profile.rating.toFixed(1)}</div>
                <div className="text-muted small">Average Rating</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center py-4">
                <div className="text-primary mb-2" style={{ fontSize: 32 }}>
                  <i className="fas fa-comments" />
                </div>
                <div className="fw-bold" style={{ fontSize: 32 }}>{profile.total_reviews}</div>
                <div className="text-muted small">Total Reviews</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center py-4">
                <div className="text-success mb-2" style={{ fontSize: 32 }}>
                  <i className="fas fa-thumbs-up" />
                </div>
                <div className="fw-bold" style={{ fontSize: 32 }}>{positivePercent}%</div>
                <div className="text-muted small">Positive (4★ or above)</div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews list */}
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-star me-2 text-warning" />Client Reviews
            </h5>
          </div>
          <div className="card-body">
            {/* BEFORE: inline spinner div | AFTER: 1 line */}
            {isLoading ? (
              <PageLoader />
            ) : reviews.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-star fa-3x d-block mb-3 opacity-25" />
                <p className="mb-0">No reviews yet. Keep serving clients!</p>
              </div>
            ) : (
              reviews.map((review: Review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </div>

    </>
  );
}
