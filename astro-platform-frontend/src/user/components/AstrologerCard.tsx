import { Link } from "react-router-dom";
import type { Astrologer } from "../../types/models";

const CONSULT_ICONS: Record<string, string> = {
  chat:  "fa-comment",
  call:  "fa-phone",
  video: "fa-video",
  all:   "fa-th-large",
};

const CONSULT_LABELS: Record<string, string> = {
  chat:  "Chat",
  call:  "Call",
  video: "Video",
  all:   "All",
};

export default function AstrologerCard({
  astrologer,
}: {
  astrologer: Astrologer;
}) {
  const {
    id,
    name,
    profile_image,
    expertise,
    experience,
    price_per_minute,
    rating,
    total_reviews,
    languages,
    is_online,
    is_available,
    consultation_type,
  } = astrologer;

  const available = is_online && is_available;

  return (
    <Link
      to={`/astrologers/${id}`}
      className="text-decoration-none h-100 d-block"
    >
      <div
        className="card h-100 shadow-sm border-0"
        style={{ transition: "box-shadow 0.2s", cursor: "pointer" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 6px 20px rgba(0,0,0,.12)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.boxShadow = "")
        }
      >
        <div className="card-body p-3">

          {/* ── TOP ROW ─────────────────────────────── */}
          <div className="d-flex gap-3 mb-3">

            {/* Avatar with online dot */}
            <div className="position-relative flex-shrink-0">
              {profile_image ? (
                <img
                  src={profile_image}
                  alt={name}
                  className="rounded-circle"
                  style={{ width: 64, height: 64, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 64, height: 64, fontSize: 22 }}
                >
                  {name?.[0]?.toUpperCase()}
                </div>
              )}
              {/* Online indicator */}
              <span
                className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white ${
                  available ? "bg-success" : "bg-secondary"
                }`}
                style={{ width: 14, height: 14 }}
                title={available ? "Available Now" : "Offline"}
              />
            </div>

            {/* Info */}
            <div className="flex-grow-1 overflow-hidden">
              <h6 className="fw-bold mb-0 text-dark text-truncate">{name}</h6>
              <div className="text-primary small fw-semibold mb-1">
                {expertise}
              </div>
              <div className="text-muted small">{experience} yrs experience</div>
              {/* Rating */}
              <div className="d-flex align-items-center gap-1 mt-1">
                <span className="text-warning" style={{ fontSize: 13 }}>★</span>
                <span className="fw-semibold small text-dark">
                  {rating.toFixed(1)}
                </span>
                <span className="text-muted small">({total_reviews})</span>
              </div>
            </div>
          </div>

          {/* ── LANGUAGES ───────────────────────────── */}
          <div className="d-flex flex-wrap gap-1 mb-2">
            {languages.slice(0, 3).map((lang) => (
              <span
                key={lang}
                className="badge bg-light text-dark border"
                style={{ fontSize: 11 }}
              >
                {lang}
              </span>
            ))}
            {languages.length > 3 && (
              <span
                className="badge bg-light text-muted border"
                style={{ fontSize: 11 }}
              >
                +{languages.length - 3}
              </span>
            )}
          </div>

          {/* ── FOOTER ──────────────────────────────── */}
          <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-1">
            <div>
              <span className="fw-bold text-dark fs-6">
                ₹{price_per_minute}
              </span>
              <span className="text-muted small">/min</span>
            </div>
            <div className="d-flex gap-1 align-items-center">
              {/* Consultation type */}
              <span
                className="badge bg-light text-primary border"
                style={{ fontSize: 11 }}
              >
                <i
                  className={`fas ${
                    CONSULT_ICONS[consultation_type] ?? "fa-th-large"
                  } me-1`}
                />
                {CONSULT_LABELS[consultation_type] ?? "All"}
              </span>
              {/* Status */}
              <span
                className={`badge ${
                  available ? "bg-success" : "bg-secondary"
                }`}
                style={{ fontSize: 11 }}
              >
                {available ? "Online" : "Offline"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}