// PATH: src/user/components/BookingModal.tsx
// NEW: Booking modal — user astrologer ko book karta hai
// Type select (chat/call/video), note, price estimate, submit

import { useState }               from "react";
import { useNavigate }            from "react-router-dom";
import { useBookConsultationMutation } from "../../store/api/consultation.api";
import { useAuth }                from "../../auth/hooks/useAuth";
import { toast }                  from "react-toastify";

type Astrologer = {
  id:               number;
  name:             string;
  price_per_minute: number;
  consultation_type?: string;
};

type Props = {
  astrologer: Astrologer;
  onClose:    () => void;
};

const TYPE_OPTIONS = [
  { value: "chat",  icon: "fa-comment", label: "Chat",       desc: "Text message karein" },
  { value: "call",  icon: "fa-phone",   label: "Voice Call", desc: "Phone pe baat karein" },
  { value: "video", icon: "fa-video",   label: "Video Call", desc: "Face-to-face session" },
];

export default function BookingModal({ astrologer, onClose }: Props) {
  const navigate              = useNavigate();
  const { isAuth }            = useAuth();
  const [book, { isLoading }] = useBookConsultationMutation();

  const [type, setType]     = useState<"chat" | "call" | "video">("chat");
  const [note, setNote]     = useState("");

  // Filter available types based on astrologer's consultation_type
  const availableTypes = TYPE_OPTIONS.filter((t) => {
    const ct = astrologer.consultation_type;
    return !ct || ct === "all" || ct === t.value;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuth) {
      toast.info("Please login to book a consultation");
      onClose();
      navigate("/login");
      return;
    }

    try {
      const result = await book({
        astrologer_id: astrologer.id,
        type,
        user_note: note.trim() || undefined,
      }).unwrap();

      toast.success("Booking request sent! Astrologer will accept shortly.");
      onClose();
      navigate(`/consultations/${result.id}`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Booking failed. Please try again.");
    }
  };

  return (
    /* Backdrop */
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      {/* Modal box */}
      <div
        className="app-card"
        style={{ width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h5 className="fw-bold mb-0">Book Consultation</h5>
            <p className="text-muted small mb-0">with {astrologer.name}</p>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Consultation type */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Consultation Type</label>
            <div className="d-flex flex-column gap-2">
              {availableTypes.map((t) => (
                <label
                  key={t.value}
                  className={`d-flex align-items-center gap-3 p-3 rounded border cursor-pointer
                    ${type === t.value ? "border-danger bg-danger bg-opacity-10" : "border-secondary"}`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => setType(t.value as "chat" | "call" | "video")}
                    className="d-none"
                  />
                  <div className={`rounded-circle d-flex align-items-center justify-content-center
                    ${type === t.value ? "bg-danger text-white" : "bg-light text-muted"}`}
                    style={{ width: 36, height: 36, flexShrink: 0 }}>
                    <i className={`fas ${t.icon}`} style={{ fontSize: 14 }} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold small">{t.label}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{t.desc}</div>
                  </div>
                  {type === t.value && (
                    <i className="fas fa-check-circle text-danger" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Your Question <span className="text-muted fw-normal">(optional)</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Apna sawaal ya concern briefly likhein — astrologer se pehle share ho jaayega..."
              maxLength={500}
            />
            <div className="form-text">{note.length}/500</div>
          </div>

          {/* Price estimate */}
          <div className="mb-4 p-3 rounded bg-light">
            <div className="fw-semibold small mb-2">Price Info</div>
            <div className="d-flex justify-content-between text-muted small mb-1">
              <span>Rate</span>
              <span className="fw-semibold text-dark">₹{astrologer.price_per_minute}/min</span>
            </div>
            <div className="d-flex justify-content-between text-muted small mb-1">
              <span>5 min estimate</span>
              <span>₹{astrologer.price_per_minute * 5}</span>
            </div>
            <div className="d-flex justify-content-between text-muted small">
              <span>15 min estimate</span>
              <span>₹{astrologer.price_per_minute * 15}</span>
            </div>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: 11 }}>
              <i className="fas fa-info-circle me-1" />
              Billing actual duration pe based hoga. Aap kisi bhi time consultation end kar sakte hain.
            </p>
          </div>

          {/* Submit */}
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary flex-shrink-0" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-call w-100" disabled={isLoading}>
              {isLoading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Sending Request...</>
              ) : (
                <><i className="fas fa-paper-plane me-2" />Send Booking Request</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}