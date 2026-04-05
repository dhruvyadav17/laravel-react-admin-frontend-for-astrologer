// PATH: src/user/pages/HoroscopePage.tsx
// NEW: Horoscope page — 12 zodiac signs with daily predictions
// Static data — no backend needed

import { useState } from "react";
import { Link }     from "react-router-dom";
import UserPage     from "../components/ui/UserPage";

const SIGNS = [
  { name: "Aries",       hindi: "मेष",     icon: "♈", dates: "Mar 21 – Apr 19", element: "Fire",  color: "danger"   },
  { name: "Taurus",      hindi: "वृषभ",    icon: "♉", dates: "Apr 20 – May 20", element: "Earth", color: "success"  },
  { name: "Gemini",      hindi: "मिथुन",   icon: "♊", dates: "May 21 – Jun 20", element: "Air",   color: "info"     },
  { name: "Cancer",      hindi: "कर्क",    icon: "♋", dates: "Jun 21 – Jul 22", element: "Water", color: "primary"  },
  { name: "Leo",         hindi: "सिंह",    icon: "♌", dates: "Jul 23 – Aug 22", element: "Fire",  color: "warning"  },
  { name: "Virgo",       hindi: "कन्या",   icon: "♍", dates: "Aug 23 – Sep 22", element: "Earth", color: "success"  },
  { name: "Libra",       hindi: "तुला",    icon: "♎", dates: "Sep 23 – Oct 22", element: "Air",   color: "info"     },
  { name: "Scorpio",     hindi: "वृश्चिक", icon: "♏", dates: "Oct 23 – Nov 21", element: "Water", color: "danger"   },
  { name: "Sagittarius", hindi: "धनु",     icon: "♐", dates: "Nov 22 – Dec 21", element: "Fire",  color: "warning"  },
  { name: "Capricorn",   hindi: "मकर",     icon: "♑", dates: "Dec 22 – Jan 19", element: "Earth", color: "secondary"},
  { name: "Aquarius",    hindi: "कुंभ",    icon: "♒", dates: "Jan 20 – Feb 18", element: "Air",   color: "primary"  },
  { name: "Pisces",      hindi: "मीन",     icon: "♓", dates: "Feb 19 – Mar 20", element: "Water", color: "info"     },
];

const PREDICTIONS: Record<string, { love: string; career: string; health: string; lucky: string }> = {
  Aries:       { love: "Aaj ka din romantic hai. Partner ke saath quality time bitayen.",             career: "Naya project milne ki sambhavana hai. Confidence se aage badhen.",     health: "Thoda yoga ya meditation karein — mann shanth rahega.",              lucky: "Red, Number 9, Tuesday"    },
  Taurus:      { love: "Rishton mein stability aayegi. Patience rakhen.",                             career: "Financial maamlon mein savdhani zaruri hai. Naye nivesh abhi mat karein.", health: "Diet ka dhyan rakhen. Gardan aur kandhe mein tension ho sakta hai.", lucky: "Green, Number 6, Friday"   },
  Gemini:      { love: "Communication open rakhein. Galafehmi door hongi.",                          career: "Teamwork se kaam accha chalega. Naye contacts mile sakte hain.",         health: "Neend poori lein. Stress management jaruri hai.",                   lucky: "Yellow, Number 5, Wednesday"},
  Cancer:      { love: "Emotions ko samjhein aur share karein. Rishta gehga hoga.",                   career: "Ghar se kaam ka mauka mil sakta hai. Creativity kaam aayegi.",          health: "Paani zyada piyen. Pet se related savdhan rahein.",                 lucky: "White, Number 2, Monday"   },
  Leo:         { love: "Aaj aap dil se baat karein — saamne waala zarur sunega.",                     career: "Leadership mein shine karenge. Recognition mile sakti hai.",            health: "Exercise regular rakhein. Hriday ka khayal rakhein.",               lucky: "Gold, Number 1, Sunday"    },
  Virgo:       { love: "Choti-choti baton mein pyar dikhayein.",                                     career: "Detail-oriented kaam aaj zyada productive rahega.",                     health: "Digestive health pe dhyan dein. Sabzi khayein.",                    lucky: "Grey, Number 5, Wednesday" },
  Libra:       { love: "Balance zaruri hai. Partner ke saath decisions milke lein.",                  career: "Negotiations mein safal rahenge. Diplomacy kaam aayegi.",              health: "Kidney aur lower back ka dhyan rakhein.",                           lucky: "Pink, Number 6, Friday"    },
  Scorpio:     { love: "Gehri baat karein — samajh badhegi. Trust banao.",                           career: "Research aur investigation mein acha din hai.",                         health: "Mental health pe focus karein. Meditation karein.",                 lucky: "Maroon, Number 8, Tuesday" },
  Sagittarius: { love: "Adventure share karein partner ke saath.",                                   career: "Learning aur travel se connected kaam milega.",                         health: "Thigh aur hip area pe dhyan dein.",                                 lucky: "Purple, Number 3, Thursday"},
  Capricorn:   { love: "Committed rahein. Long-term relationships strong honge.",                    career: "Hard work aaj zaroor rang laaegi. Senior appreciate karenge.",          health: "Joints aur haddiyon ka dhyan rakhein.",                             lucky: "Brown, Number 8, Saturday" },
  Aquarius:    { love: "Innovation relationship mein laayein — kuch naya karein saath mein.",        career: "Technology aur unique ideas aaj faydemand hain.",                       health: "Circulation pe dhyan dein. Halki walk karein.",                     lucky: "Blue, Number 4, Saturday"  },
  Pisces:      { love: "Intuition pe bharosa karein. Apna pyar dikhayen.",                           career: "Creative projects ke liye accha din. Imagination kaam aayegi.",         health: "Neend aur rest zaruri hai. Paon ka dhyan rakhein.",                 lucky: "Sea Green, Number 7, Thursday"},
};

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export default function HoroscopePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab]           = useState<"daily" | "weekly" | "monthly">("daily");

  const sign       = selected ? SIGNS.find((s) => s.name === selected) : null;
  const prediction = selected ? PREDICTIONS[selected] : null;

  return (
    <UserPage title="🌙 Horoscope">
      <div className="text-center mb-4">
        <p className="text-muted mb-3">{today}</p>
        <div className="d-flex justify-content-center gap-2">
          {(["daily","weekly","monthly"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? "btn-primary-app" : "btn-outline-app"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && sign && prediction && (
        <div className={`app-card mb-4 border border-${sign.color}`}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <span style={{ fontSize: 48 }}>{sign.icon}</span>
            <div>
              <h4 className="fw-bold mb-0">
                {sign.name} <span className="text-muted fs-6">({sign.hindi})</span>
              </h4>
              <span className="text-muted small">{sign.dates}</span>
              <span className={`badge bg-${sign.color}-subtle text-${sign.color} border ms-2`} style={{ fontSize: 10 }}>
                {sign.element}
              </span>
            </div>
            <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => setSelected(null)}>
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="row g-3 mb-3">
            {[
              { icon: "fa-heart",      color: "danger",  label: "Love",    text: prediction.love    },
              { icon: "fa-briefcase",  color: "primary", label: "Career",  text: prediction.career  },
              { icon: "fa-heartbeat",  color: "success", label: "Health",  text: prediction.health  },
            ].map(({ icon, color, label, text }) => (
              <div key={label} className="col-md-4">
                <div className="p-3 rounded bg-light h-100">
                  <div className="fw-semibold small mb-1">
                    <i className={`fas ${icon} text-${color} me-1`} />{label}
                  </div>
                  <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span className="small fw-semibold text-muted">Lucky:</span>
            <span className="badge bg-light text-dark border">{prediction.lucky}</span>
          </div>

          <div className="border-top pt-3">
            <p className="text-muted small mb-2">
              <i className="fas fa-info-circle me-1" />
              Yeh general prediction hai. Apni kundli ke hisaab se personal reading ke liye ek astrologer se baat karein.
            </p>
            <Link to="/astrologers" className="btn btn-sm btn-primary-app">
              <i className="fas fa-star me-1" />Talk to Expert Astrologer
            </Link>
          </div>
        </div>
      )}

      {/* 12 Signs Grid */}
      <div className="row g-3">
        {SIGNS.map((s) => (
          <div key={s.name} className="col-6 col-md-3">
            <button
              className={`app-card w-100 text-center border-0 ${selected === s.name ? `border border-${s.color}` : ""}`}
              onClick={() => setSelected(selected === s.name ? null : s.name)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ fontSize: 36 }}>{s.icon}</div>
              <div className="fw-semibold small mt-1">{s.name}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>{s.hindi}</div>
              <div className="text-muted" style={{ fontSize: 10 }}>{s.dates}</div>
            </button>
          </div>
        ))}
      </div>

      {!selected && (
        <p className="text-center text-muted small mt-3">
          👆 Apni rashi select karein daily prediction dekhne ke liye
        </p>
      )}
    </UserPage>
  );
}
