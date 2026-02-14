import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscriptionsContext } from '@/contexts/SubscriptionsContext';
import useChannelLists from '@/hooks/useChannelLists';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tv,
  List,
  Folder,
  LogOut,
  Youtube,
} from 'lucide-react';
import { APP_VERSION } from '@/version';

type ActiveView =
  | { type: 'subscriptions' }
  | { type: 'lists' }
  | { type: 'list-detail'; listName: string };

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

const Sidebar = ({ activeView, onNavigate }: SidebarProps) => {
  const auth = useAuthContext();
  const { subscriptionCount } = useSubscriptionsContext();
  const { lists, getListCount } = useChannelLists();

  if (!auth?.userInfo) return null;

  const { userInfo, handleLogout } = auth;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
          <Youtube className="h-5 w-5 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight">
          YT List Manager
        </span>
      </div>

      <Separator />

      {/* User */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={userInfo.picture} alt={userInfo.name} />
          <AvatarFallback>{userInfo.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{userInfo.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {userInfo.email}
          </p>
        </div>
      </div>

      <Separator />

      {/* Nawigacja */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          <Button
            variant={activeView.type === 'subscriptions' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onNavigate({ type: 'subscriptions' })}
          >
            <Tv className="mr-2 h-4 w-4" />
            Subskrypcje
            <Badge variant="secondary" className="ml-auto text-xs">
              {subscriptionCount}
            </Badge>
          </Button>

          <Button
            variant={activeView.type === 'lists' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onNavigate({ type: 'lists' })}
          >
            <List className="mr-2 h-4 w-4" />
            Moje listy
            <Badge variant="secondary" className="ml-auto text-xs">
              {getListCount()}
            </Badge>
          </Button>

          {Object.keys(lists).length > 0 && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground px-3 py-1 uppercase tracking-wider">
                Twoje listy
              </p>
              {Object.entries(lists).map(([name, channels]) => (
                <Button
                  key={name}
                  variant={
                    activeView.type === 'list-detail' &&
                    activeView.listName === name
                      ? 'secondary'
                      : 'ghost'
                  }
                  className="w-full justify-start text-sm"
                  onClick={() =>
                    onNavigate({ type: 'list-detail', listName: name })
                  }
                >
                  <Folder className="mr-2 h-4 w-4" />
                  <span className="truncate">{name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {channels.length}
                  </Badge>
                </Button>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Wyloguj
        </Button>
        <p className="text-[10px] text-muted-foreground px-3">v{APP_VERSION}</p>
      </div>
    </div>
  );
};

export default Sidebar;
export type { ActiveView };
