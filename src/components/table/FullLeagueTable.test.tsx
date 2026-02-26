import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FullLeagueTable } from './FullLeagueTable';
import type { TeamStanding } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/navigation/TournamentAwareLink', () => ({
  TournamentAwareLink: ({ href, children, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('./FormIndicator', () => ({
  FormIndicator: () => <div data-testid="form-indicator" />,
}));

vi.mock('./NextMatchBadge', () => ({
  NextMatchBadge: () => <div data-testid="next-match-badge" />,
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
    form: 'WWWWW',
    ...overrides,
  };
}

describe('FullLeagueTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render relegation legend or red borders when relegation zone is absent', () => {
    const standings: TeamStanding[] = [
      makeStanding({ position: 1, team_id: 1, zone: 'champion' }),
      makeStanding({ position: 2, team_id: 2, zone: 'euro_cups' }),
      makeStanding({ position: 16, team_id: 16, zone: null }),
    ];

    const { container } = render(<FullLeagueTable standings={standings} />);

    expect(screen.queryByText('legend.relegation')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.border-l-red-500')).toHaveLength(0);
  });

  it('renders red borders and relegation legend from backend zone regardless of position', () => {
    const standings: TeamStanding[] = [
      makeStanding({ position: 1, team_id: 1, zone: 'champion' }),
      makeStanding({ position: 2, team_id: 2, zone: 'euro_cups' }),
      makeStanding({ position: 3, team_id: 3, zone: 'relegation' }),
    ];

    const { container } = render(<FullLeagueTable standings={standings} />);

    expect(screen.getByText('legend.relegation')).toBeInTheDocument();
    expect(container.querySelectorAll('.border-l-red-500').length).toBeGreaterThan(0);
  });
});
