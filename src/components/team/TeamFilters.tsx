'use client';

import { cn } from '@/lib/utils/cn';
import { TeamYearOption } from '@/hooks/useTeam';

interface TeamFiltersProps {
  tournaments: { code: string; shortName: string }[];
  selectedTournamentCode: string;
  onTournamentChange: (code: string) => void;
  yearItems: TeamYearOption[];
  selectedSeasonId: number;
  onSeasonChange: (seasonId: number) => void;
}

export function TeamFilters({
  tournaments,
  selectedTournamentCode,
  onTournamentChange,
  yearItems,
  selectedSeasonId,
  onSeasonChange,
}: TeamFiltersProps) {
  const showTournaments = tournaments.length > 1;
  const showSeasons = yearItems.length > 0;

  if (!showTournaments && !showSeasons) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showTournaments && (
        <div className="flex items-center gap-1">
          {tournaments.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => onTournamentChange(t.code)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all',
                selectedTournamentCode === t.code
                  ? 'bg-primary/10 text-primary border border-primary/20 dark:bg-white/15 dark:text-white dark:border-white/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/8'
              )}
            >
              {t.shortName}
            </button>
          ))}
        </div>
      )}

      {showTournaments && showSeasons && (
        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 self-center" />
      )}

      {showSeasons && (
        <div className="flex items-center gap-1">
          {yearItems.map((item) => (
            <button
              key={item.seasonId}
              type="button"
              onClick={() => onSeasonChange(item.seasonId)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all',
                selectedSeasonId === item.seasonId
                  ? 'bg-primary/10 text-primary border border-primary/20 dark:bg-white/15 dark:text-white dark:border-white/20'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/5'
              )}
            >
              {item.year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
