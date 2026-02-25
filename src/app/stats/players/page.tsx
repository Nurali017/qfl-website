'use client';

import { useState } from 'react';
import { usePlayerStats, useTeams } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { StatisticsSubTabs, SUB_TAB_IDS, SUB_TAB_KEYS } from '@/components/statistics/StatisticsSubTabs';
import { StatisticsFilters } from '@/components/statistics/StatisticsFilters';
import { PlayerStatsTable } from '@/components/statistics/PlayerStatsTable';
import { StatSubTab } from '@/types/statistics';
import { usePreSeasonEffectiveId } from '@/contexts/TournamentContext';
import {
    PlayerStatsNationality,
    PlayerStatsNationalityFilter,
    PlayerStatsSortBy,
} from '@/types';

export default function PlayersStatsPage() {
    const { t } = useTranslation('statistics');
    const effectiveSeasonId = usePreSeasonEffectiveId('previous');
    const [subTab, setSubTab] = useState<StatSubTab>('key_stats');
    const [selectedClub, setSelectedClub] = useState('all');
    const [selectedNationality, setSelectedNationality] = useState<PlayerStatsNationalityFilter>('all');

    const sortBy: PlayerStatsSortBy = (() => {
        switch (subTab) {
            case 'key_stats':
            case 'goals':
                return 'goals';
            case 'attempts':
                return 'shots';
            case 'distribution':
                return 'passes';
            case 'attacking':
                return 'dribble';
            case 'defending':
                return 'tackle';
            case 'goalkeeping':
                return 'save_shot';
            case 'disciplinary':
                return 'yellow_cards';
            // Tabs not yet implemented in UI columns; use a safe default.
            default:
                return 'goals';
        }
    })();

    const teamId =
        selectedClub !== 'all' && Number.isFinite(Number(selectedClub))
            ? Number(selectedClub)
            : undefined;

    const nationality =
        selectedNationality !== 'all'
            ? (selectedNationality as PlayerStatsNationality)
            : undefined;

    // Get players with high limit for table view
    const { players, loading, error } = usePlayerStats({
        limit: 100,
        seasonId: effectiveSeasonId,
        sortBy,
        teamId,
        nationality,
    });

    // Get teams for the filter dropdown (should not depend on team-stats availability)
    const { teams: teamsList } = useTeams(effectiveSeasonId);

    return (
        <>
            {/* Mobile: combined compact filter bar */}
            <div className="md:hidden bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border py-3">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-2.5">
                    <div className="flex items-center gap-2">
                        <select
                            value={subTab}
                            onChange={(e) => setSubTab(e.target.value as StatSubTab)}
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 dark:border-dark-border-soft rounded-lg text-sm font-bold bg-white dark:bg-dark-surface text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
                        >
                            {SUB_TAB_IDS.map((id) => (
                                <option key={id} value={id}>{t(SUB_TAB_KEYS[id])}</option>
                            ))}
                        </select>
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 dark:border-dark-border-soft rounded-lg text-sm font-bold bg-white dark:bg-dark-surface text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">{t('filters.allClubs')}</option>
                            {teamsList.map((team) => (
                                <option key={team.id} value={team.id.toString()}>{team.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-1 bg-gray-50 dark:bg-dark-surface-soft rounded-lg p-1 border border-gray-200 dark:border-dark-border">
                        {(['all', 'kz', 'foreign'] as PlayerStatsNationalityFilter[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSelectedNationality(type)}
                                className={`flex-1 px-2 py-1.5 text-xs font-bold rounded transition-colors ${
                                    selectedNationality === type
                                        ? 'bg-primary dark:bg-cyan-600 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-slate-300'
                                }`}
                            >
                                {type === 'kz' ? t('filters.kazakhstanPlayers') : type === 'foreign' ? t('filters.foreignPlayers') : t('filters.allNationalities')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop: separate bars */}
            <div className="hidden md:block">
                <StatisticsSubTabs
                    activeSubTab={subTab}
                    onSubTabChange={setSubTab}
                    hideGoalkeeping={false}
                />
                <StatisticsFilters
                    mode="players"
                    selectedClub={selectedClub}
                    onClubChange={setSelectedClub}
                    selectedNationality={selectedNationality}
                    onNationalityChange={setSelectedNationality}
                    teams={teamsList.map((team) => ({
                        team_id: team.id,
                        team_name: team.name,
                        team_logo: team.logo_url ?? null,
                    }))}
                />
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 py-6 md:py-8">
                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                        <p className="text-red-600 dark:text-red-400">
                            {t('errors.playerStatsLoad', { defaultValue: 'Ошибка загрузки статистики игроков' })}
                        </p>
                        <p className="text-sm text-red-500 dark:text-red-500 mt-2">{error.message}</p>
                    </div>
                ) : (
                    <PlayerStatsTable
                        subTab={subTab}
                        filters={{
                            club: selectedClub,
                            nationality: selectedNationality,
                        }}
                        players={players}
                        loading={loading}
                    />
                )}
            </div>
        </>
    );
}
