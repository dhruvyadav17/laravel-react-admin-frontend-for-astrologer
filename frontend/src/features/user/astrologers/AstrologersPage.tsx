/**
 * AstrologersPage -- browsable, filterable grid of all verified astrologers.
 *
 * FILTERS AVAILABLE
 * ------------------
 * search, sort, expertise, language, consultation_type, min_price, max_price,
 * min_rating, online (boolean).
 *
 * TO ADD A NEW FILTER:
 * 1. Add the field to AstrologerFilters in types/models.ts.
 * 2. Add a UI control in the filter panel below.
 * 3. Pass it in the RTK Query filters object (setFilter helper).
 * 4. Handle it in UserAstrologerController@index on the backend.
 *
 * REAL-TIME
 * ----------
 * The query polls every 30 s to reflect astrologers going online/offline.
 */
import { useState, useCallback, useRef }     from 'react';
import { useGetAstrologersQuery }     from '../../../store/api/astrologer.api';
import AstrologerCard                 from '../../../user/components/AstrologerCard';
import { PageLoader, AstrologerCardSkeleton } from '../../../components/ui/States';
import type { AstrologerFilters, ConsultationType } from '../../../types/models';

const EXPERTISE_OPTIONS = [
  'Vedic Astrology', 'KP Astrology', 'Numerology', 'Tarot Reading',
  'Vastu Shastra', 'Palmistry', 'Lal Kitab', 'Nadi Astrology',
];

const LANGUAGE_OPTIONS = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada',
];

const SORT_OPTIONS = [
  { value: 'top_rated',  label: '⭐ Top Rated'         },
  { value: 'price_low',  label: '₹ Price: Low to High' },
  { value: 'price_high', label: '₹ Price: High to Low' },
  { value: 'experience', label: '🏆 Most Experienced'  },
  { value: 'newest',     label: '🆕 Newest First'      },
];

const PRICE_PRESETS = [
  { label: 'Any', min: undefined, max: undefined },
  { label: 'Under ₹10', min: undefined, max: 10 },
  { label: '₹10-25',    min: 10, max: 25 },
  { label: '₹25-50',    min: 25, max: 50 },
  { label: 'Above ₹50', min: 50, max: undefined },
];

const RATING_OPTIONS = [
  { value: '',    label: 'Any Rating' },
  { value: '4.5', label: '4.5 ★ & above' },
  { value: '4',   label: '4.0 ★ & above' },
  { value: '3',   label: '3.0 ★ & above' },
];

type FilterKey = keyof AstrologerFilters;

export default function AstrologersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<AstrologerFilters>({ sort: 'top_rated', page: 1 });

  // Debounce search -- avoids API call on every keystroke
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAstrologersQuery(filters, {
    pollingInterval: 30000, // refresh every 30s to show live online status
  });
  const astrologers = Array.isArray(data?.data) ? data.data : [];
  const pagination  = data?.pagination ?? null;

  const handleSearch = useCallback((val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: val || undefined, page: 1 }));
    }, 400);
  }, []);

  const setFilter = useCallback((key: FilterKey, value: unknown) =>
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 })), []);

  const removeFilter = useCallback((key: FilterKey) =>
    setFilters(prev => { const n = { ...prev }; delete n[key]; n.page = 1; return n; }), []);

  const clearAll = useCallback(() => setFilters({ sort: 'top_rated', page: 1 }), []);

  const setPricePreset = useCallback((min?: number, max?: number) =>
    setFilters(prev => ({ ...prev, min_price: min, max_price: max, page: 1 })), []);

  // Active filters for chip display
  const activeChips: Array<{ key: FilterKey; label: string }> = [];
  if (filters.online)            activeChips.push({ key: 'online',            label: 'Online Only' });
  if (filters.expertise)         activeChips.push({ key: 'expertise',         label: filters.expertise });
  if (filters.language)          activeChips.push({ key: 'language',          label: filters.language });
  if (filters.min_rating)        activeChips.push({ key: 'min_rating',        label: `${filters.min_rating}★+` });
  if (filters.consultation_type) activeChips.push({ key: 'consultation_type', label: filters.consultation_type });
  if (filters.min_price || filters.max_price) {
    const min = filters.min_price, max = filters.max_price;
    const label = min && max ? `₹${min}-₹${max}` : min ? `₹${min}+` : `Under ₹${max}`;
    activeChips.push({ key: 'min_price', label });
  }

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="fas fa-star text-warning me-2" />
            Talk to an Astrologer
          </h2>
          <p className="t-muted mb-0 small">
            {pagination ? `${pagination.total} verified astrologers` : 'Find your perfect guide'}
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Search astrologers..."
            style={{ minWidth: 180 }}
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
          />
          <select
            className="form-select form-select-sm"
            style={{ minWidth: 190 }}
            value={filters.sort ?? 'top_rated'}
            onChange={e => setFilter('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            style={{ borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600, background: showFilters ? "var(--primary)" : "transparent", color: showFilters ? "#fff" : "var(--primary)", border: "1px solid var(--primary)", cursor: "pointer" }} className="btn btn-sm"
            onClick={() => setShowFilters(v => !v)}
          >
            <i className="fas fa-sliders-h me-1" />
            Filters
            {activeChips.length > 0 && (
              <span style={{ display:"inline-block", background:"#dc2626", color:"#fff", borderRadius:20, fontSize:10, fontWeight:700, padding:"1px 6px", marginLeft:4 }}>{activeChips.length}</span>
            )}
          </button>

          {activeChips.length > 0 && (
            <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
              <i className="fas fa-times me-1" />Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {activeChips.map(chip => (
            <span key={chip.key}
              style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: 20, background: "rgba(230,57,70,.12)", color: "var(--primary)", border: "1px solid rgba(230,57,70,.3)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
              onClick={() => {
                if (chip.key === 'min_price') { removeFilter('min_price'); removeFilter('max_price'); }
                else removeFilter(chip.key);
              }}
              title="Click to remove"
            >
              {chip.label} <i className="fas fa-times ms-1" style={{ fontSize: 10 }} />
            </span>
          ))}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="app-card mb-4" style={{ border: "1px solid rgba(var(--bs-primary-rgb),0.25)", transition: "none" }}>
            <div className="row g-3 align-items-end">

              <div className="col-md-3">
                <label className="form-label small fw-semibold mb-1">Expertise</label>
                <select className="form-select form-select-sm"
                  value={filters.expertise ?? ''}
                  onChange={e => setFilter('expertise', e.target.value)}>
                  <option value="">All Expertise</option>
                  {EXPERTISE_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold mb-1">Language</label>
                <select className="form-select form-select-sm"
                  value={filters.language ?? ''}
                  onChange={e => setFilter('language', e.target.value)}>
                  <option value="">All Languages</option>
                  {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold mb-1">Consult Via</label>
                <select className="form-select form-select-sm"
                  value={filters.consultation_type ?? ''}
                  onChange={e => setFilter('consultation_type', e.target.value as ConsultationType)}>
                  <option value="">Any</option>
                  <option value="chat">Chat</option>
                  <option value="call">Call</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold mb-1">Min Rating</label>
                <select className="form-select form-select-sm"
                  value={filters.min_rating ?? ''}
                  onChange={e => setFilter('min_rating', e.target.value ? parseFloat(e.target.value) : undefined)}>
                  {RATING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold mb-1">Price Range</label>
                <div className="d-flex gap-1 flex-wrap">
                  {PRICE_PRESETS.map(p => {
                    const active =
                      (p.min === undefined && p.max === undefined && !filters.min_price && !filters.max_price) ||
                      (p.min === filters.min_price && p.max === filters.max_price);
                    return (
                      <button key={p.label}
                        className={`btn btn-xs ${active ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ fontSize: 11, padding: '2px 8px' }}
                        onClick={() => setPricePreset(p.min, p.max)}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="col-md-2 d-flex align-items-center pb-1">
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" id="onlineOnly"
                    checked={!!filters.online}
                    onChange={e => setFilter('online', e.target.checked || undefined)}
                    style={{ cursor: 'pointer' }} />
                  <label className="form-check-label small fw-semibold" htmlFor="onlineOnly">
                    Online Only
                  </label>
                </div>
              </div>

            </div>
          </div>
      )}

      {/* Results */}
      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle text-danger fa-3x d-block mb-3" />
          <p className="t-muted mb-3">Something went wrong.</p>
          <button className="btn btn-outline-primary" onClick={refetch}>Try Again</button>
        </div>
      ) : astrologers.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-search t-muted fa-3x d-block mb-3" />
          <p className="t-muted mb-1 fw-semibold">No astrologers found</p>
          <p className="t-muted small mb-3">Try different filters</p>
          <button className="btn btn-outline-primary" onClick={clearAll}>Clear All Filters</button>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {astrologers.map(a => (
              <div key={a.id} className="col-md-6 col-lg-4">
                <AstrologerCard astrologer={a} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination pagination-sm">
                  <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link"
                      onClick={() => setFilter('page', pagination.current_page - 1)}>
                      {'< Prev'}
                    </button>
                  </li>
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 2)
                    .reduce<number[]>((acc, p, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== p - 1) acc.push(-1);
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === -1
                        ? <li key={`e${idx}`} className="page-item disabled"><span className="page-link">...</span></li>
                        : <li key={p} className={`page-item ${p === pagination.current_page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setFilter('page', p)}>{p}</button>
                          </li>
                    )}
                  <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                    <button className="page-link"
                      onClick={() => setFilter('page', pagination.current_page + 1)}>
                      {'Next >'}
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


