/**
 * BookingModal -- shown when a user clicks "Talk Now" on an astrologer.
 *
 * Lets the user choose consultation type (Chat / Call / Video),
 * add an optional note, and see their wallet balance vs the rate.
 *
 * On confirmation: POST /consultations -- creates the consultation and
 * sends a notification to the astrologer.
 *
 * TO ADD SCHEDULED BOOKING: add a date-time picker here and pass
 * scheduled_at to the bookConsultation mutation body.
 * Backend: add scheduled_at column to consultations table.
 */
import { useState }                     from "react";
import { useNavigate }                  from "react-router-dom";
import { useBookConsultationMutation }  from "../../store/api/consultation.api";
import { useGetWalletQuery }             from "../../store/api/wallet.api";
import { useAuth }                        from "../../auth/hooks/useAuth";
import { toast }                        from "react-toastify";

type Astrologer = {
  id:                number;
  name:              string;
  price_per_minute:  number;
  consultation_type?: string;
};

type Props = { astrologer: Astrologer; onClose: () => void };

const TYPES = [
  { value: "chat",  icon: "fa-comment", label: "Chat",       desc: "Send text messages" },
  { value: "call",  icon: "fa-phone",   label: "Voice Call", desc: "Talk over the phone" },
  { value: "video", icon: "fa-video",   label: "Video Call", desc: "Face-to-face session" },
] as const;

export default function BookingModal({ astrologer, onClose }: Props) {
  const navigate = useNavigate();
  const { isAuth }            = useAuth();
  const { data: wallet }      = useGetWalletQuery(undefined, { skip: !isAuth });
  const balance               = wallet?.balance ?? 0;
  const [type, setType]       = useState<"chat" | "call" | "video">("chat");
  const [note, setNote]       = useState("");
  const [book, { isLoading }] = useBookConsultationMutation();

  // Filter available types
  const availableTypes = TYPES.filter(t => {
    const ct = astrologer.consultation_type;
    if (!ct || ct === "all") return true;
    return t.value === ct;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await book({
        astrologer_id: astrologer.id,
        type,
        user_note: note || undefined,
      }).unwrap();
      toast.success("Consultation request sent!");
      onClose();
      navigate(`/consultations/${result.id}`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Booking failed. Try again.");
    }
  };

  return (
    /* Backdrop */
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.55)", zIndex: 1050 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="rounded-4 shadow-lg p-4"
        style={{
          width: "100%", maxWidth: 420,
          background: "var(--surf)",
          border: "1px solid var(--bdr)",
        }}>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h5 className="fw-bold mb-0 t-main">Book Consultation</h5>
            <p className="t-muted small mb-0">with {astrologer.name}</p>
          </div>
          <button className="btn-close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Consultation type */}
          <div className="mb-4">
            <label className="form-label fw-semibold t-muted" style={{ fontSize: 13 }}>
              Choose Type
            </label>
            <div className="d-flex gap-2">
              {availableTypes.map(t => (
                <label key={t.value} className="flex-grow-1" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => setType(t.value)}
                    className="d-none"
                  />
                  <div className="text-center p-3 rounded-3 h-100"
                    style={{
                      border: `2px solid ${type === t.value ? "var(--primary)" : "var(--bdr2)"}`,
                      background: type === t.value ? "var(--red-tint)" : "var(--surf2)",
                      transition: "all .15s",
                    }}>
                    <i className={`fas ${t.icon} mb-1 d-block`}
                      style={{
                        fontSize: 18,
                        color: type === t.value ? "var(--primary)" : "var(--txt-m)",
                      }} />
                    <div className="fw-semibold" style={{ fontSize: 12, color: type === t.value ? "var(--primary)" : "var(--txt)" }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--txt-m)" }}>{t.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="form-label fw-semibold t-muted" style={{ fontSize: 13 }}>
              Your Note <span className="t-light fw-normal">(optional)</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Briefly describe your question or concern..."
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={500}
              style={{ resize: "none" }}
            />
          </div>

          {/* Wallet balance */}
          {isAuth && (
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
              <span className="t-muted small">Your wallet balance</span>
              <span className="fw-semibold" style={{ color: balance >= astrologer.price_per_minute ? "#16a34a" : "#dc2626" }}>
                ₹{balance.toFixed(2)}
                {balance < astrologer.price_per_minute && (
                  <span className="ms-2 small" style={{ color: "#dc2626" }}>
                    ⚠️ Low
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Price estimate */}
          <div className="p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center"
            style={{ background: "var(--surf2)", border: "1px solid var(--bdr)" }}>
            <span className="t-muted small">Rate</span>
            <span className="fw-bold" style={{ color: "var(--primary)", fontSize: 18 }}>
              ₹{astrologer.price_per_minute}
              <span className="t-muted fw-normal" style={{ fontSize: 13 }}>/min</span>
            </span>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary flex-shrink-0" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-call btn flex-grow-1 fw-semibold" disabled={isLoading}>
              {isLoading
                ? <><span className="spinner-border spinner-border-sm me-2" />Booking...</>
                : <><i className="fas fa-phone me-2" />Book Now</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
