'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { NewsArticle } from '@/types';

interface MatchRelatedNewsProps {
  news: NewsArticle[];
  loading?: boolean;
}

function NewsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-surface">
      <div className="h-40 bg-gray-200 dark:bg-dark-border" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/3" />
      </div>
    </div>
  );
}

export function MatchRelatedNews({ news, loading = false }: MatchRelatedNewsProps) {
  const { t } = useTranslation('match');

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-slate-500">
        {t('news.empty', 'Матч бойынша жаңалықтар жоқ')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {news.map((article) => (
        <Link key={article.id} href={`/news/${article.id}`} className="group block">
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border hover:shadow-md transition-shadow">
            {article.image_url ? (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="aspect-[16/9] bg-gray-100 dark:bg-dark-border" />
            )}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
              {article.publish_date && (
                <p className="mt-2 text-xs text-gray-400 dark:text-slate-500">
                  {new Date(article.publish_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
