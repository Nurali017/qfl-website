'use client';

import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { matchService } from '@/lib/api/services';
import { queryKeys } from '@/lib/api/queryKeys';
import { useTournament } from '@/contexts/TournamentContext';
import { GroupedMatchesResponse, Game } from '@/types';
import { LiveMatchCard } from './LiveMatchCard';

export function LiveMatchBanner() {
  const { i18n } = useTranslation();
  const { effectiveSeasonId } = useTournament();

  const filtersHash = JSON.stringify({
    season_id: effectiveSeasonId,
    status: 'live',
    group_by_date: true,
    language: i18n.language,
  });

  const { data } = useSWR<GroupedMatchesResponse>(
    queryKeys.games.center(filtersHash),
    () =>
      matchService.getMatchCenter({
        season_id: effectiveSeasonId,
        status: 'live',
        group_by_date: true,
        language: i18n.language,
      }) as Promise<GroupedMatchesResponse>,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  const liveMatches: Game[] = data?.groups?.flatMap((g) => g.games) ?? [];

  return (
    <AnimatePresence>
      {liveMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="space-y-3"
        >
          {liveMatches.map((match) => (
            <LiveMatchCard key={match.id} match={match} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
