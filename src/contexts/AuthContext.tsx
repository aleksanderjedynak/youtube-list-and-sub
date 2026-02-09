import { createContext, useContext } from 'react';
import useAuth, { UseAuthResult } from '@/hooks/useAuth';

const AuthContext = createContext<UseAuthResult | null>(null);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
