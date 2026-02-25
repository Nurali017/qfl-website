import { describe, expect, it } from 'vitest';

import { normalizeSupportedLanguage, resolvePreferredLanguage } from './language';

describe('language utilities', () => {
  it('normalizes supported language codes', () => {
    expect(normalizeSupportedLanguage('kz')).toBe('kz');
    expect(normalizeSupportedLanguage('ru-RU')).toBe('ru');
    expect(normalizeSupportedLanguage('KZ')).toBe('kz');
  });

  it('returns null for unsupported language values', () => {
    expect(normalizeSupportedLanguage('en')).toBeNull();
    expect(normalizeSupportedLanguage('')).toBeNull();
    expect(normalizeSupportedLanguage(null)).toBeNull();
  });

  it('resolves language by priority cookie > storage > initial > kz', () => {
    expect(resolvePreferredLanguage({
      cookieLang: 'ru',
      storedLang: 'kz',
      initialLang: 'kz',
    })).toBe('ru');

    expect(resolvePreferredLanguage({
      cookieLang: null,
      storedLang: 'ru',
      initialLang: 'kz',
    })).toBe('ru');

    expect(resolvePreferredLanguage({
      cookieLang: null,
      storedLang: null,
      initialLang: 'ru',
    })).toBe('ru');

    expect(resolvePreferredLanguage({
      cookieLang: 'en',
      storedLang: 'en',
      initialLang: 'en',
    })).toBe('kz');
  });
});

