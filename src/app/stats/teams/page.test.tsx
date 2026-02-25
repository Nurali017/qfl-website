import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/utils';
import TeamsStatsPage from './page';

const { useTeamStatsTableMock, useTournamentMock, usePreSeasonEffectiveIdMock } = vi.hoisted(() => ({
  useTeamStatsTableMock: vi.fn(),
  useTournamentMock: vi.fn(),
  usePreSeasonEffectiveIdMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('tournament=2l&season=180'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks', () => ({
  useTeamStatsTable: (...args: unknown[]) => useTeamStatsTableMock(...args),
}));

vi.mock('@/contexts/TournamentContext', () => ({
  useTournament: () => useTournamentMock(),
  usePreSeasonEffectiveId: (...args: unknown[]) => usePreSeasonEffectiveIdMock(...args),
}));

vi.mock('@/config/tournaments', () => ({
  PRE_SEASON_CONFIG: { seasonStarted: false, previousSeasonId: 61 },
}));

vi.mock('@/components/statistics/StatisticsSubTabs', () => ({
  StatisticsSubTabs: () => <div data-testid="stats-subtabs" />,
  SUB_TAB_IDS: ['key_stats', 'goals', 'attempts', 'distribution', 'attacking', 'defending', 'goalkeeping', 'disciplinary'],
  SUB_TAB_KEYS: {
    key_stats: 'subTabs.keyStats',
    goals: 'subTabs.goals',
    attempts: 'subTabs.attempts',
    distribution: 'subTabs.distribution',
    attacking: 'subTabs.attacking',
    defending: 'subTabs.defending',
    goalkeeping: 'subTabs.goalkeeping',
    disciplinary: 'subTabs.disciplinary',
  },
}));

vi.mock('@/components/statistics/StatisticsFilters', () => ({
  StatisticsFilters: () => <div data-testid="stats-filters" />,
}));

vi.mock('@/components/statistics/ClubStatsTable', () => ({
  ClubStatsTable: () => <div data-testid="club-stats-table" />,
}));

describe('Teams stats page season selection', () => {
  beforeEach(() => {
    useTeamStatsTableMock.mockReset();
    useTournamentMock.mockReset();
    usePreSeasonEffectiveIdMock.mockReset();

    useTournamentMock.mockReturnValue({
      currentTournament: {
        hasTable: true,
        hasBracket: false,
        name: { ru: 'Вторая лига', kz: 'Екінші Лига', short: '2Л' },
      },
    });
    usePreSeasonEffectiveIdMock.mockReturnValue(180);
    useTeamStatsTableMock.mockReturnValue({
      teams: [{ team_id: 1 }],
      loading: false,
      error: null,
    });
  });

  it('passes effectiveSeasonId to useTeamStatsTable', () => {
    renderWithProviders(<TeamsStatsPage />);

    expect(useTeamStatsTableMock).toHaveBeenCalledWith({ seasonId: 180 });
    expect(useTeamStatsTableMock).not.toHaveBeenCalledWith({ seasonId: 61 });
  });
});
