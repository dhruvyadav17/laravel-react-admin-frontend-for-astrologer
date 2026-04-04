// PATH: src/user/components/AstrologerCard.tsx

import { Link } from "react-router-dom";

type Props = {
  astrologer: {
    id:                 number;
    name:               string;
    profile_image?:     string | null;
    expertise?:         string;
    rating?:            number;
    price_per_minute?:  number;
    experience?:        number;
    is_online?:         boolean;
    is_available?:      boolean;
    languages?:         string[];
    total_reviews?:     number;
    consultation_type?: string;
  };
};

const CONSULT_ICONS: Record<string, string> = {
  chat:  "fa-comment",
  call:  "fa-phone",
  video: "fa-video",
  all:   "fa-th-large",
};

export default function AstrologerCard({ astrologer }: Props) {
  const {
    id,
    name               = "",
    profile_image,
    expertise,
    rating             = 0,
    price_per_minute   = 0,
    experience         = 0,
    is_online          = false,
    is_available       = false,
    languages          = [],
    total_reviews      = 0,
    consultation_type  = "all",
  } = astrologer;

  const available = is_online && is_available;
  const stars     = Math.min(Math.max(Math.round(rating), 0), 5);
  const avatar    = profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e63946&color=fff&size=150`;

  return (
    <Link to={`/astrologers/${id}`} className="text-decoration-none d-block h-100">
      <div className="astro-card-new h-100 d-flex flex-column text-center">

        {/* ── Avatar + online dot ──── */}
        <div className="astro-img-wrap mb-2 mx-auto">
          <img src={avatar} alt={name} />
          <span className={`online-dot ${available ? "on" : ""}`} />
        </div>

        {/* ── Name ────────────────── */}
        <h6 className="fw-bold mb-1 text-dark">{name}</h6>

        {/* ── Expertise ───────────── */}
        <p className="text-muted small mb-1">
          {expertise || "Astrology Expert"}
        </p>

        {/* ── Rating ──────────────── */}
        <div className="rating-stars mb-1">
          {"★".repeat(stars)}
          <span className="text-muted">{"☆".repeat(5 - stars)}</span>
        </div>
        <div className="small text-muted mb-1">
          {rating.toFixed(1)} rating
          {total_reviews > 0 && <span className="ms-1">({total_reviews})</span>}
        </div>

        {/* ── Experience ──────────── */}
        <div className="small text-muted mb-2">
          {experience}+ years experience
        </div>

        {/* ── Languages ───────────── */}
        {languages.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2 justify-content-center">
            {languages.slice(0, 3).map((l) => (
              <span key={l} className="badge bg-light text-dark border" style={{ fontSize: 10 }}>{l}</span>
            ))}
            {languages.length > 3 && (
              <span className="badge bg-light text-muted border" style={{ fontSize: 10 }}>+{languages.length - 3}</span>
            )}
          </div>
        )}

        {/* ── Footer ──────────────── */}
        <div className="mt-auto pt-2 border-top">
          <div className="d-flex align-items-center justify-content-between">
            <div className="price mb-0">
              ₹{price_per_minute}
              <span className="text-muted small fw-normal">/min</span>
            </div>
            <div className="d-flex gap-1">
              <span className="badge bg-light text-primary border" style={{ fontSize: 10 }}>
                <i className={`fas ${CONSULT_ICONS[consultation_type] ?? "fa-th-large"} me-1`} />
                {consultation_type === "all" ? "All" : consultation_type}
              </span>
              <span className={`badge ${available ? "bg-success" : "bg-secondary"}`} style={{ fontSize: 10 }}>
                {available ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}