import {
  getDefaultWallets,
  connectorsForWallets,
  Wallet,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { APP_NAME } from '@/config/constants'
import { chains } from './wagmi'

// Configure wallet options
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!

// Get default wallets
const { wallets } = getDefaultWallets({
  appName: APP_NAME,
  projectId,
})

// Custom wallet list
const customWallets = [
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  ledgerWallet,
].map(wallet => {
  const walletConfig = {
    projectId,
    appName: APP_NAME,
  };
  
  if (wallet === injectedWallet) {
    return wallet;
  }
  return () => wallet(walletConfig);
})

// Configure connectors
export const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: customWallets,
  },
  {
    groupName: 'Popular',
    wallets: customWallets,
  },
], {
  appName: APP_NAME,
  projectId,
})

// RainbowKit theme configuration
export const rainbowKitTheme = {
  lightMode: lightTheme({
    accentColor: '#1976d2', // Primary blue color
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  }),
  darkMode: darkTheme({
    accentColor: '#1976d2',
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  }),
}

// RainbowKit provider props
export const rainbowKitProviderProps = {
  chains,
  initialChain: chains[0], // Default to first chain
  theme: rainbowKitTheme.lightMode,
  coolMode: true, // Enable cool animations
  showRecentTransactions: true,
  appInfo: {
    appName: APP_NAME,
    disclaimer: {
      version: '1.0.0',
      termsUrl: '/terms',
      privacyUrl: '/privacy',
    },
  },
}

// Custom chain icons
export const chainIcons: Record<number, string> = {
  1: '/images/chains/ethereum.svg',
  5: '/images/chains/goerli.svg',
}

// Helper functions
export function getChainIcon(chainId: number): string {
  return chainIcons[chainId] || chainIcons[1] // Default to Ethereum icon
}

// Export configured provider
export { RainbowKitProvider }