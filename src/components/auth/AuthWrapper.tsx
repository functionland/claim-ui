'use client'

import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import { EmailGate } from './EmailGate';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useEmailAuth();

  // Load development utilities in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/utils/devUtils');
    }
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Show email gate if not authenticated
  if (!isAuthenticated) {
    return <EmailGate />;
  }

  // Show main content if authenticated
  return <>{children}</>;
}
