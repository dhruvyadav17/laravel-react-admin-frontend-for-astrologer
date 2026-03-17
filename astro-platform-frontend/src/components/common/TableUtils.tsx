/* ===================================================== */
/* ================= TABLE SEARCH ====================== */
/* ===================================================== */

type TableSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
}: TableSearchProps) {
  return (
    <div className="mb-3">
      <input
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ===================================================== */
/* ================= STATUS BADGE ====================== */
/* ===================================================== */

type StatusBadgeProps = {
  status?: "active" | "inactive" | "locked" | "archived";
  active?: boolean;
};

export function StatusBadge({
  status,
  active,
}: StatusBadgeProps) {
  let label = "Inactive";
  let className = "badge bg-secondary";

  if (status) {
    switch (status) {
      case "active":
        label = "Active";
        className = "badge bg-success";
        break;
      case "inactive":
        label = "Inactive";
        className = "badge bg-secondary";
        break;
      case "locked":
        label = "Locked";
        className = "badge bg-danger";
        break;
      case "archived":
        label = "Archived";
        className = "badge bg-warning";
        break;
    }
  } else if (active !== undefined) {
    label = active ? "Active" : "Inactive";
    className = active
      ? "badge bg-success"
      : "badge bg-secondary";
  }

  return <span className={className}>{label}</span>;
}
