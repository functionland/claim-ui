import type { Chain } from 'viem'
import { mainnet, goerli } from 'wagmi/chains'
import { RPC_URLS } from './contracts'

// Custom chain configurations
export const customMainnet: Chain = {
  ...mainnet,
  rpcUrls: {
    ...mainnet.rpcUrls,
    default: {
      http: [RPC_URLS.mainnet],
    },
    public: {
      http: [RPC_URLS.mainnet],
    },
  },
}

export const customGoerli: Chain = {
  ...goerli,
  rpcUrls: {
    ...goerli.rpcUrls,
    default: {
      http: [RPC_URLS.goerli],
    },
    public: {
      http: [RPC_URLS.goerli],
    },
  },
}

// Supported chains configuration
export const supportedChains = [customMainnet, customGoerli] as const

// Chain configuration for wagmi
export const wagmiChains = supportedChains.map(chain => ({
  ...chain,
  iconUrl: `https://raw.githubusercontent.com/ethereum/ethereum-org-website/dev/src/assets/eth-logo.svg`,
}))

// Chain IDs
export const CHAIN_IDS = {
  MAINNET: 1,
  GOERLI: 5,
} as const

// Network names mapping
export const NETWORK_NAMES: Record<number, string> = {
  [CHAIN_IDS.MAINNET]: 'Ethereum Mainnet',
  [CHAIN_IDS.GOERLI]: 'Goerli Testnet',
} as const

// Block explorers
export const BLOCK_EXPLORERS: Record<number, string> = {
  [CHAIN_IDS.MAINNET]: 'https://etherscan.io',
  [CHAIN_IDS.GOERLI]: 'https://goerli.etherscan.io',
} as const

// Helper functions
export const getExplorerUrl = (chainId: number, hash: string, type: 'tx' | 'address' = 'tx') => {
  const baseUrl = BLOCK_EXPLORERS[chainId]
  return `${baseUrl}/${type}/${hash}`
}

export const isSupported = (chainId: number): boolean => {
  return Object.values(CHAIN_IDS).includes(chainId as 1 | 5)
}

export const getNetworkName = (chainId: number): string => {
  return NETWORK_NAMES[chainId] || 'Unknown Network'
}


export const hardhat: Chain = {
    id: 31337,
    name: 'Hardhat',
    nativeCurrency: {
      decimals: 18,
      name: 'Placeholder Token',
      symbol: 'PLACEHOLDER',
    },
    rpcUrls: {
      default: {
        http: ['http://127.0.0.1:8545'],
      },
      public: {
        http: ['http://127.0.0.1:8545'],
      },
    },
    testnet: true,
  }