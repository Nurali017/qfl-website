'use client';

import { useTranslation } from 'react-i18next';
import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { SquadPlayer } from '@/types/team';
import { GameTeam } from '@/types';
import { getPlayerHref, getTeamHref } from '@/lib/utils/entityRoutes';
import { getTeamLogo } from '@/lib/utils/teamLogos';

function RosterPlayerRow({ player }: { player: SquadPlayer }) {
  const fullName = `${player.first_name} ${player.last_name}`;
  const playerHref = getPlayerHref(player.player_id);

  const content = (
    <div className="flex items-center gap-4 w-full px-4 py-2 bg-white dark:bg-dark-surface-alt hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors border-b border-gray-100 dark:border-dark-border last:border-0 relative group">
      <div className="w-6 text-center text-sm md:text-[20px] font-black text-gray-900 dark:text-white overflow-hidden">
        {player.jersey_number ?? '—'}
      </div>

      <div
        className="w-10 h-11 shrink-0 bg-gray-200 dark:bg-dark-border relative group-hover:scale-105 transition-transform"
        style={{ clipPath: 'polygon(50% 100%, 100% 75%, 100% 0, 0 0, 0 75%)', padding: '1px' }}
      >
        <div className="w-full h-full bg-white dark:bg-dark-surface" style={{ clipPath: 'polygon(50% 100%, 100% 75%, 100% 0, 0 0, 0 75%)' }}>
          {player.photo_url ? (
            <img src={player.photo_url} className="w-full h-full object-cover object-top" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-border">
              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{player.jersey_number ?? '—'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-[13px] md:text-sm font-bold text-gray-900 dark:text-white truncate uppercase mt-0.5 tracking-tight group-hover:text-blue-700 dark:group-hover:text-blue-400">
          {fullName}
        </div>
        {player.country_code && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold">{player.nationality || player.country_code}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!playerHref) return content;

  return (
    <Link href={playerHref} className="block w-full">
      {content}
    </Link>
  );
}

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const;
const POSITION_LABEL_KEYS: Record<string, string> = {
  GK: 'lineup.goalkeeper',
  DEF: 'lineup.defenders',
  MID: 'lineup.midfielders',
  FWD: 'lineup.forwards',
};

function TeamRosterCard({ team, players }: { team: GameTeam; players: SquadPlayer[] }) {
  const { t } = useTranslation('match');
  const teamHref = getTeamHref(team.id);
  const logoUrl = team.logo_url || getTeamLogo(team.id) || '';

  const grouped = POSITION_ORDER.map(pos => ({
    pos,
    label: t(POSITION_LABEL_KEYS[pos]),
    players: players.filter(p => p.position === pos),
  })).filter(g => g.players.length > 0);

  // Players without a recognized position
  const ungrouped = players.filter(p => !POSITION_ORDER.includes(p.position as typeof POSITION_ORDER[number]));

  const LogoContainer = ({ children }: { children: React.ReactNode }) => teamHref ? (
    <Link href={teamHref} className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">{children}</Link>
  ) : (
    <div className="flex items-center gap-3 w-full">{children}</div>
  );

  return (
    <div className="w-full flex flex-col shadow-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
      <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-dark-surface-alt border-b border-gray-100 dark:border-dark-border">
        <LogoContainer>
          <img src={logoUrl} className="w-10 h-10 object-contain drop-shadow" alt={team.name} />
          <span className="font-black text-gray-900 dark:text-white tracking-tight text-lg">{team.name}</span>
        </LogoContainer>
      </div>

      <div className="flex flex-col">
        {grouped.map(({ pos, label, players: posPlayers }, idx) => (
          <div key={pos}>
            <div className={`flex items-center justify-between px-5 py-2.5 bg-gray-50 dark:bg-dark-surface text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] border-y border-gray-100 dark:border-dark-border ${idx > 0 ? 'mt-2' : 'mt-0'}`}>
              <span>{label}</span>
            </div>
            {posPlayers.map(p => <RosterPlayerRow key={p.player_id} player={p} />)}
          </div>
        ))}

        {ungrouped.length > 0 && (
          <>
            <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 dark:bg-dark-surface text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] border-y border-gray-100 dark:border-dark-border mt-2">
              <span>{t('lineup.players')}</span>
            </div>
            {ungrouped.map(p => <RosterPlayerRow key={p.player_id} player={p} />)}
          </>
        )}
      </div>
    </div>
  );
}

interface SeasonRosterCardsProps {
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  homePlayers: SquadPlayer[];
  awayPlayers: SquadPlayer[];
}

export function SeasonRosterCards({ homeTeam, awayTeam, homePlayers, awayPlayers }: SeasonRosterCardsProps) {
  const { t } = useTranslation('match');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-700/70 dark:bg-blue-900/25 dark:text-blue-100 flex items-center gap-2">
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <span>{t('lineup.rosterInfoBanner')}</span>
      </div>

      {/* Season Roster Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {t('lineup.seasonRoster')}
      </h3>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <TeamRosterCard team={homeTeam} players={homePlayers} />
        <TeamRosterCard team={awayTeam} players={awayPlayers} />
      </div>
    </div>
  );
}
