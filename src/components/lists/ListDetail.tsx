import { useState } from 'react';
import useChannelLists from '@/hooks/useChannelLists';
import type { Channel } from '@/types/youtube';
import ChannelPickerDialog from './ChannelPickerDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Folder } from 'lucide-react';

interface ListDetailProps {
  listName: string;
  onBack: () => void;
}

const ListDetail = ({ listName, onBack }: ListDetailProps) => {
  const { lists, toggleChannelInList } = useChannelLists();
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedChannels: Channel[] = lists[listName] || [];

  return (
    <div>
      {/* Nagłówek */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wstecz
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{listName}</h1>
              <p className="text-sm text-muted-foreground">
                {selectedChannels.length} kanałów
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setPickerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj kanały
        </Button>
      </div>

      {/* Lista kanałów */}
      {selectedChannels.length > 0 ? (
        <div className="space-y-2">
          {selectedChannels.map((channel) => (
            <Card
              key={channel.id}
              className="flex items-center p-3 gap-3"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={channel.snippet?.thumbnails?.default?.url}
                  alt={channel.snippet?.title}
                />
                <AvatarFallback>
                  {channel.snippet?.title?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {channel.snippet?.title}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                Kanał
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => toggleChannelInList(listName, channel)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">
            Ta lista jest pusta
          </p>
          <Button onClick={() => setPickerOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj pierwszy kanał
          </Button>
        </div>
      )}

      {/* Dialog wyboru kanałów */}
      <ChannelPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        listName={listName}
        selectedChannels={selectedChannels}
        onToggleChannel={(channel) => toggleChannelInList(listName, channel)}
      />
    </div>
  );
};

export default ListDetail;
