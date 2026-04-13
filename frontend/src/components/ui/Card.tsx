import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  action,
  className = '',
}: {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  if (!title && !action) return null;

  return (
    <div className={`card-header d-flex align-items-center justify-content-between ${className}`}>
      {title && <h5 className="mb-0">{title}</h5>}
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  loading = false,
  empty = false,
  emptyText = 'No data available',
}: {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
}) {
  if (loading) {
    return (
      <div className="card-body text-center py-5 t-muted">
        <div className="spinner-border mb-2" />
        <div>Loading...</div>
      </div>
    );
  }

  if (empty) {
    return <div className="card-body text-center py-5 t-muted">{emptyText}</div>;
  }

  return <div className={`card-body ${className}`}>{children}</div>;
}
