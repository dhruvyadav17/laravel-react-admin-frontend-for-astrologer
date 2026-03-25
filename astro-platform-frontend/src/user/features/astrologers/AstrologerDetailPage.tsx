import { useParams } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/user.api";

/* ================= STATIC FALLBACK ================= */
const fallbackData = {
  bio: "Experienced astrologer with expertise in Vedic, Tarot, and Numerology. Helping people solve life problems with accurate predictions.",
  skills: ["Vedic", "Tarot", "Numerology"],
  languages: ["Hindi", "English"],
  experience: 5,
  rating: 4.5,
  price_per_minute: 20,
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

  const astrologer = data.find((a: any) => String(a.id) === id);

  /* ================= MERGED DATA ================= */
  const finalData = {
    ...fallbackData,
    ...astrologer,
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

              <span className="badge bg-success position-absolute top-0 end-0">
                ✔ Verified
              </span>
            </div>

            <h4 className="fw-bold">{finalData.name}</h4>

            <p className="text-muted small">
              {finalData.expertise || "Astrology Expert"}
            </p>

            {/* RATING */}
            <div className="mb-2">
              ⭐ {finalData.rating} (120 reviews)
            </div>

            {/* EXPERIENCE */}
            <p className="text-muted small">
              {finalData.experience}+ years experience
            </p>

            {/* PRICE */}
            <h5 className="text-danger fw-bold">
              ₹{finalData.price_per_minute}/min
            </h5>

            {/* CTA */}
            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-primary-app">
                Book Consultation
              </button>

              <button className="btn btn-outline-danger">
                Chat Now
              </button>
            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-md-8">

          {/* ================= GALLERY ================= */}
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

          {/* ================= ABOUT ================= */}
          <div className="app-card mb-3">
            <h5 className="section-title">About</h5>
            <p className="text-muted mb-0">
              {finalData.bio}
            </p>
          </div>

          {/* ================= SPECIALIZATION ================= */}
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

          {/* ================= LANGUAGES ================= */}
          <div className="app-card mb-3">
            <h5 className="section-title">Languages</h5>
            <p className="text-muted mb-0">
              {finalData.languages.join(", ")}
            </p>
          </div>

          {/* ================= RATING BREAKDOWN ================= */}
          <div className="app-card mb-3">
            <h5 className="section-title mb-3">Rating & Reviews</h5>

            <div className="d-flex align-items-center gap-4">

              <div className="text-center">
                <h2 className="fw-bold">{finalData.rating}</h2>
                ⭐⭐⭐⭐⭐
              </div>

              <div className="flex-grow-1">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="d-flex align-items-center gap-2 mb-1">
                    <small>{r}</small>
                    <div className="progress flex-grow-1" style={{ height: 6 }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: r === 5 ? "90%" : "20%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ================= REVIEWS ================= */}
          <div className="app-card">
            <h5 className="section-title mb-3">User Reviews</h5>

            {finalData.reviews.map((r: any, i: number) => (
              <div key={i} className="border-bottom pb-2 mb-2">
                <strong>{r.name}</strong>
                <div>⭐⭐⭐⭐⭐</div>
                <p className="small text-muted mb-0">{r.text}</p>
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}