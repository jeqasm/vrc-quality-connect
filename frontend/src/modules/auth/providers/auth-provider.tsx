import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrentAccount, logout as logoutRequest } from '../api/auth-api';
import { CurrentAccount } from '../model/auth-session';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  storeAccessToken,
} from '../model/auth-storage';

type AuthContextValue = {
  accessToken: string | null;
  account: CurrentAccount | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: { accessToken: string; account: CurrentAccount }) => void;
  setCurrentAccount: (account: CurrentAccount) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());

  const currentAccountQuery = useQuery({
    queryKey: ['auth', 'current-account', accessToken],
    enabled: Boolean(accessToken),
    retry: false,
    queryFn: () => fetchCurrentAccount(accessToken!),
  });

  useEffect(() => {
    if (currentAccountQuery.error) {
      clearStoredAccessToken();
      setAccessToken(null);
      queryClient.removeQueries({ queryKey: ['auth', 'current-account'] });
    }
  }, [currentAccountQuery.error, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      account: currentAccountQuery.data ?? null,
      isLoading: Boolean(accessToken) && currentAccountQuery.isLoading,
      isAuthenticated: Boolean(accessToken && currentAccountQuery.data),
      setSession: (session) => {
        storeAccessToken(session.accessToken);
        setAccessToken(session.accessToken);
        queryClient.setQueryData(['auth', 'current-account', session.accessToken], session.account);
      },
      setCurrentAccount: (account) => {
        if (!accessToken) {
          return;
        }

        queryClient.setQueryData(['auth', 'current-account', accessToken], account);
      },
      logout: async () => {
        const currentToken = accessToken;

        clearStoredAccessToken();
        setAccessToken(null);
        queryClient.removeQueries({ queryKey: ['auth', 'current-account'] });

        if (currentToken) {
          await logoutRequest(currentToken).catch(() => undefined);
        }
      },
    }),
    [accessToken, currentAccountQuery.data, currentAccountQuery.isLoading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
