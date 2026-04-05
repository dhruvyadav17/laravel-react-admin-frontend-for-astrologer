// PATH: src/astrologer/features/consultations/ConsultationsPage.tsx
// NEW: Astrologer side — pending requests, active sessions, history

import { useState }                          from "react";
import { Link }                              from "react-router-dom";
import {
  useAstrologerConsultationsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useStartConsultationMutation,
  useEndConsultationMutation,
} from "../../../store/api/consultation.api";
import { PageLoader, EmptyState }            from "../../../components/ui/States";
import Avatar                                from "../../../components/ui/Avatar";
import { toast }                             from "react-toastify";
import type { Consultation }                 from "../../../store/api/consultation.api";

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending:     { label: "Pending",     color: "warning"   },
  accepted:    { label: "Accepted",    color: "info"      },
  in_progress: { label: "In Progress", color: "success"   },
  completed:   { label: "Completed",   color: "secondary" },
  rejected:    { label: "Rejected",    color: "danger"    },
  cancelled:   { label: "Cancelled",   color: "secondary" },
};

const TYPE_ICON: Record<string, string> = {
  chat: "fa-comment", call: "fa-phone", video: "fa-video",
};

const FILTERS = [
  { value: "",            label: "All"         },
  { value: "pending",     label: "Pending"     },
  { value: "accepted",    label: "Accepted"    },
  { value: "in_progress", label: "Live"        },
  { value: "completed",   label: "Completed"   },
];

/* ── Reject modal ───────────────────────────────── */
function RejectModal({
  onConfirm, onClose, loading,
}: { onConfirm: (reason: string) => void; onClose: () => void; loading: boolean }) {
  const [reason, setReason] = useState("");
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={onClose}>
      <div className="card p-4" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
        <h6 className="fw-bold mb-3">Reject Request</h6>
        <textarea className="form-control mb-3" rows={3}
          placeholder="Rejection reason (optional)..."
          value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm w-100" disabled={loading}
            onClick={() => onConfirm(reason)}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Single consultation card ───────────────────── */
function ConsultCard({ c }: { c: Consultation }) {
  const [accept,  { isLoading: accepting }] = useAcceptConsultationMutation();
  const [reject,  { isLoading: rejecting }] = useRejectConsultationMutation();
  const [start,   { isLoading: starting  }] = useStartConsultationMutation();
  const [end,     { isLoading: ending    }] = useEndConsultationMutation();
  const [showReject, setShowReject]          = useState(false);

  const st = STATUS_BADGE[c.status] ?? STATUS_BADGE.cancelled;

  const handleAccept = async () => {
    try {
      await accept(c.id).unwrap();
      toast.success("Consultation accepted");
    } catch { toast.error("Action failed"); }
  };

  const handleReject = async (reason: string) => {
    try {
      await reject({ id: c.id, reason }).unwrap();
      toast.success("Consultation rejected");
      setShowReject(false);
    } catch { toast.error("Action failed"); }
  };

  const handleStart = async () => {
    try {
      await start(c.id).unwrap();
      toast.success("Session started");
    } catch { toast.error("Action failed"); }
  };

  const handleEnd = async () => {
    if (!confirm("Session end karein? Bill calculate ho jaayega.")) return;
    try {
      const res = await end(c.id).unwrap();
      toast.success(`Session ended — ₹${res.total_amount} (${res.duration_minutes} min)`);
    } catch { toast.error("Action failed"); }
  };

  return (
    <>
      <div className={`card mb-3 ${c.status === "in_progress" ? "border-success border-2" : ""}`}>
        <div className="card-body">
          <div className="d-flex align-items-start gap-3 flex-wrap">

            {/* User avatar */}
            <Avatar name={c.user?.name} src={c.user?.profile_image} size={44} color="secondary" />

            {/* Info */}
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <span className="fw-bold small">{c.user?.name ?? "User"}</span>
                <span className={`badge bg-${st.color}`} style={{ fontSize: 10 }}>{st.label}</span>
                <span className="badge bg-light text-dark border" style={{ fontSize: 10 }}>
                  <i className={`fas ${TYPE_ICON[c.type] ?? "fa-comment"} me-1`} />{c.type}
                </span>
                {c.status === "in_progress" && (
                  <span className="badge bg-success" style={{ fontSize: 10 }}>
                    <i className="fas fa-circle me-1" style={{ fontSize: 7 }} />LIVE
                  </span>
                )}
              </div>

              <div className="text-muted small mb-1">
                ₹{c.rate_per_minute}/min · {c.created_at}
              </div>

              {c.user_note && (
                <div className="alert alert-light py-1 px-2 small mb-1">
                  <i className="fas fa-quote-left me-1 opacity-50" />{c.user_note}
                </div>
              )}

              {c.status === "completed" && (
                <div className="text-muted small">
                  <i className="fas fa-check-circle text-success me-1" />
                  {c.duration_minutes} min · ₹{c.total_amount} earned
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="d-flex flex-column gap-2 flex-shrink-0 align-items-end">

              {c.status === "pending" && (
                <>
                  <button className="btn btn-success btn-sm"
                    onClick={handleAccept} disabled={accepting}>
                    {accepting
                      ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="fas fa-check me-1" />Accept</>}
                  </button>
                  <button className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowReject(true)}>
                    <i className="fas fa-times me-1" />Reject
                  </button>
                </>
              )}

              {c.status === "accepted" && (
                <>
                  <button className="btn btn-primary btn-sm"
                    onClick={handleStart} disabled={starting}>
                    {starting
                      ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="fas fa-play me-1" />Start Session</>}
                  </button>
                  <Link to={`/astrologer/consultations/${c.id}`}
                    className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-comment me-1" />Chat
                  </Link>
                </>
              )}

              {c.status === "in_progress" && (
                <>
                  <Link to={`/astrologer/consultations/${c.id}`}
                    className="btn btn-success btn-sm">
                    <i className="fas fa-comment me-1" />Open Chat
                  </Link>
                  <button className="btn btn-outline-danger btn-sm"
                    onClick={handleEnd} disabled={ending}>
                    {ending
                      ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="fas fa-stop me-1" />End Session</>}
                  </button>
                </>
              )}

              {c.status === "completed" && (
                <Link to={`/astrologer/consultations/${c.id}`}
                  className="btn btn-outline-secondary btn-sm">
                  View Chat
                </Link>
              )}

            </div>
          </div>
        </div>
      </div>

      {showReject && (
        <RejectModal
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
          loading={rejecting}
        />
      )}
    </>
  );
}

/* ── Main page ──────────────────────────────────── */
export default function ConsultationsPage() {
  const [filter, setFilter] = useState("");

  const { data, isLoading } = useAstrologerConsultationsQuery(
    { status: filter || undefined },
    { pollingInterval: 15000 }    // auto-refresh every 15s for new requests
  );

  const consultations = data?.data ?? [];

  // Count pending for badge
  const { data: pendingData } = useAstrologerConsultationsQuery({ status: "pending" });
  const pendingCount           = pendingData?.data.length ?? 0;

  return (
    <section className="content pt-3">
      <div className="container-fluid">

        {/* Filter tabs */}
        <div className="card mb-3">
          <div className="card-body py-2">
            <div className="d-flex gap-2 flex-wrap align-items-center">
              {FILTERS.map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className={`btn btn-sm ${filter === f.value ? "btn-primary" : "btn-outline-secondary"}`}>
                  {f.label}
                  {f.value === "pending" && pendingCount > 0 && (
                    <span className="badge bg-danger ms-1">{pendingCount}</span>
                  )}
                  {f.value === "in_progress" && (
                    <span className="ms-1 text-success" style={{ fontSize: 8 }}>●</span>
                  )}
                </button>
              ))}
              <span className="ms-auto text-muted small">
                {consultations.length} result{consultations.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Live session alert */}
        {filter === "" && data?.data.some((c) => c.status === "in_progress") && (
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
            <span className="badge bg-success">LIVE</span>
            Aapka ek session abhi active hai —{" "}
            <button className="btn btn-sm btn-success py-0 px-2"
              onClick={() => setFilter("in_progress")}>
              View
            </button>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <PageLoader />
        ) : consultations.length === 0 ? (
          <EmptyState
            icon={filter === "pending" ? "fa-clock" : "fa-phone-slash"}
            text={filter === "pending" ? "No pending requests" : "No consultations yet"}
            subtext="Jab users aapko book karenge, yahan dikhega"
          />
        ) : (
          consultations.map((c) => <ConsultCard key={c.id} c={c} />)
        )}

      </div>
    </section>
  );
}