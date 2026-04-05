// PATH: src/components/table/table.helpers.tsx
// FIX: TableSearch mein debounce nahi tha — har keystroke pe API call hoti thi
//      Ab useDebounce hook use kiya — 400ms delay
// FIX: TableSearch mein clear button add kiya

import { useState, useEffect } from "react";
import { useDebounce }          from "../../hooks/useDebounce";

/* ── Table Search (Debounced) ─────────────────────── */
type TableSearchProps = {
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
};

export function TableSearch({ value, onChange, placeholder = "Search..." }: TableSearchProps) {
  // Local input state — updates instantly for UI
  const [input, setInput] = useState(value);

  // Debounced value — triggers parent onChange after 400ms pause
  const debounced = useDebounce(input, 400);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
  }, [debounced]);

  // Sync if parent resets value (e.g. clear all filters)
  useEffect(() => {
    if (value === "" && input !== "") setInput("");
  }, [value]);

  return (
    <div className="mb-3">
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <i className="fas fa-search text-muted" style={{ fontSize: 13 }} />
        </span>
        <input
          className="form-control border-start-0"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {input && (
          <button
            className="btn btn-outline-secondary border-start-0"
            type="button"
            onClick={() => { setInput(""); onChange(""); }}
            title="Clear search"
          >
            <i className="fas fa-times" style={{ fontSize: 12 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Status Badge ─────────────────────────────────── */
type StatusBadgeProps = {
  status?: "active" | "inactive" | "locked" | "archived";
  active?: boolean;
};

export function StatusBadge({ status, active }: StatusBadgeProps) {
  let label     = "Inactive";
  let className = "badge bg-secondary";

  if (status) {
    const map: Record<string, [string, string]> = {
      active:   ["Active",   "badge bg-success"],
      inactive: ["Inactive", "badge bg-secondary"],
      locked:   ["Locked",   "badge bg-danger"],
      archived: ["Archived", "badge bg-warning text-dark"],
    };
    [label, className] = map[status] ?? [label, className];
  } else if (active !== undefined) {
    label     = active ? "Active"   : "Inactive";
    className = active ? "badge bg-success" : "badge bg-secondary";
  }

  return <span className={className}>{label}</span>;
}
