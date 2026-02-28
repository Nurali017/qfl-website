'use client';

import { TournamentAwareLink as Link } from '@/components/navigation/TournamentAwareLink';
import { useTranslation } from 'react-i18next';
import { PlayoffBracketResponse } from '@/types';
import { getTeamHref } from '@/lib/utils/entityRoutes';

interface CupBracketProps {
  bracket: PlayoffBracketResponse;
}

/* Short labels — always used instead of backend's long labels */
const SHORT_LABELS: Record<string, string> = {
  '1_64': '1/64',
  '1_32': '1/32',
  '1_16': '1/16',
  '1_8': '1/8',
  '1_4': '1/4',
  '1_2': '1/2',
  final: 'Финал',
  '3rd_place': '3-е',
};

type BracketEntry = PlayoffBracketResponse['rounds'][number]['entries'][number];

function roundRank(rk: string): number {
  if (rk === 'final') return 1;
  if (/^1_\d+$/.test(rk)) return Number.parseInt(rk.slice(2), 10) || 0;
  return 0;
}

function shortLabel(rk: string): string {
  return SHORT_LABELS[rk] ?? rk.replaceAll('_', '/');
}

function slotsPerSide(rk: string): number {
  return Math.max(1, Math.floor(roundRank(rk) / 2));
}

/* ---- Team logo (used on mobile) ---- */
function TeamLogo({
  team,
}: {
  team?: { id?: number | null; name?: string | null; logo_url?: string | null } | null;
}) {
  const href = getTeamHref(team?.id ?? null);
  const circle = (
    <div
      className="h-[22px] w-[22px] shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#0E2034]"
      title={team?.name || ''}
    >
      {team?.logo_url ? (
        <img src={team.logo_url} alt={team.name || ''} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[8px] text-slate-500">?</span>
      )}
    </div>
  );
  return href ? <Link href={href}>{circle}</Link> : circle;
}

/* ---- Desktop team line ---- */
function TeamLine({
  team,
  score,
}: {
  team?: { id?: number | null; name?: string | null; logo_url?: string | null } | null;
  score?: number | null;
}) {
  const href = getTeamHref(team?.id ?? null);
  const inner = (
    <div className="flex items-center gap-1 px-1.5 py-[3px]">
      <div className="h-4 w-4 shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#0E2034]">
        {team?.logo_url ? (
          <img src={team.logo_url} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <span className="min-w-0 flex-1 truncate text-[10px] font-medium leading-tight text-slate-200">
        {team?.name || '—'}
      </span>
      {score != null && (
        <span className="text-[10px] font-bold text-slate-100">{score}</span>
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="block transition-colors hover:bg-white/5">{inner}</Link>
  ) : inner;
}

/* ---- Match card ---- */
function MatchCard({ entry }: { entry: BracketEntry }) {
  const game = entry.game;
  return (
    <>
      {/* Mobile: logos stacked vertically */}
      <div className="flex flex-col items-center gap-0.5 rounded border border-white/15 bg-[#10273A] py-1 md:hidden">
        <TeamLogo team={game?.home_team} />
        <div className="h-px w-4 bg-white/10" />
        <TeamLogo team={game?.away_team} />
      </div>
      {/* Desktop: full card */}
      <div className="hidden overflow-hidden rounded border border-white/15 bg-[#10273A] md:block">
        <TeamLine team={game?.home_team} score={game?.home_score} />
        <div className="border-t border-white/10" />
        <TeamLine team={game?.away_team} score={game?.away_score} />
        {game?.home_penalty_score != null && (
          <div className="text-center text-[10px] text-white/50 py-0.5 border-t border-white/10">
            пен. {game.home_penalty_score}:{game.away_penalty_score}
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Empty slot ---- */
function EmptySlot() {
  return (
    <>
      <div className="flex flex-col items-center gap-0.5 rounded border border-dashed border-white/10 bg-[#0F1E31] py-1 md:hidden">
        <div className="h-[22px] w-[22px] rounded-full border border-dashed border-white/10" />
        <div className="h-px w-4 bg-white/5" />
        <div className="h-[22px] w-[22px] rounded-full border border-dashed border-white/10" />
      </div>
      <div className="hidden rounded border border-dashed border-white/10 bg-[#0F1E31] min-h-[40px] md:block" />
    </>
  );
}

/* ---- Round column ---- */
function RoundColumn({
  label,
  entries,
  slotCount,
}: {
  label: string;
  entries: BracketEntry[];
  slotCount: number;
}) {
  const entryByOrder = new Map(entries.map((e) => [e.sort_order, e]));
  const slots: (BracketEntry | null)[] = [];
  for (let i = 1; i <= slotCount; i++) {
    slots.push(entryByOrder.get(i) ?? null);
  }
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-1 truncate border-b border-white/20 pb-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400 md:text-[10px]">
        {label}
      </div>
      <div className="flex flex-1 flex-col justify-around gap-1">
        {slots.map((entry, i) =>
          entry ? <MatchCard key={entry.id} entry={entry} /> : <EmptySlot key={`e-${i}`} />
        )}
      </div>
    </div>
  );
}

/* ---- Main component ---- */
export function CupBracket({ bracket }: CupBracketProps) {
  const { t } = useTranslation('table');

  if (!bracket.rounds.length) {
    return (
      <div className="rounded-xl border border-white/15 bg-[#122A3D] p-4">
        <p className="text-sm text-slate-400">
          {t('cup.noBracket', { defaultValue: 'Сетка плей-офф пока не определена' })}
        </p>
      </div>
    );
  }

  const roundMap = new Map(bracket.rounds.map((r) => [r.round_name, r]));

  const numericRoundKeys = bracket.rounds
    .map((r) => r.round_name)
    .filter((rk) => /^1_\d+$/.test(rk))
    .sort((a, b) => roundRank(b) - roundRank(a));

  const finalRound = roundMap.get('final');
  const thirdPlaceRound = roundMap.get('3rd_place');

  const leftColumns = numericRoundKeys.map((rk) => {
    const entries = (roundMap.get(rk)?.entries || []).filter((e) => e.side !== 'right');
    return {
      roundKey: rk,
      label: shortLabel(rk),
      entries,
      slotCount: Math.max(slotsPerSide(rk), entries.length),
    };
  });

  const rightColumns = [...numericRoundKeys].reverse().map((rk) => {
    const entries = (roundMap.get(rk)?.entries || []).filter((e) => e.side === 'right');
    return {
      roundKey: rk,
      label: shortLabel(rk),
      entries,
      slotCount: Math.max(slotsPerSide(rk), entries.length),
    };
  });

  const centerEntries = (finalRound?.entries || []).filter(
    (e) => e.side === 'center' || e.side === 'left'
  );

  const maxSlots = leftColumns.length > 0 ? leftColumns[0].slotCount : 1;
  const bracketHeight = Math.max(maxSlots * 80, 300);

  return (
    <div className="rounded-xl border border-white/15 bg-[#122A3D] p-1.5 md:p-4">
      <div className="flex gap-0.5 md:gap-2" style={{ minHeight: bracketHeight }}>
        {/* Left half */}
        {leftColumns.map((col) => (
          <RoundColumn
            key={`l-${col.roundKey}`}
            label={col.label}
            entries={col.entries}
            slotCount={col.slotCount}
          />
        ))}

        {/* Center: Final */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 truncate border-b border-white/20 pb-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-200 md:text-[11px]">
            {shortLabel('final')}
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1">
            {centerEntries.length === 0 ? (
              <EmptySlot />
            ) : (
              centerEntries.map((entry) => <MatchCard key={entry.id} entry={entry} />)
            )}
            {thirdPlaceRound?.entries?.length ? (
              <div className="mt-1">
                <div className="mb-0.5 text-center text-[8px] font-semibold uppercase text-slate-500 md:text-[9px]">
                  {shortLabel('3rd_place')}
                </div>
                {thirdPlaceRound.entries.map((entry) => (
                  <MatchCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right half */}
        {rightColumns.map((col) => (
          <RoundColumn
            key={`r-${col.roundKey}`}
            label={col.label}
            entries={col.entries}
            slotCount={col.slotCount}
          />
        ))}
      </div>
    </div>
  );
}
