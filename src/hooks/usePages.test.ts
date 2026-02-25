import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useContactsPage, useDocumentsPage, useLeadershipPage } from './usePages';

const swrMockFn = vi.fn();
const getLeadershipPageMock = vi.fn();
const getContactsPageMock = vi.fn();
const getDocumentsPageMock = vi.fn();

vi.mock('swr', () => ({
  default: (...args: unknown[]) => swrMockFn(...args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en-US' },
  }),
}));

vi.mock('@/contexts/RoutePrefetchContext', () => ({
  useRoutePrefetchValue: () => undefined,
}));

vi.mock('@/lib/api/services', () => ({
  pagesService: {
    getLeadershipPage: (...args: unknown[]) => getLeadershipPageMock(...args),
    getContactsPage: (...args: unknown[]) => getContactsPageMock(...args),
    getDocumentsPage: (...args: unknown[]) => getDocumentsPageMock(...args),
  },
}));

describe('usePages language fallback', () => {
  beforeEach(() => {
    swrMockFn.mockReset();
    getLeadershipPageMock.mockReset();
    getContactsPageMock.mockReset();
    getDocumentsPageMock.mockReset();

    swrMockFn.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });
  });

  it('falls back to kz in useLeadershipPage when i18n language is unsupported', async () => {
    useLeadershipPage();

    expect(swrMockFn).toHaveBeenCalledWith(
      ['/pages', 'leadership', 'kz'],
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false }),
    );

    const fetcher = swrMockFn.mock.calls[0]?.[1] as () => unknown;
    await fetcher();
    expect(getLeadershipPageMock).toHaveBeenCalledWith('kz');
  });

  it('falls back to kz in useContactsPage when i18n language is unsupported', async () => {
    useContactsPage();

    expect(swrMockFn).toHaveBeenCalledWith(
      ['/pages', 'contacts', 'kz'],
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false }),
    );

    const fetcher = swrMockFn.mock.calls[0]?.[1] as () => unknown;
    await fetcher();
    expect(getContactsPageMock).toHaveBeenCalledWith('kz');
  });

  it('falls back to kz in useDocumentsPage when i18n language is unsupported', async () => {
    useDocumentsPage();

    expect(swrMockFn).toHaveBeenCalledWith(
      ['/pages', 'documents', 'kz'],
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false }),
    );

    const fetcher = swrMockFn.mock.calls[0]?.[1] as () => unknown;
    await fetcher();
    expect(getDocumentsPageMock).toHaveBeenCalledWith('kz');
  });
});

