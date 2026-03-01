'use client';

import { useMemo } from 'react';
import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { formatValue } from '@/lib/mock/statisticsHelpers';
import { ColumnPicker } from './ColumnPicker';
import { useStatsTable } from '@/hooks/useStatsTable';
import { ExtendedPlayerStat, StatSubTab } from '@/types/statistics';
import { PlayerStatsNationalityFilter } from '@/types';
import { getPlayerHref, getTeamHref } from '@/lib/utils/entityRoutes';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { navigatePrimary, shouldSkipPrimaryNavigation } from '@/lib/utils/interactiveNavigation';
import { TableSkeleton } from './TableSkeleton';

interface PlayerStatsTableProps {
    subTab: StatSubTab;
    filters: { club: string; nationality: PlayerStatsNationalityFilter };
    players: ExtendedPlayerStat[];
    loading?: boolean;
}

const TEAM_LOGO_PLACEHOLDER_SRC = '/images/placeholders/team.svg';

const DEFAULT_SORT_BY: Record<StatSubTab, string> = {
    key_stats: 'goals',
    goals: 'goals',
    attempts: 'shots',
    distribution: 'passes',
    attacking: 'dribble',
    defending: 'tackle',
    goalkeeping: 'save_shot',
    disciplinary: 'yellow_cards',
};

function toCompactPlayerName(firstName?: string | null, lastName?: string | null): string {
    const first = (firstName || '').trim();
    const last = (lastName || '').trim();

    if (last && first) return `${last} ${first[0].toUpperCase()}.`;
    if (last) return last;
    if (first) return first;
    return '—';
}

export function PlayerStatsTable({ subTab, filters, players, loading }: PlayerStatsTableProps) {
  const { t } = useTranslation('statistics');
  const router = useRouter();
  const searchParams = useSearchParams();

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
    mode: 'players',
    defaultSortByMap: DEFAULT_SORT_BY,
    itemCount: players.length,
  });

    // Filter players
    const filteredPlayers = useMemo(() => {
        return players.filter(p => {
            if (filters.club !== 'all' && p.team_id.toString() !== filters.club) return false;
            const countryCode = p.country?.code?.toUpperCase() ?? null;
            if (filters.nationality === 'kz' && countryCode !== 'KZ') return false;
            if (filters.nationality === 'foreign' && (!countryCode || countryCode === 'KZ')) return false;
            return true;
        });
    }, [players, filters]);

    // Sort players
    const sortedPlayers = useMemo(
        () => sortItems(filteredPlayers),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filteredPlayers, sortBy, sortOrder],
    );

    const fixedColCount = isMobile ? 2 : 3; // # + Player [+ Club on desktop]
    if (loading) return <TableSkeleton rows={10} columns={visibleColumns.length + fixedColCount} />;

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
            <div className="relative">
                {showMobileScrollHint && (
                    <div className="md:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-dark-surface to-transparent z-20" />
                )}
                {showMobileScrollHint && (
                    <div className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-dark-surface to-transparent z-20" />
                )}
                <div ref={scrollContainerRef} data-testid="player-stats-scroll-container" className="overflow-x-auto no-scrollbar">
                <table className="w-full md:min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-dark-surface-soft border-b border-gray-200 dark:border-dark-border">
                        <tr>
                            <th className="px-2.5 md:px-4 py-2.5 md:py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider w-10 md:w-12 sticky left-0 bg-gray-50 dark:bg-dark-surface-soft z-10">
                                #
                            </th>
                            <th className="px-2.5 md:px-4 py-2.5 md:py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider sticky left-10 md:left-12 bg-gray-50 dark:bg-dark-surface-soft z-10 w-[180px] md:w-64 border-r border-gray-100 dark:border-dark-border">
                                {t('table.player', { defaultValue: 'Player' })}
                            </th>
                            {!isMobile && (
                                <th className="px-2.5 md:px-4 py-2.5 md:py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                    {t('table.club', { defaultValue: 'Club' })}
                                </th>
                            )}
                            {visibleColumns.map(col => (
                                <th
                                    key={col.key}
                                    className={`px-2.5 md:px-4 py-2.5 md:py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${
                                        col.sortable
                                            ? 'text-gray-500 dark:text-slate-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-soft'
                                            : 'text-gray-500 dark:text-slate-400'
                                    } ${sortBy === col.key ? 'text-primary dark:text-accent-cyan bg-blue-50/50 dark:bg-cyan-500/10' : ''}`}
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
                                        const headerLabel = isMobile && col.label
                                            ? col.label.charAt(0)
                                            : col.labelKey ? t(col.labelKey, { defaultValue: col.label || col.key }) : col.label;
                                        return col.sortable ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSort(col.key)}
                                                className="w-full flex items-center gap-1 text-left"
                                            >
                                                {headerLabel}
                                                {sortBy === col.key && (
                                                    <span className="text-[10px]">{sortOrder === 'desc' ? '▼' : '▲'}</span>
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
                                        getLabel={(col) =>
                                            col.labelKey
                                                ? t(col.labelKey, { defaultValue: col.label || col.key })
                                                : col.label
                                        }
                                    />
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player, index) => {
                            const playerHref = getPlayerHref(player.player_id);

                            return (
                            <tr
                                key={player.player_id}
                                className={`border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-soft transition-colors group ${
                                    playerHref ? 'cursor-pointer' : ''
                                }`}
                                role={playerHref ? 'link' : undefined}
                                tabIndex={playerHref ? 0 : undefined}
                                onClick={(event) => {
                                    if (!playerHref) return;
                                    if (shouldSkipPrimaryNavigation(event)) return;
                                    navigatePrimary(router, playerHref, searchParams);
                                }}
                                onKeyDown={(event) => {
                                    if (!playerHref) return;
                                    if (event.key !== 'Enter' && event.key !== ' ') return;
                                    if (shouldSkipPrimaryNavigation(event)) return;
                                    event.preventDefault();
                                    navigatePrimary(router, playerHref, searchParams);
                                }}
                            >
                                <td className="px-2.5 md:px-4 py-3 md:py-4 text-sm text-gray-500 dark:text-slate-400 font-medium sticky left-0 bg-white dark:bg-dark-surface group-hover:bg-gray-50 dark:group-hover:bg-dark-surface-soft z-10">
                                    {index + 1}
                                </td>
                                <td className="px-2.5 md:px-4 py-2 sticky left-10 md:left-12 bg-white dark:bg-dark-surface group-hover:bg-gray-50 dark:group-hover:bg-dark-surface-soft z-10 border-r border-gray-100 dark:border-dark-border">
                                    {(() => {
                                        const content = (
                                            <div className="flex items-center gap-2.5 md:gap-3">
                                                <PlayerAvatar
                                                    photoUrl={player.photo_url}
                                                    firstName={player.first_name}
                                                    lastName={player.last_name}
                                                    size="sm"
                                                    className="md:w-10 md:h-10"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-tight truncate max-w-[112px] md:max-w-none">
                                                            {toCompactPlayerName(player.first_name, player.last_name)}
                                                        </span>
                                                        {isMobile ? (
                                                            (() => {
                                                                const teamHref = getTeamHref(player.team_id);
                                                                const clubLogo = (
                                                                    <img
                                                                        src={player.team_logo || TEAM_LOGO_PLACEHOLDER_SRC}
                                                                        alt={player.team_name}
                                                                        className="w-4 h-4 object-contain shrink-0"
                                                                        onError={(e) => {
                                                                            const img = e.currentTarget;
                                                                            if (img.dataset.fallbackApplied) return;
                                                                            img.dataset.fallbackApplied = 'true';
                                                                            img.src = TEAM_LOGO_PLACEHOLDER_SRC;
                                                                        }}
                                                                    />
                                                                );
                                                                return teamHref ? (
                                                                    <Link href={teamHref} aria-label={player.team_name} className="shrink-0">
                                                                        {clubLogo}
                                                                    </Link>
                                                                ) : clubLogo;
                                                            })()
                                                        ) : player.country?.flag_url ? (
                                                            <img
                                                                src={player.country.flag_url}
                                                                alt={player.country?.code ? `${player.country.code.toUpperCase()} flag` : 'flag'}
                                                                className="w-4 h-3 rounded-[1px] object-cover border border-gray-200 dark:border-dark-border-soft shrink-0"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        );

                                        if (!playerHref) return content;

                                        return (
                                            <Link
                                                href={playerHref}
                                                className="block rounded-md transition-colors hover:bg-blue-50/40 dark:hover:bg-cyan-500/10"
                                            >
                                                {content}
                                            </Link>
                                        );
                                    })()}
                                </td>
                                {!isMobile && (
                                    <td className="px-2.5 md:px-4 py-3 md:py-4">
                                        {(() => {
                                            const teamHref = getTeamHref(player.team_id);
                                            const logo = (
                                                <img
                                                    src={player.team_logo || TEAM_LOGO_PLACEHOLDER_SRC}
                                                    alt={player.team_name}
                                                    className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0"
                                                    onError={(e) => {
                                                        const img = e.currentTarget;
                                                        if (img.dataset.fallbackApplied) return;
                                                        img.dataset.fallbackApplied = 'true';
                                                        img.src = TEAM_LOGO_PLACEHOLDER_SRC;
                                                    }}
                                                />
                                            );

                                            if (!teamHref) return logo;

                                            return (
                                                <Link
                                                    href={teamHref}
                                                    aria-label={player.team_name}
                                                    className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-blue-50/40 dark:hover:bg-cyan-500/10 p-0.5"
                                                >
                                                    {logo}
                                                </Link>
                                            );
                                        })()}
                                    </td>
                                )}
                                {visibleColumns.map(col => (
                                    <td
                                        key={col.key}
                                        className={`px-2.5 md:px-4 py-3 md:py-4 text-sm text-gray-900 dark:text-slate-100 ${
                                            sortBy === col.key
                                                ? 'bg-blue-50/30 dark:bg-cyan-500/10 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/20 font-bold'
                                                : ''
                                        }`}
                                    >
                                        {formatValue((player as any)[col.key], col.format)}
                                    </td>
                                ))}
                                {hasColumnPicker && <td className="sticky right-0 bg-white dark:bg-dark-surface group-hover:bg-gray-50 dark:group-hover:bg-dark-surface-soft" />}
                            </tr>
                        )})}
                        {sortedPlayers.length === 0 && (
                            <tr>
                                <td colSpan={visibleColumns.length + fixedColCount + (hasColumnPicker ? 1 : 0)} className="px-4 py-12 text-center text-gray-500 dark:text-slate-400">
                                    {t('table.noPlayersFound', {
                                        defaultValue: 'No players found. Try adjusting filters.',
                                    })}
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
