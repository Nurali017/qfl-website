'use client';

import { useState } from 'react';
import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EnhancedMatchEvent, GameTeam } from '@/types';
import { GoalIcon, YellowCardIcon, RedCardIcon } from './MatchEventIcons';

interface MatchEventsListProps {
  events: EnhancedMatchEvent[];
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  loading?: boolean;
  isTechnical?: boolean;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
}

const INITIAL_VISIBLE = 4;

/* ─── Hero-style event icons (adapted for light + dark) ─── */

function EventMarkerIcon({ type }: { type: string }) {
  switch (type) {
    case 'goal':
      return <GoalIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white" color="currentColor" />;
    case 'own_goal':
      return <GoalIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" color="currentColor" />;
    case 'penalty':
      return <GoalIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white" color="currentColor" />;
    case 'missed_penalty':
      return (
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500/15 dark:bg-red-500/30 flex items-center justify-center">
          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
        </div>
      );
    case 'yellow_card':
      return <YellowCardIcon className="w-4 h-5 sm:w-[18px] sm:h-6 shadow-sm" />;
    case 'red_card':
      return <RedCardIcon className="w-4 h-5 sm:w-[18px] sm:h-6 shadow-sm" />;
    case 'substitution':
      return (
        <div className="flex flex-col items-center gap-[2px]">
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-green-500" />
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-red-500" />
        </div>
      );
    default:
      return null;
  }
}

/* ─── Player info blocks ─── */

function PlayerName({ name, playerId }: { name: string; playerId: number | null }) {
  if (playerId) {
    return (
      <Link href={`/player/${playerId}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
          {name}
        </span>
      </Link>
    );
  }
  return (
    <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
      {name}
    </span>
  );
}

function SubInfo({ label, name }: { label?: string; name: string }) {
  return (
    <span className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 leading-tight">
      {label && <>{label} </>}{name}
    </span>
  );
}

/* ─── Single event row (5-column split layout with unified minute axis) ─── */

function EventRow({
  event,
  isHome,
  t,
}: {
  event: EnhancedMatchEvent;
  isHome: boolean;
  t: (key: string) => string;
}) {
  const isSub = event.event_type === 'substitution';
  const isGoal = event.event_type === 'goal' || event.event_type === 'own_goal' || event.event_type === 'penalty';

  // For substitutions: player2 = IN, player = OUT
  const primaryName = isSub && event.player2_name ? event.player2_name : event.player_name;
  const primaryId = isSub && event.player2_id ? event.player2_id : event.player_id;

  const details = (
    <>
      {isSub && event.player_name && <SubInfo name={event.player_name} />}
      {isGoal && event.assist_player_name && (
        <SubInfo label={t('events.assistLabel') + ':'} name={event.assist_player_name} />
      )}
      {event.event_type === 'own_goal' && (
        <span className="text-[11px] text-red-500 font-semibold uppercase">{t('events.ownGoal')}</span>
      )}
    </>
  );

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-x-2 sm:gap-x-4 px-3 sm:px-5 py-3 sm:py-4">
      {/* Col 1 — Home player info (right-aligned) */}
      <div className="flex justify-end min-w-0">
        {isHome && (
          <div className="text-right flex flex-col items-end gap-0.5 min-w-0">
            <PlayerName name={primaryName} playerId={primaryId} />
            {details}
          </div>
        )}
      </div>

      {/* Col 2 — Home icon */}
      <div className="flex items-center justify-center w-6 sm:w-7">
        {isHome && <EventMarkerIcon type={event.event_type} />}
      </div>

      {/* Col 3 — Minute (unified center axis) */}
      <div className="flex items-center justify-center min-w-[40px] sm:min-w-[48px]">
        <span className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white tabular-nums">
          {event.minute}&apos;
        </span>
      </div>

      {/* Col 4 — Away icon */}
      <div className="flex items-center justify-center w-6 sm:w-7">
        {!isHome && <EventMarkerIcon type={event.event_type} />}
      </div>

      {/* Col 5 — Away player info (left-aligned) */}
      <div className="flex justify-start min-w-0">
        {!isHome && (
          <div className="flex flex-col gap-0.5 min-w-0">
            <PlayerName name={primaryName} playerId={primaryId} />
            {details}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Event grouping ─── */

type EventGroup = 'goals' | 'cards' | 'substitutions';

function getEventGroup(type: string): EventGroup {
  if (type === 'goal' || type === 'own_goal' || type === 'penalty' || type === 'missed_penalty') return 'goals';
  if (type === 'yellow_card' || type === 'red_card') return 'cards';
  return 'substitutions';
}

/* ─── Section (group of events) ─── */

function EventSection({
  title,
  events,
  homeTeamId,
  t,
}: {
  title: string;
  events: EnhancedMatchEvent[];
  homeTeamId: number;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsToggle = events.length > INITIAL_VISIBLE;
  const visible = expanded ? events : events.slice(0, INITIAL_VISIBLE);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
      {/* Section header */}
      <div className="py-4 sm:py-5">
        <h3 className="text-center text-[18px] sm:text-[20px] font-extrabold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
      </div>

      {/* Event rows */}
      <div className="divide-y divide-gray-100 dark:divide-dark-border/60">
        {visible.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            isHome={event.team_id === homeTeamId}
            t={t}
          />
        ))}
      </div>

      {/* Show more / less toggle */}
      {needsToggle && (
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2.5 rounded-xl border-2 border-gray-900 dark:border-gray-300 text-gray-900 dark:text-white text-[15px] font-bold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
          >
            {expanded ? t('events.showLess') : t('events.showMore')}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Shootout section (restyled to match new design) ─── */

function groupShootoutRounds(
  events: EnhancedMatchEvent[],
  homeTeamId: number,
  awayTeamId: number,
) {
  const rounds = new Map<number, { minute: number; home?: EnhancedMatchEvent; away?: EnhancedMatchEvent }>();
  for (const e of events) {
    const r = rounds.get(e.minute) ?? { minute: e.minute };
    if (e.team_id === homeTeamId) r.home = e;
    else if (e.team_id === awayTeamId) r.away = e;
    rounds.set(e.minute, r);
  }
  return [...rounds.values()].sort((a, b) => a.minute - b.minute);
}

function ShootoutIcon({ scored }: { scored: boolean }) {
  if (scored) {
    return <GoalIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white" color="currentColor" />;
  }
  return <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />;
}

function ShootoutSection({
  rounds,
  homePenaltyScore,
  awayPenaltyScore,
  t,
}: {
  rounds: { minute: number; home?: EnhancedMatchEvent; away?: EnhancedMatchEvent }[];
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="py-4 sm:py-5 flex flex-col items-center gap-1">
        <h3 className="text-center text-[18px] sm:text-[20px] font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t('events.shootout')}
        </h3>
        {homePenaltyScore != null && (
          <span className="text-[22px] font-black text-gray-900 dark:text-white tabular-nums">
            {homePenaltyScore} – {awayPenaltyScore}
          </span>
        )}
      </div>

      {/* Rounds */}
      <div className="divide-y divide-gray-100 dark:divide-dark-border/60">
        {rounds.map((round) => {
          const homeScored = round.home?.event_type === 'penalty';
          const awayScored = round.away?.event_type === 'penalty';

          return (
            <div
              key={round.minute}
              className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-x-2 sm:gap-x-4 px-3 sm:px-5 py-3 sm:py-4"
            >
              {/* Col 1 — Home player (right-aligned) */}
              <div className="flex justify-end min-w-0">
                {round.home && (
                  <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                    {round.home.player_name}
                  </span>
                )}
              </div>

              {/* Col 2 — Home kick icon */}
              <div className="flex items-center justify-center w-6 sm:w-7">
                {round.home && <ShootoutIcon scored={homeScored} />}
              </div>

              {/* Col 3 — Round number (center) */}
              <div className="flex items-center justify-center min-w-[40px] sm:min-w-[48px]">
                <span className="text-[16px] sm:text-[18px] font-black text-gray-400 dark:text-gray-500 tabular-nums">
                  {round.minute}
                </span>
              </div>

              {/* Col 4 — Away kick icon */}
              <div className="flex items-center justify-center w-6 sm:w-7">
                {round.away && <ShootoutIcon scored={awayScored} />}
              </div>

              {/* Col 5 — Away player (left-aligned) */}
              <div className="flex justify-start min-w-0">
                {round.away && (
                  <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                    {round.away.player_name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fallback: only score known, no individual events */}
      {rounds.length === 0 && homePenaltyScore != null && (
        <div className="px-4 py-3 text-sm text-center text-gray-500 dark:text-slate-400">
          {homePenaltyScore} – {awayPenaltyScore}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */

export function MatchEventsList({ events, homeTeam, awayTeam, loading, isTechnical, homePenaltyScore, awayPenaltyScore }: MatchEventsListProps) {
  const { t } = useTranslation('match');

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-dark-surface rounded-2xl h-20" />
        ))}
      </div>
    );
  }

  const regularEvents = events.filter(e => (e.half ?? 1) <= 2);
  const shootoutEvents = events.filter(e => (e.half ?? 1) >= 3);
  const shootoutRounds = groupShootoutRounds(shootoutEvents, homeTeam.id, awayTeam.id);
  const showShootout = shootoutEvents.length > 0 || homePenaltyScore != null;

  if ((!events || events.length === 0) && !showShootout) {
    return (
      <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-8 text-center">
        {isTechnical ? (
          <span className="text-orange-500 font-medium">{t('events.technicalWin')}</span>
        ) : (
          <span className="text-gray-500">{t('events.noEvents')}</span>
        )}
      </div>
    );
  }

  // Group & sort (descending — latest first)
  const groups: Record<EventGroup, EnhancedMatchEvent[]> = { goals: [], cards: [], substitutions: [] };
  for (const e of regularEvents) {
    groups[getEventGroup(e.event_type)].push(e);
  }
  for (const key of Object.keys(groups) as EventGroup[]) {
    groups[key].sort((a, b) => b.minute - a.minute);
  }

  const sectionOrder: { key: EventGroup; titleKey: string }[] = [
    { key: 'goals', titleKey: 'events.goals' },
    { key: 'cards', titleKey: 'events.cards' },
    { key: 'substitutions', titleKey: 'events.substitutions' },
  ];

  return (
    <div className="space-y-5">
      {/* Shootout FIRST */}
      {showShootout && (
        <ShootoutSection
          rounds={shootoutRounds}
          homePenaltyScore={homePenaltyScore}
          awayPenaltyScore={awayPenaltyScore}
          t={t}
        />
      )}

      {sectionOrder.map(({ key, titleKey }) => {
        if (groups[key].length === 0) return null;
        return (
          <EventSection
            key={key}
            title={t(titleKey)}
            events={groups[key]}
            homeTeamId={homeTeam.id}
            t={t}
          />
        );
      })}
    </div>
  );
}
