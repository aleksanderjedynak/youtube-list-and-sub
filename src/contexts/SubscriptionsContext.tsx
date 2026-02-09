import { createContext, useContext, useEffect } from 'react';
import useSubscriptions, {
  UseSubscriptionsResult,
} from '@/hooks/useSubscriptions';
import { useAuthContext } from '@/contexts/AuthContext';

const SubscriptionsContext = createContext<UseSubscriptionsResult | null>(null);

export const SubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuthContext();
  const accessToken = auth?.accessToken || null;
  const subs = useSubscriptions(accessToken);

  // Fetch subskrypcji raz po zalogowaniu
  useEffect(() => {
    if (accessToken) {
      subs.fetchSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <SubscriptionsContext.Provider value={subs}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptionsContext = (): UseSubscriptionsResult => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      'useSubscriptionsContext musi być użyty wewnątrz SubscriptionsProvider'
    );
  }
  return context;
};
