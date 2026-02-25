import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import MatchesCalendarPage from './page';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        title: 'Матчи',
        'calendarPdf.title': 'Календарь матчей 2026 (PDF)',
        'calendarPdf.description': 'Полный календарь дат матчей сезона 2026 в формате PDF.',
        'calendarPdf.open': 'Открыть PDF',
        'calendarPdf.download': 'Скачать PDF',
        'calendarPdf.fallback': 'Если PDF не отображается, откройте или скачайте файл',
      };
      return dict[key] ?? key;
    },
  }),
}));

describe('MatchesCalendarPage', () => {
  it('renders title and description', () => {
    render(<MatchesCalendarPage />);

    expect(screen.getByText('Календарь матчей 2026 (PDF)')).toBeInTheDocument();
    expect(
      screen.getByText('Полный календарь дат матчей сезона 2026 в формате PDF.')
    ).toBeInTheDocument();
  });

  it('renders back link to matches page', () => {
    render(<MatchesCalendarPage />);

    expect(screen.getByRole('link', { name: '← Матчи' })).toHaveAttribute('href', '/matches');
    expect(screen.queryByRole('link', { name: 'Открыть PDF' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Скачать PDF' })).not.toBeInTheDocument();
  });

  it('renders iframe with pdf view url', () => {
    render(<MatchesCalendarPage />);

    expect(screen.getByTitle('Календарь матчей 2026 (PDF)')).toHaveAttribute(
      'src',
      '/api/v1/files/view/documents/kpl-2026-calendar-dates.pdf'
    );
  });
});
