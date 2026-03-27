type Props = {
  astrologer: {
    id?: number;
    name: string;
    profile_image?: string;
    expertise?: string;
    rating?: number;
    price_per_minute?: number;
    experience?: number;
    is_online?: boolean;
  };
  onClick?: () => void;
};

export default function AstrologerCard({
  astrologer,
  onClick,
}: Props) {
  const {
    name,
    profile_image,
    expertise,
    rating = 4.5,
    price_per_minute = 0,
    experience = 0,
    is_online = false,
  } = astrologer;

  /* ================= SAFE IMAGE ================= */
  const avatar =
    profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

  /* ================= RATING ================= */
  const stars = Math.round(rating);

  return (
    <div className="astro-card-new h-100">

      {/* ================= IMAGE ================= */}
      <div className="astro-img-wrap mb-2">

        <img src={avatar} alt={name} />

        {/* ONLINE DOT */}
        <span className={`online-dot ${is_online ? "on" : ""}`} />

      </div>

      {/* ================= NAME ================= */}
      <h6 className="fw-bold mb-1">{name}</h6>

      {/* ================= EXPERTISE ================= */}
      <p className="text-muted small mb-1">
        {expertise || "Astrology Expert"}
      </p>

      {/* ================= RATING ================= */}
      <div className="rating-stars mb-1">
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
      </div>

      <div className="small text-muted mb-2">
        {rating.toFixed(1)} rating
      </div>

      {/* ================= EXPERIENCE ================= */}
      <div className="small text-muted mb-2">
        {experience}+ years experience
      </div>

      {/* ================= PRICE ================= */}
      <div className="price mb-3">
        ₹{price_per_minute}/min
      </div>

      {/* ================= CTA ================= */}
      <button
        className="btn btn-call w-100"
        onClick={onClick}
      >
        {is_online ? "Talk Now" : "View Profile"}
      </button>

    </div>
  );
}