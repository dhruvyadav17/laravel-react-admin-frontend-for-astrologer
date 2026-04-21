/**
 * AstrologerCard -- responsive card shown in the astrologer grid.
 *
 * Displays: avatar, name, expertise, rating, experience, language badges,
 * consultation type, online status, price, low-balance warning, and CTA.
 *
 * WALLET BALANCE CHECK
 * ---------------------
 * If the user is logged in, the card fetches their wallet balance and
 * disables/replaces the Talk Now button if they cannot afford even 1 minute.
 *
 * TO ADD VERIFIED BADGE: check astrologer.is_verified and render a OK icon
 * next to the name (already shown on AstrologerDetailPage).
 *
 * TO CHANGE LANGUAGE BADGE COLORS: edit the LANG_STYLE map.
 */
import { Link }             from 'react-router-dom';
import StarRating            from '../../../components/ui/StarRating';
import { useFavorites }      from '../hooks/useFavorites';
import { useGetWalletQuery } from '../../../store/wallet.api';
import { useAuth }           from '../../auth/hooks/useAuth';

type Props = {
  astrologer: {
    id:                 number;
    name:               string;
    profile_image?:     string | null;
    expertise?:         string;
    rating?:            number;
    price_per_minute?:  number;
    experience?:        number;
    is_online?:         boolean;
    is_available?:      boolean;
    languages?:         string[];
    total_reviews?:     number;
    consultation_type?: string;
  };
};

const TYPE_LABEL: Record<string, string> = {
  chat: '💬 Chat', call: '📞 Call', video: '🎥 Video', all: '💬📞🎥 All',
};

// Language colors for variety
const LANG_COLORS: Record<string, { bg: string; color: string }> = {
  Hindi:    { bg: 'rgba(234,88,12,.12)',   color: '#ea580c' },
  English:  { bg: 'rgba(37,99,235,.12)',   color: '#2563eb' },
  Tamil:    { bg: 'rgba(124,58,237,.12)',  color: '#7c3aed' },
  Telugu:   { bg: 'rgba(5,150,105,.12)',   color: '#059669' },
  Marathi:  { bg: 'rgba(220,38,38,.12)',   color: '#dc2626' },
  Bengali:  { bg: 'rgba(217,119,6,.12)',   color: '#d97706' },
  Gujarati: { bg: 'rgba(15,118,110,.12)',  color: '#0f766e' },
  Kannada:  { bg: 'rgba(147,51,234,.12)',  color: '#9333ea' },
  default:  { bg: 'rgba(71,85,105,.12)',   color: '#475569' },
};

function LangBadge({ lang }: { lang: string }) {
  const style = LANG_COLORS[lang] ?? LANG_COLORS.default;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.color}44`,
    }}>
      {lang}
    </span>
  );
}

export default function AstrologerCard({ astrologer }: Props) {
  const {
    id, name = '', profile_image, expertise,
    rating = 0, price_per_minute = 0, experience = 0,
    is_online = false, is_available = false,
    languages = [], total_reviews = 0, consultation_type = 'all',
  } = astrologer;

  const { isFavorite, toggle } = useFavorites();
  const { isAuth }             = useAuth();

  const { data: wallet } = useGetWalletQuery(undefined, { skip: !isAuth });
  const balance           = wallet?.balance ?? 0;
  const available         = is_online && is_available;
  const hasEnoughBalance  = !isAuth || balance >= price_per_minute;

  const avatar = profile_image?.startsWith('http')
    ? profile_image
    : profile_image
      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000'}/storage/${profile_image}`
      : null;

  return (
    <div className="astro-card-new d-flex flex-column text-center h-100">

      {/* Favorite button */}
      <button
        className="position-absolute border-0 p-0"
        style={{ top: 10, right: 10, background: 'transparent', cursor: 'pointer', zIndex: 2 }}
        onClick={(e) => { e.preventDefault(); toggle(id); }}
        title={isFavorite(id) ? 'Remove from favorites' : 'Save astrologer'}
      >
        <i
          className={`fas fa-heart`}
          style={{ fontSize: 16, color: isFavorite(id) ? '#e63946' : 'var(--bdr2)' }}
        />
      </button>

      {/* Avatar + online dot */}
      <Link to={`/astrologers/${id}`} className="text-decoration-none d-block">
        <div className="astro-img-wrap mb-2 mx-auto">
          {avatar ? (
            <img src={avatar} alt={name} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
          ) : (
            <div style={{
              width: 88, height: 88, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'var(--red-tint)', border: '3px solid var(--primary)',
              fontSize: 28, fontWeight: 700, color: 'var(--primary)',
            }}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={`online-dot ${available ? 'on' : ''}`}
            style={available ? { animation: 'pulse 2s infinite' } : {}}
          />
        </div>

        <h6 className="fw-bold mb-0 t-main d-flex align-items-center justify-content-center gap-1" style={{ fontSize: 14 }}>
          {name}
          {(astrologer as any).is_verified && (
            <i className="fas fa-check-circle" style={{ color: '#2563eb', fontSize: 12 }} title="Verified Astrologer" />
          )}
        </h6>
        <p className="t-muted mb-1" style={{ fontSize: 12 }}>{expertise || 'Astrology Expert'}</p>

        {/* Rating */}
        <div className="mb-1"><StarRating rating={rating} size={12} /></div>
        <div className="t-muted mb-1" style={{ fontSize: 12 }}>
          {rating.toFixed(1)} rating
          {total_reviews > 0 && <span className="ms-1">({total_reviews})</span>}
        </div>
        <div className="t-muted mb-2" style={{ fontSize: 12 }}>{experience}+ years experience</div>

        {/* Language badges */}
        {languages.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2 justify-content-center">
            {languages.slice(0, 3).map(l => <LangBadge key={l} lang={l} />)}
            {languages.length > 3 && (
              <span style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                fontSize: 10, fontWeight: 600,
                background: 'var(--surf2)', color: 'var(--txt-m)',
                border: '1px solid var(--bdr2)',
              }}>
                +{languages.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Footer */}
      <div className="mt-auto pt-2" style={{ borderTop: '1px solid var(--bdr)' }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          {/* Price */}
          <div className="price mb-0">
            ₹{price_per_minute}<span className="t-muted fw-normal" style={{ fontSize: 12 }}>/min</span>
          </div>

          {/* Badges: type + status */}
          <div className="d-flex gap-1 align-items-center">
            {/* Consultation type */}
            <span style={{
              display: 'inline-block', padding: '2px 7px', borderRadius: 20,
              fontSize: 10, fontWeight: 600,
              background: 'rgba(230,57,70,.10)', color: '#e63946',
              border: '1px solid rgba(230,57,70,.25)',
            }}>
              {TYPE_LABEL[consultation_type] ?? consultation_type}
            </span>

            {/* Online status */}
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 20,
              fontSize: 10, fontWeight: 600,
              background: available ? 'rgba(34,197,94,.12)' : 'rgba(100,116,139,.12)',
              color: available ? '#16a34a' : '#64748b',
              border: `1px solid ${available ? 'rgba(34,197,94,.3)' : 'rgba(100,116,139,.3)'}`,
            }}>
              {available ? '* Online' : 'o Offline'}
            </span>
          </div>
        </div>

        {/* Low balance warning */}
        {isAuth && available && !hasEnoughBalance && (
          <Link to="/wallet" className="btn btn-sm btn-warning w-100 mb-1" style={{ fontSize: 11 }}>
            <i className="fas fa-wallet me-1" />
            Low Balance (₹{balance.toFixed(0)}) -- Recharge
          </Link>
        )}

        {/* CTA Button */}
        <Link
          to={`/astrologers/${id}`}
          className={`btn w-100 btn-sm ${
            available && hasEnoughBalance ? 'btn-call' :
            available && !hasEnoughBalance ? 'btn-outline-warning' :
            'btn-outline-secondary'
          }`}
          style={{ borderRadius: 8 }}
        >
          {available && hasEnoughBalance
            ? <><i className="fas fa-phone me-1" />Talk Now</>
            : available && !hasEnoughBalance
            ? <><i className="fas fa-wallet me-1" />Recharge to Talk</>
            : <><i className="fas fa-clock me-1" />View Profile</>
          }
        </Link>
      </div>
    </div>
  );
}
