import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserPage from '../../components/UserPage';
import { useGetHoroscopeSettingsQuery } from '../../../../store/settings.api';

const SIGNS = [
  { name: 'Aries',       symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire',  color: '#e63946' },
  { name: 'Taurus',      symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', color: '#2a9d8f' },
  { name: 'Gemini',      symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air',   color: '#e9c46a' },
  { name: 'Cancer',      symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', color: '#457b9d' },
  { name: 'Leo',         symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire',  color: '#e76f51' },
  { name: 'Virgo',       symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', color: '#52b788' },
  { name: 'Libra',       symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air',   color: '#9b2335' },
  { name: 'Scorpio',     symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', color: '#6d2b7d' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire',  color: '#c77dff' },
  { name: 'Capricorn',   symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', color: '#6b705c' },
  { name: 'Aquarius',    symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air',   color: '#4cc9f0' },
  { name: 'Pisces',      symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', color: '#48cae4' },
];

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

export default function HoroscopePage() {
  const { data: settings } = useGetHoroscopeSettingsQuery();
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const predictions = settings?.horoscope_predictions ?? {};
  const sign = selected ? SIGNS.find(s => s.name === selected) : null;
  const prediction = selected ? predictions[selected] : null;

  return (
    <UserPage title="🌙 Horoscope">

      {/* Date + tab switcher */}
      <div className="text-center mb-4">
        <p className="t-muted mb-3" style={{ fontSize: 14 }}>{today}</p>
        <div className="d-flex justify-content-center gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`btn btn-sm fw-semibold ${tab === t ? 'btn-primary-app' : 'btn-outline-secondary'}`}
              style={{ borderRadius: 20, padding: '6px 18px' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Selected sign prediction */}
      {selected && sign && (
        <div className="app-card mb-4" style={{ border: `2px solid ${sign.color}22`, borderRadius: 16 }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{
              width: 64, height: 64, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 32,
              background: `${sign.color}18`, border: `2px solid ${sign.color}44`,
            }}>{sign.symbol}</div>
            <div>
              <h4 className="fw-bold mb-0 t-main">{sign.name}</h4>
              <span className="t-muted small">{sign.dates} · {sign.element}</span>
            </div>
            <button className="btn btn-sm btn-outline-secondary ms-auto"
              onClick={() => setSelected(null)} style={{ borderRadius: 20 }}>
              ✕ Close
            </button>
          </div>

          {tab === 'daily' && prediction ? (
            <div className="row g-3">
              {[
                { icon: 'fa-heart',     color: '#e63946', label: 'Love',   text: prediction.love   },
                { icon: 'fa-briefcase', color: '#2a9d8f', label: 'Career', text: prediction.career },
                { icon: 'fa-heartbeat', color: '#52b788', label: 'Health', text: prediction.health },
              ].map(({ icon, color, label, text }) => (
                <div key={label} className="col-md-4">
                  <div className="app-card h-100" style={{ background: 'var(--surf2)', borderRadius: 12 }}>
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
                  style={{ background: 'rgba(230,196,106,.12)', border: '1px solid rgba(230,196,106,.3)' }}>
                  <i className="fas fa-star text-warning" />
                  <span className="t-muted small">Lucky: <strong className="t-main">{prediction.lucky}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-calendar-alt fa-2x t-muted d-block mb-3 opacity-50" />
              <p className="t-muted mb-3">
                {tab === 'weekly' ? 'Weekly' : 'Monthly'} predictions are personalized based on your birth chart.
              </p>
              <Link to="/astrologers" className="btn btn-primary-app btn-sm">
                Talk to an Expert Astrologer
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Sign grid */}
      <h6 className="fw-semibold t-main mb-3">
        {selected ? 'All Signs' : '👆 Select your zodiac sign'}
      </h6>
      <div className="row g-2">
        {SIGNS.map(s => (
          <div key={s.name} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <button onClick={() => setSelected(selected === s.name ? null : s.name)}
              className="w-100 border-0 text-start"
              style={{
                background:   selected === s.name ? `${s.color}18` : 'var(--surf2)',
                border:       `1px solid ${selected === s.name ? s.color : 'var(--bdr)'}`,
                borderRadius: 12, padding: '12px 10px', cursor: 'pointer', transition: 'all .15s',
              }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.symbol}</div>
              <div className="fw-semibold t-main" style={{ fontSize: 12 }}>{s.name}</div>
              <div className="t-muted" style={{ fontSize: 10 }}>{s.dates}</div>
            </button>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="app-card mt-4 text-center" style={{ background: 'var(--surf2)' }}>
        <i className="fas fa-user-astronaut fa-2x d-block mb-2" style={{ color: 'var(--primary)' }} />
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
