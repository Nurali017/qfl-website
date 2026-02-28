'use client';

import { useTranslation } from 'react-i18next';

export type TabId = 'lineups' | 'statistics' | 'overview' | 'h2h' | 'timeline' | 'news';

interface Tab {
  id: TabId;
  labelKey: string;
}

interface MatchTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  protocolUrl?: string | null;
  showLineupsTab?: boolean;
  showStatisticsTab?: boolean;
  showTimelineTab?: boolean;
  showNewsTab?: boolean;
}

export function MatchTabs({
  activeTab,
  onTabChange,
  protocolUrl,
  showLineupsTab = true,
  showStatisticsTab = true,
  showTimelineTab = true,
  showNewsTab = false,
}: MatchTabsProps) {
  const { t } = useTranslation('match');
  const hasProtocol = Boolean(protocolUrl);

  const tabs: Tab[] = [
    { id: 'overview', labelKey: 'tabs.overview' },
    ...(showTimelineTab ? [{ id: 'timeline', labelKey: 'tabs.timeline' } as Tab] : []),
    ...(showLineupsTab ? [{ id: 'lineups', labelKey: 'tabs.lineups' } as Tab] : []),
    ...(showStatisticsTab ? [{ id: 'statistics', labelKey: 'tabs.statistics' } as Tab] : []),
    { id: 'h2h', labelKey: 'tabs.h2h' },
    ...(showNewsTab ? [{ id: 'news', labelKey: 'tabs.news' } as Tab] : []),
  ];

  return (
    <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border sticky top-14 md:top-16 z-30 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 py-3 md:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <nav className="flex flex-1 min-w-0 gap-2 md:gap-3 overflow-x-auto scrollbar-hide items-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    px-3.5 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 rounded-full text-xs sm:text-[13px] md:text-sm font-bold transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${isActive
                      ? 'bg-[#001a3d] text-white shadow-md cursor-default'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-transparent'
                    }
                  `}
                >
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </nav>

          {hasProtocol && (
            <a
              href={protocolUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="protocol-link-desktop"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 mb-2 rounded-lg text-sm font-semibold whitespace-nowrap hover:opacity-90 transition-opacity bg-primary text-white"
            >
              {t('tabs.protocol')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
