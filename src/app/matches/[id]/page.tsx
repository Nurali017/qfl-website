'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMatchDetail, useMatchEvents, useMatchLineup, useMatchStats } from '@/hooks';
import { useTeamPlayers } from '@/hooks/useTeam';
import { transformTeamStats } from '@/lib/api/transformers/matchTransformers';
import { LineupRenderingMode, PlayerCountry } from '@/types';
import { MatchHeader } from '@/components/MatchHeader';
import { MatchTabs, TabId } from '@/components/match/MatchTabs';
import { MatchRelatedNews } from '@/components/match/MatchRelatedNews';
import { useMatchNews } from '@/hooks/useMatchNews';
import { MatchVideoCard } from '@/components/match/MatchVideoCard';
import { MatchLiveStreamCard } from '@/components/match/MatchLiveStreamCard';
import { LineupField } from '@/components/match/LineupField';
import { LineupFieldMini } from '@/components/match/LineupFieldMini';
import { SeasonRosterCards } from '@/components/match/SeasonRosterCards';
import { TournamentTableMini } from '@/components/match/TournamentTableMini';
import { MatchStatisticsTab } from '@/components/match/MatchStatisticsTab';
import { H2HContentCards } from '@/components/match/H2HContentCards';
import { MatchEventsList } from '@/components/match/MatchEventsList';
import { getTournamentBySeasonId, isCupTournament } from '@/config/tournaments';
import { RefereeCard } from '@/components/match/RefereeCard';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 bg-gray-200 dark:bg-dark-border rounded-2xl" />
      <div className="h-24 bg-gray-200 dark:bg-dark-border rounded-xl" />
      <div className="h-12 bg-gray-200 dark:bg-dark-border rounded-lg" />
      <div className="h-96 bg-gray-200 dark:bg-dark-border rounded-xl" />
    </div>
  );
}

function ErrorState({ error }: { error?: string }) {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Матч не найден
      </h1>
      <p className="text-gray-500 dark:text-slate-400 mb-8">
        {error || 'К сожалению, информация о матче недоступна'}
      </p>
    </div>
  );
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id ? Number(params.id) : null;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { t, i18n } = useTranslation('match');
  // Data fetching
  const { match, loading: matchLoading, error: matchError } = useMatchDetail(matchId, true);
  const isLive = match?.is_live || false;
  const { events, loading: eventsLoading } = useMatchEvents(matchId, isLive);
  const { lineup, loading: lineupLoading } = useMatchLineup(matchId, isLive);
  const { stats, loading: statsLoading } = useMatchStats(matchId, isLive);
  const { news: matchNews, loading: matchNewsLoading } = useMatchNews(matchId, i18n.language);

  const lineupMode: LineupRenderingMode = useMemo(() => {
    if (lineup?.rendering?.mode) {
      return lineup.rendering.mode;
    }
    if (lineupLoading) {
      return 'field';
    }
    if (lineup?.lineups) {
      return 'field';
    }
    return 'hidden';
  }, [lineup, lineupLoading]);

  // Определяем isCup по season_id самого матча, а не по глобальному контексту
  const matchIsCup = useMemo(() => {
    if (!match?.season_id) return false;
    const tournament = getTournamentBySeasonId(match.season_id);
    return tournament ? isCupTournament(tournament) : false;
  }, [match?.season_id]);

  const isUpcoming = match?.status === 'upcoming';

  // For upcoming matches, check if the lineup API returned real lineup data (not just team_squad fallback)
  const hasRealLineup = !!(
    lineup?.has_lineup &&
    lineup?.rendering?.source &&
    lineup.rendering.source !== 'team_squad'
  );

  // Always show Lineups tab for upcoming matches (to show season roster fallback)
  const showLineupsTab = isUpcoming || lineupLoading || lineupMode !== 'hidden';

  // Fetch season rosters for upcoming matches when no real lineup
  const shouldFetchRosters = isUpcoming && !hasRealLineup && !lineupLoading;
  const { players: homePlayers } = useTeamPlayers(
    shouldFetchRosters ? match?.home_team?.id ?? null : null,
    match?.season_id ?? undefined
  );
  const { players: awayPlayers } = useTeamPlayers(
    shouldFetchRosters ? match?.away_team?.id ?? null : null,
    match?.season_id ?? undefined
  );

  useEffect(() => {
    if (!showLineupsTab && activeTab === 'lineups') {
      setActiveTab('overview');
    }
    if (isUpcoming && activeTab === 'statistics') {
      setActiveTab('overview');
    }
    if (activeTab === 'news' && !matchNewsLoading && matchNews.length === 0) {
      setActiveTab('overview');
    }
  }, [activeTab, showLineupsTab, isUpcoming, matchNews.length, matchNewsLoading]);

  // Трансформировать team_stats в формат home/away
  const transformedStats = useMemo(() => {
    if (!stats?.team_stats || stats.team_stats.length < 2 || !match) return undefined;

    return transformTeamStats(
      stats.team_stats,
      match.home_team.id,
      match.away_team.id
    );
  }, [stats, match]);

  // Создать маппинг player_id -> country из lineup данных
  const playerCountryMap = useMemo(() => {
    const map: Record<number, PlayerCountry> = {};
    if (lineup?.lineups) {
      const allPlayers = [
        ...(lineup.lineups.home_team?.starters || []),
        ...(lineup.lineups.home_team?.substitutes || []),
        ...(lineup.lineups.away_team?.starters || []),
        ...(lineup.lineups.away_team?.substitutes || []),
      ];
      allPlayers.forEach(player => {
        if (player.country) {
          map[player.player_id] = player.country;
        }
      });
    }
    return map;
  }, [lineup]);

  // Создать расширенный объект match со статистикой
  const matchWithStats = useMemo(() => {
    if (!match) return null;

    return {
      ...match,
      stats: transformedStats,
      player_stats: stats?.player_stats,
    };
  }, [match, transformedStats, stats]);

  if (matchLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (matchError || !match) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <ErrorState error={matchError} />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFBFC] dark:bg-dark-bg min-h-screen">
      {/* 1. Hero Section */}
      <MatchHeader
        match={match}
        events={events?.events || []}
        eventsLoading={eventsLoading}
        playerCountryMap={playerCountryMap}
      />

      {match.is_schedule_tentative === true && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 pt-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/70 dark:bg-amber-900/25 dark:text-amber-100">
            {t('scheduleNotice.perMatch')}
          </div>
        </div>
      )}

      {/* 2. Tab Navigation - Sticky & Full Width Container */}
      <MatchTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        protocolUrl={match.protocol_url}
        showLineupsTab={showLineupsTab}
        showStatisticsTab={false}
        showH2hTab={false}
        showTimelineTab={!isUpcoming}
        showNewsTab={matchNews.length > 0}
      />

      {/* 3. Tab Content - Constrained Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 py-5 md:py-8">

        {/* Lineups tab - full width without sidebar */}
        {activeTab === 'lineups' && showLineupsTab && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isUpcoming && !hasRealLineup ? (
              <SeasonRosterCards
                homeTeam={match.home_team}
                awayTeam={match.away_team}
                homePlayers={homePlayers}
                awayPlayers={awayPlayers}
              />
            ) : (
              <LineupField
                lineups={lineup?.lineups}
                homeTeam={match.home_team}
                awayTeam={match.away_team}
                loading={lineupLoading}
                renderingMode={lineupMode}
              />
            )}
          </div>
        )}

        {/* H2H tab - full width without sidebar */}
        {activeTab === 'h2h' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <H2HContentCards homeTeam={match.home_team} awayTeam={match.away_team} seasonId={match.season_id ?? undefined} />
          </div>
        )}

        {/* Timeline tab - full width without sidebar */}
        {activeTab === 'timeline' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MatchEventsList
              events={events?.events || []}
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              loading={eventsLoading}
              isTechnical={match.is_technical}
              homePenaltyScore={match.home_penalty_score}
              awayPenaltyScore={match.away_penalty_score}
            />
          </div>
        )}

        {/* News tab */}
        {activeTab === 'news' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MatchRelatedNews news={matchNews} loading={matchNewsLoading} />
          </div>
        )}

        {/* Overview tab - with sidebar layout */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column - main content */}
            <div className="space-y-8">
              {match.youtube_live_url && (
                <MatchLiveStreamCard liveUrl={match.youtube_live_url} />
              )}
              {match.video_url && (
                <MatchVideoCard videoUrl={match.video_url} />
              )}

              {/* Full Statistics - after key stats */}
              {!isUpcoming && (
                <MatchStatisticsTab match={matchWithStats || match} />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {showLineupsTab && !isUpcoming && (
                <LineupFieldMini
                  lineups={lineup?.lineups}
                  homeTeam={match.home_team}
                  awayTeam={match.away_team}
                  loading={lineupLoading}
                  renderingMode={lineupMode}
                />
              )}
              <RefereeCard referees={lineup?.referees} />
              {!matchIsCup && (
                <TournamentTableMini
                  seasonId={match.season_id ?? undefined}
                  homeTeamId={match.home_team.id}
                  awayTeamId={match.away_team.id}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
