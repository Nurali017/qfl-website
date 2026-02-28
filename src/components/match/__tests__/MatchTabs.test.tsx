import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen } from '@/test/utils';
import { MatchTabs } from '@/components/match/MatchTabs';

describe('MatchTabs', () => {
  it('renders desktop and stacked mobile protocol links when protocolUrl is provided', () => {
    const protocolUrl = 'https://example.com/protocol.pdf';

    renderWithProviders(
      <MatchTabs
        activeTab="overview"
        onTabChange={vi.fn()}
        protocolUrl={protocolUrl}
      />
    );

    expect(screen.getByTestId('protocol-link-desktop')).toHaveAttribute('href', protocolUrl);
    expect(screen.getByTestId('protocol-link-mobile-stacked')).toBeInTheDocument();
  });

  it('does not render protocol link when protocolUrl is absent', () => {
    renderWithProviders(
      <MatchTabs
        activeTab="overview"
        onTabChange={vi.fn()}
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('keeps tab switching behavior', () => {
    const onTabChange = vi.fn();

    renderWithProviders(
      <MatchTabs
        activeTab="overview"
        onTabChange={onTabChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Статистика' }));
    expect(onTabChange).toHaveBeenCalledWith('statistics');
  });
});
