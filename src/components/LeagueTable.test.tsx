import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeagueTable } from './LeagueTable';
import type { TeamStanding } from '@/types';

const { useLeagueTableMock, useTournamentMock } = vi.hoisted(() => ({
  useLeagueTableMock: vi.fn(),
  useTournamentMock: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (typeof options?.defaultValue === 'string') {
        return options.defaultValue;
      }
      return key;
    },
  }),
}));

vi.mock('@/hooks', () => ({
  useLeagueTable: useLeagueTableMock,
}));

vi.mock('@/contexts/TournamentContext', () => ({
  useTournament: useTournamentMock,
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@/components/navigation/TournamentAwareLink', () => ({
  TournamentAwareLink: ({ href, children, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

function makeStanding(overrides: Partial<TeamStanding>): TeamStanding {
  return {
    position: 1,
    team_id: 1,
    team_name: 'Team',
    team_logo: null as unknown as string,
    games_played: 10,
    wins: 6,
    draws: 2,
    losses: 2,
    goals_scored: 15,
    goals_conceded: 8,
    goal_difference: 7,
    points: 20,
    ...overrides,
  };
}

describe('LeagueTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTournamentMock.mockReturnValue({
      effectiveSeasonId: 200,
      showTable: true,
      currentTournament: { name: { ru: 'Премьер-Лига' } },
    });
  });

  it('hides relegation legend and red dots when backend does not mark relegation zone', () => {
    useLeagueTableMock.mockReturnValue({
      standings: [
        makeStanding({ position: 1, team_id: 1, zone: 'champion' }),
        makeStanding({ position: 2, team_id: 2, zone: 'euro_cups' }),
        makeStanding({ position: 16, team_id: 16, zone: null }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<LeagueTable />);

    expect(screen.queryByText('tableLegend.relegation')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.bg-red-500')).toHaveLength(0);
  });

  it('renders relegation legend and red markers only when backend marks relegation zone', () => {
    useLeagueTableMock.mockReturnValue({
      standings: [
        makeStanding({ position: 1, team_id: 1, zone: 'champion' }),
        makeStanding({ position: 2, team_id: 2, zone: 'euro_cups' }),
        makeStanding({ position: 3, team_id: 3, zone: 'relegation' }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<LeagueTable />);

    expect(screen.getByText('tableLegend.relegation')).toBeInTheDocument();
    expect(container.querySelectorAll('.bg-red-500').length).toBeGreaterThanOrEqual(2);
  });
});
