/**
 * useHeartbeat -- keeps the astrologer marked as "online" in the database.
 *
 * Pings POST /astrologer/me/heartbeat every 30 seconds while the astrologer
 * is logged in and has toggled their status to Online.
 *
 * The backend cron job (artisan astrologer:mark-offline) runs every 5 minutes
 * and marks any astrologer whose last_heartbeat_at is older than 5 minutes
 * as offline. This handles browser closes / network drops gracefully.
 *
 * This hook is mounted in AstrologerLayout so it runs on every astrologer page.
 * It stops automatically when the astrologer goes Offline.
 */
import { useEffect, useRef } from 'react';
import { useSendHeartbeatMutation, useMyAstrologerProfileQuery } from '../store/api/astrologer.api';
import { useAuth } from '../auth/hooks/useAuth';

const INTERVAL = 30_000; // 30 seconds

export function useHeartbeat() {
  const { isAuth, isAstrologer }  = useAuth();
  const { data: profile }          = useMyAstrologerProfileQuery(undefined, {
    skip: !isAuth || !isAstrologer,
  });
  const [ping]  = useSendHeartbeatMutation();
  const ref     = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuth || !isAstrologer || !profile?.is_online) {
      if (ref.current) clearInterval(ref.current);
      return;
    }

    ping(); // immediate
    ref.current = setInterval(() => ping(), INTERVAL);

    return () => { if (ref.current) clearInterval(ref.current); };
  }, [isAuth, isAstrologer, profile?.is_online, ping]);
}
