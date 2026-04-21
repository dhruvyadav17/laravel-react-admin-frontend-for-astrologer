/**
 * useLang — language hook. Reads from localStorage.
 * Usage:  const { t, lang, setLang } = useLang();
 *         t('nav.home') → 'Home' or 'होम'
 */
import { useState, useCallback } from 'react';
import translations, { type Lang } from './translations';

const STORAGE_KEY = 'astro_lang';

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'hi' || saved === 'en') ? saved as Lang : 'en';
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
    // Update html lang attribute
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[lang]?.[key] ?? translations.en?.[key] ?? fallback ?? key;
  }, [lang]);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'hi' : 'en'), [lang, setLang]);

  return { lang, setLang, toggle, t, isHindi: lang === 'hi' };
}

export default useLang;
