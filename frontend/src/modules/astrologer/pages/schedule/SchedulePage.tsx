/**
 * SchedulePage -- weekly availability schedule editor.
 *
 * The astrologer sets per-day on/off toggles and start/end times.
 * Data is saved as POST /astrologer/me/schedule (replaces existing schedule).
 *
 * Backend model: astrologer_schedules (one row per active day, day_of_week 0-6).
 *
 * The schedule is PUBLIC -- users can see it on the astrologer's profile page
 * to know when to book. It is currently informational only (no booking slots).
 *
 * TO ADD SLOT-BASED BOOKING:
 * 1. Generate 30/60-min slots from the schedule on the backend.
 * 2. Add a consultations.scheduled_at column.
 * 3. Show a slot picker in BookingModal before confirming.
 */
import { useEffect, useState }         from "react";
import {
  useMyScheduleQuery,
  useSaveScheduleMutation,
} from "../../../../store/astrologer.api";
import { PageLoader } from "../../../../components/ui/States";
import type { AstrologerSchedule } from "../../../../types/models";
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
    is_active:   i >= 1 && i <= 5, // Mon-Fri on by default
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

        <div className="app-card">
          <div className="d-flex align-items-center justify-content-between p-3" style={{ borderBottom: "1px solid var(--bdr)" }}>
            <div>
              <h5 className="fw-bold t-main mb-0">
                <i className="fas fa-calendar-alt me-2 text-primary" />
                Weekly Schedule
              </h5>
              <small className="t-muted">
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

          <div>
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead style={{ background: "var(--surf2)", borderBottom: "2px solid var(--bdr)" }}>
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
                          <span className={`fw-semibold ${row.is_active ? "" : "t-muted"}`}>
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
                            <span style={{ background: "rgba(34,197,94,.12)", color: "#16a34a", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                              {dur}
                            </span>
                          ) : (
                            <span style={{ background: "rgba(100,116,139,.12)", color: "#64748b", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
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

          <div className="t-muted small p-3" style={{ borderTop: "1px solid var(--bdr)" }}>
            <i className="fas fa-info-circle me-1" />
            Changes are visible to users immediately after saving.
          </div>
        </div>
    </>
  );
}