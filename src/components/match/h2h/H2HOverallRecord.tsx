'use client';

import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { GameTeam } from '@/types';
import { H2HOverallStats } from '@/types/h2h';

interface H2HOverallRecordProps {
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  overall: H2HOverallStats;
  homeColor: string;
  awayColor: string;
}

function ProgressRing({
  value,
  total,
  color,
  sublabel,
  index,
  prefersReducedMotion,
}: {
  value: number;
  total: number;
  color: string;
  sublabel: string;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const radius = 37;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? value / total : 0;
  const strokeDashoffset = circumference * (1 - ratio);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 sm:w-[110px] sm:h-[110px]">
        <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" className="stroke-gray-200 dark:stroke-dark-border" strokeWidth={strokeWidth} />
          {prefersReducedMotion ? (
            <circle
              cx="50" cy="50" r={radius} fill="none" stroke={color}
              strokeWidth={strokeWidth} strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            />
          ) : (
            <motion.circle
              cx="50" cy="50" r={radius} fill="none" stroke={color}
              strokeWidth={strokeWidth} strokeDasharray={circumference}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference, opacity: 0 }}
              whileInView={{ strokeDashoffset, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="text-xl sm:text-2xl font-black leading-none tracking-tighter" style={{ color }}>
            {value}<span className="text-sm font-bold text-gray-400 dark:text-slate-500">/{total}</span>
          </span>
        </div>
      </div>
      <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center mt-1">
        {sublabel}
      </span>
    </div>
  );
}

export function H2HOverallRecord({
  homeTeam,
  awayTeam,
  overall,
  homeColor,
  awayColor,
}: H2HOverallRecordProps) {
  const { t } = useTranslation('match');
  const prefersReducedMotion = useReducedMotion();

  const homeLogo = homeTeam.logo_url;
  const awayLogo = awayTeam.logo_url;
  const total = overall.total_matches || 1;

  return (
    <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-4 sm:p-6 md:p-10 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0 drop-shadow-md bg-white dark:bg-dark-surface-alt rounded-full p-2 border border-gray-100 dark:border-dark-border">
            {homeLogo ? <img src={homeLogo} alt={homeTeam.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/images/placeholders/team.svg'; }} /> : <span className="font-bold text-xl" style={{ color: homeColor }}>{homeTeam.name[0]}</span>}
          </div>
          <span className="font-black hidden md:inline text-xl uppercase tracking-tighter" style={{ color: homeColor }}>{homeTeam.name}</span>
        </div>

        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-slate-500 bg-white dark:bg-dark-surface-alt px-4 py-2 rounded-full border border-gray-100 dark:border-dark-border shadow-sm text-center">
          {t('h2h.headToHead', 'HEAD TO HEAD')}
        </h3>

        <div className="flex items-center gap-4">
          <span className="font-black hidden md:inline text-xl uppercase tracking-tighter" style={{ color: awayColor }}>{awayTeam.name}</span>
          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0 drop-shadow-md bg-white dark:bg-dark-surface-alt rounded-full p-2 border border-gray-100 dark:border-dark-border">
            {awayLogo ? <img src={awayLogo} alt={awayTeam.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/images/placeholders/team.svg'; }} /> : <span className="font-bold text-xl" style={{ color: awayColor }}>{awayTeam.name[0]}</span>}
          </div>
        </div>
      </div>

      {/* Progress Rings */}
      <div className="bg-white dark:bg-dark-surface-alt rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-dark-border flex items-center justify-center gap-6 sm:gap-8 md:gap-12 w-full">
        <ProgressRing
          value={overall.team1_wins}
          total={total}
          color={homeColor}
          sublabel={t('h2h.wins', 'WINS')}
          index={0}
          prefersReducedMotion={prefersReducedMotion}
        />
        <ProgressRing
          value={overall.draws}
          total={total}
          color="#9CA3AF"
          sublabel={t('h2h.draws', 'DRAWS')}
          index={1}
          prefersReducedMotion={prefersReducedMotion}
        />
        <ProgressRing
          value={overall.team2_wins}
          total={total}
          color={awayColor}
          sublabel={t('h2h.wins', 'WINS')}
          index={2}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </div>
  );
}
