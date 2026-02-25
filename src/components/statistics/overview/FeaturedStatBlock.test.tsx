import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderWithProviders, screen } from '@/test/utils';
import { FeaturedStatBlock } from './FeaturedStatBlock';

const { routerPushMock } = vi.hoisted(() => ({
  routerPushMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPushMock }),
  useSearchParams: () => new URLSearchParams('tournament=pl&season=61'),
}));

vi.mock('@/components/navigation/TournamentAwareLink', () => ({
  TournamentAwareLink: ({
    href,
    children,
  }: {
    href: string;
    children: ReactNode;
  }) => <a href={href}>{children}</a>,
}));

function buildRankings(count: number) {
  return Array.from({ length: count }).map((_, index) => ({
    rank: index + 2,
    name: `Player ${index + 2}`,
    imageUrl: null,
    teamName: `Team ${index + 2}`,
    teamLogoUrl: null,
    value: index + 10,
    href: `/player/${index + 2}`,
  }));
}

const baseProps = {
  title: 'Goals',
  featured: {
    photoUrl: null,
    name: 'Leader',
    teamName: 'Top Team',
    teamLogoUrl: null,
    mainStat: { label: 'Goals', value: 30 },
    circles: [{ value: 50, label: 'Accuracy' }],
  },
  entityLabel: 'Игрок',
  valueLabel: 'Всего',
  viewFullTableHref: '/stats/players',
};

describe('FeaturedStatBlock mobile compact list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routerPushMock.mockReset();
  });

  it('renders all ranking entries in compact list', () => {
    renderWithProviders(<FeaturedStatBlock {...baseProps} rankings={buildRankings(4)} />);

    // Each player name appears twice (mobile compact list + desktop table)
    expect(screen.getAllByText('Player 2')).toHaveLength(2);
    expect(screen.getAllByText('Player 5')).toHaveLength(2);
    // 4 rankings x 2 (mobile + desktop) = 8
    expect(screen.getAllByText(/Player \d+/)).toHaveLength(8);
  });

  it('shows no ranking message for empty rankings', () => {
    renderWithProviders(<FeaturedStatBlock {...baseProps} rankings={[]} />);

    expect(screen.getByText('Рейтинг пока недоступен.')).toBeInTheDocument();
  });

  it('renders single ranking entry without issues', () => {
    renderWithProviders(<FeaturedStatBlock {...baseProps} rankings={buildRankings(1)} />);

    // "Player 2" appears in both mobile compact list and desktop table
    expect(screen.getAllByText('Player 2')).toHaveLength(2);
  });

  it('navigates on desktop row click', () => {
    renderWithProviders(<FeaturedStatBlock {...baseProps} rankings={buildRankings(2)} />);

    const desktopTable = screen.getAllByRole('table')[0];
    const row = within(desktopTable).getByText('Player 2').closest('tr');
    expect(row).toBeTruthy();
    fireEvent.click(row!);

    expect(routerPushMock).toHaveBeenCalledWith('/player/2?tournament=pl&season=61', undefined);
  });
});
