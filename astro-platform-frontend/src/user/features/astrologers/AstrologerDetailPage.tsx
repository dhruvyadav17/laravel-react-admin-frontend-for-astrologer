import { useParams } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/user.api";

/* ================= STATIC FALLBACK ================= */
const fallbackData = {
  bio: "",
  skills: [],
  languages: [],
  experience: 5,
  rating: 4.5,
  price_per_minute: 20,
  total_reviews: 120,
  reviews: [
    { name: "Rahul", text: "Very accurate prediction!", rating: 5 },
    { name: "Anjali", text: "Helpful and polite.", rating: 5 },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  ],
};

export default function AstrologerDetailPage() {
  const { id } = useParams();

  const { data = [], isLoading, isError } = useGetAstrologersQuery();
  console.log("Fetched astrologers:", data);

  const astrologer = data.find((a: any) => String(a.id) === id);

  /* ================= SAFE PARSER ================= */
  const parseArray = (val: any) => {
    if (!val) return [];

    if (Array.isArray(val)) return val;

    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  /* ================= SMART PICK ================= */
  const pick = (val: any, fallback: any) => {
    if (val === null || val === undefined) return fallback;

    if (Array.isArray(val)) {
      return val.length ? val : fallback;
    }

    if (typeof val === "string") {
      return val.trim() ? val : fallback;
    }

    return val;
  };

  /* ================= FINAL DATA ================= */
  const finalData = {
    name: pick(astrologer?.name, "Astrologer"),
    profile_image: astrologer?.profile_image,

    bio: pick(astrologer?.bio, fallbackData.bio),

    skills: pick(
      parseArray(astrologer?.skills),
      fallbackData.skills
    ),

    languages: pick(
      parseArray(astrologer?.languages),
      fallbackData.languages
    ),

    gallery: pick(
      parseArray(astrologer?.gallery),
      fallbackData.gallery
    ),

    experience: pick(astrologer?.experience, fallbackData.experience),
    rating: pick(astrologer?.rating, fallbackData.rating),

    price_per_minute: pick(
      astrologer?.price_per_minute,
      fallbackData.price_per_minute
    ),

    total_reviews: pick(
      astrologer?.total_reviews,
      fallbackData.total_reviews
    ),

    reviews: pick(astrologer?.reviews, fallbackData.reviews),
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger" />
        <p className="text-muted mt-2">Loading astrologer...</p>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (isError) {
    return (
      <div className="text-center mt-5 text-danger">
        Failed to load astrologer
      </div>
    );
  }

  /* ================= NOT FOUND ================= */
  if (!astrologer) {
    return (
      <div className="text-center mt-5 text-muted">
        Astrologer not found
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="row g-4">

        {/* ================= LEFT ================= */}
        <div className="col-md-4">
          <div className="app-card text-center position-sticky" style={{ top: 100 }}>

            {/* IMAGE */}
            <div className="mb-3 position-relative">
              <img
                src={
                  finalData.profile_image ||
                  `https://ui-avatars.com/api/?name=${finalData.name}`
                }
                className="astro-img"
              />

              {astrologer?.is_verified === true && (
                <span className="badge bg-success position-absolute top-0 end-0">
                  ✔ Verified
                </span>
              )}
            </div>

            <h4 className="fw-bold">{finalData.name}</h4>

            {/* ONLINE */}
            <div className="small mb-2">
              {astrologer?.is_online === true ? (
                <span className="text-success">● Online</span>
              ) : (
                <span className="text-muted">● Offline</span>
              )}
            </div>

            <p className="text-muted small">
              {pick(astrologer?.expertise, "Astrology Expert")}
            </p>

            {/* RATING */}
            <div className="mb-2">
              ⭐ {finalData.rating} ({finalData.total_reviews} reviews)
            </div>

            <p className="text-muted small">
              {finalData.experience}+ years experience
            </p>

            <h5 className="text-danger fw-bold">
              ₹{finalData.price_per_minute}/min
            </h5>

            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-primary-app">
                Book Consultation
              </button>

              <button
                className="btn btn-outline-danger"
                disabled={!astrologer?.is_online}
              >
                {astrologer?.is_online ? "Chat Now" : "Offline"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-md-8">

          {/* GALLERY */}
          <div className="app-card mb-3">
            <h5 className="section-title mb-3">Gallery</h5>
            <div className="row g-2">
              {finalData.gallery.map((img: string, i: number) => (
                <div className="col-md-4" key={i}>
                  <img
                    src={img}
                    className="w-100 rounded"
                    style={{ height: 120, objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ABOUT */}
          <div className="app-card mb-3">
            <h5 className="section-title">About</h5>
            <p className="text-muted mb-0">{finalData.bio}</p>
          </div>

          {/* SKILLS */}
          <div className="app-card mb-3">
            <h5 className="section-title">Specialization</h5>
            <div className="d-flex flex-wrap gap-2">
              {finalData.skills.map((s: string, i: number) => (
                <span key={i} className="badge-accent px-3 py-2">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* LANGUAGES */}
          <div className="app-card mb-3">
            <h5 className="section-title">Languages</h5>
            <p className="text-muted mb-0">
              {finalData.languages.join(", ")}
            </p>
          </div>

          {/* RATING */}
          <div className="app-card mb-3">
            <h5 className="section-title mb-3">Rating & Reviews</h5>

            <div className="d-flex align-items-center gap-4">

              <div className="text-center">
                <h2 className="fw-bold">{finalData.rating}</h2>
                {"⭐".repeat(Math.round(finalData.rating))}
              </div>

              <div className="flex-grow-1">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="d-flex align-items-center gap-2 mb-1">
                    <small>{r}</small>
                    <div className="progress flex-grow-1" style={{ height: 6 }}>
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${(finalData.rating / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* REVIEWS */}
          <div className="app-card">
            <h5 className="section-title mb-3">User Reviews</h5>

            {(finalData.reviews || []).map((r: any, i: number) => (
              <div key={i} className="border-bottom pb-2 mb-2">
                <strong>{r.name}</strong>
                <div>{"⭐".repeat(r.rating || 5)}</div>
                <p className="small text-muted mb-0">{r.text}</p>
              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}