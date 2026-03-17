type Props = {
  label?: string;

  value: string | number;
  onChange: (value: string) => void;

  type?: "text" | "email" | "password" | "number";
  placeholder?: string;

  error?: string;
  disabled?: boolean;
  required?: boolean;

  className?: string;
};

export default function FormInput({
  label,
  value,
  onChange,

  type = "text",
  placeholder,

  error,
  disabled = false,
  required = false,

  className = "",
}: Props) {
  return (
    <div className={`mb-2 ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && (
            <span className="text-danger ms-1">*</span>
          )}
        </label>
      )}

      <input
        type={type}
        className={`form-control ${error ? "is-invalid" : ""}`}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />

      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
