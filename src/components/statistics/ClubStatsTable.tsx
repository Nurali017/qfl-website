'use client';

import { useMemo, useState } from 'react';
import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatValue } from '@/lib/mock/statisticsHelpers';
import { ColumnPicker } from './ColumnPicker';
import { useDebounce } from '@/hooks/useDebounce';
import { useStatsTable } from '@/hooks/useStatsTable';
import { StatSubTab, TeamStatistics } from '@/types/statistics';
import { getTeamHref } from '@/lib/utils/entityRoutes';
import { navigatePrimary, shouldSkipPrimaryNavigation } from '@/lib/utils/interactiveNavigation';
import { TableSkeleton } from './TableSkeleton';

interface ClubStatsTableProps {
  subTab: StatSubTab;
  teams: TeamStatistics[];
  loading?: boolean;
}

const DEFAULT_SORT_BY: Record<StatSubTab, string> = {
  key_stats: 'points',
  goals: 'goals_scored',
  attempts: 'shots',
  distribution: 'passes',
  attacking: 'possession',
  defending: 'tackles',
  goalkeeping: 'points',
  disciplinary: 'fouls',
};

const TEAM_LOGO_PLACEHOLDER_SRC = '/images/placeholders/team.svg';

export function ClubStatsTable({ subTab, teams, loading }: ClubStatsTableProps) {
  const { t } = useTranslation('statistics');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const {
    isMobile,
    columns,
    visibleColumns,
    setCustomColumns,
    sortBy,
    sortOrder,
    handleSort,
    scrollContainerRef,
    showMobileScrollHint,
    hasColumnPicker,
    sortItems,
  } = useStatsTable({
    subTab,
    mode: 'clubs',
    defaultSortByMap: DEFAULT_SORT_BY,
    itemCount: teams.length,
  });

  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const filteredTeams = useMemo(() => {
    if (!normalizedQuery) return teams;
    return teams.filter((team) =>
      (team.team_name || '').toLowerCase().includes(normalizedQuery)
    );
  }, [teams, normalizedQuery]);

  const sortedTeams = useMemo(
    () => sortItems(filteredTeams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredTeams, sortBy, sortOrder],
  );

  if (loading) return <TableSkeleton rows={10} columns={visibleColumns.length + 2} />;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
      <div className="px-3 md:px-4 py-3 border-b border-gray-200 dark:border-dark-border">
        <div className="relative max-w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('table.searchClub', { defaultValue: 'Поиск клуба…' })}
            aria-label={t('table.searchClub', { defaultValue: 'Поиск клуба…' })}
            className="w-full pl-10 pr-9 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface-soft transition-colors"
              aria-label={t('table.clearSearch', {
                defaultValue: 'Очистить поиск',
              })}
            >
              <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>


      <div className="relative">
        {showMobileScrollHint && (
          <div className="md:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-dark-surface to-transparent z-20" />
        )}
        {showMobileScrollHint && (
          <div className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-dark-surface to-transparent z-20" />
        )}
        <div ref={scrollContainerRef} data-testid="club-stats-scroll-container" className="overflow-x-auto no-scrollbar">
          <table className="w-full md:min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-dark-surface-soft border-b border-gray-200 dark:border-dark-border">
            <tr>
              <th className="px-2.5 md:px-4 py-2.5 md:py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider w-12 md:w-16 sticky left-0 bg-gray-50 dark:bg-dark-surface-soft z-10">
                {t('table.position')}
              </th>
              <th className="px-2.5 md:px-4 py-2.5 md:py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider sticky left-12 md:left-16 bg-gray-50 dark:bg-dark-surface-soft z-10 w-[170px] md:w-64 border-r border-gray-100 dark:border-dark-border">
                {t('table.club')}
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-2.5 md:px-4 py-2.5 md:py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${
                    col.sortable
                      ? 'text-gray-500 dark:text-slate-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-soft'
                      : 'text-gray-500 dark:text-slate-400'
                  } ${
                    sortBy === col.key
                      ? 'text-primary dark:text-accent-cyan bg-blue-50/50 dark:bg-cyan-500/10'
                      : ''
                  }`}
                  aria-sort={
                    col.sortable
                      ? sortBy === col.key
                        ? sortOrder === 'desc'
                          ? 'descending'
                          : 'ascending'
                        : 'none'
                      : undefined
                  }
                >
                  {(() => {
                    const headerLabel = isMobile
                      ? col.label.charAt(0)
                      : col.labelKey ? t(col.labelKey, { defaultValue: col.label }) : (col.fullLabel || col.label);
                    return col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="w-full flex items-center gap-1 text-left"
                      >
                        {headerLabel}
                        {sortBy === col.key && (
                          <span className="text-[10px]">
                            {sortOrder === 'desc' ? '▼' : '▲'}
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">{headerLabel}</div>
                    );
                  })()}
                </th>
              ))}
              {hasColumnPicker && (
                <th className="px-1 py-2.5 bg-gray-50 dark:bg-dark-surface-soft sticky right-0 z-10">
                  <ColumnPicker
                    columns={columns}
                    selected={new Set(visibleColumns.map(c => c.key))}
                    onChange={setCustomColumns}
                    sortBy={sortBy}
                    getLabel={(col) => col.labelKey ? t(col.labelKey, { defaultValue: col.label }) : (col.fullLabel || col.label)}
                  />
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {sortedTeams.map((team, index) => {
              const teamHref = getTeamHref(team.team_id);
              return (
              <tr
                key={team.team_id}
                className={`border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-soft transition-colors group ${
                  teamHref ? 'cursor-pointer' : ''
                }`}
                role={teamHref ? 'link' : undefined}
                tabIndex={teamHref ? 0 : undefined}
                onClick={(event) => {
                  if (!teamHref) return;
                  if (shouldSkipPrimaryNavigation(event)) return;
                  navigatePrimary(router, teamHref, searchParams);
                }}
                onKeyDown={(event) => {
                  if (!teamHref) return;
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  if (shouldSkipPrimaryNavigation(event)) return;
                  event.preventDefault();
                  navigatePrimary(router, teamHref, searchParams);
                }}
              >
                <td className="px-2.5 md:px-4 py-3 md:py-4 text-sm text-gray-500 dark:text-slate-400 font-medium sticky left-0 bg-white dark:bg-dark-surface group-hover:bg-gray-50 dark:group-hover:bg-dark-surface-soft z-10">
                  {index + 1}
                </td>
                <td className="px-2.5 md:px-4 py-3 md:py-4 sticky left-12 md:left-16 bg-white dark:bg-dark-surface group-hover:bg-gray-50 dark:group-hover:bg-dark-surface-soft z-10 border-r border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <img
                      src={team.team_logo || TEAM_LOGO_PLACEHOLDER_SRC}
                      alt={team.team_name}
                      className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallbackApplied) return;
                        img.dataset.fallbackApplied = 'true';
                        img.src = TEAM_LOGO_PLACEHOLDER_SRC;
                      }}
                    />
                    {(() => {
                      if (!teamHref) {
                        return (
                          <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-slate-100 truncate max-w-[108px] md:max-w-none">
                            {team.team_name}
                          </span>
                        );
                      }

                      return (
                        <Link
                          href={teamHref}
                          className="font-semibold text-sm md:text-base text-gray-900 dark:text-slate-100 hover:text-primary dark:hover:text-accent-cyan transition-colors truncate max-w-[108px] md:max-w-none"
                        >
                          {team.team_name}
                        </Link>
                      );
                    })()}
                  </div>
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-2.5 md:px-4 py-3 md:py-4 text-sm text-gray-900 dark:text-slate-100 ${
                      sortBy === col.key
                        ? 'bg-blue-50/30 dark:bg-cyan-500/10 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/20 font-semibold'
                        : ''
                    }`}
                  >
                    {formatValue(team[col.key as keyof TeamStatistics], col.format)}
                  </td>
                ))}
                {hasColumnPicker && <td className="sticky right-0 bg-white dark:bg-dark-surface group-hover:bg-gray-50 dark:group-hover:bg-dark-surface-soft" />}
              </tr>
            )})}

            {sortedTeams.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2 + (hasColumnPicker ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500 dark:text-slate-400"
                >
                  {t('table.noClubsFound')}
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
