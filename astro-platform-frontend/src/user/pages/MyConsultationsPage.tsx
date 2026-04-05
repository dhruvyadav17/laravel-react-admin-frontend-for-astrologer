// PATH: src/user/pages/MyConsultationsPage.tsx
// NEW: User consultation history — list with status, chat link, cancel button

import { useState }                     from "react";
import { Link }                         from "react-router-dom";
import { useMyConsultationsQuery,
         useCancelConsultationMutation } from "../../store/api/consultation.api";
import { PageLoader, EmptyState }        from "../../components/ui/States";
import Avatar                            from "../../components/ui/Avatar";
import UserPage                          from "../components/ui/UserPage";
import { toast }                         from "react-toastify";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:     { label: "Pending",     color: "warning", icon: "fa-clock"          },
  accepted:    { label: "Accepted",    color: "info",    icon: "fa-check"          },
  in_progress: { label: "In Progress", color: "primary", icon: "fa-circle"         },
  completed:   { label: "Completed",   color: "success", icon: "fa-check-circle"   },
  rejected:    { label: "Rejected",    color: "danger",  icon: "fa-times-circle"   },
  cancelled:   { label: "Cancelled",   color: "secondary",icon: "fa-ban"           },
};

const TYPE_ICONS: Record<string, string> = {
  chat: "fa-comment", call: "fa-phone", video: "fa-video",
};

const FILTERS = [
  { value: "",            label: "All"         },
  { value: "pending",     label: "Pending"     },
  { value: "accepted",    label: "Accepted"    },
  { value: "in_progress", label: "In Progress" },
  { value: "completed",   label: "Completed"   },
  { value: "rejected",    label: "Rejected"    },
];

export default function MyConsultationsPage() {
  const [filter, setFilter] = useState("");

  const { data, isLoading, refetch } = useMyConsultationsQuery({ status: filter || undefined });
  const [cancel, { isLoading: cancelling }] = useCancelConsultationMutation();

  const consultations = data?.data ?? [];

  const handleCancel = async (id: number) => {
    if (!confirm("Kya aap yeh booking request cancel karna chahte hain?")) return;
    try {
      await cancel(id).unwrap();
      toast.success("Consultation cancelled");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Cancel nahi ho paya");
    }
  };

  return (
    <UserPage title="📞 My Consultations">

      {/* Filter tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`btn btn-sm ${filter === f.value ? "btn-primary-app" : "btn-outline-secondary"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : consultations.length === 0 ? (
        <EmptyState
          icon="fa-phone-slash"
          text="No consultations yet"
          subtext="Kisi astrologer se baat karein — 'Talk Now' button se booking karein"
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {consultations.map((c) => {
            const st = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.cancelled;
            return (
              <div key={c.id} className="app-card">
                <div className="d-flex align-items-start gap-3 flex-wrap">

                  {/* Astrologer avatar */}
                  <Avatar
                    name={c.astrologer?.name}
                    src={c.astrologer?.profile_image}
                    size={48}
                    color="primary"
                  />

                  {/* Info */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span className="fw-bold">{c.astrologer?.name ?? "Astrologer"}</span>
                      <span className={`badge bg-${st.color}`}>
                        <i className={`fas ${st.icon} me-1`} style={{ fontSize: 9 }} />
                        {st.label}
                      </span>
                      <span className="badge bg-light text-dark border" style={{ fontSize: 10 }}>
                        <i className={`fas ${TYPE_ICONS[c.type] ?? "fa-comment"} me-1`} />
                        {c.type}
                      </span>
                    </div>
                    <div className="text-muted small mb-1">{c.astrologer?.expertise}</div>
                    <div className="d-flex gap-3 text-muted small flex-wrap">
                      <span>₹{c.rate_per_minute}/min</span>
                      {c.duration_minutes && <span>{c.duration_minutes} min</span>}
                      {c.total_amount    && <span className="fw-semibold text-dark">Total: ₹{c.total_amount}</span>}
                      <span>{c.created_at}</span>
                    </div>
                    {c.user_note && (
                      <p className="text-muted small mt-1 mb-0">
                        <i className="fas fa-quote-left me-1 opacity-50" />
                        {c.user_note}
                      </p>
                    )}
                    {c.rejection_reason && (
                      <p className="text-danger small mt-1 mb-0">
                        <i className="fas fa-exclamation-circle me-1" />
                        {c.rejection_reason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-column gap-2 align-items-end flex-shrink-0">
                    {(c.status === "accepted" || c.status === "in_progress") && (
                      <Link to={`/consultations/${c.id}`}
                        className="btn btn-sm btn-call">
                        <i className="fas fa-comment me-1" />
                        {c.status === "in_progress" ? "Join Session" : "Open Chat"}
                      </Link>
                    )}
                    {c.status === "pending" && (
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancel(c.id)}
                        disabled={cancelling}>
                        Cancel
                      </button>
                    )}
                    {c.status === "completed" && (
                      <Link to={`/consultations/${c.id}`}
                        className="btn btn-sm btn-outline-secondary">
                        View Summary
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book CTA */}
      <div className="text-center mt-5">
        <Link to="/astrologers" className="btn btn-outline-app">
          <i className="fas fa-search me-2" />Find Astrologers
        </Link>
      </div>
    </UserPage>
  );
}