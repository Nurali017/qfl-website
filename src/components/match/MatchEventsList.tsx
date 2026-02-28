'use client';

import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EnhancedMatchEvent, GameTeam } from '@/types';
import { GoalIcon, YellowCardIcon, RedCardIcon, SubstitutionIcon, PenaltyIcon } from './MatchEventIcons';
import { HOME_COLOR, AWAY_COLOR } from '@/lib/utils/teamLogos';

interface MatchEventsListProps {
  events: EnhancedMatchEvent[];
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  loading?: boolean;
  isTechnical?: boolean;
}

export function MatchEventsList({ events, homeTeam, awayTeam, loading, isTechnical }: MatchEventsListProps) {
  const { t } = useTranslation('match');

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#f5f5f5] dark:bg-dark-surface rounded-xl h-20" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-[#f5f5f5] dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border px-4 py-8 text-center">
        {isTechnical ? (
          <span className="text-orange-500 font-medium">{t('events.technicalWin')}</span>
        ) : (
          <span className="text-gray-500">{t('events.noEvents')}</span>
        )}
      </div>
    );
  }

  // Sort events by minute (latest first)
  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
            <GoalIcon className="w-5 h-5 text-white" />
          </div>
        );
      case 'penalty':
        return (
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-md">
            <PenaltyIcon className="w-5 h-5 text-white" />
          </div>
        );
      case 'yellow_card':
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <YellowCardIcon className="w-6 h-6 drop-shadow-md" />
          </div>
        );
      case 'red_card':
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <RedCardIcon className="w-6 h-6 drop-shadow-md" />
          </div>
        );
      case 'substitution':
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <SubstitutionIcon className="w-7 h-7 text-gray-700 dark:text-gray-300 drop-shadow-sm" />
          </div>
        );
      default:
        return <Circle className="w-6 h-6 fill-gray-400 text-gray-400" />;
    }
  };


  return (
    <div className="space-y-3">
      {sortedEvents.map((event) => {
        const teamColor = event.team_id === homeTeam.id ? HOME_COLOR : event.team_id === awayTeam.id ? AWAY_COLOR : '#9CA3AF';

        return (
          <div
            key={event.id}
            className="bg-[#f5f5f5] dark:bg-dark-surface rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-4 transition-colors hover:bg-gray-200/50 dark:hover:bg-dark-border/50 overflow-hidden relative"
          >
            {/* Left Accent Bar colored by team */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: teamColor }} />

            {/* Time Badge */}
            <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white w-8 sm:w-10 flex-shrink-0 text-right">
              {event.minute}&apos;
            </div>

            {/* Event Icon */}
            <div className="flex-shrink-0">
              {getEventIcon(event.event_type)}
            </div>

            {/* Player & Event Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                {(() => {
                  // For substitutions, show the incoming player as the main name
                  const primaryName = event.event_type === 'substitution' && event.player2_name ? event.player2_name : event.player_name;
                  const primaryId = event.event_type === 'substitution' && event.player2_id ? event.player2_id : event.player_id;

                  return primaryId ? (
                    <Link
                      href={`/player/${primaryId}`}
                      className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                    >
                      <span className="text-sm sm:text-[15px] font-semibold text-gray-900 dark:text-slate-100">
                        {primaryName}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-sm sm:text-[15px] font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {primaryName}
                    </span>
                  );
                })()}
              </div>

              {/* Additional info */}
              {event.event_type === 'substitution' && event.player2_name && (
                <div className="text-[12px] sm:text-[13px] text-gray-600 dark:text-gray-400 mt-0.5 flex items-center gap-1.5 line-clamp-1">
                  <span className="text-red-600 dark:text-red-500 font-bold text-[10px]">{t('events.out')}</span>
                  {event.player_name}
                </div>
              )}

              {(event.event_type === 'goal' || event.event_type === 'penalty') && event.assist_player_name && (
                <div className="text-[12px] sm:text-[13px] text-gray-600 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                  <span className="font-semibold text-gray-500 text-[10px] uppercase">{t('events.assistLabel')}:</span>
                  {event.assist_player_name}
                </div>
              )}

              {(event.event_type === 'penalty' || event.event_type === 'yellow_card' || event.event_type === 'red_card') && event.description && (
                <div className="text-[12px] sm:text-[13px] text-gray-600 dark:text-gray-400 mt-0.5">
                  {event.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
