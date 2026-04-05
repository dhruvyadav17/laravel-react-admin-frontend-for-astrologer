// PATH: src/user/pages/ConsultationPage.tsx
// NEW: In-consultation chat page — polling every 5s for new messages
// Works for both chat type (text) and accepted/in_progress status

import { useState, useEffect, useRef }   from "react";
import { useParams, useNavigate }        from "react-router-dom";
import { useGetConsultationQuery,
         useGetMessagesQuery,
         useSendMessageMutation,
         useCancelConsultationMutation } from "../../store/api/consultation.api";
import { useAuth }                       from "../../auth/hooks/useAuth";
import Avatar                            from "../../components/ui/Avatar";
import { PageLoader }                    from "../../components/ui/States";
import { toast }                         from "react-toastify";

const STATUS_LABEL: Record<string, string> = {
  pending:     "Waiting for astrologer to accept...",
  accepted:    "Astrologer ne accept kiya — session start hone wala hai",
  in_progress: "Session in progress",
  completed:   "Consultation completed",
  rejected:    "Request rejected by astrologer",
  cancelled:   "Consultation cancelled",
};

export default function ConsultationPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const consultId = parseInt(id ?? "0", 10);

  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: consult, isLoading: loadingConsult } = useGetConsultationQuery(consultId, {
    skip: !consultId,
    pollingInterval: 10000, // poll every 10s for status changes
  });

  const { data: messages = [], isLoading: loadingMsgs } = useGetMessagesQuery(consultId, {
    skip: !consultId || !["accepted", "in_progress", "completed"].includes(consult?.status ?? ""),
    pollingInterval: 5000, // poll every 5s for new messages
  });

  const [send, { isLoading: sending }] = useSendMessageMutation();
  const [cancel]                       = useCancelConsultationMutation();

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg) return;
    setMessage("");
    try {
      await send({ consultationId: consultId, message: msg }).unwrap();
    } catch {
      toast.error("Message send nahi hua — dobara try karein");
      setMessage(msg);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Booking cancel karein?")) return;
    try {
      await cancel(consultId).unwrap();
      toast.success("Cancelled");
      navigate("/consultations");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Cancel nahi hua");
    }
  };

  if (loadingConsult) return (
    <div className="container py-5"><PageLoader /></div>
  );

  if (!consult) return (
    <div className="container py-5 text-center">
      <p className="text-muted">Consultation nahi mila</p>
    </div>
  );

  const canChat     = ["accepted", "in_progress"].includes(consult.status);
  const isCompleted = consult.status === "completed";
  const isPending   = consult.status === "pending";

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>

      {/* Header */}
      <div className="app-card mb-3">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={consult.astrologer?.name} src={consult.astrologer?.profile_image} size={44} />
          <div className="flex-grow-1">
            <div className="fw-bold">{consult.astrologer?.name}</div>
            <div className="text-muted small">{consult.astrologer?.expertise}</div>
            <div className="text-muted small">₹{consult.rate_per_minute}/min · {consult.type}</div>
          </div>
          <div className="text-end">
            <div className={`badge bg-${
              consult.status === "in_progress" ? "success" :
              consult.status === "completed"   ? "secondary" :
              consult.status === "pending"     ? "warning" : "info"
            } px-3 py-2`}>
              {consult.status.replace("_", " ").toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Status message */}
      <div className={`alert ${canChat ? "alert-success" : isCompleted ? "alert-secondary" : "alert-warning"} py-2 small mb-3`}>
        <i className="fas fa-info-circle me-2" />
        {STATUS_LABEL[consult.status]}
      </div>

      {/* Pending state */}
      {isPending && (
        <div className="app-card text-center py-5">
          <div className="spinner-border text-warning mb-3" role="status" />
          <h6 className="fw-bold">Waiting for Response</h6>
          <p className="text-muted small mb-3">
            Astrologer ko aapki request mil gayi hai. Accept hone par chat shuru ho jayega.
          </p>
          {consult.user_note && (
            <div className="alert alert-light py-2 small text-start">
              <strong>Aapka note:</strong> {consult.user_note}
            </div>
          )}
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={handleCancel}>
            Cancel Request
          </button>
        </div>
      )}

      {/* Rejected/Cancelled */}
      {["rejected", "cancelled"].includes(consult.status) && (
        <div className="app-card text-center py-4">
          <i className="fas fa-times-circle text-danger fa-3x d-block mb-3" />
          <h6 className="fw-bold">
            {consult.status === "rejected" ? "Request Rejected" : "Consultation Cancelled"}
          </h6>
          {consult.rejection_reason && (
            <p className="text-muted small">{consult.rejection_reason}</p>
          )}
          <button className="btn btn-primary-app btn-sm mt-2"
            onClick={() => navigate("/astrologers")}>
            Find Another Astrologer
          </button>
        </div>
      )}

      {/* Chat window */}
      {(canChat || isCompleted) && (
        <div className="app-card p-0 overflow-hidden">

          {/* Messages */}
          <div style={{ height: 420, overflowY: "auto" }} className="p-3">
            {loadingMsgs && messages.length === 0 ? (
              <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-muted" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-comment fa-2x d-block mb-2 opacity-25" />
                <p className="small">Chat shuru karein — pehla message bhejein</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {messages.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id}
                      className={`d-flex gap-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                      {!isMe && (
                        <Avatar name={msg.sender.name} src={msg.sender.profile_image} size={28} color="primary" />
                      )}
                      <div className={`px-3 py-2 rounded-3 ${
                        isMe ? "bg-danger text-white" : "bg-light text-dark"
                      }`} style={{ maxWidth: "72%", wordBreak: "break-word" }}>
                        <p className="mb-0 small" style={{ lineHeight: 1.5 }}>{msg.message}</p>
                        <div className={`mt-1 ${isMe ? "text-white opacity-75" : "text-muted"}`}
                          style={{ fontSize: 10 }}>
                          {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                          {isMe && (
                            <i className={`fas fa-check ms-1 ${msg.is_read ? "text-white" : ""}`}
                              style={{ fontSize: 9 }} />
                          )}
                        </div>
                      </div>
                      {isMe && (
                        <Avatar name={user?.name} src={null} size={28} color="secondary" />
                      )}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {canChat ? (
            <form onSubmit={handleSend}
              className="border-top p-3 d-flex gap-2 align-items-end bg-white">
              <textarea
                className="form-control form-control-sm"
                placeholder="Message likhein..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                }}
                rows={1}
                style={{ resize: "none", maxHeight: 120, overflowY: "auto" }}
                maxLength={2000}
              />
              <button type="submit" className="btn btn-call btn-sm flex-shrink-0"
                disabled={!message.trim() || sending}>
                {sending
                  ? <span className="spinner-border spinner-border-sm" />
                  : <i className="fas fa-paper-plane" />}
              </button>
            </form>
          ) : (
            <div className="border-top p-3 bg-light text-center text-muted small">
              {isCompleted
                ? `Session ended · Duration: ${consult.duration_minutes} min · Total: ₹${consult.total_amount}`
                : "Chat unavailable"}
            </div>
          )}
        </div>
      )}

      {/* Completed summary */}
      {isCompleted && (
        <div className="app-card mt-3">
          <h6 className="fw-bold mb-3"><i className="fas fa-receipt me-2 text-success" />Session Summary</h6>
          <div className="row g-2 text-center">
            {[
              { label: "Duration",  value: `${consult.duration_minutes} min` },
              { label: "Rate",      value: `₹${consult.rate_per_minute}/min`  },
              { label: "Total",     value: `₹${consult.total_amount}`          },
            ].map(({ label, value }) => (
              <div key={label} className="col-4">
                <div className="p-2 bg-light rounded">
                  <div className="fw-bold small">{value}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}