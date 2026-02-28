'use client';

import { UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RefereeInfo } from '@/types/match';

interface RefereeCardProps {
  referees?: RefereeInfo[];
}

const ROLE_ORDER: RefereeInfo['role'][] = ['main', 'assistant', 'fourth', 'var', 'avar'];

export function RefereeCard({ referees }: RefereeCardProps) {
  const { t } = useTranslation('match');

  if (!referees || referees.length === 0) return null;

  const grouped: Partial<Record<RefereeInfo['role'], string[]>> = {};
  for (const ref of referees) {
    if (!grouped[ref.role]) grouped[ref.role] = [];
    grouped[ref.role]!.push(ref.name);
  }

  const rows = ROLE_ORDER.filter(role => grouped[role]?.length).map(role => ({
    label: t(`referee.${role}`),
    value: grouped[role]!.join(', '),
  }));

  if (rows.length === 0) return null;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-dark-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-gray-600 dark:text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {t('referee.brigade')}
        </h3>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-dark-border">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-3 px-5 py-3">
            <span className="text-xs text-gray-500 dark:text-slate-400 leading-5 shrink-0">
              {label}
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white text-right leading-5">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
