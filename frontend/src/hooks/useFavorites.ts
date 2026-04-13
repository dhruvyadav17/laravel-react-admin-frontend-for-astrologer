/**
 * useFavorites -- convenience wrapper around the favorites API.
 *
 * Provides:
 *   isFavorite(astrologerId)  -- boolean -- is this astrologer saved?
 *   toggle(astrologerId)      -- async   -- add or remove from favorites
 *
 * Used in AstrologerCard and AstrologerDetailPage. Favorites are stored
 * server-side so they persist across devices and sessions.
 *
 * TO ADD OFFLINE OPTIMISTIC UPDATE: call updateCachedData before the
 * toggleFavorite mutation and roll back on error.
 */
import { useCallback, useMemo } from 'react';
import { useGetFavoritesQuery, useToggleFavoriteMutation } from '../store/api/favorite.api';
import { useAuth } from '../auth/hooks/useAuth';

// Guest localStorage store
function getLocalFavs(): number[]  {
  try { return JSON.parse(localStorage.getItem('favorites') ?? '[]'); } catch { return []; }
}
function setLocalFavs(ids: number[]) {
  localStorage.setItem('favorites', JSON.stringify(ids));
}

export function useFavorites() {
  const { isAuth } = useAuth();

  // Server favorites -- only when logged in
  const { data: serverData } = useGetFavoritesQuery(undefined, { skip: !isAuth });
  const [toggleServer]       = useToggleFavoriteMutation();

  const serverIds = useMemo(() => serverData?.ids ?? [], [serverData]);
  const localIds  = useMemo(() => isAuth ? [] : getLocalFavs(), [isAuth]);

  const favorites = isAuth ? serverIds : localIds;

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const toggle = useCallback(async (id: number) => {
    if (isAuth) {
      // Optimistic + server sync
      await toggleServer(id);
    } else {
      // Guest: localStorage only
      const current = getLocalFavs();
      const next    = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      setLocalFavs(next);
    }
  }, [isAuth, toggleServer]);

  return { favorites, isFavorite, toggle };
}
