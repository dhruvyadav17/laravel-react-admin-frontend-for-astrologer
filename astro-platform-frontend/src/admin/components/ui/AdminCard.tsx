import {
  Card,
  CardHeader,
  CardBody,
} from "../../../components/ui/Card";

import ErrorState from "../../../components/common/ErrorState";

type Props = {
  title?: string;
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyText?: string;
  className?: string;
  children: React.ReactNode;
};

export default function AdminCard({
  title,
  loading = false,
  empty = false,
  error = false,
  onRetry,
  emptyText = "No data available",
  className = "",
  children,
}: Props) {
  return (
    <Card className={className}>
      {title && <CardHeader title={title} />}

      <CardBody className="p-0">
        {error ? (
          <ErrorState onRetry={onRetry} />
        ) : loading ? (
          <div className="p-4 text-center text-muted">
            Loading...
          </div>
        ) : empty ? (
          <div className="p-4 text-center text-muted">
            {emptyText}
          </div>
        ) : (
          children
        )}
      </CardBody>
    </Card>
  );
}
