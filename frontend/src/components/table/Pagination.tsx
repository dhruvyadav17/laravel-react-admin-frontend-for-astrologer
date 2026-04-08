type Meta = {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

type Props = {
  meta: Meta;
  onPageChange: (page: number) => void;
  onPerPageChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

export default function Pagination({
  meta,
  onPageChange,
  onPerPageChange,
  pageSizeOptions = [10, 25, 50],
}: Props) {
  const { current_page, last_page, total, per_page } = meta;

  if (last_page <= 1) return null;

  /* ================= PAGE NUMBERS ================= */
  const getPages = () => {
    const pages: number[] = [];
    const start = Math.max(1, current_page - 2);
    const end = Math.min(last_page, current_page + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      {/* LEFT INFO */}
      <div className="text-muted small">
        Page {current_page} of {last_page} • Total {total}
      </div>

      {/* RIGHT CONTROLS */}
      <div className="d-flex align-items-center gap-2">
        {/* PAGE SIZE */}
        {onPerPageChange && (
          <select
            className="form-select form-select-sm"
            style={{ width: 80 }}
            value={per_page}
            onChange={(e) =>
              onPerPageChange(Number(e.target.value))
            }
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        )}

        {/* PREV */}
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={current_page === 1}
          onClick={() => onPageChange(current_page - 1)}
        >
          Prev
        </button>

        {/* PAGE NUMBERS */}
        {getPages().map((page) => (
          <button
            key={page}
            className={`btn btn-sm ${
              page === current_page
                ? "btn-primary"
                : "btn-outline-secondary"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* NEXT */}
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={current_page === last_page}
          onClick={() => onPageChange(current_page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
