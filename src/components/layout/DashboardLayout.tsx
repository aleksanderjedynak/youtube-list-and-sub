import { useState } from 'react';
import Sidebar, { type ActiveView } from './Sidebar';
import Header from './Header';
import SubscriptionsGrid from '@/components/subscriptions/SubscriptionsGrid';
import ListsPanel from '@/components/lists/ListsPanel';
import ListDetail from '@/components/lists/ListDetail';
import { ScrollArea } from '@/components/ui/scroll-area';

const DashboardLayout = () => {
  const [activeView, setActiveView] = useState<ActiveView>({
    type: 'subscriptions',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - stały na desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border">
        <Sidebar activeView={activeView} onNavigate={handleNavigate} />
      </aside>

      {/* Główna część */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeView={activeView}
          onNavigate={handleNavigate}
        />
        <ScrollArea className="flex-1">
          <div className="p-6">
            {activeView.type === 'subscriptions' && (
              <SubscriptionsGrid globalSearch={searchQuery} />
            )}
            {activeView.type === 'lists' && (
              <ListsPanel
                onOpenList={(name) =>
                  handleNavigate({ type: 'list-detail', listName: name })
                }
              />
            )}
            {activeView.type === 'list-detail' && (
              <ListDetail
                listName={activeView.listName}
                onBack={() => handleNavigate({ type: 'lists' })}
              />
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default DashboardLayout;
