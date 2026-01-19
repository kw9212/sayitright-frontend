'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStore } from './token';

export type User = {
  id: string;
  email: string;
  username?: string | null;
  creditBalance: number;
  tier?: 'free' | 'premium';
  authProvider: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthStatus = 'loading' | 'guest' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  bootstrap: () => Promise<void>;
  loginLocal: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const setToken = (token: string | null) => {
    setAccessToken(token);

    if (token) {
      tokenStore.setAccessToken(token);
    } else {
      tokenStore.clearAccessToken();
    }
  };

  const fetchMe = async (token: string) => {
    const r = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const newToken = r.headers.get('x-new-access-token');
    if (newToken) {
      setToken(newToken);
    }

    const data = await r.json().catch(() => null);
    return { r, data };
  };

  const bootstrap = async () => {
    setStatus('loading');

    const token = tokenStore.getAccessToken();
    if (token) {
      const { r, data } = await fetchMe(token);
      if (r.ok && data?.ok && data?.data) {
        setUser(data.data);
        setToken(token);
        setStatus('authenticated');
        return;
      }
    }

    const rr = await fetch('/api/auth/refresh', { method: 'POST' });
    const refreshData = await rr.json().catch(() => null);

    if (!rr.ok || !refreshData?.data?.accessToken) {
      setUser(null);
      setToken(null);
      setStatus('guest');
      return;
    }

    const newAccessToken = refreshData.data.accessToken;
    setToken(newAccessToken);

    const { r: r2, data: data2 } = await fetchMe(newAccessToken);
    if (r2.ok && data2?.ok && data2?.data) {
      setUser(data2.data);
      setStatus('authenticated');
      return;
    }

    setUser(null);
    setToken(null);
    setStatus('guest');
  };

  const loginLocal = async ({ email, password }: { email: string; password: string }) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      throw new Error(data?.error?.message ?? '로그인 실패');
    }

    const token = data?.data?.accessToken ?? data?.accessToken;
    if (!token) {
      throw new Error('accessToken이 응답에 없습니다.');
    }

    setToken(token);

    const { r: r2, data: data2 } = await fetchMe(token);
    if (r2.ok && data2?.ok && data2?.data) {
      setUser(data2.data);
      setStatus('authenticated');
      return;
    }

    await bootstrap();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setToken(null);
    setStatus('guest');
  };

  const logoutAll = async () => {
    await fetch('/api/auth/logout-all', { method: 'POST' }).catch(() => {});
    setUser(null);
    setToken(null);
    setStatus('guest');
  };

  const refreshUser = async () => {
    const token = tokenStore.getAccessToken();
    if (!token) {
      return;
    }

    const { r, data } = await fetchMe(token);
    if (r.ok && data?.ok && data?.data) {
      setUser(data.data);
    }
  };

  useEffect(() => {
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      bootstrap,
      loginLocal,
      logout,
      logoutAll,
      refreshUser,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, user, accessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return v;
}
