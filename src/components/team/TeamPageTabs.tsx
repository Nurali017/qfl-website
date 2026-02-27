'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils/cn';
import { TEAM_PAGE_NAV_TABS, TeamPageTab } from './tabState';
import { TeamFilters } from './TeamFilters';
import type { TeamYearOption } from '@/hooks/useTeam';

interface TeamPageTabsProps {
  activeTab: TeamPageTab;
  onChange: (tab: TeamPageTab) => void;
  tournaments?: { code: string; shortName: string }[];
  selectedTournamentCode?: string;
  onTournamentChange?: (code: string) => void;
  yearItems?: TeamYearOption[];
  selectedSeasonId?: number;
  onSeasonChange?: (seasonId: number) => void;
}

export function TeamPageTabs({
  activeTab,
  onChange,
  tournaments = [],
  selectedTournamentCode = '',
  onTournamentChange,
  yearItems = [],
  selectedSeasonId = 0,
  onSeasonChange,
}: TeamPageTabsProps) {
  const { t, i18n } = useTranslation('team');
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(false);

  const tabLabels: Record<TeamPageTab, string> = {
    overview: t('tabs.overview', 'Обзор'),
    matches: t('tabs.matches', 'Матчи'),
    squad: t('tabs.squad', 'Состав'),
    stats: t('tabs.stats', 'Статистика'),
    staff: t('tabs.staff', 'Персонал'),
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const canScroll = el.scrollWidth > el.clientWidth + 1;
      setShowLeftHint(canScroll && el.scrollLeft > 0);
      setShowRightHint(canScroll && el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [i18n.language]);

  const hasFilters = tournaments.length > 1 || yearItems.length > 1;

  return (
    <div className="sticky top-14 md:top-20 z-40 mb-6 md:mb-8 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#050a13]/85 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Nav tabs row */}
          <div className="relative flex items-center flex-1 min-w-0">
            <div
              ref={scrollerRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 md:py-3 flex-1 min-w-0"
            >
              {TEAM_PAGE_NAV_TABS.map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onChange(tab)}
                    className={cn(
                      'rounded-full px-3.5 md:px-4 py-2 text-xs md:text-sm font-bold whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20 dark:bg-white/15 dark:text-white dark:border-white/20 shadow-sm'
                        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
                    )}
                  >
                    {tabLabels[tab]}
                  </button>
                );
              })}
            </div>

            {showLeftHint ? (
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 dark:from-slate-900/90 to-transparent md:hidden" />
            ) : null}
            {showRightHint && !hasFilters ? (
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 dark:from-slate-900/90 to-transparent md:hidden" />
            ) : null}
          </div>

          {/* Filters: second row on mobile, right side on desktop */}
          {hasFilters && (
            <div className="shrink-0 pb-2 md:pb-0 md:pl-3 md:border-l md:border-gray-200 md:dark:border-white/10 md:ml-2 md:py-3">
              <TeamFilters
                tournaments={tournaments}
                selectedTournamentCode={selectedTournamentCode}
                onTournamentChange={onTournamentChange ?? (() => {})}
                yearItems={yearItems}
                selectedSeasonId={selectedSeasonId}
                onSeasonChange={onSeasonChange ?? (() => {})}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
