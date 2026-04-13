/**
 * Shared loading and empty-state components.
 *
 * PageLoader       -- full-page centered spinner
 * EmptyState       -- icon + text for empty lists / 404 sections
 * AstrologerCardSkeleton -- shimmer placeholder while astrologers load
 *
 * TO ADD A NEW SKELETON: copy AstrologerCardSkeleton and adjust the
 * skeleton-box dimensions to match your card layout.
 * The shimmer animation is injected once via a <style> tag (skeleton-css id).
 */
/* -- Keyframe for skeleton shimmer -------------- */
const skeletonStyle = `
@keyframes skeletonShimmer {
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skeleton-box {
  background: linear-gradient(90deg, var(--surf2) 0px, var(--surf3) 40px, var(--surf2) 80px);
  background-size: 200px 100%;
  animation: skeletonShimmer 1.4s ease infinite;
  border-radius: 6px;
}
`;

// Inject skeleton CSS once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-css')) {
  const style = document.createElement('style');
  style.id = 'skeleton-css';
  style.textContent = skeletonStyle;
  document.head.appendChild(style);
}

/* -- PageLoader ---------------------------------- */
export function PageLoader({ color = 'danger' }: { color?: string }) {
  return (
    <div className="text-center py-5">
      <div className={`spinner-border text-${color}`} role="status" />
    </div>
  );
}

/* -- EmptyState ----------------------------------- */
export function EmptyState({ icon = 'fa-inbox', text = 'No data found', subtext }: {
  icon?: string; text?: string; subtext?: string;
}) {
  return (
    <div className="text-center py-5 t-muted">
      <i className={`fas ${icon} fa-2x d-block mb-2 opacity-25`} />
      <p className="mb-0 fw-semibold">{text}</p>
      {subtext && <p className="mb-0 small mt-1">{subtext}</p>}
    </div>
  );
}

/* -- AstrologerCardSkeleton ----------------------- */
export function AstrologerCardSkeleton() {
  return (
    <div className="astro-card-new d-flex flex-column text-center" style={{ minHeight: 320 }}>
      {/* Avatar */}
      <div className="skeleton-box mx-auto mb-3"
        style={{ width: 88, height: 88, borderRadius: '50%' }} />
      {/* Name */}
      <div className="skeleton-box mx-auto mb-2" style={{ width: '70%', height: 16 }} />
      {/* Expertise */}
      <div className="skeleton-box mx-auto mb-2" style={{ width: '50%', height: 12 }} />
      {/* Stars */}
      <div className="skeleton-box mx-auto mb-2" style={{ width: '60%', height: 12 }} />
      {/* Experience */}
      <div className="skeleton-box mx-auto mb-3" style={{ width: '40%', height: 12 }} />
      {/* Badges */}
      <div className="d-flex gap-1 justify-content-center mb-3">
        <div className="skeleton-box" style={{ width: 50, height: 20, borderRadius: 20 }} />
        <div className="skeleton-box" style={{ width: 60, height: 20, borderRadius: 20 }} />
      </div>
      {/* Footer */}
      <div className="mt-auto pt-2" style={{ borderTop: '1px solid var(--bdr)' }}>
        <div className="skeleton-box mb-2" style={{ width: '100%', height: 36, borderRadius: 8 }} />
      </div>
    </div>
  );
}
