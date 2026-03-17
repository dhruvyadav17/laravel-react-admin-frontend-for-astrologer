type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: Props) {
  return (
    <div className="text-center py-5">
      <div className="mb-3 text-danger fw-semibold">
        {message}
      </div>

      {onRetry && (
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
