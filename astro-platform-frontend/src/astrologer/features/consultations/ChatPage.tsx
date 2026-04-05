// PATH: src/astrologer/features/consultations/ChatPage.tsx
// NEW: Astrologer side chat — same UI as user side but uses astrologer endpoints

import { useEffect, useRef, useState }        from "react";
import { useParams, useNavigate }             from "react-router-dom";
import { useGetConsultationQuery,
         useGetMessagesQuery,
         useAstrologerSendMessageMutation,
         useStartConsultationMutation,
         useEndConsultationMutation }          from "../../../store/api/consultation.api";
import { useAuth }                            from "../../../auth/hooks/useAuth";
import Avatar                                 from "../../../components/ui/Avatar";
import { PageLoader }                         from "../../../components/ui/States";
import { toast }                              from "react-toastify";

export default function AstrologerChatPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const consultId = parseInt(id ?? "0", 10);

  const [message, setMessage] = useState("");
  const bottomRef             = useRef<HTMLDivElement>(null);

  // Use user-side query for fetching — same endpoint works (backend checks ownership)
  const { data: consult, isLoading } = useGetConsultationQuery(consultId, {
    skip:            !consultId,
    pollingInterval: 10000,
  });

  const { data: messages = [] } = useGetMessagesQuery(consultId, {
    skip:            !consultId || !["accepted", "in_progress", "completed"].includes(consult?.status ?? ""),
    pollingInterval: 4000,
  });

  const [send,  { isLoading: sending  }] = useAstrologerSendMessageMutation();
  const [start, { isLoading: starting }] = useStartConsultationMutation();
  const [end,   { isLoading: ending   }] = useEndConsultationMutation();

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
      toast.error("Message send nahi hua");
      setMessage(msg);
    }
  };

  const handleStart = async () => {
    try {
      await start(consultId).unwrap();
      toast.success("Session started");
    } catch { toast.error("Failed to start session"); }
  };

  const handleEnd = async () => {
    if (!confirm("Session end karein? Billing calculate ho jaayegi.")) return;
    try {
      const res = await end(consultId).unwrap();
      toast.success(`Session ended — ₹${res.total_amount} (${res.duration_minutes} min)`);
      navigate("/astrologer/consultations");
    } catch { toast.error("Failed to end session"); }
  };

  if (isLoading) return <div className="container py-5"><PageLoader /></div>;
  if (!consult)  return <div className="container py-5 text-center text-muted">Consultation nahi mili</div>;

  const canChat     = ["accepted", "in_progress"].includes(consult.status);
  const isCompleted = consult.status === "completed";

  return (
    <section className="content pt-3">
      <div className="container-fluid" style={{ maxWidth: 760 }}>

        {/* Back */}
        <button className="btn btn-sm btn-outline-secondary mb-3"
          onClick={() => navigate("/astrologer/consultations")}>
          <i className="fas fa-arrow-left me-1" />Back to Requests
        </button>

        {/* Header card */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Avatar name={consult.user?.name} src={consult.user?.profile_image} size={44} color="secondary" />
              <div className="flex-grow-1">
                <div className="fw-bold">{consult.user?.name}</div>
                <div className="text-muted small">
                  {consult.type} · ₹{consult.rate_per_minute}/min
                </div>
                {consult.user_note && (
                  <div className="text-muted small mt-1">
                    <i className="fas fa-quote-left me-1 opacity-50" />{consult.user_note}
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                {consult.status === "accepted" && (
                  <button className="btn btn-success btn-sm" onClick={handleStart} disabled={starting}>
                    {starting
                      ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="fas fa-play me-1" />Start</>}
                  </button>
                )}
                {consult.status === "in_progress" && (
                  <button className="btn btn-danger btn-sm" onClick={handleEnd} disabled={ending}>
                    {ending
                      ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="fas fa-stop me-1" />End Session</>}
                  </button>
                )}
                <span className={`badge px-3 py-2 bg-${
                  consult.status === "in_progress" ? "success" :
                  consult.status === "accepted"    ? "info"    : "secondary"
                }`}>
                  {consult.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="card overflow-hidden">

          {/* Messages */}
          <div style={{ height: 460, overflowY: "auto" }} className="p-3 bg-light">
            {messages.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-comment fa-2x d-block mb-2 opacity-25" />
                <p className="small">
                  {canChat
                    ? "Session start ho gaya — pehla message bhejein"
                    : "No messages yet"}
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {messages.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id}
                      className={`d-flex gap-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                      {!isMe && (
                        <Avatar name={msg.sender.name} src={msg.sender.profile_image} size={28} color="secondary" />
                      )}
                      <div className={`px-3 py-2 rounded-3 ${isMe ? "bg-primary text-white" : "bg-white border"}`}
                        style={{ maxWidth: "72%", wordBreak: "break-word" }}>
                        <p className="mb-0 small" style={{ lineHeight: 1.5 }}>{msg.message}</p>
                        <div className={`mt-1 ${isMe ? "opacity-75 text-white" : "text-muted"}`}
                          style={{ fontSize: 10 }}>
                          {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {isMe && (
                        <Avatar name={user?.name} src={null} size={28} color="primary" />
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
                placeholder="Reply likhein... (Enter to send)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                }}
                rows={2}
                style={{ resize: "none" }}
                maxLength={2000}
              />
              <button type="submit" className="btn btn-primary btn-sm flex-shrink-0"
                disabled={!message.trim() || sending}>
                {sending
                  ? <span className="spinner-border spinner-border-sm" />
                  : <i className="fas fa-paper-plane" />}
              </button>
            </form>
          ) : (
            <div className="border-top p-3 bg-light text-center text-muted small">
              {isCompleted
                ? `Completed · ${consult.duration_minutes} min · ₹${consult.total_amount}`
                : "Chat is not available for this status"}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}