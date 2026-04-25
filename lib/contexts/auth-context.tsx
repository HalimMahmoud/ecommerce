'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { getMeAction, logoutAction } from '@/lib/auth/actions';
import type { AuthUser } from '@/lib/auth/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const prevPathRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await getMeAction());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await logoutAction();
  }, []);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = pathname;

    // Always fetch on first mount
    if (!initializedRef.current) {
      initializedRef.current = true;
      void refresh();
      return;
    }

    // Re-fetch only when crossing the auth boundary (login/logout redirects)
    const wasOnAuth = prevPath?.startsWith('/auth') ?? false;
    const isOnAuth = pathname?.startsWith('/auth') ?? false;
    if (wasOnAuth !== isOnAuth) {
      void refresh();
    }
  }, [pathname, refresh]);

  const value = useMemo(
    () => ({ user, loading, refresh, logout, isAuthenticated: !!user }),
    [user, loading, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

