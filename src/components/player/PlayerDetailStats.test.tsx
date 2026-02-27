import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { renderWithProviders, screen } from '@/test/utils';
import { PlayerDetailStats } from './PlayerDetailStats';
import { PlayerPageStats } from '@/types/player';

const stats: PlayerPageStats = {
  games_played: 18,
  minutes_played: 1234,
  started: 14,
  subbed_in: 4,
  goals: 7,
  assists: 6,
  shots: 32,
  shots_on_goal: 21,
  passes: 488,
  key_passes: 25,
  pass_accuracy: 82,
  interception: 19,
  dribble: 17,
  yellow_cards: 3,
  red_cards: 1,
  duels: 40,
  duels_won: 30,
  duels_won_percentage: 75,
};

describe('PlayerDetailStats', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
  });

  it('uses unique duel labels and does not trigger duplicate key warnings', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      renderWithProviders(<PlayerDetailStats stats={stats} />);

      expect(screen.getAllByText('Выигранные дуэли (%)').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Выигранных дуэлей').length).toBeGreaterThan(0);

      const duplicateKeyWarnings = consoleErrorSpy.mock.calls.filter(([message]) =>
        typeof message === 'string' && message.includes('Encountered two children with the same key')
      );
      expect(duplicateKeyWarnings).toHaveLength(0);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
