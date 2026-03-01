'use client';

import { Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RefereeInfo, Stadium } from '@/types/match';

interface RefereeCardProps {
  referees?: RefereeInfo[];
  stadium?: Stadium | null;
  visitors?: number | null;
  protocolUrl?: string | null;
}

const ROLE_ORDER: RefereeInfo['role'][] = ['main', 'assistant', 'fourth', 'var', 'avar'];

export function RefereeCard({ referees, stadium, visitors, protocolUrl }: RefereeCardProps) {
  const { t, i18n } = useTranslation('match');

  const hasReferees = referees && referees.length > 0;
  const hasStadium = Boolean(stadium?.name);
  const hasVisitors = visitors != null && visitors > 0;
  const hasProtocol = Boolean(protocolUrl);

  if (!hasReferees && !hasStadium && !hasVisitors && !hasProtocol) return null;

  const grouped: Partial<Record<RefereeInfo['role'], string[]>> = {};
  if (hasReferees) {
    for (const ref of referees!) {
      if (!grouped[ref.role]) grouped[ref.role] = [];
      grouped[ref.role]!.push(ref.name);
    }
  }

  const refereeRows = ROLE_ORDER.filter(role => grouped[role]?.length).map(role => ({
    label: t(`referee.${role}`),
    names: grouped[role]!.join(', '),
  }));

  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'kz' ? 'kk-KZ' : 'ru-RU';
  const spectatorsLabel = t('spectators');
  const spectatorsCapitalized = spectatorsLabel.charAt(0).toUpperCase() + spectatorsLabel.slice(1);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">

      {/* Stadium + Visitors */}
      {(hasStadium || hasVisitors) && (
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-dark-border">
          {hasStadium && (
            <div className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
              {stadium!.name}
            </div>
          )}
          {hasVisitors && (
            <div className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">
              {spectatorsCapitalized}: {visitors!.toLocaleString(locale)}
            </div>
          )}
        </div>
      )}

      {/* Referee rows: name on top, role label below */}
      {refereeRows.length > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-dark-border">
          {refereeRows.map(({ label, names }) => (
            <div key={label} className="px-5 py-3">
              <div className="text-sm text-gray-900 dark:text-white leading-snug">
                {names}
              </div>
              <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocol button */}
      {hasProtocol && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <a
            href={protocolUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border text-sm font-semibold text-gray-700 dark:text-slate-300 hover:border-gray-400 hover:text-gray-900 dark:hover:border-slate-400 transition-colors"
          >
            <Printer className="w-4 h-4" />
            {t('protocolCard.open')}
          </a>
        </div>
      )}
    </div>
  );
}
