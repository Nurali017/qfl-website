'use client';

import { useState, useCallback, useEffect } from 'react';

export function usePersistedColumns(mode: 'clubs' | 'players', subTab: string) {
  const key = `stats-columns:${mode}:${subTab}`;

  const [customColumns, setCustomColumnsRaw] = useState<Set<string> | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;
      return new Set(JSON.parse(saved) as string[]);
    } catch {
      return null;
    }
  });

  const setCustomColumns = useCallback((cols: Set<string> | null) => {
    setCustomColumnsRaw(cols);
    if (cols) {
      localStorage.setItem(key, JSON.stringify([...cols]));
    } else {
      localStorage.removeItem(key);
    }
  }, [key]);

  // Re-read from localStorage when subTab changes (key changes)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setCustomColumnsRaw(new Set(JSON.parse(saved) as string[]));
      } else {
        setCustomColumnsRaw(null);
      }
    } catch {
      setCustomColumnsRaw(null);
    }
  }, [key]);

  return [customColumns, setCustomColumns] as const;
}
