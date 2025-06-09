'use client'

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import { isValidEmail, validateEmailWithServer } from '@/utils/emailAuth';

export function EmailGate() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const { authenticate } = useEmailAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await validateEmailWithServer(email.toLowerCase());
      
      if (isValid) {
        authenticate(email.toLowerCase());
      } else {
        setError('Your email is not in the whitelisted emails. Please contact hi@fx.land');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.default,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `linear-gradient(to bottom, ${
        isDarkMode 
          ? 'rgba(18, 18, 18, 0.8), rgba(45, 45, 45, 0.9)'
          : 'rgba(243, 244, 246, 0.8), rgba(255, 255, 255, 0.9)'
      })`
    }}>
      <Container maxWidth="sm">
        <Paper sx={{ 
          p: 6,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[8],
          borderRadius: 3
        }}>
          <Stack spacing={4} alignItems="center">
            {/* Logo */}
            <Box sx={{ position: 'relative', width: 80, height: 80 }}>
              <Image
                src="/images/logo.png"
                alt="Logo"
                style={{ objectFit: 'contain' }}
                unoptimized
                width={80}
                height={80}
              />
            </Box>

            {/* Title */}
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                textAlign: 'center',
                background: isDarkMode
                  ? 'linear-gradient(to right, #90caf9, #42a5f5)'
                  : 'linear-gradient(to right, #1976d2, #64b5f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Access Portal
            </Typography>

            {/* Subtitle */}
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.text.secondary,
                textAlign: 'center',
                maxWidth: 400
              }}
            >
              Enter your email address to access the portal
            </Typography>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: isDarkMode
                      ? 'linear-gradient(to right, #1976d2, #42a5f5)'
                      : 'linear-gradient(to right, #1976d2, #64b5f6)',
                    '&:hover': {
                      background: isDarkMode
                        ? 'linear-gradient(to right, #1565c0, #1976d2)'
                        : 'linear-gradient(to right, #1565c0, #1976d2)',
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Access Portal'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Contact info */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                textAlign: 'center',
                mt: 2
              }}
            >
              Need access? Contact{' '}
              <Box 
                component="span" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}
              >
                hi@fx.land
              </Box>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
