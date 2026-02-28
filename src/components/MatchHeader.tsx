'use client';

import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useTranslation } from 'react-i18next';
import { Calendar, Building, Users, Clock } from 'lucide-react';
import { MatchDetail, EnhancedMatchEvent, PlayerCountry } from '@/types';
import { getTeamLogo, HOME_COLOR, AWAY_COLOR } from '@/lib/utils/teamLogos';
import { formatMatchDayDate, formatMatchTime } from '@/lib/utils/dateFormat';
import { getTeamHref } from '@/lib/utils/entityRoutes';
import { MatchEventTimeline } from '@/components/match/MatchEventTimeline';

interface MatchHeaderProps {
  match: MatchDetail;
  events?: EnhancedMatchEvent[];
  eventsLoading?: boolean;
  playerCountryMap?: Record<number, PlayerCountry>;
}

export function MatchHeader({ match, events = [], eventsLoading = false, playerCountryMap = {} }: MatchHeaderProps) {
  const { t, i18n } = useTranslation('match');
  const displayTime = formatMatchTime(match.time) || match.time;

  const homeLogoUrl = match.home_team.logo_url || getTeamLogo(match.home_team.id);
  const awayLogoUrl = match.away_team.logo_url || getTeamLogo(match.away_team.id);
  const homeColor = HOME_COLOR;
  const awayColor = AWAY_COLOR;
  const homeTeamHref = getTeamHref(match.home_team.id);
  const awayTeamHref = getTeamHref(match.away_team.id);

  const hasScore = match.home_score !== undefined && match.away_score !== undefined && match.home_score !== null && match.away_score !== null;
  const isLive = match.is_live || match.status === 'live';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#001a3d] to-[#003366]">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1.5px)] [background-size:24px_24px]"></div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-3 sm:px-4 md:px-10 lg:px-20 pt-3 pb-0 md:pt-6">

        {/* Match Information Bar */}
        <div className="mb-4 md:mb-10 max-w-5xl mx-auto xl:-ml-4 w-full border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] md:text-[13px] text-white/80">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/60" />
            <span>{formatMatchDayDate(match.date, i18n.language)}</span>
          </div>

          {match.time && (
            <div className="flex items-center gap-1.5 pl-2 sm:pl-0 sm:border-l border-white/20 sm:ml-2">
              <Clock className="w-3.5 h-3.5 text-white/60" />
              <span>{displayTime}</span>
            </div>
          )}

          {match.stadium && (
            <div className="flex items-center gap-1.5 pl-2 sm:pl-0 sm:border-l border-white/20 sm:ml-2">
              <Building className="w-3.5 h-3.5 text-white/60" />
              <span>
                {match.stadium.name}
                {match.stadium.city ? `, ${match.stadium.city}` : ''}
              </span>
            </div>
          )}

          {match.visitors && (
            <div className="flex items-center gap-1.5 pl-2 sm:pl-0 sm:border-l border-white/20 sm:ml-2">
              <Users className="w-3.5 h-3.5 text-white/60" />
              <span>ATT: {match.visitors.toLocaleString(i18n.language === 'en' ? 'en-US' : i18n.language === 'kz' ? 'kk-KZ' : 'ru-RU')}</span>
            </div>
          )}

        </div>
        </div>

        {/* Main Score Area */}
        {(() => {
          const uniqueEvents = events.filter(
            (e, i, arr) =>
              arr.findIndex(
                x => x.event_type === e.event_type && x.minute === e.minute && x.player_name === e.player_name
              ) === i
          );
          const hasGoals = hasScore && uniqueEvents.some(e => e.event_type === 'goal' || e.event_type === 'penalty');
          return (
            <div className="mb-4 md:mb-12 grid grid-cols-[1fr_auto_1fr] w-full max-w-5xl mx-auto xl:-ml-4">

              {/* Row 1 — Home Team */}
              {homeTeamHref ? (
                <Link
                  href={homeTeamHref}
                  className="self-center flex flex-col md:flex-row items-center justify-end gap-2 md:gap-5 group text-center md:text-right focus-visible:outline-none"
                >
                  <div className="flex-1 min-w-0 flex flex-col items-end hidden md:flex">
                    <h2 className="text-sm md:text-3xl font-bold text-white uppercase tracking-wider leading-tight mb-1 truncate max-w-[200px] lg:max-w-[280px] xl:max-w-none group-hover:text-amber-400 transition-colors">
                      {match.home_team.name}
                    </h2>
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform z-10">
                    {homeLogoUrl ? (
                      <img src={homeLogoUrl} alt={match.home_team.name} className="w-full h-full object-contain drop-shadow-lg" />
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: homeColor }}>{match.home_team.name[0]}</span>
                    )}
                  </div>
                  <div className="md:hidden mt-2 w-full">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider truncate text-center group-hover:text-amber-400">
                      {match.home_team.name}
                    </h2>
                  </div>
                </Link>
              ) : (
                <div className="self-center flex flex-col md:flex-row items-center justify-end gap-2 md:gap-5 text-center md:text-right">
                  <div className="flex-1 min-w-0 flex flex-col items-end hidden md:flex">
                    <h2 className="text-sm md:text-3xl font-bold text-white uppercase tracking-wider leading-tight mb-1 truncate max-w-[200px] lg:max-w-[280px] xl:max-w-none">
                      {match.home_team.name}
                    </h2>
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center z-10">
                    {homeLogoUrl ? (
                      <img src={homeLogoUrl} alt={match.home_team.name} className="w-full h-full object-contain drop-shadow-lg" />
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: homeColor }}>{match.home_team.name[0]}</span>
                    )}
                  </div>
                  <div className="md:hidden mt-2 w-full">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider truncate text-center">
                      {match.home_team.name}
                    </h2>
                  </div>
                </div>
              )}

              {/* Row 1 — Score / Status */}
              <div className="self-center flex flex-col items-center justify-center px-2">
                {hasScore || isLive ? (
                  <div className="flex flex-col items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                      {/* Home Score */}
                      <span className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-none">{match.home_score ?? 0}</span>

                      <div className="text-white/30 text-xl font-bold">-</div>

                      {/* Away Score */}
                      <span className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-none">{match.away_score ?? 0}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full mt-1">
                      {isLive ? (
                        <div className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 md:py-1.5 rounded-full uppercase tracking-wider animate-pulse mb-1 border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                          LIVE
                        </div>
                      ) : (
                        <span className="text-white text-[11px] md:text-sm font-bold uppercase tracking-[0.1em] mb-1">
                          {match.status === 'finished' ? t('matchEnded') : match.status === 'upcoming' ? t('upcoming') : match.status}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center mt-2">
                    <div className="text-2xl md:text-5xl font-bold text-white mb-3 tracking-tight">{displayTime || '—'}</div>
                    <div className="px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-white/10 backdrop-blur-sm">
                      {t('upcoming')}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 1 — Away Team */}
              {awayTeamHref ? (
                <Link
                  href={awayTeamHref}
                  className="self-center flex flex-col md:flex-row items-center justify-start gap-2 md:gap-5 group text-center md:text-left focus-visible:outline-none"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform z-10">
                    {awayLogoUrl ? (
                      <img src={awayLogoUrl} alt={match.away_team.name} className="w-full h-full object-contain drop-shadow-lg" />
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: awayColor }}>{match.away_team.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-start hidden md:flex">
                    <h2 className="text-sm md:text-3xl font-bold text-white uppercase tracking-wider leading-tight mb-1 truncate max-w-[200px] lg:max-w-[280px] xl:max-w-none group-hover:text-amber-400 transition-colors">
                      {match.away_team.name}
                    </h2>
                  </div>
                  <div className="md:hidden mt-2 w-full">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider truncate text-center group-hover:text-amber-400">
                      {match.away_team.name}
                    </h2>
                  </div>
                </Link>
              ) : (
                <div className="self-center flex flex-col md:flex-row items-center justify-start gap-2 md:gap-5 text-center md:text-left">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center z-10">
                    {awayLogoUrl ? (
                      <img src={awayLogoUrl} alt={match.away_team.name} className="w-full h-full object-contain drop-shadow-lg" />
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: awayColor }}>{match.away_team.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-start hidden md:flex">
                    <h2 className="text-sm md:text-3xl font-bold text-white uppercase tracking-wider leading-tight mb-1 truncate max-w-[200px] lg:max-w-[280px] xl:max-w-none">
                      {match.away_team.name}
                    </h2>
                  </div>
                  <div className="md:hidden mt-2 w-full">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider truncate text-center">
                      {match.away_team.name}
                    </h2>
                  </div>
                </div>
              )}

              {/* Row 2 — Scorers (share same grid columns as Row 1) */}
              {hasGoals && (
                <>
                  <div className="self-start flex flex-col items-end gap-1.5 px-4 md:px-8 mt-4 md:mt-10">
                    {uniqueEvents.filter(e => e.team_id === match.home_team.id && (e.event_type === 'goal' || e.event_type === 'penalty')).map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-white/90 text-[11px] md:text-[13px]">
                        <span className="font-semibold">{e.player_name}</span>
                        <span className="text-white/60">({e.minute}&apos;){e.event_type === 'penalty' ? ' (P)' : ''}</span>
                        <span className="text-[10px] ml-1 opacity-80" role="img" aria-label="goal">⚽</span>
                      </div>
                    ))}
                  </div>
                  <div className="self-start mt-4 md:mt-10"></div>
                  <div className="self-start flex flex-col items-start gap-1.5 px-4 md:px-8 mt-4 md:mt-10">
                    {uniqueEvents.filter(e => e.team_id === match.away_team.id && (e.event_type === 'goal' || e.event_type === 'penalty')).map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-white/90 text-[11px] md:text-[13px]">
                        <span className="text-[10px] mr-1 opacity-80" role="img" aria-label="goal">⚽</span>
                        <span className="text-white/60">({e.minute}&apos;){e.event_type === 'penalty' ? ' (P)' : ''}</span>
                        <span className="font-semibold">{e.player_name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </div>

      <div className="relative z-20 w-full mt-4 hidden md:block">
        <MatchEventTimeline
          events={events}
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          currentMinute={match.minute || (match.status === 'finished' ? 90 : 0)}
          loading={eventsLoading}
          playerCountryMap={playerCountryMap}
        />
      </div>
    </div>
  );
}
