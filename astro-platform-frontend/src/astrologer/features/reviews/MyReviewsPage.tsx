import {
  useMyAstrologerProfileQuery,
  useGetAstrologerReviewsQuery,
} from "../../../store/api/astrologer.api";
import type { Review } from "../../../types/models";

/* =====================================================
 | STAR ROW
 ===================================================== */
function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < rating ? "text-warning" : "text-muted"}
          style={{ fontSize: 15 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* =====================================================
 | SINGLE REVIEW CARD
 ===================================================== */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border rounded p-3 mb-3">
      <div className="d-flex align-items-center gap-3 mb-2">
        {review.user.profile_image ? (
          <img
            src={review.user.profile_image}
            alt={review.user.name}
            className="rounded-circle flex-shrink-0"
            style={{ width: 40, height: 40, objectFit: "cover" }}
          />
        ) : (
          <div
            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 40, height: 40, fontSize: 16 }}
          >
            {review.user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-grow-1">
          <div className="fw-semibold">{review.user.name}</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {review.created_at}
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.comment && (
        <p className="mb-0 text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {review.comment}
        </p>
      )}
    </div>
  );
}

/* =====================================================
 | MAIN PAGE
 ===================================================== */
export default function MyReviewsPage() {
  const { data: profile }    = useMyAstrologerProfileQuery();
  const { data, isLoading }  = useGetAstrologerReviewsQuery(
    profile?.id ?? 0,
    { skip: !profile?.id }
  );

  const reviews = data?.data ?? [];

  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const positivePercent =
    reviews.length > 0
      ? Math.round((positiveCount / reviews.length) * 100)
      : 0;

  return (
    <section className="content pt-3">
      <div className="container-fluid">

        {/* Summary stats */}
        {profile && (
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card text-center py-4">
                <div className="mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.round(profile.rating)
                          ? "text-warning"
                          : "text-muted"
                      }
                      style={{ fontSize: 24 }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="fw-bold" style={{ fontSize: 32 }}>
                  {profile.rating.toFixed(1)}
                </div>
                <div className="text-muted small">Average Rating</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center py-4">
                <div className="text-primary mb-2" style={{ fontSize: 32 }}>
                  <i className="fas fa-comments" />
                </div>
                <div className="fw-bold" style={{ fontSize: 32 }}>
                  {profile.total_reviews}
                </div>
                <div className="text-muted small">Total Reviews</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center py-4">
                <div className="text-success mb-2" style={{ fontSize: 32 }}>
                  <i className="fas fa-thumbs-up" />
                </div>
                <div className="fw-bold" style={{ fontSize: 32 }}>
                  {positivePercent}%
                </div>
                <div className="text-muted small">Positive (4★ or above)</div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews list */}
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-star me-2 text-warning" />
              Client Reviews
            </h5>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i
                  className="fas fa-star fa-3x d-block mb-3 opacity-25"
                />
                <p className="mb-0">
                  No reviews yet. Keep serving clients and reviews will appear here!
                </p>
              </div>
            ) : (
              reviews.map((review: Review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}