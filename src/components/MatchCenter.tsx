'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTournament } from '@/contexts/TournamentContext';
import { useMatchCenter } from '@/hooks';
import { MatchCenterFilters } from '@/components/matches/MatchCenterFilters';
import { MatchCard } from '@/components/matches/MatchCard';
import { LiveMatchCard } from '@/components/matches/LiveMatchCard';
import { MatchCenterSkeleton } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatMatchDate, formatDateRange } from '@/lib/utils/dateFormat';
import { MatchCenterFilters as FiltersType, DateGroup, Game } from '@/types';
import { getMatchCenterFiltersFromUrl } from '@/lib/utils/urlState';

/**
 * Merge tentative games of the same tour into a single group with a date
 * range label (e.g., "Тур 4 · 4-5 сәуір").
 *
 * Uses `tourDateRanges` from the backend (full date ranges unaffected by
 * filters) so that filtering by team still shows the full tour date range.
 */
function mergeTentativeGroups(
  groups: DateGroup[],
  language: string,
  tourLabel: string,
  tourDateRanges?: Record<number, [string, string]>,
): DateGroup[] {
  // Pass 1: collect every tentative game by its tour number
  const tentativeTours = new Map<number, { dates: Set<string>; games: Game[] }>();

  for (const group of groups) {
    for (const game of group.games) {
      if (!game.is_schedule_tentative || !game.tour) continue;
      if (!tentativeTours.has(game.tour)) {
        tentativeTours.set(game.tour, { dates: new Set(), games: [] });
      }
      tentativeTours.get(game.tour)!.dates.add(group.date);
      tentativeTours.get(game.tour)!.games.push(game);
    }
  }

  // Pass 2: build result — emit merged tour group on first encounter,
  // keep non-tentative (or no-tour) games in their original date group.
  const merged: DateGroup[] = [];
  const emittedTours = new Set<number>();

  for (const group of groups) {
    // Emit merged groups for tours first appearing in this date group
    for (const game of group.games) {
      if (
        game.is_schedule_tentative &&
        game.tour &&
        tentativeTours.has(game.tour) &&
        !emittedTours.has(game.tour)
      ) {
        emittedTours.add(game.tour);
        const entry = tentativeTours.get(game.tour)!;

        // Prefer backend-provided full date range (ignores team/status filters)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[merge] tour=${game.tour}, tourDateRanges keys=`, tourDateRanges ? Object.keys(tourDateRanges) : 'undefined', 'value=', tourDateRanges?.[game.tour]);
        }
        const backendRange = tourDateRanges?.[game.tour];
        const dates = backendRange ?? [...entry.dates].sort();
        const dateRange = formatDateRange(
          Array.isArray(dates) ? dates : [dates],
          language,
        );
        const label = `${tourLabel} ${game.tour} · ${dateRange}`;
        merged.push({ date: (backendRange?.[0] ?? [...entry.dates].sort()[0]), date_label: label, games: entry.games });
      }
    }

    // Keep non-tentative / no-tour games in their original group
    const remaining = group.games.filter(g => !g.is_schedule_tentative || !g.tour);
    if (remaining.length > 0) {
      merged.push({ ...group, games: remaining });
    }
  }

  return merged;
}

export function MatchCenter() {
  const { t, i18n } = useTranslation('match');
  const { t: tErrors } = useTranslation('errors');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { effectiveSeasonId } = useTournament();

  // Initialize filters from URL
  const [filters, setFilters] = useState<FiltersType>(() =>
    getMatchCenterFiltersFromUrl(searchParams)
  );

  // Sync state with URL changes (browser back/forward)
  useEffect(() => {
    const newFilters = getMatchCenterFiltersFromUrl(searchParams);
    setFilters(newFilters);
  }, [searchParams]);

  // Fetch data with current filters
  const { groups, total, tentativeTourDates, loading, error, refetch } = useMatchCenter({
    season_id: filters.season_id || effectiveSeasonId,
    fetchAll: true,
    ...filters,
  });
  // Merge tentative tour groups into date ranges
  const mergedGroups = mergeTentativeGroups(groups, i18n.language, t('tour'), tentativeTourDates);

  const hasActiveFilters =
    filters.group !== undefined ||
    filters.final === true ||
    (filters.tours?.length ?? 0) > 0 ||
    (filters.team_ids?.length ?? 0) > 0 ||
    filters.month !== undefined ||
    filters.year !== undefined ||
    filters.status !== undefined ||
    filters.hide_past === true;

  // Sync filters to URL when they change
  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);

    // Keep existing params (tournament/stage/lang) and only update match-center keys.
    const params = new URLSearchParams(searchParams.toString());
    [
      'season_id',
      'group',
      'final',
      'tours',
      'team_ids',
      'month',
      'year',
      'status',
      'hide_past',
    ].forEach((key) => params.delete(key));

    if (newFilters.season_id) params.set('season_id', String(newFilters.season_id));
    if (newFilters.group) params.set('group', newFilters.group);
    if (newFilters.final) params.set('final', 'true');
    if (newFilters.tours?.length) params.set('tours', newFilters.tours.join(','));
    if (newFilters.team_ids?.length) params.set('team_ids', newFilters.team_ids.join(','));
    if (newFilters.month) params.set('month', String(newFilters.month));
    if (newFilters.year) params.set('year', String(newFilters.year));
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.hide_past) params.set('hide_past', 'true');

    // Update URL
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newUrl, { scroll: false });
  };

  if (loading) {
    return <MatchCenterSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
        <ErrorMessage message={tErrors('loadMatches')} onRetry={refetch} compact />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MatchCenterFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Total count */}
      {total > 0 && (
        <div className="text-sm text-gray-600 dark:text-slate-400">
          {t('totalMatches', { count: total })}
        </div>
      )}

      {/* Grouped matches */}
      {mergedGroups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border">
          <p className="text-gray-500 dark:text-slate-400 text-lg">
            {hasActiveFilters
              ? t('noMatchesFiltered')
              : t('noData.noMatches', { ns: 'common' })}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {mergedGroups.map((group, idx) => (
            <div key={`${group.date}-${idx}`} className="space-y-4">
              {/* Date header */}
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100 capitalize">
                {group.date_label || formatMatchDate(group.date, i18n.language)}
              </h2>

              {/* Matches in this date group */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                {group.games.map((match) =>
                  match.is_live || match.status === 'live' ? (
                    <LiveMatchCard key={match.id} match={match} />
                  ) : (
                    <MatchCard key={match.id} match={match} showTour showDate={false} showScheduleDisclaimer />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
