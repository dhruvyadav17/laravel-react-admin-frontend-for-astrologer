// PATH: src/admin/components/page/AdminTablePage.tsx
// FIX: onAction optional kiya — CrudTable undefined pass karta hai jab create permission nahi

import type { ReactNode } from 'react';

type Props = {
  title:       string;
  actionLabel?: string;
  onAction?:   () => void;
  loading?:    boolean;
  error?:      boolean;
  onRetry?:    () => void;
  empty?:      boolean;
  columns:     ReactNode;
  children:    ReactNode;
  topContent?: ReactNode;
  permission?: string | boolean;
};

export default function AdminTablePage({
  title, actionLabel = 'Add', onAction,
  loading = false, error = false, onRetry,
  empty = false, columns, children, topContent,
}: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold">{title}</h5>
        {onAction && (
          <button className="btn btn-primary btn-sm" onClick={onAction}>
            <i className="fas fa-plus me-1" />{actionLabel}
          </button>
        )}
      </div>

      {topContent && (
        <div className="card-body border-bottom pb-2 pt-3">{topContent}</div>
      )}

      <div className="card-body p-0">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-5">
            <i className="fas fa-exclamation-triangle text-danger fa-2x mb-2 d-block" />
            <p className="text-muted mb-2">Failed to load data</p>
            {onRetry && (
              <button className="btn btn-outline-secondary btn-sm" onClick={onRetry}>
                <i className="fas fa-redo me-1" />Retry
              </button>
            )}
          </div>
        )}

        {!loading && !error && empty && (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-inbox fa-2x mb-2 d-block" />
            <p className="mb-0">No records found</p>
          </div>
        )}

        {!loading && !error && !empty && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">{columns}</thead>
              <tbody>{children}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
