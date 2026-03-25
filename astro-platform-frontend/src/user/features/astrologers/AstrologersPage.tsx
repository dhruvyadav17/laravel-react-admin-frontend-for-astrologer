import { useNavigate } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/user.api";
import { useEffect } from "react";
export default function AstrologersPage() {
  const navigate = useNavigate();

  const { data = [], isLoading, isError } = useGetAstrologersQuery();

  useEffect(() => {
    if (!isLoading && data.length === 1) {
      navigate(`/astrologers/${data[0].id}`, { replace: true });
    }
  }, [data, isLoading, navigate]);

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger" />
        <p className="mt-2 text-muted">Loading astrologers...</p>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (isError) {
    return (
      <div className="text-center mt-5 text-danger">
        Failed to load astrologers
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!data.length) {
    return (
      <div className="text-center mt-5 text-muted">
        No astrologers available right now
      </div>
    );
  }

  return (
    <div className="container page">
      {/* ================= HEADER ================= */}
      <div className="text-center mb-5">
        <h2 className="section-title">🔮 Our Astrologers</h2>
        <p className="text-muted">
          Talk to experienced astrologers & get guidance
        </p>
      </div>

      {/* ================= LIST ================= */}
      <div className="row g-4">
        {data.map((astro: any) => (
          <div className="col-md-4" key={astro.id}>
            <div className="app-card astro-card h-100 d-flex flex-column justify-content-between">
              {/* ================= TOP ================= */}
              <div>
                {/* IMAGE */}
                <div className="text-center mb-3 position-relative">
                  <img
                    src={
                      astro.profile_image ||
                      `https://ui-avatars.com/api/?name=${astro.name}`
                    }
                    alt={astro.name}
                    className="astro-img"
                  />

                  {/* VERIFIED BADGE */}
                  <span className="badge bg-success position-absolute top-0 end-0">
                    ✔
                  </span>
                </div>

                {/* NAME */}
                <h5 className="text-center fw-bold mb-1">{astro.name}</h5>

                {/* EXPERTISE */}
                <p className="text-muted text-center small mb-2">
                  {astro.expertise || "Astrology Expert"}
                </p>

                {/* RATING */}
                <div className="text-center mb-2">
                  <span className="badge-accent px-2 py-1">
                    ⭐ {astro.rating || "4.5"}
                  </span>
                  <span className="text-muted small ms-1">(120)</span>
                </div>

                {/* EXPERIENCE */}
                <p className="text-center text-muted small mb-2">
                  {astro.experience || 5}+ years experience
                </p>

                {/* PRICE */}
                <div className="text-center fw-bold mb-3">
                  <span className="text-danger fs-5">
                    ₹ {astro.price_per_minute || 20}
                  </span>
                  <span className="text-muted small"> /min</span>
                </div>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary-app btn-app"
                  onClick={() => navigate(`/astrologers/${astro.id}`)}
                >
                  View Details
                </button>

                <button className="btn btn-outline-app btn-app">
                  Talk Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
