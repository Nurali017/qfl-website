'use client';

import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useTranslation } from 'react-i18next';
import { MatchDetail } from '@/types';
import { getTeamLogo, HOME_COLOR, AWAY_COLOR } from '@/lib/utils/teamLogos';
import { getTeamHref } from '@/lib/utils/entityRoutes';

interface MatchStatisticsTabProps {
    match: MatchDetail;
}

// Horizontal bar for Possession
function PossessionBar({ homeValue, awayValue, homeColor, awayColor, t }: { homeValue: number, awayValue: number, homeColor: string, awayColor: string, t: any }) {
    const total = homeValue + awayValue || 100;
    const homePercent = (homeValue / total) * 100;
    const awayPercent = (awayValue / total) * 100;

    return (
        <div className="flex flex-col gap-3 w-full my-8">
            <div className="flex justify-between items-end px-2">
                <span className="text-2xl sm:text-4xl font-black tracking-tighter" style={{ color: homeColor }}>{homeValue}<span className="text-2xl opacity-50">%</span></span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('statisticsTab.possessionPercent')}</span>
                <span className="text-2xl sm:text-4xl font-black tracking-tighter" style={{ color: awayColor }}>{awayValue}<span className="text-2xl opacity-50">%</span></span>
            </div>
            <div className="flex h-3 md:h-4 w-full rounded-full overflow-hidden bg-gray-100 shadow-inner">
                <div className="h-full transition-all duration-1000 ease-out border-r-2 border-white" style={{ width: `${homePercent}%`, backgroundColor: homeColor }} />
                <div className="h-full transition-all duration-1000 ease-out border-l-2 border-white" style={{ width: `${awayPercent}%`, backgroundColor: awayColor }} />
            </div>
        </div>
    );
}

// Solid Stat row
function SimpleStatRow({
    label, homeValue, awayValue, homeColor, awayColor
}: { label: string; homeValue: number; awayValue: number; homeColor: string; awayColor: string; }) {
    const total = homeValue + awayValue;
    const homePercent = total === 0 ? 50 : (homeValue / total) * 100;
    const awayPercent = total === 0 ? 50 : (awayValue / total) * 100;

    const isHomeWinner = homeValue > awayValue;
    const isAwayWinner = awayValue > homeValue;

    return (
        <div className="flex flex-col gap-2 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-4 rounded-xl">
            <div className="flex items-center justify-between">
                {/* Home Val */}
                <span className={`text-lg md:text-xl w-10 ${isHomeWinner ? 'font-black text-gray-900' : 'font-bold text-gray-400'}`}>{homeValue}</span>
                {/* Label */}
                <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center flex-1">{label}</span>
                {/* Away Val */}
                <span className={`text-lg md:text-xl w-10 text-right ${isAwayWinner ? 'font-black text-gray-900' : 'font-bold text-gray-400'}`}>{awayValue}</span>
            </div>

            {/* Split Comparison Bar */}
            <div className="flex items-center justify-center gap-1 h-2 w-full">
                {/* Home Bar (grows right-to-left from center) */}
                <div className="flex-1 flex justify-end h-full bg-gray-100 rounded-l-full overflow-hidden">
                    <div className="h-full transition-all duration-1000 ease-out rounded-l-full" style={{ width: `${homePercent}%`, backgroundColor: isHomeWinner ? homeColor : '#cbd5e1' }} />
                </div>
                {/* Divider gap */}
                <div className="w-1 h-full bg-transparent" />
                {/* Away Bar */}
                <div className="flex-1 h-full bg-gray-100 rounded-r-full overflow-hidden">
                    <div className="h-full transition-all duration-1000 ease-out rounded-r-full" style={{ width: `${awayPercent}%`, backgroundColor: isAwayWinner ? awayColor : '#cbd5e1' }} />
                </div>
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
            <div className="text-center py-16 bg-[#f5f5f5] rounded-3xl border border-gray-200 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <p className="text-gray-500 font-bold uppercase tracking-widest">{t('statisticsTab.notAvailable')}</p>
            </div>
        );
    }

    const LogoContainer = ({ children, href }: { children: React.ReactNode, href: string | null }) => href ? (
        <Link href={href} className="flex items-center gap-3 md:gap-4 group hover:opacity-80 transition-opacity">
            {children}
        </Link>
    ) : (
        <div className="flex items-center gap-3 md:gap-4">
            {children}
        </div>
    );

    return (
        <div className="bg-[#f5f5f5] rounded-2xl md:rounded-[2rem] border border-gray-200/60 p-4 sm:p-6 md:p-10 shadow-lg max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">

            {/* Header with team logos */}
            <div className="flex items-center justify-between mb-2">
                <LogoContainer href={homeTeamHref}>
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0 drop-shadow-md bg-white rounded-full p-2 border border-gray-100">
                        {homeLogo ? <img src={homeLogo} className="w-full h-full object-contain" alt={home_team.name} /> : <span className="font-bold text-xl" style={{ color: homeColor }}>{home_team.name[0]}</span>}
                    </div>
                    <span className="font-black text-gray-900 hidden md:inline text-xl uppercase tracking-tighter" style={{ color: homeColor }}>{home_team.name}</span>
                </LogoContainer>

                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                    {t('statisticsTab.title', 'STATISTICS')}
                </h3>

                <LogoContainer href={awayTeamHref}>
                    <span className="font-black text-gray-900 hidden md:inline text-xl uppercase tracking-tighter" style={{ color: awayColor }}>{away_team.name}</span>
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0 drop-shadow-md bg-white rounded-full p-2 border border-gray-100">
                        {awayLogo ? <img src={awayLogo} className="w-full h-full object-contain" alt={away_team.name} /> : <span className="font-bold text-xl" style={{ color: awayColor }}>{away_team.name[0]}</span>}
                    </div>
                </LogoContainer>
            </div>

            {/* Possession */}
            <PossessionBar
                homeValue={getStat('possession', 'home')}
                awayValue={getStat('possession', 'away')}
                homeColor={homeColor}
                awayColor={awayColor}
                t={t}
            />

            {/* Standard Stats List */}
            <div className="bg-white rounded-3xl p-3 sm:p-4 md:p-8 shadow-sm border border-gray-100">
                <SimpleStatRow label={t('shots')} homeValue={getStat('shots', 'home')} awayValue={getStat('shots', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('shotsOnTarget')} homeValue={getStat('shots_on_target', 'home')} awayValue={getStat('shots_on_target', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('statisticsTab.shotsMissed')} homeValue={getStat('shots', 'home') - getStat('shots_on_target', 'home')} awayValue={getStat('shots', 'away') - getStat('shots_on_target', 'away')} homeColor={homeColor} awayColor={awayColor} />

                <div className="h-px bg-gray-100 my-4" />

                <SimpleStatRow label={t('corners')} homeValue={getStat('corners', 'home')} awayValue={getStat('corners', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('offsides')} homeValue={getStat('offsides', 'home')} awayValue={getStat('offsides', 'away')} homeColor={homeColor} awayColor={awayColor} />

                <div className="h-px bg-gray-100 my-4" />

                <SimpleStatRow label={t('fouls')} homeValue={getStat('fouls', 'home')} awayValue={getStat('fouls', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('yellowCards')} homeValue={getStat('yellow_cards', 'home')} awayValue={getStat('yellow_cards', 'away')} homeColor={homeColor} awayColor={awayColor} />
                <SimpleStatRow label={t('redCards')} homeValue={getStat('red_cards', 'home')} awayValue={getStat('red_cards', 'away')} homeColor={homeColor} awayColor={awayColor} />
            </div>
        </div>
    );
}
