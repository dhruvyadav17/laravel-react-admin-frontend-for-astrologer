// PATH: src/user/components/AstrologerCard.tsx
// ADD: Heart/favorite button using useFavorites hook
// ADD: StarRating component

import { Link }         from "react-router-dom";
import StarRating       from "../../components/ui/StarRating";
import { useFavorites } from "../../hooks/useFavorites";

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
  chat: "fa-comment", call: "fa-phone", video: "fa-video", all: "fa-th-large",
};

export default function AstrologerCard({ astrologer }: Props) {
  const {
    id, name = "", profile_image, expertise,
    rating = 0, price_per_minute = 0, experience = 0,
    is_online = false, is_available = false,
    languages = [], total_reviews = 0, consultation_type = "all",
  } = astrologer;

  const { isFavorite, toggle } = useFavorites();
  const available = is_online && is_available;
  const avatar    = profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e63946&color=fff&size=150`;

  return (
    <div className="astro-card-new h-100 d-flex flex-column text-center position-relative">

      {/* Heart button — ADD: save to favorites */}
      <button
        className="position-absolute top-0 end-0 m-2 btn btn-sm border-0 p-1"
        style={{ zIndex: 10, background: "rgba(255,255,255,0.9)", borderRadius: "50%", lineHeight: 1 }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
        title={isFavorite(id) ? "Remove from saved" : "Save astrologer"}
      >
        <i className={`fas fa-heart ${isFavorite(id) ? "text-danger" : "text-muted"}`}
          style={{ fontSize: 14 }} />
      </button>

      {/* Avatar + online dot */}
      <Link to={`/astrologers/${id}`} className="text-decoration-none d-block">
        <div className="astro-img-wrap mb-2 mx-auto">
          <img src={avatar} alt={name} />
          <span className={`online-dot ${available ? "on" : ""}`} />
        </div>

        <h6 className="fw-bold mb-1 text-dark">{name}</h6>
        <p className="text-muted small mb-1">{expertise || "Astrology Expert"}</p>

        {/* StarRating — ADD: shared component */}
        <div className="mb-1"><StarRating rating={rating} size={13} /></div>
        <div className="small text-muted mb-1">
          {rating.toFixed(1)} rating
          {total_reviews > 0 && <span className="ms-1">({total_reviews})</span>}
        </div>

        <div className="small text-muted mb-2">{experience}+ years experience</div>

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
      </Link>

      {/* Footer */}
      <div className="mt-auto pt-2 border-top">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="price mb-0">
            ₹{price_per_minute}<span className="text-muted small fw-normal">/min</span>
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
        <Link to={`/astrologers/${id}`}
          className={`btn w-100 btn-sm ${available ? "btn-call" : "btn-outline-secondary"}`}>
          {available
            ? <><i className="fas fa-phone me-1" />Talk Now</>
            : <><i className="fas fa-clock me-1" />View Profile</>}
        </Link>
      </div>

    </div>
  );
}
