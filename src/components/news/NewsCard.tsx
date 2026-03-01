'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NewsArticle } from '@/types';
import { formatNewsDate } from '@/lib/utils/dateFormat';

interface NewsCardProps {
  news: NewsArticle;
  variant?: 'default' | 'compact' | 'featured';
  showStats?: boolean;
  className?: string;
}

export function NewsCard({
  news,
  variant = 'default',
  showStats = false,
  className = '',
}: NewsCardProps) {
  const { i18n, t } = useTranslation('news');

  if (variant === 'featured') {
    return (
      <Link
        href={`/news/${news.id}`}
        className={`group block h-full ${className}`}
      >
        <div className="relative overflow-hidden rounded-2xl h-full bg-gray-100 dark:bg-dark-surface min-h-[320px] md:min-h-[400px] transition-shadow duration-500 hover:shadow-2xl">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={news.image_url || '/images/news-placeholder.svg'}
              alt={news.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
              className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 via-60% to-black/20" />

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 transition-transform duration-500 group-hover:-translate-y-1">
            {news.article_type && (
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 text-white text-xs font-bold rounded uppercase ${
                  news.article_type === 'NEWS' ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  {news.article_type === 'NEWS' ? t('typeNews') : t('typeAnalytics')}
                </span>
              </div>
            )}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-lg transition-colors duration-300 group-hover:text-[#E5B73B]">
              {news.title}
            </h3>
            <p className="text-white/90 text-sm drop-shadow-md flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatNewsDate(news.publish_date, i18n.language)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/news/${news.id}`}
        className={`group block ${className}`}
      >
        <div className="flex gap-4 p-4 bg-white dark:bg-dark-surface rounded-xl h-full border border-gray-100 dark:border-dark-border transition-all duration-300 hover:bg-gray-50 dark:hover:bg-dark-surface-soft hover:shadow-sm">
          <div className="flex-1 min-w-0 flex flex-col">
            {news.article_type && (
              <div className="mb-1">
                <span className={`px-2 py-0.5 text-white text-xs font-bold rounded uppercase ${
                  news.article_type === 'NEWS' ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  {news.article_type === 'NEWS' ? t('typeNews') : t('typeAnalytics')}
                </span>
              </div>
            )}
            <h3 className="font-semibold text-primary dark:text-accent-cyan leading-snug line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-[#E5B73B]">
              {news.title}
            </h3>
            <div className="mt-auto flex items-center gap-3 text-gray-500 dark:text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatNewsDate(news.publish_date, i18n.language)}
              </span>
              {showStats && news.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {news.views}
                </span>
              )}
            </div>
          </div>
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-shadow duration-300 group-hover:shadow-md">
            <Image
              src={news.image_url || '/images/news-placeholder.svg'}
              alt={news.title}
              width={80}
              height={80}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/news/${news.id}`}
      className={`group block ${className}`}
    >
      <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-border h-full flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={news.image_url || '/images/news-placeholder.svg'}
            alt={news.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {news.article_type && (
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 text-white text-xs font-bold rounded uppercase ${
                news.article_type === 'NEWS' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {news.article_type === 'NEWS' ? t('typeNews') : t('typeAnalytics')}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-primary dark:text-accent-cyan leading-tight mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-[#E5B73B]">
            {news.title}
          </h3>
          {news.excerpt && (
            <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-3 line-clamp-2">
              {news.excerpt}
            </p>
          )}
          <div className="mt-auto flex items-center gap-4 text-gray-500 dark:text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatNewsDate(news.publish_date, i18n.language)}
            </span>
            {showStats && news.views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {news.views}
              </span>
            )}
            {showStats && news.likes !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {news.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
