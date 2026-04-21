/**
 * useFavorites -- convenience wrapper around the favorites API.
 *
 * Provides:
 *   isFavorite(astrologerId)  -- boolean -- is this astrologer saved?
 *   toggle(astrologerId)      -- async   -- add or remove from favorites
 *
 * API returns: { data: { ids: number[] } }
 * The ids field is an array of astrologer_id values.
 */
import { useCallback, useMemo } from 'react';
import { useGetFavoritesQuery, useToggleFavoriteMutation } from '../../../store/favorite.api';
import { useAuth } from '../../auth/hooks/useAuth';

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

  // API returns { ids: number[] } — extract the array safely
  const serverIds = useMemo(() => {
    if (!serverData) return [];
    // Handle both shapes: number[] or { ids: number[] }
    if (Array.isArray(serverData)) return serverData as number[];
    if (Array.isArray((serverData as any).ids)) return (serverData as any).ids as number[];
    return [];
  }, [serverData]);

  const localIds  = useMemo(() => isAuth ? [] : getLocalFavs(), [isAuth]);
  const favorites = isAuth ? serverIds : localIds;

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const toggle = useCallback(async (id: number) => {
    if (isAuth) {
      await toggleServer(id);
    } else {
      const current = getLocalFavs();
      const next    = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      setLocalFavs(next);
    }
  }, [isAuth, toggleServer]);

  return { favorites, isFavorite, toggle };
}
