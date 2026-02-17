import type { Subscription } from '@/types/youtube';
import { formatNumber } from '@/lib/format';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2 } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  onShowDetails: (sub: Subscription) => void;
  onUnsubscribe: (subscriptionId: string, channelName: string) => void;
  disabled?: boolean;
}

const SubscriptionCard = ({
  subscription,
  onShowDetails,
  onUnsubscribe,
  disabled,
}: SubscriptionCardProps) => {
  const { snippet, statistics } = subscription;

  return (
    <Card
      className="group overflow-hidden transition-all hover:border-primary/50 cursor-pointer"
      onClick={() => onShowDetails(subscription)}
      onAuxClick={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          window.open(
            `https://www.youtube.com/channel/${snippet.resourceId.channelId}`,
            '_blank'
          );
        }
      }}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url}
          alt={snippet.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget;
            // Spróbuj niższą jakość jako fallback
            const fallback = snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url;
            if (fallback && img.src !== fallback) {
              img.src = fallback;
            }
          }}
        />
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate" title={snippet.title}>
          {snippet.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {statistics?.subscriberCount && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {formatNumber(statistics.subscriberCount)} sub
            </Badge>
          )}
          {statistics?.videoCount && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {formatNumber(statistics.videoCount)} filmów
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            window.open(
              `https://www.youtube.com/channel/${snippet.resourceId.channelId}`,
              '_blank'
            );
          }}
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          Kanał
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onUnsubscribe(subscription.id, snippet.title);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;
