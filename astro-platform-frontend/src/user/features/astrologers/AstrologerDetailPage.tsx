import { useParams } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/user.api";

export default function AstrologerDetailPage() {
  const { id } = useParams();

  const { data = [], isLoading, isError } = useGetAstrologersQuery();

  const astrologer = data.find((a: any) => String(a.id) === id);

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

        {/* ================= LEFT PROFILE ================= */}
        <div className="col-md-4">

          <div className="app-card text-center position-sticky" style={{ top: 100 }}>

            {/* IMAGE */}
            <div className="mb-3 position-relative">

              <img
                src={
                  astrologer.profile_image ||
                  `https://ui-avatars.com/api/?name=${astrologer.name}`
                }
                alt={astrologer.name}
                className="astro-img"
              />

              {/* VERIFIED */}
              <span className="badge bg-success position-absolute top-0 end-0">
                ✔ Verified
              </span>
            </div>

            {/* NAME */}
            <h4 className="fw-bold mb-1">{astrologer.name}</h4>

            {/* EXPERTISE */}
            <p className="text-muted small mb-2">
              {astrologer.expertise || "Astrology Expert"}
            </p>

            {/* RATING */}
            <div className="mb-2">
              <span className="badge-accent px-2 py-1">
                ⭐ {astrologer.rating || "4.5"}
              </span>
              <span className="text-muted small ms-1">
                (120 reviews)
              </span>
            </div>

            {/* EXPERIENCE */}
            <p className="text-muted small mb-2">
              {astrologer.experience || 5}+ years experience
            </p>

            {/* PRICE */}
            <div className="mb-3">
              <span className="text-danger fw-bold fs-4">
                ₹{astrologer.price_per_minute || 20}
              </span>
              <span className="text-muted"> /min</span>
            </div>

            {/* CTA */}
            <div className="d-grid gap-2 mt-3">

              <button className="btn btn-primary-app btn-app">
                Book Consultation
              </button>

              <button className="btn btn-outline-app btn-app">
                Chat Now
              </button>

            </div>

          </div>

        </div>

        {/* ================= RIGHT DETAILS ================= */}
        <div className="col-md-8">

          {/* ABOUT */}
          <div className="app-card mb-3">
            <h5 className="section-title mb-2">About</h5>
            <p className="text-muted mb-0">
              {astrologer.bio || "No description available."}
            </p>
          </div>

          {/* SPECIALIZATION */}
          <div className="app-card mb-3">
            <h5 className="section-title mb-2">Specialization</h5>

            <div className="d-flex flex-wrap gap-2">
              {(astrologer.skills || ["Vedic", "Tarot"]).map(
                (skill: string, i: number) => (
                  <span
                    key={i}
                    className="badge-accent px-3 py-2"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          {/* LANGUAGES */}
          <div className="app-card mb-3">
            <h5 className="section-title mb-2">Languages</h5>
            <p className="text-muted mb-0">
              {(astrologer.languages || ["Hindi", "English"]).join(", ")}
            </p>
          </div>

          {/* REVIEWS */}
          <div className="app-card">
            <h5 className="section-title mb-3">Reviews</h5>

            <div className="border-bottom pb-2 mb-2">
              <strong>Rahul</strong>
              <p className="mb-0 text-muted small">
                Very accurate prediction!
              </p>
            </div>

            <div>
              <strong>Anjali</strong>
              <p className="mb-0 text-muted small">
                Helpful and polite.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}