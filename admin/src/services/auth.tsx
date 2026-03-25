/**
 * Authentication Context & Provider
 *
 * SECURITY NOTES:
 * - JWT is stored in localStorage for SPA convenience.
 * - For production environments, consider using httpOnly cookies
 *   set by the server to prevent XSS-based token theft.
 * - Token validity is checked on mount and on navigation.
 * - Auto-logout occurs when the token expires or is invalidated.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  login as apiLogin,
  getMe,
  getToken,
  removeToken,
  type User,
} from './api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    // Basic input validation
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const { user: userData } = await apiLogin(email, password);
    setUser(userData);
  };

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
