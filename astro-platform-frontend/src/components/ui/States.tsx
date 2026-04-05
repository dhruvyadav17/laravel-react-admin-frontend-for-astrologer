// PATH: src/components/ui/States.tsx
// NEW: PageLoader + EmptyState — 2 components, 1 file
// Replaces inline spinner + "no data" in 7+ files

export function PageLoader({ color = "primary" }: { color?: string }) {
  return (
    <div className="text-center py-5">
      <div className={`spinner-border text-${color}`} role="status" />
    </div>
  );
}

export function EmptyState({ icon = "fa-inbox", text = "No data found", subtext }: {
  icon?: string; text?: string; subtext?: string;
}) {
  return (
    <div className="text-center py-5 text-muted">
      <i className={`fas ${icon} fa-2x d-block mb-2 opacity-25`} />
      <p className="mb-0 fw-semibold">{text}</p>
      {subtext && <p className="mb-0 small mt-1">{subtext}</p>}
    </div>
  );
}
