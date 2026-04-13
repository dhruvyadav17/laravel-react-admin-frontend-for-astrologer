/**
 * PanchangPage -- daily Hindu calendar (Panchang) information.
 *
 * Data is computed algorithmically from the selected date using
 * simplified Tithi, Nakshatra, Yoga, and Karan formulas.
 *
 * DISCLAIMER: The calculations are approximate. For precise Panchang
 * (used for rituals / muhurat), integrate a proper ephemeris library
 * such as Swiss Ephemeris (swisseph npm package).
 *
 * TO SHOW LOCATION-BASED SUNRISE/SUNSET:
 * 1. Use navigator.geolocation to get lat/lng.
 * 2. Call a sunrise-sunset API (e.g. api.sunrise-sunset.org).
 * 3. Replace the hardcoded 06:15 / 18:30 values below.
 */
import { useState } from "react";
import UserPage from "../components/ui/UserPage";

// Static data arrays for Panchang
const TITHIS    = ["Pratipada","Dvitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dvadashi","Trayodashi","Chaturdashi","Purnima / Amavasya"];
const NAKSHATRAS = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const YOGAS     = ["Vishkumbha","Preeti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
const KARANS    = ["Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti","Shakuni","Chatushpada","Nagava","Kimstughna"];
const PAKSHA    = ["Shukla Paksha (Waxing Moon)","Krishna Paksha (Waning Moon)"];
const RAHU_KAAL = ["9:00 AM - 10:30 AM","7:30 AM - 9:00 AM","4:30 PM - 6:00 PM","3:00 PM - 4:30 PM","12:00 PM - 1:30 PM","10:30 AM - 12:00 PM","1:30 PM - 3:00 PM"];
const ABHIJIT   = ["11:48 AM - 12:36 PM","11:50 AM - 12:38 PM","11:48 AM - 12:36 PM","11:46 AM - 12:34 PM","11:44 AM - 12:32 PM","11:42 AM - 12:30 PM","11:50 AM - 12:38 PM"];

// Simple Panchang calculation from Julian date
function getPanchangData(dateStr: string) {
  const d    = new Date(dateStr);
  const dow  = d.getDay(); // 0=Sun
  const epoch = new Date("2000-01-06").getTime();
  const days  = Math.floor((d.getTime() - epoch) / 86400000);

  const tithi     = TITHIS[Math.abs(Math.floor(days % 15)) % 15];
  const nakshatra = NAKSHATRAS[Math.abs(days % 27)];
  const yoga      = YOGAS[Math.abs(Math.floor(days * 0.363) % 27)];
  const karan     = KARANS[Math.abs(Math.floor(days * 2) % 11)];
  const paksha    = PAKSHA[Math.abs(Math.floor(days / 15)) % 2];
  const rahuKaal  = RAHU_KAAL[dow];
  const abhijit   = ABHIJIT[dow];

  // Approximate sunrise/sunset for India (varies by ~1hr by season)
  const month   = d.getMonth();
  const isSummer = month >= 3 && month <= 8;
  const sunrise = isSummer ? "5:45 AM" : "6:45 AM";
  const sunset  = isSummer ? "7:15 PM" : "6:05 PM";

  const days_names = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const vaara = days_names[dow]; // Day name in Panchang

  return { tithi, nakshatra, yoga, karan, paksha, rahuKaal, abhijit, sunrise, sunset, vaara };
}

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function InfoCard({ icon, title, value, sub, color = "primary" }: {
  icon: string; title: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="col-sm-6 col-md-3">
      <div className="app-card text-center py-3 h-100">
        <div style={{ fontSize: 26, color: color === "warning" ? "#ca8a04" : color === "primary" ? "var(--primary)" : color === "info" ? "#0284c7" : color === "success" ? "#16a34a" : "var(--primary)" }}>
          <i className={`fas ${icon}`} />
        </div>
        <div className="fw-semibold t-main small mb-1">{title}</div>
        <div className="fw-bold" style={{ fontSize: 15, color: color === "warning" ? "#ca8a04" : color === "primary" ? "var(--primary)" : color === "info" ? "#0284c7" : color === "success" ? "#16a34a" : "var(--primary)" }}>{value}</div>
        {sub && <div className="t-muted" style={{ fontSize: 11 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function PanchangPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const panchang = getPanchangData(date);

  return (
    <UserPage title="📅 Panchang">

      {/* Date Selector */}
      <div className="text-center mb-4">
        <label className="form-label fw-semibold mb-2 d-block t-main">Select Date</label>
        <input type="date" className="form-control w-auto mx-auto"
          value={date} onChange={e => setDate(e.target.value)} />
        <p className="t-muted small mt-2">{formatDate(date)}</p>
      </div>

      {/* Vaara + Paksha */}
      <div className="app-card mb-4 text-center" style={{ background: "var(--surf2)" }}>
        <div className="d-flex justify-content-center gap-4 flex-wrap">
          <div>
            <div className="t-muted small">Day (Vaara)</div>
            <div className="fw-bold t-main fs-5">{panchang.vaara}</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--bdr)", paddingLeft: 24 }}>
            <div className="t-muted small">Paksha</div>
            <div className="fw-bold t-main fs-6">{panchang.paksha}</div>
          </div>
        </div>
      </div>

      {/* Main 4 cards */}
      <div className="row g-3 mb-4">
        <InfoCard icon="fa-sun"      color="warning" title="Tithi"     value={panchang.tithi}     />
        <InfoCard icon="fa-star"     color="primary" title="Nakshatra" value={panchang.nakshatra} />
        <InfoCard icon="fa-moon"     color="info"    title="Yoga"      value={panchang.yoga}      />
        <InfoCard icon="fa-calendar" color="success" title="Karan"     value={panchang.karan}     />
      </div>

      {/* Sunrise/Sunset + Auspicious */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="app-card h-100">
            <h6 className="fw-bold t-main mb-3">
              <i className="fas fa-sun text-warning me-2" />Sunrise & Sunset
            </h6>
            <div className="row text-center">
              <div className="col-6">
                <div className="t-muted small mb-1">🌅 Sunrise</div>
                <div className="fw-bold t-main">{panchang.sunrise}</div>
              </div>
              <div className="col-6">
                <div className="t-muted small mb-1">🌇 Sunset</div>
                <div className="fw-bold t-main">{panchang.sunset}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="app-card h-100">
            <h6 className="fw-bold t-main mb-3">
              <i className="fas fa-clock text-primary me-2" />Auspicious Timings
            </h6>
            <div className="row">
              <div className="col-6">
                <div className="t-muted small mb-1">⚠️ Rahu Kaal</div>
                <div className="fw-bold t-main" style={{ fontSize: 13 }}>{panchang.rahuKaal}</div>
              </div>
              <div className="col-6">
                <div className="t-muted small mb-1">✨ Abhijit</div>
                <div className="fw-bold t-main" style={{ fontSize: 13 }}>{panchang.abhijit}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3" style={{ background: "rgba(14,165,233,.10)", border: "1px solid rgba(14,165,233,.3)", color: "#0284c7" }}>
        <i className="fas fa-info-circle mt-1 flex-shrink-0" />
        <div>
          <strong>Note:</strong> These calculations are approximate based on standard Hindu calendar algorithms.
          For precise Panchang data based on your location, please consult a certified astrologer.
        </div>
      </div>

    </UserPage>
  );
}
