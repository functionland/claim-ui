'use client'

import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { config, chains } from '@/lib/wagmi'
import type { ReactNode, FC } from 'react'

const materialTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

interface ProvidersProps {
  readonly children: ReactNode
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <ThemeProvider theme={materialTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  )
}
