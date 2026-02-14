import { useState, useMemo } from 'react';
import { useSubscriptionsContext } from '@/contexts/SubscriptionsContext';
import type { Channel } from '@/types/youtube';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface ChannelPickerDialogProps {
  open: boolean;
  onClose: () => void;
  listName: string;
  selectedChannels: Channel[];
  onToggleChannel: (channel: Channel) => void;
}

const ChannelPickerDialog = ({
  open,
  onClose,
  listName,
  selectedChannels,
  onToggleChannel,
}: ChannelPickerDialogProps) => {
  const { subscriptions } = useSubscriptionsContext();
  const [search, setSearch] = useState('');

  const filteredSubs = useMemo(() => {
    if (!search) return subscriptions;
    const query = search.toLowerCase();
    return subscriptions.filter((sub) =>
      sub.snippet.title.toLowerCase().includes(query)
    );
  }, [subscriptions, search]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Dodaj kanały do "{listName}"</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj kanałów..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[50vh] -mx-2">
          <div className="space-y-1 px-2">
            {filteredSubs.map((sub) => {
              const isSelected = selectedChannels.some(
                (c) => c.id === sub.id
              );
              return (
                <button
                  key={sub.id}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left"
                  onClick={() => onToggleChannel(sub as Channel)}
                >
                  <Checkbox checked={isSelected} />
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={sub.snippet.thumbnails.default?.url}
                      alt={sub.snippet.title}
                    />
                    <AvatarFallback className="text-xs">
                      {sub.snippet.title[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">{sub.snippet.title}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Gotowe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelPickerDialog;
