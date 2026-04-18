import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, AuthState } from '../types';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<Usuario | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('hip_user');
    const t = localStorage.getItem('hip_token');
    if (u && t) { setUser(JSON.parse(u)); setToken(t); }
    setLoading(false);
  }, []);

  function login(userData: Usuario, accessToken: string) {
    setUser(userData); setToken(accessToken);
    localStorage.setItem('hip_user',  JSON.stringify(userData));
    localStorage.setItem('hip_token', accessToken);
  }

  function logout() {
    setUser(null); setToken(null);
    localStorage.removeItem('hip_user');
    localStorage.removeItem('hip_token');
  }

  return (
    <AuthContext.Provider value={{
      user, token,
      isAdmin: user?.rol === 'ADMIN',
      isAuth:  !!token,
      loading, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
