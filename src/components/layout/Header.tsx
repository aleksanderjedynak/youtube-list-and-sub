import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu, Search, User } from 'lucide-react';
import Sidebar, { type ActiveView } from './Sidebar';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

const Header = ({
  searchQuery,
  onSearchChange,
  activeView,
  onNavigate,
}: HeaderProps) => {
  const auth = useAuthContext();
  const userInfo = auth?.userInfo;

  return (
    <header className="border-b border-border px-4 md:px-6 py-3 flex items-center gap-4">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar activeView={activeView} onNavigate={onNavigate} />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj kanałów..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* User dropdown */}
      {userInfo && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={userInfo.picture} alt={userInfo.name} />
                <AvatarFallback>
                  {userInfo.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userInfo.name}</p>
                <p className="text-xs text-muted-foreground">
                  {userInfo.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              ID: {userInfo.id}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={auth?.handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default Header;
