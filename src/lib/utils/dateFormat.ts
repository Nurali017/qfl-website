type SupportedLanguage = 'ru' | 'kz' | 'en';

/** Normalize date-only strings "YYYY-MM-DD" → "YYYY-MM-DDT00:00:00"
 *  to avoid Safari returning Invalid Date on ISO 8601 date-only format. */
function safeParseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00');
  }
  return new Date(dateStr);
}

const LOCALE_MAP: Record<SupportedLanguage, string> = {
  ru: 'ru-RU',
  kz: 'kk-KZ',
  en: 'en-US',
};

function getLocale(language: string): string {
  const lang = language.substring(0, 2) as SupportedLanguage;
  return LOCALE_MAP[lang] || 'ru-RU';
}

/* Kazakh weekday/month names — Intl kk-KZ is unreliable in minimal ICU runtimes */
const KZ_WEEKDAYS_LONG = ['жексенбі', 'дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі'];
const KZ_WEEKDAYS_SHORT = ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб'];
const KZ_MONTHS_LONG = ['', 'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
const KZ_MONTHS_SHORT = ['', 'қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау', 'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел'];

function formatKzDate(date: Date, options: { weekday?: 'long' | 'short'; day?: 'numeric'; month?: 'long' | 'short'; year?: 'numeric' }): string {
  const parts: string[] = [];
  if (options.weekday) {
    const names = options.weekday === 'long' ? KZ_WEEKDAYS_LONG : KZ_WEEKDAYS_SHORT;
    parts.push(names[date.getDay()]);
  }
  const day = options.day ? String(date.getDate()) : '';
  const month = options.month
    ? (options.month === 'long' ? KZ_MONTHS_LONG : KZ_MONTHS_SHORT)[date.getMonth() + 1]
    : '';
  if (day && month) parts.push(`${day} ${month}`);
  else if (day) parts.push(day);
  else if (month) parts.push(month);
  if (options.year) parts.push(String(date.getFullYear()));
  return parts.join(', ');
}

function isKz(language: string): boolean {
  return language.substring(0, 2) === 'kz';
}

export function formatMatchDate(dateStr: string, language: string): string {
  const date = safeParseDate(dateStr);
  if (isKz(language)) return formatKzDate(date, { weekday: 'long', day: 'numeric', month: 'long' });
  const locale = getLocale(language);

  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatNewsDate(dateStr: string, language: string): string {
  const date = safeParseDate(dateStr);
  if (isKz(language)) {
    return formatKzDate(date, { day: 'numeric', month: 'long' });
  }
  const locale = getLocale(language);

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  });
}

export function formatShortDate(dateStr: string, language: string): string {
  const date = safeParseDate(dateStr);
  if (isKz(language)) return formatKzDate(date, { day: 'numeric', month: 'short' });
  const locale = getLocale(language);

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateRange(dates: string[], language: string): string {
  if (dates.length === 0) return '';

  const sortedDates = [...dates].map(d => safeParseDate(d)).sort((a, b) => a.getTime() - b.getTime());

  const startDate = sortedDates[0];
  const endDate = sortedDates[sortedDates.length - 1];

  if (isKz(language)) {
    const startFormatted = formatKzDate(startDate, { day: 'numeric', month: 'long' });
    const endFormatted = formatKzDate(endDate, { day: 'numeric', month: 'long' });
    return startDate.getTime() === endDate.getTime() ? startFormatted : `${startFormatted} - ${endFormatted}`;
  }

  const locale = getLocale(language);
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
  };

  const startFormatted = startDate.toLocaleDateString(locale, formatOptions);
  const endFormatted = endDate.toLocaleDateString(locale, formatOptions);

  if (startDate.getTime() === endDate.getTime()) {
    return startFormatted;
  }

  return `${startFormatted} - ${endFormatted}`;
}

export function formatMatchDayDate(dateStr: string, language: string): string {
  const date = safeParseDate(dateStr);
  if (isKz(language)) return formatKzDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const locale = getLocale(language);

  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMatchTime(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const parsed = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!parsed) return trimmed;
  return `${parsed[1].padStart(2, '0')}:${parsed[2]}`;
}
