import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Subscription, ChannelDetails } from '@/types/youtube';
import { formatNumber } from '@/lib/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Film, Eye, Calendar } from 'lucide-react';

interface ChannelDetailDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onClose: () => void;
}

const ChannelDetailDialog = ({
  subscription,
  open,
  onClose,
}: ChannelDetailDialogProps) => {
  const auth = useAuthContext();
  const [details, setDetails] = useState<ChannelDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subscription || !open) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${subscription.snippet.resourceId.channelId}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.items?.[0]) {
          setDetails(data.items[0]);
        }
      } catch (error) {
        console.error('Błąd pobierania szczegółów kanału:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [subscription, open, auth?.accessToken]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full rounded-md" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            ) : details ? (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={details.snippet.thumbnails.high?.url}
                        alt={details.snippet.title}
                      />
                      <AvatarFallback className="text-lg">
                        {details.snippet.title[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">
                        {details.snippet.title}
                      </DialogTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        Od{' '}
                        {new Date(
                          details.snippet.publishedAt
                        ).toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                {/* Banner */}
                {details.brandingSettings?.image?.bannerExternalUrl && (
                  <img
                    src={details.brandingSettings.image.bannerExternalUrl}
                    alt="Baner kanału"
                    className="w-full h-32 object-cover rounded-lg mt-4"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Statystyki */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xl font-bold">
                        {formatNumber(details.statistics.subscriberCount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Subskrybentów
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Film className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xl font-bold">
                        {formatNumber(details.statistics.videoCount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Filmów
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xl font-bold">
                        {formatNumber(details.statistics.viewCount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Wyświetleń
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Separator className="my-4" />

                {/* Opis */}
                {details.snippet.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {details.snippet.description}
                  </p>
                )}
              </>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelDetailDialog;
