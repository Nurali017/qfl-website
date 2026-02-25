import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import MatchesPage from './page';

const { useTournamentMock } = vi.hoisted(() => ({
  useTournamentMock: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        title: 'Матчи',
        'scheduleNotice.global': 'Дата и время матчей могут корректироваться. Окончательное расписание публикуется за месяц до начала.',
        'calendarPdf.cta': 'Календарь дат (PDF)',
      };
      return dict[key] ?? key;
    },
  }),
}));

vi.mock('@/contexts/TournamentContext', () => ({
  useTournament: () => useTournamentMock(),
}));

vi.mock('@/components/MatchCenter', () => ({
  MatchCenter: () => <div data-testid="match-center" />,
}));

vi.mock('@/components/ui/SeasonYearSelector', () => ({
  SeasonYearSelector: () => <div data-testid="season-year-selector" />,
}));

describe('MatchesPage schedule notice', () => {
  beforeEach(() => {
    useTournamentMock.mockReset();
  });

  it('renders matches page shell', () => {
    useTournamentMock.mockReturnValue({ effectiveSeasonId: 200 });

    render(<MatchesPage />);

    expect(screen.getByRole('heading', { name: 'Матчи' })).toBeInTheDocument();
    expect(screen.getByTestId('season-year-selector')).toBeInTheDocument();
    expect(screen.getByTestId('match-center')).toBeInTheDocument();
  });

  it('does not render schedule notice and calendar link', () => {
    useTournamentMock.mockReturnValue({ effectiveSeasonId: 61 });

    render(<MatchesPage />);

    expect(
      screen.queryByText('Дата и время матчей могут корректироваться. Окончательное расписание публикуется за месяц до начала.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Календарь дат (PDF)' })).not.toBeInTheDocument();
    expect(screen.getByTestId('match-center')).toBeInTheDocument();
  });
});
