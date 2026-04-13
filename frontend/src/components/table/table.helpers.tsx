import { useState, useEffect } from "react";
import { useDebounce }          from "../../core/hooks/useDebounce";

/* -- Table Search (Debounced) ----------------------- */
export function TableSearch({ value, onChange, placeholder = "Search..." }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [input, setInput] = useState(value);
  const debounced         = useDebounce(input, 400);

  useEffect(() => { if (debounced !== value) onChange(debounced); }, [debounced]);
  useEffect(() => { if (value === "" && input !== "") setInput(""); }, [value]);

  return (
    <div className="mb-3">
      <div className="input-group">
        <span className="input-group-text border-end-0" style={{ background: "var(--surf, #fff)", color: "var(--txt-m, #6b7280)" }}>
          <i className="fas fa-search t-muted" style={{ fontSize: 13 }} />
        </span>
        <input className="form-control border-start-0" placeholder={placeholder}
          value={input} onChange={(e) => setInput(e.target.value)} />
        {input && (
          <button className="btn btn-outline-secondary border-start-0" type="button"
            onClick={() => { setInput(""); onChange(""); }}>
            <i className="fas fa-times" style={{ fontSize: 12 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* -- Status Badge ----------------------------------- */
export function StatusBadge({ status, active }: {
  status?: "active" | "inactive" | "locked" | "archived"; active?: boolean;
}) {
  let label = "Inactive", className = "badge bg-secondary";
  const archivedStyle = {
    background: "rgba(234,179,8,.15)",
    color: "#92400e",
    border: "1px solid rgba(234,179,8,.3)",
    fontSize: 11,
    borderRadius: 20,
    padding: "3px 8px",
  };

  if (status) {
    const map: Record<string, [string, string]> = {
      active: ["Active", "badge bg-success"],
      inactive: ["Inactive", "badge bg-secondary"],
      locked: ["Locked", "badge bg-danger"],
      archived: ["Archived", "badge"],
    };
    [label, className] = map[status] ?? [label, className];
  } else if (active !== undefined) {
    label = active ? "Active" : "Inactive";
    className = active ? "badge bg-success" : "badge bg-secondary";
  }

  return <span className={className} style={status === "archived" ? archivedStyle : undefined}>{label}</span>;
}

/* -- Online Badge -- NEW ----------------------------- */
export function OnlineBadge({ online }: { online: boolean }) {
  return (
    <span className={`badge ${online ? "bg-success" : "bg-secondary"}`}>
      <i className="fas fa-circle me-1" style={{ fontSize: 7 }} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

/* -- Verified Badge -- NEW --------------------------- */
export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="badge bg-success">
      <i className="fas fa-check-circle me-1" />Verified
    </span>
  ) : (
    <span className="badge" style={{ background:"rgba(234,179,8,.15)", color:"#92400e", border:"1px solid rgba(234,179,8,.3)", fontSize:11, borderRadius:20, padding:"3px 8px" }}>Unverified</span>
  );
}

