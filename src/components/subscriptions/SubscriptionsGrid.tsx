import { useState, useMemo } from 'react';
import { useSubscriptionsContext } from '@/contexts/SubscriptionsContext';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Subscription } from '@/types/youtube';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionFilters from './SubscriptionFilters';
import ChannelDetailDialog from './ChannelDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, Loader2 } from 'lucide-react';

interface SubscriptionsGridProps {
  globalSearch: string;
}

const SubscriptionCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
    <div className="p-3 pt-0 flex gap-2">
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 w-8" />
    </div>
  </Card>
);

const SubscriptionsGrid = ({ globalSearch }: SubscriptionsGridProps) => {
  const {
    subscriptions,
    isLoading,
    subscriptionCount,
    fetchSubscriptions,
  } = useSubscriptionsContext();
  const auth = useAuthContext();

  const [localSearch, setLocalSearch] = useState('');
  const [sortCriteria, setSortCriteria] = useState('default');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [unsubscribingChannel, setUnsubscribingChannel] = useState<string | null>(null);

  // Połącz wyszukiwanie globalne (z headera) i lokalne
  const searchQuery = globalSearch || localSearch;

  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    // Filtrowanie
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((sub) =>
        sub.snippet.title.toLowerCase().includes(query)
      );
    }

    // Sortowanie
    result.sort((a, b) => {
      switch (sortCriteria) {
        case 'name':
          return a.snippet.title.localeCompare(b.snippet.title);
        case 'date':
          return (
            new Date(a.snippet.publishedAt).getTime() -
            new Date(b.snippet.publishedAt).getTime()
          );
        case 'subscribers': {
          const aSub = parseInt(a.statistics?.subscriberCount || '0', 10);
          const bSub = parseInt(b.statistics?.subscriberCount || '0', 10);
          return bSub - aSub;
        }
        case 'videos': {
          const aVid = parseInt(a.statistics?.videoCount || '0', 10);
          const bVid = parseInt(b.statistics?.videoCount || '0', 10);
          return bVid - aVid;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [subscriptions, searchQuery, sortCriteria]);

  const handleRefresh = async () => {
    // Wyczyść cache żeby wymusić ponowne pobranie
    sessionStorage.removeItem('yt_subscriptions_cache');
    await fetchSubscriptions();
  };

  const handleUnsubscribe = async (subscriptionId: string, channelName: string) => {
    setUnsubscribingChannel(channelName);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/subscriptions?id=${subscriptionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status} ${response.statusText}`);
      }
      // Wyczyść cache i odśwież
      sessionStorage.removeItem('yt_subscriptions_cache');
      await fetchSubscriptions();
    } catch (error) {
      console.error('Nie udało się odsubskrybować:', error);
    } finally {
      setUnsubscribingChannel(null);
    }
  };

  return (
    <div>
      {/* Nagłówek */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Tv className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subskrypcje</h1>
          <p className="text-sm text-muted-foreground">
            {subscriptionCount} kanałów
            {searchQuery && (
              <>
                {' '}
                · <Badge variant="secondary" className="text-xs">{filteredSubscriptions.length} wyników</Badge>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Filtry */}
      <SubscriptionFilters
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        sortCriteria={sortCriteria}
        onSortChange={setSortCriteria}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Grid */}
      <div className="relative">
        {unsubscribingChannel && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3 p-6 bg-card border rounded-lg shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">
                Usuwanie subskrypcji <span className="text-primary">{unsubscribingChannel}</span>...
              </p>
              <p className="text-xs text-muted-foreground">Pobieranie zaktualizowanej listy</p>
            </div>
          </div>
        )}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 ${unsubscribingChannel ? 'pointer-events-none opacity-50' : ''}`}>
          {isLoading && subscriptions.length === 0
            ? Array.from({ length: 12 }).map((_, i) => (
                <SubscriptionCardSkeleton key={i} />
              ))
            : filteredSubscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onShowDetails={setSelectedSub}
                  onUnsubscribe={handleUnsubscribe}
                  disabled={!!unsubscribingChannel}
                />
              ))}
        </div>
      </div>

      {!isLoading && filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <Tv className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Brak wyników dla tego wyszukiwania'
              : 'Brak subskrypcji do wyświetlenia'}
          </p>
        </div>
      )}

      {/* Dialog szczegółów */}
      <ChannelDetailDialog
        subscription={selectedSub}
        open={!!selectedSub}
        onClose={() => setSelectedSub(null)}
      />
    </div>
  );
};

export default SubscriptionsGrid;
