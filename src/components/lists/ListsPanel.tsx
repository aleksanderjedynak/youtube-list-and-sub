import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import useChannelLists from '@/hooks/useChannelLists';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Folder, List } from 'lucide-react';

interface ListsPanelProps {
  onOpenList: (listName: string) => void;
}

const ListsPanel = ({ onOpenList }: ListsPanelProps) => {
  const { lists, createList, deleteList } = useChannelLists();
  const [listName, setListName] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value.replace(/\s+/g, '-').slice(0, 64);
    setListName(value);
  };

  const handleCreate = (): void => {
    if (listName.length >= 3) {
      createList(listName);
      setListName('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div>
      {/* Nagłówek */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <List className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moje listy</h1>
          <p className="text-sm text-muted-foreground">
            {Object.keys(lists).length} list
          </p>
        </div>
      </div>

      {/* Tworzenie nowej listy */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Nazwa nowej listy (min. 3 znaki)..."
              value={listName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleCreate} disabled={listName.length < 3}>
              <Plus className="mr-2 h-4 w-4" />
              Utwórz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Siatka list */}
      {Object.keys(lists).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(lists).map(([name, channels]) => (
            <Card
              key={name}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => onOpenList(name)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="truncate">{name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <Badge variant="secondary">
                  {channels.length} kanałów
                </Badge>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenList(name);
                  }}
                >
                  Otwórz
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList(name);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Nie masz jeszcze żadnych list
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Utwórz pierwszą listę powyżej
          </p>
        </div>
      )}
    </div>
  );
};

export default ListsPanel;
