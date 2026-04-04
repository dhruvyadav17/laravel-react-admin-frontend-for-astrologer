// PATH: src/hooks/usePagination.ts
// IMPROVEMENT: Debounce add kiya search ke liye
//              Pehle har keystroke pe URL update hoti thi → API call
//              Ab: searchInput (immediate UI) aur search (debounced, URL + API)
//              User 400ms tak type karna band kare tab API call hogi

import { useSearchParams }  from "react-router-dom";
import { useState, useEffect } from "react";

type Options = {
  defaultPage?:   number;
  defaultSearch?: string;
  debounceMs?:    number;
};

export function usePagination(options: Options = {}) {
  const {
    defaultPage   = 1,
    defaultSearch = "",
    debounceMs    = 400,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  /* ── Read from URL ──────────────────────────── */
  const page = Number(searchParams.get("page")) || defaultPage;
  const urlSearch = searchParams.get("search") ?? defaultSearch;

  /* ── Local input state (instant) ───────────── */
  const [searchInput, setSearchInput] = useState(urlSearch);

  /* ── Debounced value (goes to URL + API) ────── */
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);

      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.delete("page"); // reset page on new search
      setSearchParams(params);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchInput, debounceMs]);

  /* ── Page change ────────────────────────────── */
  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    setSearchParams(params);
  };

  /* ── Clear search ───────────────────────────── */
  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.delete("page");
    setSearchParams(params);
  };

  return {
    page,
    setPage,
    search,        // debounced → use for API
    searchInput,   // immediate → use for input value
    setSearchInput,// use for onChange
    clearSearch,
    // backward compat
    setSearch: setSearchInput,
  };
}
