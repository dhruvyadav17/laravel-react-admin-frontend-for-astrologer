/**
 * HoroscopePage -- zodiac sign selector with daily/weekly/monthly predictions.
 *
 * All prediction content is static (stored in the SIGNS array below).
 * The sign grid is always visible; clicking a sign expands its prediction card.
 *
 * TO INTEGRATE A LIVE HOROSCOPE API:
 * 1. Replace the static SIGNS[i].daily/weekly/monthly content with an API call.
 * 2. Suggested API: Aztro or Horoscope-API (free tiers available).
 * 3. Cache the response per sign per day to avoid excessive calls.
 * 4. Add a loading skeleton inside the expanded prediction card.
 */
import { useState } from "react";
import { Link }     from "react-router-dom";
import UserPage     from "../components/ui/UserPage";

const SIGNS = [
  { name: "Aries",       symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire",  color: "#e63946" },
  { name: "Taurus",      symbol: "♉", dates: "Apr 20 - May 20", element: "Earth", color: "#2a9d8f" },
  { name: "Gemini",      symbol: "♊", dates: "May 21 - Jun 20", element: "Air",   color: "#e9c46a" },
  { name: "Cancer",      symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water", color: "#457b9d" },
  { name: "Leo",         symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire",  color: "#e76f51" },
  { name: "Virgo",       symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth", color: "#52b788" },
  { name: "Libra",       symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air",   color: "#9b2335" },
  { name: "Scorpio",     symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water", color: "#6d2b7d" },
  { name: "Sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire",  color: "#c77dff" },
  { name: "Capricorn",   symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth", color: "#6b705c" },
  { name: "Aquarius",    symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air",   color: "#4cc9f0" },
  { name: "Pisces",      symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water", color: "#48cae4" },
];

type PredictionKey = typeof SIGNS[number]["name"];

const DAILY: Record<PredictionKey, { love: string; career: string; health: string; lucky: string }> = {
  Aries:       { love: "A romantic opportunity may come your way. Stay open to connection.", career: "Confidence will help you land a new project or lead a team.", health: "Yoga or light exercise will keep your energy balanced.", lucky: "Red . 9 . Tuesday" },
  Taurus:      { love: "Patience in relationships will bring stability and deeper trust.", career: "Avoid risky financial decisions. Steady progress is better today.", health: "Watch your diet. Neck and shoulder tension is possible.", lucky: "Green . 6 . Friday" },
  Gemini:      { love: "Open communication will resolve a recent misunderstanding.", career: "Teamwork brings results. New professional connections are likely.", health: "Prioritize good sleep and manage stress proactively.", lucky: "Yellow . 5 . Wednesday" },
  Cancer:      { love: "Share your feelings openly -- your bond will deepen.", career: "A creative work-from-home opportunity may appear.", health: "Stay hydrated. Watch for digestive sensitivity.", lucky: "White . 2 . Monday" },
  Leo:         { love: "Speak from the heart -- your partner is listening closely.", career: "Leadership shines today. Recognition from superiors is likely.", health: "Maintain your exercise routine. Focus on heart health.", lucky: "Gold . 1 . Sunday" },
  Virgo:       { love: "Small thoughtful gestures will mean a lot to your partner.", career: "Detail-oriented work will be highly productive and rewarding.", health: "Digestive health needs attention. Eat more greens.", lucky: "Grey . 5 . Wednesday" },
  Libra:       { love: "Make decisions together -- partnership and balance are key.", career: "Diplomatic skills will help you succeed in negotiations.", health: "Pay attention to your lower back and kidney health.", lucky: "Pink . 6 . Friday" },
  Scorpio:     { love: "Deeper conversations will build understanding and lasting trust.", career: "Research and investigative work will be very productive.", health: "Mental wellness is important. Practice mindfulness or meditation.", lucky: "Maroon . 8 . Tuesday" },
  Sagittarius: { love: "Shared adventures will strengthen your relationship.", career: "Opportunities related to travel or education may arise.", health: "Take care of your hips and thighs with stretching.", lucky: "Purple . 3 . Thursday" },
  Capricorn:   { love: "Long-term commitment grows stronger through consistent effort.", career: "Hard work pays off today. Seniors may take notice.", health: "Joint and bone health deserves attention. Stay active.", lucky: "Brown . 8 . Saturday" },
  Aquarius:    { love: "Introduce something new into your relationship to keep it fresh.", career: "Technology and unconventional thinking will give you an edge.", health: "Focus on circulation. A brisk walk will do you good.", lucky: "Blue . 4 . Saturday" },
  Pisces:      { love: "Trust your intuition. Express your feelings openly and honestly.", career: "Creative projects thrive today. Let your imagination lead.", health: "Rest is essential. Take care of your feet.", lucky: "Sea Green . 7 . Thursday" },
};

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export default function HoroscopePage() {
  const [selected, setSelected] = useState<PredictionKey | null>(null);
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");

  const sign = selected ? SIGNS.find(s => s.name === selected) : null;
  const prediction = selected ? DAILY[selected] : null;

  return (
    <UserPage title="🌙 Horoscope">

      {/* Header */}
      <div className="text-center mb-4">
        <p className="t-muted mb-3" style={{ fontSize: 14 }}>{today}</p>
        <div className="d-flex justify-content-center gap-2">
          {(["daily", "weekly", "monthly"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`btn btn-sm fw-semibold ${tab === t ? "btn-primary-app" : "btn-outline-secondary"}`}
              style={{ borderRadius: 20, padding: "6px 18px" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Selected sign prediction card */}
      {selected && sign && prediction && (
        <div className="app-card mb-4" style={{ border: `2px solid ${sign.color}22`, borderRadius: 16 }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{
              width: 64, height: 64, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 32,
              background: `${sign.color}18`, border: `2px solid ${sign.color}44`,
            }}>{sign.symbol}</div>
            <div>
              <h4 className="fw-bold mb-0 t-main">{sign.name}</h4>
              <span className="t-muted small">{sign.dates} . {sign.element}</span>
            </div>
            <button className="btn btn-sm btn-outline-secondary ms-auto"
              onClick={() => setSelected(null)} style={{ borderRadius: 20 }}>
              x Close
            </button>
          </div>

          {tab === "daily" ? (
            <div className="row g-3">
              {[
                { icon: "fa-heart",    color: "#e63946", label: "Love",    text: prediction.love   },
                { icon: "fa-briefcase",color: "#2a9d8f", label: "Career",  text: prediction.career },
                { icon: "fa-heartbeat",color: "#52b788", label: "Health",  text: prediction.health },
              ].map(({ icon, color, label, text }) => (
                <div key={label} className="col-md-4">
                  <div className="app-card h-100" style={{ background: "var(--surf2)", borderRadius: 12 }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className={`fas ${icon}`} style={{ color, fontSize: 16 }} />
                      <span className="fw-semibold t-main" style={{ fontSize: 13 }}>{label}</span>
                    </div>
                    <p className="t-muted mb-0" style={{ fontSize: 13, lineHeight: 1.6 }}>{text}</p>
                  </div>
                </div>
              ))}
              <div className="col-12">
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                  style={{ background: "rgba(230,196,106,0.12)", border: "1px solid rgba(230,196,106,0.3)" }}>
                  <i className="fas fa-star text-warning" />
                  <span className="t-muted small">Lucky: <strong className="t-main">{prediction.lucky}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-calendar-alt fa-2x t-muted d-block mb-3 opacity-50" />
              <p className="t-muted mb-3">
                {tab === "weekly" ? "Weekly" : "Monthly"} predictions are personalized based on your birth chart.
              </p>
              <Link to="/astrologers" className="btn btn-primary-app btn-sm">
                Talk to an Expert Astrologer
              </Link>
            </div>
          )}

          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--bdr)" }}>
            <p className="t-muted mb-2" style={{ fontSize: 12 }}>
              <i className="fas fa-info-circle me-1" />
              General prediction. For a personalized reading based on your exact birth time and place:
            </p>
            <Link to="/astrologers" className="btn btn-sm btn-outline-secondary">
              <i className="fas fa-user-astronaut me-1" />Get Personal Reading
            </Link>
          </div>
        </div>
      )}

      {/* ★ Zodiac grid -- was missing before, now always visible */}
      <div>
        <h6 className="fw-semibold t-main mb-3">
          {selected ? "All Signs" : "👆 Select your zodiac sign"}
        </h6>
        <div className="row g-2">
          {SIGNS.map(s => (
            <div key={s.name} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <button
                onClick={() => setSelected(selected === s.name ? null : s.name)}
                className="w-100 border-0 text-start"
                style={{
                  background:    selected === s.name ? `${s.color}18` : "var(--surf2)",
                  border:        `1px solid ${selected === s.name ? s.color : "var(--bdr)"}`,
                  borderRadius:  12,
                  padding:       "12px 10px",
                  cursor:        "pointer",
                  transition:    "all 0.15s ease",
                  outline:       selected === s.name ? `2px solid ${s.color}44` : "none",
                }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{s.symbol}</div>
                <div className="fw-semibold t-main" style={{ fontSize: 12 }}>{s.name}</div>
                <div className="t-muted" style={{ fontSize: 10 }}>{s.dates}</div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="app-card mt-4 text-center" style={{ background: "var(--surf2)" }}>
        <i className="fas fa-user-astronaut fa-2x d-block mb-2" style={{ color: "var(--primary)" }} />
        <h6 className="fw-bold t-main mb-1">Want a Personalized Reading?</h6>
        <p className="t-muted small mb-3">
          Talk to a certified astrologer for insights based on your exact birth chart.
        </p>
        <Link to="/astrologers" className="btn btn-primary-app btn-sm px-4">
          Talk to an Astrologer
        </Link>
      </div>

    </UserPage>
  );
}
