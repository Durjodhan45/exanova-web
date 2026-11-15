import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthResponse, User, UserRole } from '../types';
import { authService } from '../services/auth.service';
import {
  clearStoredAuth,
  REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const token =
      localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authService.getMe();
      setUser(me);
      // update stored user
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      } else {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      }
    } catch {
      clearStoredAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    const handleUnauthorized = () => {
      clearStoredAuth();
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [initAuth]);

  const login = async (
    identifier: string,
    password: string,
    rememberMe = false,
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const authData: AuthResponse = await authService.login(identifier, password);
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem(TOKEN_STORAGE_KEY, authData.accessToken);
      if (authData.refreshToken) {
        storage.setItem(REFRESH_TOKEN_STORAGE_KEY, authData.refreshToken);
      }

      // Fetch full profile (includes student/faculty specifics)
      let fullProfile: User;
      try {
        fullProfile = await authService.getMe();
      } catch {
        fullProfile = {
          id: authData.user.id,
          username: authData.user.username,
          email: authData.user.email,
          role: authData.user.role,
          status: 'ACTIVE' as any,
          mustChangePassword: authData.user.mustChangePassword,
        };
      }

      storage.setItem(USER_STORAGE_KEY, JSON.stringify(fullProfile));
      setUser(fullProfile);
      return fullProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearStoredAuth();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const me = await authService.getMe();
      setUser(me);
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      } else {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      }
    } catch {
      // ignore
    }
  };

  const role = user?.role || null;
  const isAuthenticated = !!user;
  const mustChangePassword = !!user?.mustChangePassword;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        mustChangePassword,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
