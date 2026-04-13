// NEW FEATURE: Debounce hook
// PROBLEM: Search input pe har keystroke mein API call hoti thi
//          User "Vedic Astrology" type kare -> 14 API calls
// SOLUTION: useDebounce -- value ko delay karta hai jab tak user type karna band na kare
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
