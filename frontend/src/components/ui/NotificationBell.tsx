/**
 * NotificationBell -- dropdown notification centre.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
  type AppNotification,
} from '../../store/api/notification.api';

const COLOR_MAP: Record<string, string> = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  primary: 'text-primary',
  info: 'text-info',
};

interface Props {
  pollingMs?: number;
}

export default function NotificationBell({ pollingMs = 30000 }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: pollingMs,
  });
  const [markAll] = useMarkAllReadMutation();
  const [markOne] = useMarkOneReadMutation();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

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
      <button
        className="btn btn-link nav-link p-1 position-relative"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
      >
        <i className="fas fa-bell" style={{ fontSize: 18 }} />
        {unreadCount > 0 && (
          <span
            className="position-absolute rounded-pill"
            style={{
              background: '#dc2626',
              color: '#fff',
              top: 0,
              right: 0,
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 4px',
              minWidth: 18,
              textAlign: 'center',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card shadow-lg position-absolute end-0"
          style={{ width: 340, zIndex: 1050, top: '110%', maxHeight: 420, overflowY: 'auto' }}
        >
          <div
            className="d-flex justify-content-between align-items-center py-2 px-3"
            style={{ borderBottom: '1px solid var(--bdr)' }}
          >
            <span className="fw-semibold small">
              Notifications
              {unreadCount > 0 && (
                <span
                  className="ms-2"
                  style={{
                    display: 'inline-block',
                    background: '#dc2626',
                    color: '#fff',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm p-0 t-muted"
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
            <div className="text-center py-4 t-muted">
              <i className="fas fa-bell-slash d-block mb-2" style={{ fontSize: 24 }} />
              <span className="small">No notifications</span>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={`w-100 text-start border-0 bg-transparent px-3 py-2 border-bottom ${!n.read_at ? 'surf-2' : ''}`}
                  style={{ transition: 'background 0.15s' }}
                  onClick={() => handleClick(n)}
                >
                  <div className="d-flex align-items-start gap-2">
                    <i
                      className={`fas ${n.data.icon ?? 'fa-bell'} mt-1 flex-shrink-0 ${COLOR_MAP[n.data.color ?? 'primary'] ?? 'text-primary'}`}
                      style={{ fontSize: 14 }}
                    />
                    <div className="overflow-hidden">
                      <div className="fw-semibold small t-main text-truncate">{n.data.title}</div>
                      <div className="t-muted" style={{ fontSize: 12, lineHeight: 1.4 }}>
                        {n.data.message}
                      </div>
                      <div className="t-muted mt-1" style={{ fontSize: 11 }}>
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
