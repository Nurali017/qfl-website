'use client';

import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from '@/types';
import { getTeamLogo, HOME_COLOR, AWAY_COLOR } from '@/lib/utils/teamLogos';
import { transitions } from '@/lib/motion/config';

interface LiveMatchCardProps {
  match: Game;
  className?: string;
}

export function LiveMatchCard({ match, className = '' }: LiveMatchCardProps) {
  const { t } = useTranslation('match');

  const homeLogoUrl = match.home_team.logo_url || getTeamLogo(match.home_team.id);
  const awayLogoUrl = match.away_team.logo_url || getTeamLogo(match.away_team.id);
  const homeScore = match.home_score ?? 0;
  const awayScore = match.away_score ?? 0;
  const scoreKey = `${homeScore}-${awayScore}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}
    >
      <Link href={`/matches/${match.id}`} className="block px-4 py-5 md:px-8 md:py-6">
        {/* Everything centered */}
        <div className="flex flex-col items-center">

          {/* LIVE badge — top center */}
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full mb-4"
            style={{ boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)' }}
            role="status"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            LIVE
          </motion.div>

          {/* Teams + Score — centered row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8 w-full">
            {/* Home team — right-aligned */}
            <div className="flex items-center gap-2 md:gap-3 justify-end min-w-0">
              <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-slate-100 truncate text-right">
                {match.home_team.name}
              </span>
              {homeLogoUrl ? (
                <img
                  src={homeLogoUrl}
                  alt={match.home_team.name}
                  loading="lazy"
                  className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: HOME_COLOR }}
                >
                  {match.home_team.name[0]}
                </div>
              )}
            </div>

            {/* Score — red, dead center */}
            <div className="text-center shrink-0 px-2 md:px-4">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={scoreKey}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={transitions.springBouncy}
                >
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 8px rgba(239, 68, 68, 0.2)',
                        '0 0 24px rgba(239, 68, 68, 0.5)',
                        '0 0 8px rgba(239, 68, 68, 0.2)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-3xl md:text-5xl font-black text-red-500 tabular-nums tracking-tight whitespace-nowrap"
                  >
                    {homeScore} : {awayScore}
                  </motion.span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Away team — left-aligned */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {awayLogoUrl ? (
                <img
                  src={awayLogoUrl}
                  alt={match.away_team.name}
                  loading="lazy"
                  className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: AWAY_COLOR }}
                >
                  {match.away_team.name[0]}
                </div>
              )}
              <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-slate-100 truncate">
                {match.away_team.name}
              </span>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
