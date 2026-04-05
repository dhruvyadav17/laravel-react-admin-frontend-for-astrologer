// PATH: src/components/ui/StarRating.tsx
// NEW: Shared star rating — display + interactive
// Replaces Stars() in: AstrologerDetailPage, MyReviewsPage, AstrologerCard

type Props = {
  rating:       number;
  size?:        number;
  interactive?: boolean;
  onChange?:    (rating: number) => void;
};

export default function StarRating({ rating, size = 16, interactive = false, onChange }: Props) {
  if (interactive && onChange) {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" className="btn btn-sm border-0 p-0"
            onClick={() => onChange(star)} style={{ fontSize: size * 2, lineHeight: 1 }}>
            <span className={star <= rating ? "text-warning" : "text-muted"}>★</span>
          </button>
        ))}
      </div>
    );
  }

  const full = Math.min(Math.max(Math.round(rating), 0), 5);
  return (
    <span style={{ fontSize: size }}>
      <span className="text-warning">{"★".repeat(full)}</span>
      <span className="text-muted">{"☆".repeat(5 - full)}</span>
    </span>
  );
}
