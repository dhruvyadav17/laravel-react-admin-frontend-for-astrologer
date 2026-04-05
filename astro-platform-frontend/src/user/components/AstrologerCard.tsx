// PATH: src/user/components/AstrologerCard.tsx
// IMPROVEMENT: CTA button add kiya — "Talk Now" if online, "Notify Me" if offline
//              Better visual hierarchy, price more prominent
//              Consultation type icon more visible

import { Link }              from "react-router-dom";
import type { Astrologer }   from "../../types/models";

type Props = { astrologer: Astrologer };

const CONSULT_ICONS: Record<string, string> = {
  chat:  "fa-comment",
  call:  "fa-phone",
  video: "fa-video",
  all:   "fa-th-large",
};

const CONSULT_LABELS: Record<string, string> = {
  chat: "Chat", call: "Call", video: "Video", all: "All",
};

export default function AstrologerCard({ astrologer: a }: Props) {
  const available = a.is_online && a.is_available;
  const stars     = Math.min(Math.max(Math.round(a.rating ?? 0), 0), 5);
  const avatar    = a.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name ?? "")}&background=e63946&color=fff&size=150`;

  return (
    <div className="astro-card-new h-100 d-flex flex-column">

      {/* Top: Avatar + online indicator */}
      <div className="text-center position-relative mb-2">
        <Link to={`/astrologers/${a.id}`} className="text-decoration-none d-block">
          <div className="astro-img-wrap mx-auto">
            <img src={avatar} alt={a.name} />
            <span className={`online-dot ${available ? "on" : ""}`} />
          </div>
        </Link>
      </div>

      {/* Name + expertise */}
      <Link to={`/astrologers/${a.id}`} className="text-decoration-none">
        <h6 className="fw-bold mb-0 text-dark text-center">{a.name}</h6>
      </Link>
      <p className="text-muted small mb-1 text-center">{a.expertise || "Astrology Expert"}</p>

      {/* Rating */}
      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
        <span className="text-warning" style={{ fontSize: 13 }}>
          {"★".repeat(stars)}{"☆".repeat(5 - stars)}
        </span>
        <span className="small fw-semibold">{(a.rating ?? 0).toFixed(1)}</span>
        {(a.total_reviews ?? 0) > 0 && (
          <span className="text-muted" style={{ fontSize: 11 }}>({a.total_reviews})</span>
        )}
      </div>

      {/* Experience */}
      <div className="small text-muted mb-2 text-center">
        {a.experience ?? 0}+ years experience
      </div>

      {/* Languages */}
      {(a.languages ?? []).length > 0 && (
        <div className="d-flex flex-wrap gap-1 mb-2 justify-content-center">
          {(a.languages ?? []).slice(0, 3).map((l) => (
            <span key={l} className="badge bg-light text-dark border" style={{ fontSize: 10 }}>{l}</span>
          ))}
          {(a.languages ?? []).length > 3 && (
            <span className="badge bg-light text-muted border" style={{ fontSize: 10 }}>
              +{(a.languages ?? []).length - 3}
            </span>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-grow-1" />

      {/* Footer: price + consult type */}
      <div className="border-top pt-2 mt-2">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <span className="fw-bold text-danger">₹{a.price_per_minute}</span>
            <span className="text-muted small">/min</span>
          </div>
          <span className="badge bg-light text-primary border" style={{ fontSize: 10 }}>
            <i className={`fas ${CONSULT_ICONS[a.consultation_type ?? "all"]} me-1`} />
            {CONSULT_LABELS[a.consultation_type ?? "all"]}
          </span>
        </div>

        {/* CTA button */}
        <Link
          to={`/astrologers/${a.id}`}
          className={`btn w-100 btn-sm ${available ? "btn-call" : "btn-outline-secondary"}`}
        >
          {available ? (
            <><i className="fas fa-phone me-1" />Talk Now</>
          ) : (
            <><i className="fas fa-clock me-1" />View Profile</>
          )}
        </Link>
      </div>

    </div>
  );
}
