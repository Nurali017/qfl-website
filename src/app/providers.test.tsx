import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { Providers } from './providers';

vi.mock('@/contexts/TournamentContext', () => ({
  TournamentProvider: ({
    children,
  }: {
    children: ReactNode;
    initialTournamentId?: string;
  }) => <>{children}</>,
}));

describe('Providers', () => {
  it('renders children when localStorage access throws', async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    try {
      render(
        <Providers initialLang="ru" initialTournamentId="pl">
          <div data-testid="providers-child">ok</div>
        </Providers>
      );

      expect(screen.getByTestId('providers-child')).toBeInTheDocument();
    } finally {
      setItemSpy.mockRestore();
      getItemSpy.mockRestore();
    }
  });
});
