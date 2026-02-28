import useSWR from 'swr';
import { NewsArticle } from '@/types';
import { newsService } from '@/lib/api/services/newsService';

export function useMatchNews(matchId: number | null, lang: string) {
  const { data, isLoading } = useSWR<NewsArticle[]>(
    matchId ? ['match-news', matchId, lang] : null,
    () => newsService.getByMatch(matchId!, lang),
  );
  return { news: data ?? [], loading: isLoading };
}
