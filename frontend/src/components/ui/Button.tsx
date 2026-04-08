type Props = {
  label?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
};

export default function Button({
  label,
  onClick,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  size = "md",
  className = "",
  type = "button",
  title,
}: Props) {
  const sizeClass =
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" />
      )}
      {icon && !loading && <i className={`${icon} me-1`} />}
      {label}
    </button>
  );
}
