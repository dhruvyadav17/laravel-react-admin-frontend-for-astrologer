type Option = {
  label: string;
  value: string | number;
};

type Props = {
  label?: string;

  value: string | number;
  onChange: (value: string) => void;

  options: Option[];
  placeholder?: string;

  error?: string;
  disabled?: boolean;
  required?: boolean;

  className?: string;
};

export default function FormSelect({
  label,
  value,
  onChange,

  options,
  placeholder = "Select option",

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

      <select
        className={`form-select ${error ? "is-invalid" : ""}`}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
