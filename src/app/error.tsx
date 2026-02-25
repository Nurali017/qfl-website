'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error boundary caught:', error);
  }, [error]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
      <div className="max-w-lg mx-auto bg-white dark:bg-dark-surface rounded-xl p-8 shadow-sm">
        <div className="text-5xl font-bold text-red-500 mb-4">!</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mb-2">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-6" />}
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
