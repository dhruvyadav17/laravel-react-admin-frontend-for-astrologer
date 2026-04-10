// PATH: src/core/hooks/usePagination.ts
// FIX F6: searchParams useEffect dependency missing → stale closure
//   searchParams was used inside effect but not in deps array

import { useSearchParams }     from 'react-router-dom';
import { useState, useEffect } from 'react';

type Options = {
  defaultPage?:   number;
  defaultSearch?: string;
  debounceMs?:    number;
};

export function usePagination(options: Options = {}) {
  const {
    defaultPage   = 1,
    defaultSearch = '',
    debounceMs    = 400,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const page      = Number(searchParams.get('page')) || defaultPage;
  const urlSearch = searchParams.get('search') ?? defaultSearch;

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [search,      setSearch]      = useState(urlSearch);

  // FIX F6: searchParams added to deps
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);

      const params = new URLSearchParams(searchParams);

      if (searchInput.trim()) {
        params.set('search', searchInput.trim());
      } else {
        params.delete('search');
      }

      params.delete('page');
      setSearchParams(params);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchInput, debounceMs, searchParams]); // FIX F6: searchParams in deps

  useEffect(() => {
    if (urlSearch === '' && searchInput !== '') setSearchInput('');
  }, [urlSearch]);

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.delete('page');
    setSearchParams(params);
  };

  return {
    page, setPage,
    search, searchInput, setSearchInput, clearSearch,
    setSearch: setSearchInput,
  };
}
