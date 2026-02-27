'use client';

import { ReactNode, Suspense, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { swrConfig } from '@/lib/swr/config';
import { TournamentProvider } from '@/contexts/TournamentContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { normalizeSupportedLanguage, resolvePreferredLanguage } from '@/lib/i18n/language';
import {
  setLanguageCookie,
  getClientLanguageCookie,
} from '@/lib/i18n/cookies.client';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/safeStorage';

interface ProvidersProps {
  children: ReactNode;
  initialLang?: string;
  initialTournamentId?: string;
}

export function Providers({
  children,
  initialLang,
  initialTournamentId,
}: ProvidersProps) {
  const normalizedInitialLang = resolvePreferredLanguage({
    initialLang,
  });
  const currentI18nLang = normalizeSupportedLanguage(i18n.language);

  // Keep i18n in sync during render to avoid SSR/CSR language mismatch on first paint.
  if (currentI18nLang !== normalizedInitialLang) {
    void i18n.changeLanguage(normalizedInitialLang);
  }

  // Sync localStorage/cookie/document language on mount with priority:
  // cookie > localStorage > initialLang > kz
  useEffect(() => {
    const storedLang = normalizeSupportedLanguage(safeLocalStorageGet('i18nextLng'));
    const cookieLang = normalizeSupportedLanguage(getClientLanguageCookie());
    const nextLang = resolvePreferredLanguage({
      cookieLang,
      storedLang,
      initialLang: normalizedInitialLang,
    });
    const currentLang = normalizeSupportedLanguage(i18n.language);

    if (cookieLang !== nextLang) {
      setLanguageCookie(nextLang);
    }

    if (storedLang !== nextLang) {
      safeLocalStorageSet('i18nextLng', nextLang);
    }

    if (document.documentElement.lang !== nextLang) {
      document.documentElement.lang = nextLang;
    }

    if (currentLang !== nextLang) {
      void i18n.changeLanguage(nextLang);
    }
  }, [normalizedInitialLang]);

  return (
    <ThemeProvider>
      <SWRConfig value={swrConfig}>
        <I18nextProvider i18n={i18n}>
          <Suspense fallback={null}>
            <TournamentProvider
              initialTournamentId={initialTournamentId}
            >
              {children}
            </TournamentProvider>
          </Suspense>
        </I18nextProvider>
      </SWRConfig>
    </ThemeProvider>
  );
}
