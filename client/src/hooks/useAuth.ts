import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { authApi, tokenStorage, type AuthResponse } from '../services/api';

interface AuthState {
  user: AuthResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      tokenStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    const profile = await authApi.login({ email, password });
    setUser(profile);
  };

  const signup = async (email: string, password: string) => {
    await authApi.signup({ email, password });
    // Auto-login after signup
    await login(email, password);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return { user, loading, login, signup, logout };
}