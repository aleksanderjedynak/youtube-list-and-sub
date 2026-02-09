import { useState, useCallback } from 'react';
import type { Subscription } from '@/types/youtube';

const SUBSCRIPTIONS_API =
  'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50';
const CHANNELS_API =
  'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=';

const CACHE_KEY = 'yt_subscriptions_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minut

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

interface CachedData {
  data: Subscription[];
  timestamp: number;
}

function getCachedSubscriptions(): Subscription[] | null {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  try {
    const { data, timestamp }: CachedData = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  } catch {
    // Nieprawidłowy cache
  }
  sessionStorage.removeItem(CACHE_KEY);
  return null;
}

function setCachedSubscriptions(data: Subscription[]): void {
  sessionStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ data, timestamp: Date.now() })
  );
}

export interface UseSubscriptionsResult {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  subscriptionCount: number;
  fetchSubscriptions: () => Promise<void>;
}

const useSubscriptions = (
  accessToken: string | null
): UseSubscriptionsResult => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    return getCachedSubscriptions() || [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Batch: pobierz szczegóły kanałów po 50 na raz
  const fetchChannelDetailsBatch = useCallback(
    async (
      channelIds: string[]
    ): Promise<Map<string, { statistics: Subscription['statistics']; thumbnails?: Subscription['snippet']['thumbnails'] }>> => {
      const results = new Map<
        string,
        { statistics: Subscription['statistics']; thumbnails?: Subscription['snippet']['thumbnails'] }
      >();
      if (!accessToken) return results;

      const chunks = chunkArray(channelIds, 50);
      for (const chunk of chunks) {
        const ids = chunk.join(',');
        const response = await fetch(`${CHANNELS_API}${ids}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) continue;
        const data = await response.json();
        for (const item of data.items || []) {
          results.set(item.id, {
            statistics: item.statistics,
            thumbnails: item.snippet?.thumbnails,
          });
        }
      }
      return results;
    },
    [accessToken]
  );

  const fetchSubscriptions = useCallback(async () => {
    if (!accessToken) return;

    // Sprawdź cache
    const cached = getCachedSubscriptions();
    if (cached && cached.length > 0) {
      setSubscriptions(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Krok 1: Pobierz wszystkie subskrypcje (paginacja)
      const allSubs: Subscription[] = [];
      let nextPageToken: string | null = null;

      do {
        const url: string = nextPageToken
          ? `${SUBSCRIPTIONS_API}&pageToken=${nextPageToken}`
          : SUBSCRIPTIONS_API;

        const response: Response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Błąd API: ${response.status} ${response.statusText}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await response.json();
        allSubs.push(...(data.items || []));
        nextPageToken = data.nextPageToken || null;
      } while (nextPageToken);

      // Krok 2: Batch - pobierz statystyki kanałów
      const channelIds = allSubs.map(
        (sub) => sub.snippet.resourceId.channelId
      );
      const detailsMap = await fetchChannelDetailsBatch(channelIds);

      // Krok 3: Połącz dane
      const enrichedSubs = allSubs.map((sub) => {
        const details = detailsMap.get(sub.snippet.resourceId.channelId);
        return {
          ...sub,
          snippet: {
            ...sub.snippet,
            // Miniaturki z Channels API są bardziej aktualne niż z Subscriptions API
            thumbnails: details?.thumbnails || sub.snippet.thumbnails,
          },
          statistics: details?.statistics,
        };
      });

      setSubscriptions(enrichedSubs);
      setCachedSubscriptions(enrichedSubs);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nie udało się pobrać subskrypcji';
      setError(message);
      console.error('Błąd pobierania subskrypcji:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, fetchChannelDetailsBatch]);

  return {
    subscriptions,
    isLoading,
    error,
    subscriptionCount: subscriptions.length,
    fetchSubscriptions,
  };
};

export default useSubscriptions;
