'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ColumnDefinition } from '@/lib/mock/statisticsHelpers';

interface ColumnPickerProps {
  columns: ColumnDefinition[];
  selected: Set<string>;
  onChange: (keys: Set<string>) => void;
  sortBy: string;
  getLabel: (col: ColumnDefinition) => string;
}

export function ColumnPicker({ columns, selected, onChange, sortBy, getLabel }: ColumnPickerProps) {
  const { t } = useTranslation('statistics');
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, updatePosition]);

  const MAX_COLUMNS = 2;

  const toggleColumn = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) {
      if (next.size <= 1) return;
      next.delete(key);
    } else {
      if (next.size >= MAX_COLUMNS) return;
      next.add(key);
    }
    onChange(next);
  };

  return (
    <div className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-md text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-dark-surface-soft transition-colors"
        aria-label="Select columns"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg min-w-[160px]"
          style={{ top: position.top, right: position.right }}
        >
          <div className="px-3 py-1.5 text-[11px] text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-dark-border">
            {t('table.maxColumns', { count: MAX_COLUMNS, defaultValue: `макс. ${MAX_COLUMNS} столбца` })}
          </div>
          {columns.map((col) => {
            const isChecked = selected.has(col.key);
            const isAtMax = selected.size >= MAX_COLUMNS && !isChecked;
            return (
              <label
                key={col.key}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm border-b last:border-b-0 border-gray-100 dark:border-dark-border transition-colors ${
                  isAtMax
                    ? 'opacity-60 cursor-default'
                    : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-soft'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isAtMax || (isChecked && selected.size <= 1)}
                  onChange={() => toggleColumn(col.key)}
                  className="w-3.5 h-3.5 rounded text-primary border-gray-300 dark:border-dark-border-soft focus:ring-primary dark:focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-slate-200 whitespace-nowrap">
                  {getLabel(col)}
                </span>
              </label>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
