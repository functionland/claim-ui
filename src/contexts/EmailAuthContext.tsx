'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCachedEmail, setCachedEmail, clearCachedEmail } from '@/utils/emailAuth';

interface EmailAuthContextType {
  isAuthenticated: boolean;
  authenticatedEmail: string | null;
  isLoading: boolean;
  authenticate: (email: string) => void;
  logout: () => void;
}

const EmailAuthContext = createContext<EmailAuthContextType | undefined>(undefined);

export function useEmailAuth() {
  const context = useContext(EmailAuthContext);
  if (context === undefined) {
    throw new Error('useEmailAuth must be used within an EmailAuthProvider');
  }
  return context;
}

interface EmailAuthProviderProps {
  children: ReactNode;
}

export function EmailAuthProvider({ children }: EmailAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for cached email on mount
    const cachedEmail = getCachedEmail();
    if (cachedEmail) {
      setIsAuthenticated(true);
      setAuthenticatedEmail(cachedEmail);
    }
    setIsLoading(false);
  }, []);

  const authenticate = (email: string) => {
    setCachedEmail(email);
    setIsAuthenticated(true);
    setAuthenticatedEmail(email);
  };

  const logout = () => {
    clearCachedEmail();
    setIsAuthenticated(false);
    setAuthenticatedEmail(null);
  };

  const value: EmailAuthContextType = {
    isAuthenticated,
    authenticatedEmail,
    isLoading,
    authenticate,
    logout,
  };

  return (
    <EmailAuthContext.Provider value={value}>
      {children}
    </EmailAuthContext.Provider>
  );
}
