// PATH: src/hooks/useFavorites.ts
// NEW: Saved/favorite astrologers — localStorage based

import { useState, useEffect, useCallback } from "react";

const KEY = "astro_favorites";

function getStored(): number[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(getStored);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = (id: number) => favorites.includes(id);

  return { favorites, toggle, isFavorite };
}
