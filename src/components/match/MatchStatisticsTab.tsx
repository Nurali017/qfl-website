'use client';

import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useTranslation } from 'react-i18next';
import { MatchDetail } from '@/types';
import { getTeamLogo, HOME_COLOR, AWAY_COLOR } from '@/lib/utils/teamLogos';
import { getTeamHref } from '@/lib/utils/entityRoutes';

interface MatchStatisticsTabProps {
    match: MatchDetail;
}

// SVG Progress Circle for possession (same style as MiniKeyStats)
function ProgressCircle({ value, color }: { value: number; color: string }) {
    const size = 56;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;
    const center = size / 2;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90">
                <circle cx={center} cy={center} r={radius} fill="none" className="stroke-gray-200 dark:stroke-dark-border" strokeWidth={strokeWidth} />
                <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" className="transition-all duration-700 ease-out" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-slate-200">{value}</span>
        </div>
    );
}

// Possession row with circular progress
function PossessionRow({ label, homeValue, awayValue, homeColor, awayColor }: { label: string; homeValue: number; awayValue: number; homeColor: string; awayColor: string }) {
    return (
        <div className="flex items-center gap-4">
            <ProgressCircle value={homeValue} color={homeColor} />
            <div className="flex-1">
                <p className="text-center text-xs font-medium text-gray-500 dark:text-slate-400 tracking-wide">{label}</p>
            </div>
            <ProgressCircle value={awayValue} color={awayColor} />
        </div>
    );
}

// Simple stat row with unified bar
function SimpleStatRow({ label, homeValue, awayValue, homeColor, awayColor }: { label: string; homeValue: number; awayValue: number; homeColor: string; awayColor: string }) {
    const total = homeValue + awayValue;
    const homePercent = total === 0 ? 50 : (homeValue / total) * 100;
    const awayPercent = total === 0 ? 50 : (awayValue / total) * 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-200 w-8">{homeValue}</span>
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 tracking-wide">{label}</span>
                <span className="text-sm font-bold text-gray-700 dark:text-slate-200 w-8 text-right">{awayValue}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-border">
                <div className="transition-all duration-700 ease-out rounded-l-full" style={{ width: `${homePercent}%`, backgroundColor: homeColor }} />
                <div className="transition-all duration-700 ease-out rounded-r-full" style={{ width: `${awayPercent}%`, backgroundColor: awayColor }} />
            </div>
        </div>
    );
}

export function MatchStatisticsTab({ match }: MatchStatisticsTabProps) {
    const { t } = useTranslation('match');
    const { home_team, away_team, stats } = match;

    const homeColor = HOME_COLOR;
    const awayColor = AWAY_COLOR;
    const homeLogo = home_team.logo_url || getTeamLogo(home_team.id);
    const awayLogo = away_team.logo_url || getTeamLogo(away_team.id);
    const homeTeamHref = getTeamHref(home_team.id);
    const awayTeamHref = getTeamHref(away_team.id);

    const getStat = (category: keyof NonNullable<typeof stats>, team: 'home' | 'away') => {
        if (!stats || !stats[category]) return 0;
        return stats[category][team] || 0;
    };

    if (!stats) {
        return (
            <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm max-w-4xl mx-auto">
                <p className="text-gray-500 font-bold uppercase tracking-widest">{t('statisticsTab.notAvailable')}</p>
            </div>
        );
    }

    const LogoContainer = ({ children, href }: { children: React.ReactNode, href: string | null }) => href ? (
        <Link href={href} className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            {children}
        </Link>
    ) : (
        <div className="flex items-center gap-3">
            {children}
        </div>
    );

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 shadow-sm max-w-4xl mx-auto">

            {/* Header with team logos */}
            <div className="flex items-center justify-between mb-6">
                <LogoContainer href={homeTeamHref}>
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
                        {homeLogo ? <img src={homeLogo} className="w-full h-full object-contain" alt={home_team.name} /> : <span className="font-bold text-lg" style={{ color: homeColor }}>{home_team.name[0]}</span>}
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white hidden md:inline uppercase tracking-wide" style={{ color: homeColor }}>{home_team.name}</span>
                </LogoContainer>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('statisticsTab.title', 'Статистика')}</h3>

                <LogoContainer href={awayTeamHref}>
                    <span className="font-bold text-sm hidden md:inline uppercase tracking-wide" style={{ color: awayColor }}>{away_team.name}</span>
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
                        {awayLogo ? <img src={awayLogo} className="w-full h-full object-contain" alt={away_team.name} /> : <span className="font-bold text-lg" style={{ color: awayColor }}>{away_team.name[0]}</span>}
                    </div>
                </LogoContainer>
            </div>

            <div className="space-y-6">
                {/* Possession with circles */}
                <PossessionRow
                    label={t('statisticsTab.possessionPercent')}
                    homeValue={getStat('possession', 'home')}
                    awayValue={getStat('possession', 'away')}
                    homeColor={homeColor}
                    awayColor={awayColor}
                />

                <div className="h-px bg-gray-100 dark:bg-dark-border" />

                {/* Shots group */}
                <SimpleStatRow label={t('shots')} homeValue={getStat('shots', 'home')} awayValue={getStat('shots', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('shotsOnTarget')} homeValue={getStat('shots_on_target', 'home')} awayValue={getStat('shots_on_target', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('statisticsTab.shotsMissed')} homeValue={getStat('shots', 'home') - getStat('shots_on_target', 'home')} awayValue={getStat('shots', 'away') - getStat('shots_on_target', 'away')} homeColor={homeColor} awayColor={awayColor} />

                <div className="h-px bg-gray-100 dark:bg-dark-border" />

                {/* Set pieces */}
                <SimpleStatRow label={t('corners')} homeValue={getStat('corners', 'home')} awayValue={getStat('corners', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('offsides')} homeValue={getStat('offsides', 'home')} awayValue={getStat('offsides', 'away')} homeColor={homeColor} awayColor={awayColor} />

                <div className="h-px bg-gray-100 dark:bg-dark-border" />

                {/* Discipline */}
                <SimpleStatRow label={t('fouls')} homeValue={getStat('fouls', 'home')} awayValue={getStat('fouls', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('yellowCards')} homeValue={getStat('yellow_cards', 'home')} awayValue={getStat('yellow_cards', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('redCards')} homeValue={getStat('red_cards', 'home')} awayValue={getStat('red_cards', 'away')} homeColor={homeColor} awayColor={awayColor} />
            </div>
        </div>
    );
}
