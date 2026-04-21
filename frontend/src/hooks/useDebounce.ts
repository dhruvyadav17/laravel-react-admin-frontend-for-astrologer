// NEW FEATURE: Debounce hook
//          User "Vedic Astrology" type kare -> 14 API calls
// USAGE: const debouncedSearch = useDebounce(search, 400);
//        useGetAstrologersQuery({ search: debouncedSearch })

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
