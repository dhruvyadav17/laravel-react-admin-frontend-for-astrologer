// PATH: src/user/features/astrologers/AstrologersPage.tsx
// USER-FACING listing — filters, sort, pagination
// AdminCrudPage ka koi import nahi hai yahan

import { useState } from "react";
import { useGetAstrologersQuery } from "../../../store/api/astrologer.api";
import AstrologerCard from "../../components/AstrologerCard";
import type { AstrologerFilters, ConsultationType } from "../../../types/models";

const EXPERTISE_OPTIONS = [
  "Vedic Astrology", "KP Astrology", "Numerology", "Tarot Reading",
  "Vastu Shastra", "Palmistry", "Lal Kitab", "Nadi Astrology",
];

const LANGUAGE_OPTIONS = [
  "Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Kannada",
];

const SORT_OPTIONS = [
  { value: "top_rated",  label: "⭐ Top Rated"         },
  { value: "price_low",  label: "₹ Price: Low to High" },
  { value: "price_high", label: "₹ Price: High to Low" },
  { value: "experience", label: "🏆 Most Experienced"  },
  { value: "newest",     label: "🆕 Newest First"      },
];

export default function AstrologersPage() {
  const [filters, setFilters] = useState<AstrologerFilters>({
    sort: "top_rated",
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAstrologersQuery(filters);
  const astrologers = data?.data       ?? [];
  const pagination  = data?.pagination ?? null;

  const setFilter = (key: keyof AstrologerFilters, value: unknown) =>
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));

  const clearAll = () => setFilters({ sort: "top_rated", page: 1 });

  const activeFilterCount = [
    filters.online,
    filters.expertise,
    filters.language,
    filters.min_rating,
    filters.consultation_type,
  ].filter(Boolean).length;

  return (
    <div className="container py-4">

      {/* ── PAGE HEADER ─────────────────────────── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="fas fa-star text-warning me-2" />
            Talk to an Astrologer
          </h2>
          <p className="text-muted mb-0">
            {pagination
              ? `${pagination.total} verified astrologers`
              : "Find your perfect guide"}
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          <select
            className="form-select form-select-sm"
            style={{ minWidth: 190 }}
            value={filters.sort ?? "top_rated"}
            onChange={(e) => setFilter("sort", e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <i className="fas fa-sliders-h me-1" />
            Filters
            {activeFilterCount > 0 && (
              <span className="badge bg-danger ms-1 rounded-pill">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
              <i className="fas fa-times me-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER PANEL ────────────────────────── */}
      {showFilters && (
        <div className="card mb-4 border-primary border-opacity-25">
          <div className="card-body">
            <div className="row g-3 align-items-end">

              <div className="col-md-3">
                <label className="form-label small fw-semibold mb-1">
                  Expertise
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filters.expertise ?? ""}
                  onChange={(e) => setFilter("expertise", e.target.value)}
                >
                  <option value="">All Expertise</option>
                  {EXPERTISE_OPTIONS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold mb-1">
                  Language
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filters.language ?? ""}
                  onChange={(e) => setFilter("language", e.target.value)}
                >
                  <option value="">All Languages</option>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold mb-1">
                  Consult Via
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filters.consultation_type ?? ""}
                  onChange={(e) =>
                    setFilter("consultation_type", e.target.value as ConsultationType)
                  }
                >
                  <option value="">Any</option>
                  <option value="chat">Chat</option>
                  <option value="call">Call</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold mb-1">
                  Min Rating
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filters.min_rating ?? ""}
                  onChange={(e) =>
                    setFilter(
                      "min_rating",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5 ★ &amp; above</option>
                  <option value="4">4.0 ★ &amp; above</option>
                  <option value="3">3.0 ★ &amp; above</option>
                </select>
              </div>

              <div className="col-md-2 d-flex align-items-center pb-1">
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="onlineOnly"
                    checked={!!filters.online}
                    onChange={(e) =>
                      setFilter("online", e.target.checked ? true : undefined)
                    }
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label small fw-semibold"
                    htmlFor="onlineOnly"
                  >
                    Online Only
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS ─────────────────────────────── */}
      {isLoading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: 48, height: 48 }}
            role="status"
          />
          <p className="text-muted">Finding astrologers...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle text-danger fa-3x d-block mb-3" />
          <p className="text-muted mb-3">Something went wrong.</p>
          <button className="btn btn-outline-primary" onClick={refetch}>
            Try Again
          </button>
        </div>
      ) : astrologers.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-search text-muted fa-3x d-block mb-3" />
          <p className="text-muted mb-3">
            No astrologers found with these filters.
          </p>
          <button className="btn btn-outline-primary" onClick={clearAll}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {astrologers.map((a) => (
              <div key={a.id} className="col-md-6 col-lg-4">
                <AstrologerCard astrologer={a} />
              </div>
            ))}
          </div>

          {/* ── PAGINATION ─────────────────────── */}
          {pagination && pagination.last_page > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">

                  <li
                    className={`page-item ${
                      pagination.current_page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setFilter("page", pagination.current_page - 1)
                      }
                    >
                      ‹ Prev
                    </button>
                  </li>

                  {Array.from(
                    { length: pagination.last_page },
                    (_, i) => i + 1
                  )
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.last_page ||
                        Math.abs(p - pagination.current_page) <= 2
                    )
                    .reduce<number[]>((acc, p, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== p - 1) acc.push(-1);
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === -1 ? (
                        <li key={`ellipsis-${idx}`} className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      ) : (
                        <li
                          key={p}
                          className={`page-item ${
                            p === pagination.current_page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setFilter("page", p)}
                          >
                            {p}
                          </button>
                        </li>
                      )
                    )}

                  <li
                    className={`page-item ${
                      pagination.current_page === pagination.last_page
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setFilter("page", pagination.current_page + 1)
                      }
                    >
                      Next ›
                    </button>
                  </li>

                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}