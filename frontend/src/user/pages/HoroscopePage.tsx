import { useState } from "react";
import { Link } from "react-router-dom";
import UserPage from "../components/ui/UserPage";

const SIGNS = [
  { name: "Aries", hindi: "मेष", icon: "♈", dates: "Mar 21 – Apr 19", element: "Fire", color: "danger" },
  { name: "Taurus", hindi: "वृषभ", icon: "♉", dates: "Apr 20 – May 20", element: "Earth", color: "success" },
  { name: "Gemini", hindi: "मिथुन", icon: "♊", dates: "May 21 – Jun 20", element: "Air", color: "info" },
  { name: "Cancer", hindi: "कर्क", icon: "♋", dates: "Jun 21 – Jul 22", element: "Water", color: "primary" },
  { name: "Leo", hindi: "सिंह", icon: "♌", dates: "Jul 23 – Aug 22", element: "Fire", color: "warning" },
  { name: "Virgo", hindi: "कन्या", icon: "♍", dates: "Aug 23 – Sep 22", element: "Earth", color: "success" },
  { name: "Libra", hindi: "तुला", icon: "♎", dates: "Sep 23 – Oct 22", element: "Air", color: "info" },
  { name: "Scorpio", hindi: "वृश्चिक", icon: "♏", dates: "Oct 23 – Nov 21", element: "Water", color: "danger" },
  { name: "Sagittarius", hindi: "धनु", icon: "♐", dates: "Nov 22 – Dec 21", element: "Fire", color: "warning" },
  { name: "Capricorn", hindi: "मकर", icon: "♑", dates: "Dec 22 – Jan 19", element: "Earth", color: "secondary" },
  { name: "Aquarius", hindi: "कुंभ", icon: "♒", dates: "Jan 20 – Feb 18", element: "Air", color: "primary" },
  { name: "Pisces", hindi: "मीन", icon: "♓", dates: "Feb 19 – Mar 20", element: "Water", color: "info" },
];

const PREDICTIONS = {
  Aries: {
    love: "Today is a romantic day. Spend quality time with your partner.",
    career: "There is a possibility of getting a new project. Move forward with confidence.",
    health: "Do some yoga or meditation — it will keep your mind calm.",
    lucky: "Red, Number 9, Tuesday",
  },
  Taurus: {
    love: "Stability will improve in relationships. Be patient.",
    career: "Be cautious with financial matters. Avoid new investments for now.",
    health: "Take care of your diet. You may feel tension in the neck and shoulders.",
    lucky: "Green, Number 6, Friday",
  },
  Gemini: {
    love: "Keep communication open. Misunderstandings will be resolved.",
    career: "Work will go well with teamwork. You may build new connections.",
    health: "Get proper sleep. Stress management is important.",
    lucky: "Yellow, Number 5, Wednesday",
  },
  Cancer: {
    love: "Understand and share your emotions. Your bond will deepen.",
    career: "You may get an opportunity to work from home. Creativity will help.",
    health: "Drink more water. Be careful about stomach-related issues.",
    lucky: "White, Number 2, Monday",
  },
  Leo: {
    love: "Speak from the heart — your partner will listen.",
    career: "You will shine in leadership. Recognition is likely.",
    health: "Maintain regular exercise. Take care of your heart health.",
    lucky: "Gold, Number 1, Sunday",
  },
  Virgo: {
    love: "Express love through small gestures.",
    career: "Detail-oriented work will be highly productive today.",
    health: "Focus on digestive health. Eat more vegetables.",
    lucky: "Grey, Number 5, Wednesday",
  },
  Libra: {
    love: "Balance is important. Make decisions together with your partner.",
    career: "You will succeed in negotiations. Diplomacy will help.",
    health: "Take care of kidneys and lower back.",
    lucky: "Pink, Number 6, Friday",
  },
  Scorpio: {
    love: "Have deeper conversations — it will build understanding and trust.",
    career: "A good day for research and investigation work.",
    health: "Focus on mental health. Practice meditation.",
    lucky: "Maroon, Number 8, Tuesday",
  },
  Sagittarius: {
    love: "Share adventures with your partner.",
    career: "Work related to learning and travel may come your way.",
    health: "Take care of your thighs and hips.",
    lucky: "Purple, Number 3, Thursday",
  },
  Capricorn: {
    love: "Stay committed. Long-term relationships will grow stronger.",
    career: "Hard work will pay off. Seniors may appreciate you.",
    health: "Take care of joints and bones.",
    lucky: "Brown, Number 8, Saturday",
  },
  Aquarius: {
    love: "Bring innovation into your relationship — try something new together.",
    career: "Technology and unique ideas will benefit you.",
    health: "Focus on blood circulation. Go for a light walk.",
    lucky: "Blue, Number 4, Saturday",
  },
  Pisces: {
    love: "Trust your intuition. Express your love openly.",
    career: "A great day for creative projects. Use your imagination.",
    health: "Proper rest and sleep are important. Take care of your feet.",
    lucky: "Sea Green, Number 7, Thursday",
  },
};

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function HoroscopePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");

  const sign = selected ? SIGNS.find((s) => s.name === selected) : null;
  const prediction = selected ? PREDICTIONS[selected] : null;

  return (
    <UserPage title="🌙 Horoscope">
      <div className="text-center mb-4">
        <p className="text-muted mb-3">{today}</p>
        <div className="d-flex justify-content-center gap-2">
          {(["daily", "weekly", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`btn btn-sm ${
                tab === t ? "btn-primary-app" : "btn-outline-app"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {selected && sign && prediction && (
        <div className={`app-card mb-4 border border-${sign.color}`}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <span style={{ fontSize: 48 }}>{sign.icon}</span>
            <div>
              <h4 className="fw-bold mb-0">
                {sign.name}{" "}
                <span className="text-muted fs-6">({sign.hindi})</span>
              </h4>
              <span className="text-muted small">{sign.dates}</span>
            </div>
          </div>

          <p className="text-muted small">
            <i className="fas fa-info-circle me-1" />
            This is a general prediction. For a personalized reading based on your birth chart, consult an expert astrologer.
          </p>

          <Link to="/astrologers" className="btn btn-sm btn-primary-app">
            Talk to Expert Astrologer
          </Link>
        </div>
      )}

      {!selected && (
        <p className="text-center text-muted small mt-3">
          👆 Select your zodiac sign to view your daily prediction
        </p>
      )}
    </UserPage>
  );
}