import { useEffect, useState }         from "react";
import {
  useMyScheduleQuery,
  useSaveScheduleMutation,
} from "../../../store/api/astrologer.api";
import { PageLoader } from "../../../components/ui/States";
import type { AstrologerSchedule } from "../../../types/models";
import { toast } from "react-toastify";

const DAYS = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
];

type DayRow = {
  day_of_week: number;
  start_time:  string;
  end_time:    string;
  is_active:   boolean;
};

function buildDefaults(): DayRow[] {
  return DAYS.map((_, i) => ({
    day_of_week: i,
    start_time:  "09:00",
    end_time:    "18:00",
    is_active:   i >= 1 && i <= 5, // Mon–Fri on by default
  }));
}

function calcDuration(start: string, end: string): string | null {
  try {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const total = eh * 60 + em - (sh * 60 + sm);
    if (total <= 0) return null;
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
  } catch {
    return null;
  }
}

export default function SchedulePage() {
  const { data: saved, isLoading } = useMyScheduleQuery();
  const [save, { isLoading: saving }] = useSaveScheduleMutation();
  const [rows, setRows] = useState<DayRow[]>(buildDefaults());

  /* Merge saved schedule with defaults */
  useEffect(() => {
    if (saved && saved.length > 0) {
      setRows(
        buildDefaults().map((def) => {
          const existing = saved.find(
            (s: AstrologerSchedule) => s.day_of_week === def.day_of_week
          );
          if (!existing) return def;
          return {
            ...def,
            start_time: existing.start_time,
            end_time:   existing.end_time,
            is_active:  existing.is_active,
          };
        })
      );
    }
  }, [saved]);

  const updateRow = (
    idx: number,
    field: keyof DayRow,
    value: string | boolean
  ) =>
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );

  const handleSave = async () => {
    try {
      await save(rows).unwrap();
      toast.success("Schedule saved successfully!");
    } catch {
      toast.error("Failed to save schedule. Please try again.");
    }
  };

  if (isLoading) return <PageLoader />;

  const activeDays = rows.filter((r) => r.is_active).length;

  return (
    <>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <div>
              <h5 className="card-title mb-0">
                <i className="fas fa-calendar-alt me-2 text-primary" />
                Weekly Schedule
              </h5>
              <small className="text-muted">
                {activeDays} active day{activeDays !== 1 ? "s" : ""} per week
              </small>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : (
                <i className="fas fa-save me-1" />
              )}
              Save Schedule
            </button>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 130 }}>Day</th>
                    <th style={{ width: 80 }}>Active</th>
                    <th style={{ width: 160 }}>Start Time</th>
                    <th style={{ width: 160 }}>End Time</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const dur = calcDuration(row.start_time, row.end_time);
                    return (
                      <tr
                        key={row.day_of_week}
                        className={!row.is_active ? "opacity-50" : ""}
                      >
                        <td>
                          <span className={`fw-semibold ${row.is_active ? "" : "text-muted"}`}>
                            {DAYS[row.day_of_week]}
                          </span>
                        </td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={row.is_active}
                              onChange={(e) =>
                                updateRow(idx, "is_active", e.target.checked)
                              }
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={row.start_time}
                            disabled={!row.is_active}
                            onChange={(e) =>
                              updateRow(idx, "start_time", e.target.value)
                            }
                            style={{ width: 130 }}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={row.end_time}
                            disabled={!row.is_active}
                            onChange={(e) =>
                              updateRow(idx, "end_time", e.target.value)
                            }
                            style={{ width: 130 }}
                          />
                        </td>
                        <td>
                          {row.is_active && dur ? (
                            <span className="badge bg-success-subtle text-success fw-normal">
                              {dur}
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary fw-normal">
                              Day off
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer text-muted small">
            <i className="fas fa-info-circle me-1" />
            Changes are visible to users immediately after saving.
          </div>
        </div>
    </>
  );
}