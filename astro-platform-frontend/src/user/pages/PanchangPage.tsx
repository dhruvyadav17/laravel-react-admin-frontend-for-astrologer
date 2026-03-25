import { useState } from "react";

/* ================= STATIC FALLBACK ================= */
const fallbackPanchang = {
  tithi: "Shukla Paksha Dwitiya",
  nakshatra: "Rohini",
  yoga: "Shubh",
  karan: "Balava",
  sunrise: "06:25 AM",
  sunset: "06:45 PM",
  rahu_kaal: "01:30 PM - 03:00 PM",
  abhijit: "12:05 PM - 12:50 PM",
  moon_sign: "Vrishabha",
  sun_sign: "Meena",
};

export default function PanchangPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  /* ================= FUTURE API ================= */
  // const { data } = useGetPanchangQuery(date);

  const data: any = null; // 🔥 simulate API

  /* ================= SAFE PICK ================= */
  const pick = (val: any, fallback: any) =>
    val === null || val === undefined || val === ""
      ? fallback
      : val;

  /* ================= FINAL DATA ================= */
  const panchang = {
    tithi: pick(data?.tithi, fallbackPanchang.tithi),
    nakshatra: pick(data?.nakshatra, fallbackPanchang.nakshatra),
    yoga: pick(data?.yoga, fallbackPanchang.yoga),
    karan: pick(data?.karan, fallbackPanchang.karan),
    sunrise: pick(data?.sunrise, fallbackPanchang.sunrise),
    sunset: pick(data?.sunset, fallbackPanchang.sunset),
    rahu_kaal: pick(data?.rahu_kaal, fallbackPanchang.rahu_kaal),
    abhijit: pick(data?.abhijit, fallbackPanchang.abhijit),
    moon_sign: pick(data?.moon_sign, fallbackPanchang.moon_sign),
    sun_sign: pick(data?.sun_sign, fallbackPanchang.sun_sign),
  };

  return (
    <div className="container page">

      {/* ================= HEADER ================= */}
      <div className="text-center mb-5">
        <h2 className="section-title">📅 Panchang</h2>
        <p className="text-muted">
          Daily Vedic Astrology Insights
        </p>
      </div>

      {/* ================= DATE ================= */}
      <div className="text-center mb-4">
        <input
          type="date"
          className="form-control w-auto mx-auto shadow-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* ================= GRID ================= */}
      <div className="row g-4">

        {/* LEFT */}
        <div className="col-md-8">

          <Section title="🌙 Panchang Details">
            <div className="row">
              <Item title="Tithi" value={panchang.tithi} />
              <Item title="Nakshatra" value={panchang.nakshatra} />
              <Item title="Yoga" value={panchang.yoga} />
              <Item title="Karan" value={panchang.karan} />
            </div>
          </Section>

          <Section title="☀ Sun & Moon">
            <div className="row">
              <Item title="Sunrise" value={panchang.sunrise} icon="🌅" />
              <Item title="Sunset" value={panchang.sunset} icon="🌇" />
              <Item title="Moon Sign" value={panchang.moon_sign} />
              <Item title="Sun Sign" value={panchang.sun_sign} />
            </div>
          </Section>

        </div>

        {/* RIGHT */}
        <div className="col-md-4">

          <Section title="⚠ Important Timings" center>
            <Info label="Rahu Kaal" value={panchang.rahu_kaal} variant="danger" />
            <Info label="Abhijit Muhurat" value={panchang.abhijit} variant="success" />
          </Section>

          <div className="app-card text-center">
            <h6 className="text-muted mb-2">Today’s Insight</h6>
            <p className="small mb-0">
              Today is favorable for starting new work and making financial decisions.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

/* ================= SECTION ================= */
function Section({ title, children, center }: any) {
  return (
    <div className="app-card mb-4">
      <h5 className="section-title mb-3 text-center">{title}</h5>
      <div className={center ? "text-center" : ""}>{children}</div>
    </div>
  );
}

/* ================= ITEM ================= */
function Item({ title, value, icon }: any) {
  return (
    <div className="col-md-6 mb-3">
      <div className="panchang-item h-100 text-center">

        {icon && <div className="mb-1 fs-5">{icon}</div>}

        <h6 className="text-muted small">{title}</h6>
        <div className="fw-semibold">{value}</div>

      </div>
    </div>
  );
}

/* ================= INFO ================= */
function Info({ label, value, variant }: any) {
  const colorClass =
    variant === "danger"
      ? "text-danger"
      : variant === "success"
      ? "text-success"
      : "";

  return (
    <div className="mb-3">
      <small className="text-muted">{label}</small>
      <div className={`fw-bold ${colorClass}`}>{value}</div>
    </div>
  );
}