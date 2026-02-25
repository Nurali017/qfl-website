import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/types';

const DEFAULT_LANGUAGE: SupportedLanguage = 'kz';

export interface LanguageResolutionInput {
  cookieLang?: string | null;
  storedLang?: string | null;
  initialLang?: string | null;
}

export function normalizeSupportedLanguage(value: string | null | undefined): SupportedLanguage | null {
  if (!value) return null;
  const normalized = value.toLowerCase().slice(0, 2) as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : null;
}

export function resolvePreferredLanguage({
  cookieLang,
  storedLang,
  initialLang,
}: LanguageResolutionInput): SupportedLanguage {
  return (
    normalizeSupportedLanguage(cookieLang)
    ?? normalizeSupportedLanguage(storedLang)
    ?? normalizeSupportedLanguage(initialLang)
    ?? DEFAULT_LANGUAGE
  );
}

