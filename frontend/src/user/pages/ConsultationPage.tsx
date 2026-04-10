import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetConsultationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCancelConsultationMutation,
} from "../../store/api/consultation.api";
import { useAuth } from "../../auth/hooks/useAuth";
import Avatar from "../../components/ui/Avatar";
import { PageLoader } from "../../components/ui/States";
import { toast } from "react-toastify";

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for astrologer to accept...",
  accepted: "Astrologer has accepted — session will start shortly",
  in_progress: "Session in progress",
  completed: "Consultation completed",
  rejected: "Request rejected by astrologer",
  cancelled: "Consultation cancelled",
};

export default function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const consultId = parseInt(id ?? "0", 10);

  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: consult, isLoading: loadingConsult } = useGetConsultationQuery(consultId, {
    skip: !consultId,
    pollingInterval: 10000,
  });

  const { data: messages = [], isLoading: loadingMsgs } = useGetMessagesQuery(consultId, {
    skip: !consultId || !["accepted", "in_progress", "completed"].includes(consult?.status ?? ""),
    pollingInterval: 5000,
  });

  const [send, { isLoading: sending }] = useSendMessageMutation();
  const [cancel] = useCancelConsultationMutation();

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
      toast.error("Message could not be sent. Please try again.");
      setMessage(msg);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancel(consultId).unwrap();
      toast.success("Consultation cancelled successfully");
      navigate("/consultations");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Cancellation failed");
    }
  };

  if (loadingConsult)
    return (
      <div className="container py-5">
        <PageLoader />
      </div>
    );

  if (!consult)
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">Consultation not found</p>
      </div>
    );

  const canChat = ["accepted", "in_progress"].includes(consult.status);
  const isCompleted = consult.status === "completed";
  const isPending = consult.status === "pending";

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="app-card mb-3">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={consult.astrologer?.name} src={consult.astrologer?.profile_image} size={44} />
          <div className="flex-grow-1">
            <div className="fw-bold">{consult.astrologer?.name}</div>
            <div className="text-muted small">{consult.astrologer?.expertise}</div>
            <div className="text-muted small">
              ₹{consult.rate_per_minute}/min · {consult.type}
            </div>
          </div>
          <div className="text-end">
            <div
              className={`badge bg-${
                consult.status === "in_progress"
                  ? "success"
                  : consult.status === "completed"
                  ? "secondary"
                  : consult.status === "pending"
                  ? "warning"
                  : "info"
              } px-3 py-2`}
            >
              {consult.status.replace("_", " ").toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div
        className={`alert ${
          canChat ? "alert-success" : isCompleted ? "alert-secondary" : "alert-warning"
        } py-2 small mb-3`}
      >
        <i className="fas fa-info-circle me-2" />
        {STATUS_LABEL[consult.status]}
      </div>

      {/* Pending */}
      {isPending && (
        <div className="app-card text-center py-5">
          <div className="spinner-border text-warning mb-3" />
          <h6 className="fw-bold">Waiting for Response</h6>
          <p className="text-muted small mb-3">
            The astrologer has received your request. Chat will start once it is accepted.
          </p>
          {consult.user_note && (
            <div className="alert alert-light py-2 small text-start">
              <strong>Your note:</strong> {consult.user_note}
            </div>
          )}
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={handleCancel}>
            Cancel Request
          </button>
        </div>
      )}

      {/* Chat */}
      {(canChat || isCompleted) && (
        <div className="app-card p-0 overflow-hidden">
          <div style={{ height: 420, overflowY: "auto" }} className="p-3">
            {messages.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-comment fa-2x d-block mb-2 opacity-25" />
                <p className="small">Start the conversation by sending your first message</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {messages.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                      <div className={`px-3 py-2 rounded-3 ${isMe ? "bg-danger text-white" : "bg-light"}`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {canChat && (
            <form onSubmit={handleSend} className="border-top p-3 d-flex gap-2">
              <textarea
                className="form-control"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="btn btn-primary-app" disabled={!message.trim()}>
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}