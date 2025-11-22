'use client';

/**
 * Authentication Context
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { IUserResponse, ITenantResponse } from '@/../../shared/types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: IUserResponse | null;
  tenant: ITenantResponse | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: IUserResponse, tenant: ITenantResponse | null) => void;
  logout: () => void;
  updateUser: (user: IUserResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'academy_access_token';
const USER_KEY = 'academy_user';
const TENANT_KEY = 'academy_tenant';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserResponse | null>(null);
  const [tenant, setTenant] = useState<ITenantResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        const tenantStr = localStorage.getItem(TENANT_KEY);

        if (token && userStr) {
          setAccessToken(token);
          setUser(JSON.parse(userStr));
          if (tenantStr) {
            setTenant(JSON.parse(tenantStr));
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear corrupted data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TENANT_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Verify token validity on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (accessToken) {
        try {
          const profile = await authService.getProfile(accessToken);
          setUser(profile.user);
          setTenant(profile.tenant);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid, clear auth state
          logout();
        }
      }
    };

    if (accessToken && !isLoading) {
      verifyToken();
    }
  }, []); // Only run once on mount

  const login = (token: string, user: IUserResponse, tenant: ITenantResponse | null) => {
    setAccessToken(token);
    setUser(user);
    setTenant(tenant);

    // Persist to localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (tenant) {
      localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    setTenant(null);

    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TENANT_KEY);

    // Redirect to login
    router.push('/login');
  };

  const updateUser = (updatedUser: IUserResponse) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    tenant,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
