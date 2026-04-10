// PATH: src/components/ui/NotificationBell.tsx
// Reusable notification bell — use in AdminNavbar + AstrologerLayout + UserHeader
// Props: variant = 'admin' | 'user' | 'astrologer' (changes URL paths)

import { useState, useRef, useEffect }  from 'react';
import { useNavigate }                  from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
  type AppNotification,
} from '../../store/api/notification.api';

const COLOR_MAP: Record<string, string> = {
  success: 'text-success', danger: 'text-danger',
  warning: 'text-warning', primary: 'text-primary',
  info:    'text-info',
};

interface Props {
  pollingMs?: number;
}

export default function NotificationBell({ pollingMs = 30000 }: Props) {
  const navigate                          = useNavigate();
  const [open, setOpen]                   = useState(false);
  const ref                               = useRef<HTMLDivElement>(null);

  const { data, isLoading }               = useGetNotificationsQuery(undefined, {
    pollingInterval: pollingMs,
  });
  const [markAll]                         = useMarkAllReadMutation();
  const [markOne]                         = useMarkOneReadMutation();

  const notifications = data?.notifications ?? [];
  const unreadCount   = data?.unread_count   ?? 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n: AppNotification) => {
    if (!n.read_at) await markOne(n.id);
    if (n.data.url) {
      setOpen(false);
      navigate(n.data.url);
    }
  };

  return (
    <div ref={ref} className="position-relative d-inline-block">
      {/* Bell button */}
      <button
        className="btn btn-link nav-link p-1 position-relative"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
      >
        <i className="fas fa-bell" style={{ fontSize: 18 }} />
        {unreadCount > 0 && (
          <span
            className="position-absolute badge bg-danger rounded-pill"
            style={{ top: 0, right: 0, fontSize: 9, minWidth: 16, padding: '2px 4px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="card shadow-lg position-absolute end-0"
          style={{ width: 340, zIndex: 1050, top: '110%', maxHeight: 420, overflowY: 'auto' }}
        >
          <div className="card-header d-flex justify-content-between align-items-center py-2 px-3">
            <span className="fw-semibold small">
              Notifications
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount}</span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm p-0 text-muted"
                style={{ fontSize: 11 }}
                onClick={() => markAll()}
              >
                Mark all read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-bell-slash d-block mb-2" style={{ fontSize: 24 }} />
              <span className="small">Koi notification nahi</span>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={`w-100 text-start border-0 bg-transparent px-3 py-2 border-bottom
                    ${!n.read_at ? 'bg-light' : ''}`}
                  style={{ transition: 'background 0.15s' }}
                  onClick={() => handleClick(n)}
                >
                  <div className="d-flex align-items-start gap-2">
                    <i
                      className={`fas ${n.data.icon ?? 'fa-bell'} mt-1 flex-shrink-0
                        ${COLOR_MAP[n.data.color ?? 'primary'] ?? 'text-primary'}`}
                      style={{ fontSize: 14 }}
                    />
                    <div className="overflow-hidden">
                      <div className="fw-semibold small text-dark text-truncate">
                        {n.data.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.4 }}>
                        {n.data.message}
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                        {n.created_at}
                      </div>
                    </div>
                    {!n.read_at && (
                      <div
                        className="bg-primary rounded-circle flex-shrink-0"
                        style={{ width: 7, height: 7, marginTop: 4 }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
