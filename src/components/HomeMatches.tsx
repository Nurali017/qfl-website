'use client';

import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronRight } from 'lucide-react';
import { useTournament } from '@/contexts/TournamentContext';
import { useMatchCenter, useMatches } from '@/hooks';
import { formatMatchDate } from '@/lib/utils/dateFormat';
import { getTeamLogo } from '@/lib/utils/teamLogos';
import { SUPER_CUP_FEATURED_MATCH, SUPER_CUP_HERO_ENABLED } from '@/config/featuredMatch';
import { Game } from '@/types';
import {
  HOME_MATCHES_PRESEASON_DATE_FROM,
  HOME_MATCHES_PRESEASON_DATE_TO,
  getHomeMatchesQueryPlan,
  getHomeMatchesTourFallback,
} from '@/lib/home/homeMatchesQueryPlan';
import {
  getTeamNameSizing,
  TeamNameFontClass,
} from '@/components/HomeMatches/teamNameSizing';

const TEAM_NAME_FONT_CLASS_MAP: Record<TeamNameFontClass, string> = {
  'text-[11px]': 'text-[11px]',
  'text-[10px]': 'text-[10px]',
};

function formatKickoffTime(raw: string | null): string {
  if (!raw) return '-';
  if (raw.length >= 5) return raw.slice(0, 5);
  return raw;
}

interface DisplayGroup {
  date: string;
  dateLabel: string;
  games: Game[];
}

const HOME_MATCHES_DEFAULT_VISIBLE_COUNT = 8;

export function HomeMatches() {
  const { t, i18n } = useTranslation('match');
  const { effectiveSeasonId, currentRound, currentTournament } = useTournament();
  const homeMatchesQueryPlan = getHomeMatchesQueryPlan({
    tournamentId: currentTournament.id,
    seasonId: effectiveSeasonId,
    currentRound,
    totalRounds: currentTournament.totalRounds ?? null,
  });
  const useTourBasedMatches = homeMatchesQueryPlan.source === 'tour';

  const {
    matches: tourMatches,
    loading: tourMatchesLoading,
    error: tourMatchesError,
  } = useMatches({
    seasonId: effectiveSeasonId,
    tour: getHomeMatchesTourFallback(homeMatchesQueryPlan),
    enabled: useTourBasedMatches,
  });

  const matchCenterFilters = homeMatchesQueryPlan.source === 'matchCenter'
    ? homeMatchesQueryPlan.matchCenterFilters
    : {
        season_id: effectiveSeasonId,
        group_by_date: true,
      };

  const {
    groups,
    loading: groupedMatchesLoading,
    error: groupedMatchesError,
  } = useMatchCenter({
    ...matchCenterFilters,
    enabled: !useTourBasedMatches,
  });

  // Fetch Super Cup match separately (lives in its own season)
  const scEnabled = SUPER_CUP_HERO_ENABLED && Date.now() < new Date(SUPER_CUP_FEATURED_MATCH.heroDisableAfter).getTime();
  const {
    groups: scGroups,
  } = useMatchCenter({
    season_id: SUPER_CUP_FEATURED_MATCH.seasonId,
    date_from: SUPER_CUP_FEATURED_MATCH.date,
    date_to: SUPER_CUP_FEATURED_MATCH.date,
    group_by_date: true,
    enabled: scEnabled,
  });

  const groupedMatches = groups.flatMap((group) => group.games);
  const matches = useTourBasedMatches ? tourMatches : groupedMatches;
  const loading = useTourBasedMatches ? tourMatchesLoading : groupedMatchesLoading;
  const error = useTourBasedMatches ? tourMatchesError : groupedMatchesError;

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-sm p-4 md:p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-primary dark:text-accent-cyan flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('title')}
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-100 dark:bg-dark-surface rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-sm p-4 md:p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-primary dark:text-accent-cyan flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('title')}
          </h2>
        </div>
        <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-8">
          {t('noData.noMatches', { ns: 'common' })}
        </p>
      </div>
    );
  }

  const groupedForDisplay = useTourBasedMatches
    ? (() => {
        const grouped = new Map<string, Game[]>();

        for (const game of matches) {
          const key = game.date || 'unknown';
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key)!.push(game);
        }

        return Array.from(grouped.entries()).map(([groupDate, groupGames]) => ({
          date: groupDate,
          dateLabel: groupDate === 'unknown'
            ? t('dateUnknown', 'Күні нақтыланады')
            : formatMatchDate(groupDate, i18n.language),
          games: groupGames,
        }));
      })()
    : groups.map((group) => ({
        date: group.date,
        dateLabel: group.date_label || formatMatchDate(group.date, i18n.language),
        games: group.games,
      }));

  // Prepend Super Cup match group before PL matches
  const scDisplayGroups: DisplayGroup[] = scEnabled
    ? scGroups
        .filter((g) => g.games.length > 0)
        .map((g) => ({
          date: g.date,
          dateLabel: g.date_label || formatMatchDate(g.date, i18n.language),
          games: g.games,
        }))
    : [];
  const mergedForDisplay = [...scDisplayGroups, ...groupedForDisplay];

  const isSuperCupAndRoundOneMode =
    homeMatchesQueryPlan.source === 'matchCenter' &&
    homeMatchesQueryPlan.matchCenterFilters.date_from === HOME_MATCHES_PRESEASON_DATE_FROM &&
    homeMatchesQueryPlan.matchCenterFilters.date_to === HOME_MATCHES_PRESEASON_DATE_TO;

  const displayGroups: DisplayGroup[] = isSuperCupAndRoundOneMode
    ? mergedForDisplay
    : mergedForDisplay.reduce<{ groups: DisplayGroup[]; remaining: number }>(
        (acc, group) => {
          if (acc.remaining <= 0) {
            return acc;
          }

          const gamesForGroup = group.games.slice(0, acc.remaining);
          if (gamesForGroup.length === 0) {
            return acc;
          }

          acc.groups.push({
            date: group.date,
            dateLabel: group.dateLabel,
            games: gamesForGroup,
          });
          acc.remaining -= gamesForGroup.length;
          return acc;
        },
        { groups: [], remaining: HOME_MATCHES_DEFAULT_VISIBLE_COUNT }
      ).groups;

  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-sm p-4 md:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h2 className="text-lg md:text-xl font-bold text-primary dark:text-accent-cyan flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t('title')}
        </h2>
        <Link
          href="/matches"
          className="text-gray-500 dark:text-slate-400 font-medium text-sm hover:text-primary dark:hover:text-accent-cyan flex items-center transition-colors group"
        >
          {t('viewAll', { ns: 'match' })}
          <ChevronRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="space-y-2 flex-1">
        {displayGroups.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-8">
            {t('noData.noMatches', { ns: 'common' })}
          </p>
        ) : (
          displayGroups.map((group) => (
            <div key={group.date} className="space-y-2">
              <div className="text-sm text-gray-500 dark:text-slate-400 pt-1">
                {group.dateLabel}
              </div>

              {group.games.map((game) => {
                const homeTeamDisplay = getTeamNameSizing(game.home_team, i18n.language);
                const awayTeamDisplay = getTeamNameSizing(game.away_team, i18n.language);

                return (
                  <Link
                    key={game.id}
                    href={`/matches/${game.id}`}
                    className="block bg-gray-50 dark:bg-dark-surface-soft hover:bg-gray-100 dark:hover:bg-dark-surface-soft rounded-lg p-2 sm:p-2.5 transition-colors"
                  >
                    {/* Teams */}
                    <div className="flex items-center justify-between gap-1.5">
                      {/* Home team */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <img
                          src={game.home_team.logo_url || getTeamLogo(game.home_team.id) || '/images/team-placeholder.png'}
                          alt={game.home_team.name}
                          className="w-6 h-6 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/images/team-placeholder.png';
                          }}
                        />
                        <span
                          title={homeTeamDisplay.fullName}
                          className={`font-medium text-gray-900 dark:text-slate-100 truncate leading-tight ${TEAM_NAME_FONT_CLASS_MAP[homeTeamDisplay.fontClass]}`}
                        >
                          {homeTeamDisplay.displayName}
                        </span>
                      </div>

                      {/* Score or Time */}
                      <div className="flex-shrink-0 text-center min-w-[44px] sm:min-w-[52px]">
                        {game.status === 'upcoming' && game.broadcasters && game.broadcasters.length > 0 && (
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            {game.broadcasters.filter(b => b.logo_url).map(b => (
                              <img key={b.id} src={b.logo_url!} alt={b.name} title={b.name} className="h-5 w-auto object-contain" />
                            ))}
                          </div>
                        )}
                        {(game.is_live || game.status === 'live') && (
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold text-red-500">LIVE</span>
                          </div>
                        )}
                        {game.home_score !== null && game.away_score !== null ? (
                          <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100">
                            {game.home_score} : {game.away_score}
                          </div>
                        ) : (game.is_live || game.status === 'live') ? (
                          <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100">
                            {game.home_score ?? 0} : {game.away_score ?? 0}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                            {formatKickoffTime(game.time)}
                          </div>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                        <span
                          title={awayTeamDisplay.fullName}
                          className={`font-medium text-gray-900 dark:text-slate-100 truncate leading-tight text-right ${TEAM_NAME_FONT_CLASS_MAP[awayTeamDisplay.fontClass]}`}
                        >
                          {awayTeamDisplay.displayName}
                        </span>
                        <img
                          src={game.away_team.logo_url || getTeamLogo(game.away_team.id) || '/images/team-placeholder.png'}
                          alt={game.away_team.name}
                          className="w-6 h-6 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/images/team-placeholder.png';
                          }}
                        />
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
