'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ColumnDefinition,
  getColumnsForSubTab,
  getMobileColumns,
  applyCustomColumns,
} from '@/lib/mock/statisticsHelpers';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePersistedColumns } from '@/hooks/usePersistedColumns';
import { StatSubTab } from '@/types/statistics';

export function toFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getDefaultSortBy(
  subTab: StatSubTab,
  columns: ColumnDefinition[],
  defaultSortByMap: Record<StatSubTab, string>,
): string {
  const preferred = defaultSortByMap[subTab];
  if (columns.some((c) => c.key === preferred)) return preferred;
  return columns.find((c) => c.sortable)?.key || columns[0]?.key || preferred;
}

interface UseStatsTableOptions {
  subTab: StatSubTab;
  mode: 'players' | 'clubs';
  defaultSortByMap: Record<StatSubTab, string>;
  /** Number of data items — used to re-check overflow when data changes */
  itemCount: number;
}

export function useStatsTable({
  subTab,
  mode,
  defaultSortByMap,
  itemCount,
}: UseStatsTableOptions) {
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
  const [hasInteractedWithXScroll, setHasInteractedWithXScroll] = useState(false);

  // Columns
  const columns = useMemo(() => getColumnsForSubTab(subTab, mode), [subTab, mode]);
  const [customColumns, setCustomColumns] = usePersistedColumns(mode, subTab);

  // Sort
  const [sortBy, setSortBy] = useState<string>(() =>
    getDefaultSortBy(subTab, columns, defaultSortByMap),
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const visibleColumns = useMemo(
    () =>
      isMobile
        ? customColumns
          ? applyCustomColumns(columns, customColumns, sortBy)
          : getMobileColumns(columns, sortBy)
        : columns,
    [isMobile, columns, sortBy, customColumns],
  );

  // Reset sort when subTab changes and current sortBy isn't available
  useEffect(() => {
    const columnKeys = new Set(columns.map((c) => c.key));
    if (!columnKeys.has(sortBy)) {
      setSortBy(getDefaultSortBy(subTab, columns, defaultSortByMap));
      setSortOrder('desc');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  // Overflow detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateOverflow = () => {
      const overflow = container.scrollWidth > container.clientWidth + 1;
      setHasHorizontalOverflow(overflow);
      if (!overflow) setHasInteractedWithXScroll(false);
    };

    const handleScroll = () => {
      if (container.scrollLeft > 8) setHasInteractedWithXScroll(true);
    };

    updateOverflow();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateOverflow);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateOverflow);
    };
  }, [itemCount, visibleColumns.length]);

  const showMobileScrollHint = hasHorizontalOverflow && !hasInteractedWithXScroll;
  const hasColumnPicker = isMobile && columns.length > visibleColumns.length;

  // Generic sort helper
  function sortItems<T>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      const aNum = toFiniteNumber((a as Record<string, unknown>)[sortBy]);
      const bNum = toFiniteNumber((b as Record<string, unknown>)[sortBy]);

      if (aNum === null && bNum === null) return 0;
      if (aNum === null) return 1;
      if (bNum === null) return -1;

      return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
    });
  }

  return {
    isMobile,
    columns,
    visibleColumns,
    customColumns,
    setCustomColumns,
    sortBy,
    sortOrder,
    handleSort,
    scrollContainerRef,
    showMobileScrollHint,
    hasColumnPicker,
    sortItems,
  };
}
