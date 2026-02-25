'use client';

import Link from 'next/link';

export default function NewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-white dark:bg-dark-surface rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Failed to load news
        </h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          Could not retrieve news articles. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-slate-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-dark-surface-soft transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
