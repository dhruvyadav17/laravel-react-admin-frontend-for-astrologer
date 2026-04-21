// Pings the heartbeat API every 30s while the astrologer is online.
// The backend cron (artisan astrologer:mark-offline) marks inactive astrologers
// offline if no heartbeat arrives within 5 minutes.
// Mounted in AstrologerLayout so it runs on every astrologer page.
import { useEffect, useRef } from 'react';
import { useSendHeartbeatMutation, useMyAstrologerProfileQuery } from '../../../store/astrologer.api';
import { useAuth } from '../../auth/hooks/useAuth';

const HEARTBEAT_INTERVAL = 30_000;

export function useHeartbeat() {
  const { isAuth, isAstrologer } = useAuth();
  const { data: profile }        = useMyAstrologerProfileQuery(undefined, {
    skip: !isAuth || !isAstrologer,
  });

  const [ping]   = useSendHeartbeatMutation();
  const pingRef  = useRef(ping);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep ref current so the interval always calls the latest mutation trigger
  // without that causing the effect to restart.
  useEffect(() => { pingRef.current = ping; }, [ping]);

  useEffect(() => {
    if (!isAuth || !isAstrologer || !profile?.is_online) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    pingRef.current();
    timerRef.current = setInterval(() => pingRef.current(), HEARTBEAT_INTERVAL);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAuth, isAstrologer, profile?.is_online]);
}
