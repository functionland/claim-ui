'use client'

import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { config } from '@/lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContractProvider } from '@/contexts/ContractContext'
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext'
import { EmailAuthProvider } from '@/contexts/EmailAuthContext'

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useThemeContext();
  
  const materialTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: isDarkMode ? '#121212' : '#fff',
        paper: isDarkMode ? '#1e1e1e' : '#fff',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDarkMode ? '#121212' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={materialTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider>
            <ThemedApp>
              <EmailAuthProvider>
                <ContractProvider>
                  {children}
                </ContractProvider>
              </EmailAuthProvider>
            </ThemedApp>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
