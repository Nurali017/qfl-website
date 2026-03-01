import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { newsService } from '@/lib/api/services';
import { queryKeys } from '@/lib/api/queryKeys';

interface ArticleTypeCounts {
  NEWS: number;
  ANALYTICS: number;
}

interface UseArticleTypeCountsResult {
  counts: ArticleTypeCounts;
  loading: boolean;
}

export function useArticleTypeCounts(championshipCode?: string): UseArticleTypeCountsResult {
  const { i18n } = useTranslation();

  const { data, isLoading } = useSWR(
    queryKeys.news.articleTypeCounts(i18n.language, championshipCode),
    () => newsService.getArticleTypeCounts(i18n.language, championshipCode),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    counts: {
      NEWS: data?.NEWS ?? 0,
      ANALYTICS: data?.ANALYTICS ?? 0,
    },
    loading: isLoading,
  };
}
