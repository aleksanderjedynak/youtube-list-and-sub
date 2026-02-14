import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Search } from 'lucide-react';

interface SubscriptionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortCriteria: string;
  onSortChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const SubscriptionFilters = ({
  searchQuery,
  onSearchChange,
  sortCriteria,
  onSortChange,
  onRefresh,
  isLoading,
}: SubscriptionFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj subskrypcji..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={sortCriteria} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Sortuj według..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Domyślnie</SelectItem>
          <SelectItem value="name">Nazwa</SelectItem>
          <SelectItem value="date">Data subskrypcji</SelectItem>
          <SelectItem value="subscribers">Subskrybenci</SelectItem>
          <SelectItem value="videos">Liczba filmów</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        className="shrink-0"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default SubscriptionFilters;
