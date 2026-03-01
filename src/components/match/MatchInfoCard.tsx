'use client';

import { Building, Users, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Stadium } from '@/types/match';

interface MatchInfoCardProps {
  stadium?: Stadium | null;
  visitors?: number | null;
  protocolUrl?: string | null;
}

export function MatchInfoCard({ stadium, visitors, protocolUrl }: MatchInfoCardProps) {
  const { t, i18n } = useTranslation('match');

  const hasStadium = stadium?.name;
  const hasVisitors = visitors != null && visitors > 0;
  const hasProtocol = Boolean(protocolUrl);

  if (!hasStadium && !hasVisitors && !hasProtocol) return null;

  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'kz' ? 'kk-KZ' : 'ru-RU';

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-dark-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
          <Building className="w-4 h-4 text-gray-600 dark:text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {t('matchInfo.title')}
        </h3>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-dark-border">
        {hasStadium && (
          <div className="flex items-start justify-between gap-3 px-5 py-3">
            <span className="text-xs text-gray-500 dark:text-slate-400 leading-5 shrink-0">
              {t('matchInfo.stadium')}
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white text-right leading-5">
              {stadium!.name}{stadium!.city ? `, ${stadium!.city}` : ''}
            </span>
          </div>
        )}
        {hasVisitors && (
          <div className="flex items-start justify-between gap-3 px-5 py-3">
            <span className="text-xs text-gray-500 dark:text-slate-400 leading-5 shrink-0">
              {t('matchInfo.attendance')}
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white text-right leading-5">
              {visitors!.toLocaleString(locale)}
            </span>
          </div>
        )}
        {hasProtocol && (
          <div className="flex items-start justify-between gap-3 px-5 py-3">
            <span className="text-xs text-gray-500 dark:text-slate-400 leading-5 shrink-0">
              {t('tabs.protocol')}
            </span>
            <a
              href={protocolUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline leading-5"
            >
              <FileText className="w-3.5 h-3.5" />
              {t('protocolCard.open')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
