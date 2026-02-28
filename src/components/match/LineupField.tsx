'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { MatchLineups, GameTeam, LineupPlayerExtended, LineupRenderingMode } from '@/types';
import { buildPlacedPlayers, orderStartersForPlacement } from '@/lib/utils/lineupPlacement';
import { getPlayerHref, getTeamHref } from '@/lib/utils/entityRoutes';
import { HOME_COLOR, AWAY_COLOR, getTeamLogo } from '@/lib/utils/teamLogos';

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

function resolveKitColor(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  const color = raw.trim();
  return HEX_COLOR_RE.test(color) ? color.toUpperCase() : fallback;
}

// --- JERSEY ICON (PITCH VIEW) ---
function JerseyIcon({ color, number }: { color: string; number: number }) {
  return (
    <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-transform hover:scale-110 group-hover:scale-110">
      <div className="absolute top-1 left-0 w-full h-full bg-black/40 blur-[2px] rounded-full opacity-50" />
      <svg viewBox="0 0 128 128" fill="none" className="w-full h-full drop-shadow-md z-10">
        <path
          fill={color}
          d="M107.327 21.364c-5.413-4.466-26.674-9.136-27.576-9.333a1.304 1.304 0 0 0-1.101.256c-16.692 13.303-29.519.649-30.057.105a1.322 1.322 0 0 0-1.428-.295 1.301 1.301 0 0 0-.657.582c-1.217.777-7.31 2.45-11.802 3.683-10.71 2.942-13.946 3.998-14.754 5.33C18.5 24.09 8 56.523 8 58.613c0 1.04.97 1.624 1.297 1.822l.005.003c2.182 1.303 8.025 2.748 13.997 2.746 3.27 0 6.546-.476 9.312-1.602l-1.95 46.035c-.017.494.25.954.69 1.187.204.108 13.879 7.197 32.955 7.197 9.594 0 20.556-1.794 31.855-7.172.465-.221.755-.693.741-1.203l-1.625-46.034c9.061 2.65 23.322-3.26 23.926-3.515a1.29 1.29 0 0 0 .764-1.48c-.724-3.135-7.228-30.765-12.64-35.232Z"
        />
        <path fill="rgba(0,0,0,0.2)" d="M119.177 58.115c-.604.254-14.866 6.164-23.927 3.515l12.05-40.228c5.412 4.468 11.917 32.097 12.641 35.233a1.29 1.29 0 0 1-.764 1.48ZM8 58.589c0-2.09 10.5-34.522 11.952-36.919.808-1.332 12.659 39.888 12.659 39.888-2.766 1.127-6.041 1.602-9.312 1.602-5.972.002-11.815-1.443-13.997-2.746l-.005-.003C8.97 60.214 8 59.63 8 58.589Z" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] md:text-[11px] font-bold z-20 pt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        {number}
      </span>
    </div>
  );
}

// --- PLAYER MARKER (PITCH VIEW) ---
function PlayerMarker({ player, position, teamColor }: { player: LineupPlayerExtended; position: { x: number; y: number }; teamColor: string }) {
  const playerHref = getPlayerHref(player.player_id);

  const content = (
    <>
      <JerseyIcon color={teamColor} number={player.number} />
      <div className="flex items-center justify-center gap-1">
        <span className="text-[8px] md:text-[10px] font-medium text-white text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-[64px] md:max-w-[84px] tracking-wide line-clamp-2">
          {player.last_name}
        </span>
        {player.is_captain && (
          <span className="flex items-center justify-center w-3.5 h-3.5 bg-yellow-400 rounded-full text-[7px] font-black text-black leading-none shadow-md" title="Captain">C</span>
        )}
      </div>
    </>
  );

  if (!playerHref) {
    return (
      <div
        data-testid={`lineup-marker-${player.player_id}`}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center gap-0.5 pointer-events-auto"
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={playerHref}
      data-testid={`lineup-marker-${player.player_id}`}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center gap-0.5 pointer-events-auto"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {content}
    </Link>
  );
}

// --- PLAYER ROW (LIST VIEW) ---
function PlayerRow({ player }: { player: LineupPlayerExtended }) {
  const fullName = `${player.first_name} ${player.last_name}`;
  const playerHref = getPlayerHref(player.player_id);

  const content = (
    <div className="flex items-center gap-4 w-full px-4 py-2 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 relative group">
      <div className="w-6 text-center text-sm md:text-[20px] font-black text-gray-900 overflow-hidden">
        {player.number}
      </div>

      {/* Small Shield for List view */}
      <div
        className="w-10 h-11 shrink-0 bg-gray-200 relative group-hover:scale-105 transition-transform"
        style={{ clipPath: 'polygon(50% 100%, 100% 75%, 100% 0, 0 0, 0 75%)', padding: '1px' }}
      >
        <div className="w-full h-full bg-white" style={{ clipPath: 'polygon(50% 100%, 100% 75%, 100% 0, 0 0, 0 75%)' }}>
          {player.photo_url ? (
            <img src={player.photo_url} className="w-full h-full object-cover object-top" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-[10px] text-gray-400 font-bold">{player.number}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-[13px] md:text-sm font-bold text-gray-900 truncate uppercase mt-0.5 tracking-tight group-hover:text-blue-700">
          {fullName}
        </div>
        {player.country?.flag_url && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <img
              src={player.country.flag_url}
              alt={player.country.code}
              className="w-3.5 h-2.5 object-cover rounded-[1px] shadow-sm flex-shrink-0"
            />
            <span className="text-[10px] text-gray-500 font-semibold">{player.country.name}</span>
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

// --- SUBSTITUTE ROW (COMPACT, FOR PITCH VIEW SIDE PANELS) ---
function SubstituteRow({ player }: { player: LineupPlayerExtended }) {
  const playerHref = getPlayerHref(player.player_id);

  const content = (
    <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/60 transition-colors border-b border-gray-200/60 last:border-0 group">
      <span className="w-5 text-right text-[11px] font-bold text-gray-400 tabular-nums shrink-0">{player.number}</span>
      <span className="text-[12px] font-semibold text-gray-800 truncate uppercase tracking-tight group-hover:text-blue-700">
        {player.last_name}
      </span>
    </div>
  );

  if (!playerHref) return content;

  return (
    <Link href={playerHref} className="block w-full">
      {content}
    </Link>
  );
}

// --- SUBSTITUTE SIDE PANEL (FOR PITCH VIEW) ---
function SubstituteSidePanel({ team, logoUrl, substitutes, align }: { team: GameTeam; logoUrl: string | null | undefined; substitutes: LineupPlayerExtended[]; align: 'left' | 'right' }) {
  const teamHref = getTeamHref(team.id);

  return (
    <div className="bg-[#f5f5f5] rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className={`px-3 py-2.5 bg-white border-b-2 border-slate-800 flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {teamHref ? (
          <Link href={teamHref} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <img src={logoUrl || getTeamLogo(team.id) || ''} className="w-6 h-6 object-contain" alt={team.name} />
          </Link>
        ) : (
          <img src={logoUrl || getTeamLogo(team.id) || ''} className="w-6 h-6 object-contain shrink-0" alt={team.name} />
        )}
        <div className={`flex flex-col min-w-0 ${align === 'right' ? 'items-end' : ''}`}>
          <span className="font-bold text-gray-900 text-[11px] uppercase tracking-tight truncate max-w-full">{team.name}</span>
          <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase">Substitutes</span>
        </div>
      </div>
      {/* Player list */}
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        {substitutes.map(p => <SubstituteRow key={p.player_id} player={p} />)}
        {substitutes.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-gray-400">—</div>
        )}
      </div>
    </div>
  );
}

// --- TEAM LIST CARD (LIST VIEW) ---
function TeamLineupListCard({ team, logoUrl, starters, substitutes, formation }: { team: GameTeam; logoUrl: string | null | undefined; starters: LineupPlayerExtended[]; substitutes: LineupPlayerExtended[]; formation?: string }) {
  const teamHref = getTeamHref(team.id);

  const gks = starters.filter(p => p.position === 'GK');
  const defs = starters.filter(p => p.position === 'DEF');
  const mids = starters.filter(p => p.position === 'MID');
  const fwds = starters.filter(p => p.position === 'FWD');

  const LogoContainer = ({ children }: { children: React.ReactNode }) => teamHref ? (
    <Link href={teamHref} className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">{children}</Link>
  ) : (
    <div className="flex items-center gap-3 w-full">{children}</div>
  );

  return (
    <div className="w-full flex flex-col shadow-lg rounded-xl overflow-hidden border border-gray-200/50 bg-[#f5f5f5]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b-4 border-slate-900">
        <LogoContainer>
          <img src={logoUrl || getTeamLogo(team.id) || ''} className="w-10 h-10 object-contain drop-shadow" alt={team.name} />
          <span className="font-black text-gray-900 tracking-tight text-lg">{team.name}</span>
        </LogoContainer>
        {formation && (
          <div className="text-gray-500 font-mono font-bold text-sm tracking-widest whitespace-nowrap shrink-0">{formation}</div>
        )}
      </div>

      <div className="flex flex-col">
        {gks.length > 0 && (
          <>
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#f5f5f5] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-y border-gray-200 mx-0 mt-0">
              <span>GOALKEEPER</span>
            </div>
            {gks.map(p => <PlayerRow key={p.player_id} player={p} />)}
          </>
        )}

        {defs.length > 0 && (
          <>
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#f5f5f5] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-y border-gray-200 mt-2">
              <span>DEFENDERS</span>
            </div>
            {defs.map(p => <PlayerRow key={p.player_id} player={p} />)}
          </>
        )}

        {mids.length > 0 && (
          <>
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#f5f5f5] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-y border-gray-200 mt-2">
              <span>MIDFIELDERS</span>
            </div>
            {mids.map(p => <PlayerRow key={p.player_id} player={p} />)}
          </>
        )}

        {fwds.length > 0 && (
          <>
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#f5f5f5] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-y border-gray-200 mt-2">
              <span>FORWARDS</span>
            </div>
            {fwds.map(p => <PlayerRow key={p.player_id} player={p} />)}
          </>
        )}

        {substitutes.length > 0 && (
          <>
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#f5f5f5] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-y border-gray-200 mt-6">
              <span>SUBSTITUTES</span>
            </div>
            {substitutes.map(p => <PlayerRow key={p.player_id} player={p} />)}
          </>
        )}
      </div>
    </div>
  );
}

// --- FIELD VISUALIZATION (PITCH VIEW) ---
function FieldVisualization({
  homeStarters,
  awayStarters,
  homeFormation,
  awayFormation,
  homeColor,
  awayColor,
  homeTeam,
  awayTeam,
}: {
  homeStarters: LineupPlayerExtended[];
  awayStarters: LineupPlayerExtended[];
  homeFormation?: string;
  awayFormation?: string;
  homeColor: string;
  awayColor: string;
  homeTeam: GameTeam;
  awayTeam: GameTeam;
}) {
  const homePlacedPlayers = buildPlacedPlayers({ starters: homeStarters, invertY: false, mirrorX: true });
  const awayPlacedPlayers = buildPlacedPlayers({ starters: awayStarters, invertY: true, mirrorX: false });

  // Map 0-100 logic to field boundaries (must match LineupFieldMini for parity)
  const mapToHomeHalf = (pos: { x: number; y: number }) => ({
    x: pos.x,
    y: pos.y * 0.51 + 5.45,
  });
  const mapToAwayHalf = (pos: { x: number; y: number }) => ({
    x: pos.x,
    y: pos.y * 0.53 + 41.3,
  });

  return (
    <div className="relative w-full aspect-[21/28] md:h-[820px] overflow-hidden bg-[#0a1617] rounded-lg shadow-xl shadow-black/20 border border-[#1b2a2b]">
      {/* Banner Overlays for Team Info inside pitch */}

      {/* Home Banner Top */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-black/40 backdrop-blur-sm border-b border-[#ffffff10]">
        <div className="flex items-center gap-3">
          <img src={homeTeam.logo_url || getTeamLogo(homeTeam.id) || ''} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow" alt={homeTeam.name} />
          <span className="font-bold text-white uppercase text-sm md:text-lg tracking-wide">{homeTeam.name}</span>
        </div>
        <span className="font-mono font-bold text-white/50 text-sm md:text-base">{homeFormation}</span>
      </div>

      {/* Away Banner Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-black/40 backdrop-blur-sm border-t border-[#ffffff10]">
        <span className="font-mono font-bold text-white/50 text-sm md:text-base">{awayFormation}</span>
        <div className="flex items-center gap-3">
          <span className="font-bold text-white uppercase text-sm md:text-lg tracking-wide">{awayTeam.name}</span>
          <img src={awayTeam.logo_url || getTeamLogo(awayTeam.id) || ''} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow" alt={awayTeam.name} />
        </div>
      </div>

      {/* SVG PITCH LINES */}
      <div className="absolute inset-0 z-0 p-4 md:p-6 opacity-60">
        <svg className="w-full h-full" viewBox="0 0 500 700" preserveAspectRatio="none">
          <g stroke="#ffffff" strokeWidth="1.5" fill="none" strokeOpacity="0.4">
            {/* Outline */}
            <rect x="0" y="0" width="500" height="700" rx="4" />

            {/* Center Line */}
            <line x1="0" y1="350" x2="500" y2="350" />

            {/* Center Circle */}
            <circle cx="250" cy="350" r="55" />
            <circle cx="250" cy="350" r="3" fill="#ffffff" fillOpacity="0.4" stroke="none" />

            {/* Home Penalty Area */}
            <rect x="100" y="0" width="300" height="115" />
            <rect x="180" y="0" width="140" height="40" />
            <path d="M 200,115 A 50,50 0 0,0 300,115" />
            <circle cx="250" cy="85" r="2.5" fill="#ffffff" fillOpacity="0.4" stroke="none" />

            {/* Away Penalty Area */}
            <rect x="100" y="585" width="300" height="115" />
            <rect x="180" y="660" width="140" height="40" />
            <path d="M 200,585 A 50,50 0 0,1 300,585" />
            <circle cx="250" cy="615" r="2.5" fill="#ffffff" fillOpacity="0.4" stroke="none" />

            {/* Corner Arcs */}
            <path d="M 0,15 A 15,15 0 0,0 15,0" />
            <path d="M 485,0 A 15,15 0 0,0 500,15" />
            <path d="M 0,685 A 15,15 0 0,1 15,700" />
            <path d="M 485,700 A 15,15 0 0,1 500,685" />
          </g>
        </svg>
      </div>

      {/* Players Home */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {homePlacedPlayers.map(({ player, position }) => (
          <PlayerMarker
            key={player.player_id}
            player={player}
            position={mapToHomeHalf(position)}
            teamColor={homeColor}
          />
        ))}
      </div>

      {/* Players Away */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {awayPlacedPlayers.map(({ player, position }) => (
          <PlayerMarker
            key={player.player_id}
            player={player}
            position={mapToAwayHalf(position)}
            teamColor={awayColor}
          />
        ))}
      </div>
    </div>
  );
}

// --- MAIN WRAPPER EXPORT ---
interface LineupFieldProps { lineups?: MatchLineups; homeTeam: GameTeam; awayTeam: GameTeam; loading?: boolean; renderingMode?: LineupRenderingMode; }

export function LineupField({ lineups, homeTeam, awayTeam, loading, renderingMode = 'field' }: LineupFieldProps) {
  const { t } = useTranslation('match');
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch');

  if (loading) return <div className="animate-pulse h-[800px] bg-gray-200 rounded-xl" />;
  if (renderingMode === 'hidden') return null;

  if (!lineups || !lineups.home_team || !lineups.away_team) {
    return <div className="bg-white rounded-2xl p-12 text-center border shadow-sm"><p className="text-gray-500">{t('lineup.noData')}</p></div>;
  }

  const homeColor = resolveKitColor(lineups.home_team.kit_color, HOME_COLOR);
  const awayColor = resolveKitColor(lineups.away_team.kit_color, AWAY_COLOR);
  const homeStarters = orderStartersForPlacement(lineups.home_team.starters).slice(0, 11);
  const awayStarters = orderStartersForPlacement(lineups.away_team.starters).slice(0, 11);

  // When renderingMode is 'list', skip the toggle and show list directly
  if (renderingMode === 'list') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <TeamLineupListCard team={homeTeam} logoUrl={homeTeam.logo_url} starters={homeStarters} substitutes={lineups.home_team.substitutes || []} formation={lineups.home_team.formation} />
        <TeamLineupListCard team={awayTeam} logoUrl={awayTeam.logo_url} starters={awayStarters} substitutes={lineups.away_team.substitutes || []} formation={lineups.away_team.formation} />
      </div>
    );
  }

  // Effective view: use internal toggle for field renderingMode
  const showPitch = viewMode === 'pitch';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* View Toggles */}
      <div className="flex items-center justify-start">
        <div className="inline-flex bg-gray-100 p-1.5 rounded-full border border-gray-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 ${!showPitch ? 'bg-[#1e293b] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            {t('lineup.listView', 'LIST VIEW')}
          </button>
          <button
            onClick={() => setViewMode('pitch')}
            className={`px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 ${showPitch ? 'bg-[#1e293b] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            {t('lineup.pitchView', 'PITCH VIEW')}
          </button>
        </div>
      </div>

      {!showPitch && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <TeamLineupListCard team={homeTeam} logoUrl={homeTeam.logo_url} starters={homeStarters} substitutes={lineups.home_team.substitutes || []} formation={lineups.home_team.formation} />
          <TeamLineupListCard team={awayTeam} logoUrl={awayTeam.logo_url} starters={awayStarters} substitutes={lineups.away_team.substitutes || []} formation={lineups.away_team.formation} />
        </div>
      )}

      {showPitch && (
        <>
          {/* Desktop: 3-column layout — Home subs | Pitch | Away subs */}
          <div className="hidden lg:flex max-w-7xl mx-auto gap-4 xl:gap-6 items-start">
            <div className="w-[240px] xl:w-[280px] shrink-0 sticky top-4">
              <SubstituteSidePanel team={homeTeam} logoUrl={homeTeam.logo_url} substitutes={lineups.home_team.substitutes || []} align="left" />
            </div>
            <div className="flex-1 min-w-0">
              <FieldVisualization
                homeStarters={homeStarters} awayStarters={awayStarters}
                homeFormation={lineups.home_team.formation} awayFormation={lineups.away_team.formation}
                homeColor={homeColor} awayColor={awayColor}
                homeTeam={homeTeam} awayTeam={awayTeam}
              />
            </div>
            <div className="w-[240px] xl:w-[280px] shrink-0 sticky top-4">
              <SubstituteSidePanel team={awayTeam} logoUrl={awayTeam.logo_url} substitutes={lineups.away_team.substitutes || []} align="right" />
            </div>
          </div>

          {/* Mobile: Pitch on top, subs in 2-col grid below */}
          <div className="lg:hidden flex flex-col gap-6">
            <div className="max-w-3xl mx-auto w-full">
              <FieldVisualization
                homeStarters={homeStarters} awayStarters={awayStarters}
                homeFormation={lineups.home_team.formation} awayFormation={lineups.away_team.formation}
                homeColor={homeColor} awayColor={awayColor}
                homeTeam={homeTeam} awayTeam={awayTeam}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SubstituteSidePanel team={homeTeam} logoUrl={homeTeam.logo_url} substitutes={lineups.home_team.substitutes || []} align="left" />
              <SubstituteSidePanel team={awayTeam} logoUrl={awayTeam.logo_url} substitutes={lineups.away_team.substitutes || []} align="right" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
