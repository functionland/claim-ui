import type { Chain } from 'viem'
import { mainnet, goerli, base, baseSepolia } from 'wagmi/chains'
import { SupportedChain } from './constants'

// Chain IDs
export const CHAIN_IDS = {
  MAINNET: 1,
  GOERLI: 300,
  HARDHAT: 31337,
  IOTEX_TESTNET: 4690,
  SKALE_TESTNET: 974399131,
  SFI_TESTNET: 751,
  BASE_SEPOLIA: 84532,
  BASE: 8453
} as const

// RPC Configuration
export const RPC_URLS: Record<SupportedChain, string> = {
  mainnet: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  goerli: `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  hardhat: 'http://127.0.0.1:8545',
  iotex: 'https://babel-api.testnet.iotex.io',
  skale: 'https://testnet.skalenodes.com/v1/giant-half-dual-testnet',
  sfi: 'https://rpc-testnet.singularityfinance.ai',
  base: 'https://mainnet.base.org',
  'base-sepolia': 'https://sepolia.base.org',
}


// Network names mapping
export const NETWORK_NAMES: Record<number, string> = {
  [CHAIN_IDS.MAINNET]: 'Ethereum Mainnet',
  [CHAIN_IDS.GOERLI]: 'Sepolia Testnet',
  [CHAIN_IDS.HARDHAT]: 'Hardhat',
  [CHAIN_IDS.IOTEX_TESTNET]: 'IoTeX Testnet',
  [CHAIN_IDS.SKALE_TESTNET]: 'SKALE Testnet',
  [CHAIN_IDS.SFI_TESTNET]: 'SFI Testnet',
  [CHAIN_IDS.BASE_SEPOLIA]: 'Base Sepolia',
  [CHAIN_IDS.BASE]: 'Base'
} as const

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

export const iotexTestnet: Chain = {
  id: CHAIN_IDS.IOTEX_TESTNET,
  name: NETWORK_NAMES[CHAIN_IDS.IOTEX_TESTNET],
  nativeCurrency: {
    name: 'IoTeX',
    symbol: 'IOTX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://babel-api.testnet.iotex.io'],
    },
    public: {
      http: ['https://babel-api.testnet.iotex.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'IoTeX Explorer',
      url: 'https://testnet.iotexscan.io',
    },
  },
} as const satisfies Chain

export const skaleTestnet: Chain = {
  id: CHAIN_IDS.SKALE_TESTNET,
  name: NETWORK_NAMES[CHAIN_IDS.SKALE_TESTNET],
  nativeCurrency: {
    name: 'SKALE',
    symbol: 'sFUEL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.skalenodes.com/v1/giant-half-dual-testnet'],
    },
    public: {
      http: ['https://testnet.skalenodes.com/v1/giant-half-dual-testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://giant-half-dual-testnet.explorer.testnet.skalenodes.com',
    },
  },
  testnet: true,
}

export const sfiTestnet: Chain = {
  id: CHAIN_IDS.SFI_TESTNET,
  name: NETWORK_NAMES[CHAIN_IDS.SFI_TESTNET],
  nativeCurrency: {
    name: 'SFI',
    symbol: 'SFI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.singularityfinance.ai'],
    },
    public: {
      http: ['https://rpc-testnet.singularityfinance.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SFI Explorer',
      url: 'https://testnet-explorer.singularityfinance.ai',
    },
  },
  testnet: true,
}

export const customBaseSepolia: Chain = {
  ...baseSepolia,
  rpcUrls: {
    ...baseSepolia.rpcUrls,
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
}

export const customBase: Chain = {
  ...base,
  rpcUrls: {
    ...base.rpcUrls,
    default: {
      http: [RPC_URLS.base || 'https://mainnet.base.org'],
    },
    public: {
      http: [RPC_URLS.base || 'https://mainnet.base.org'],
    },
  },
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

// Supported chains configuration
export const supportedChains = [
  customMainnet,
  customGoerli,
  iotexTestnet,
  skaleTestnet,
  sfiTestnet,
  customBaseSepolia,
  customBase,
  hardhat,
] as const

// Chain configuration for wagmi
export const wagmiChains = supportedChains.map(chain => ({
  ...chain,
  iconUrl: `https://raw.githubusercontent.com/ethereum/ethereum-org-website/dev/src/assets/eth-logo.svg`,
}))

// Block explorers
export const BLOCK_EXPLORERS: Record<number, string> = {
  [CHAIN_IDS.MAINNET]: 'https://etherscan.io',
  [CHAIN_IDS.GOERLI]: 'https://goerli.etherscan.io',
  [CHAIN_IDS.IOTEX_TESTNET]: 'https://testnet.iotexscan.io',
  [CHAIN_IDS.SKALE_TESTNET]: 'https://giant-half-dual-testnet.explorer.testnet.skalenodes.com',
  [CHAIN_IDS.SFI_TESTNET]: 'https://testnet-explorer.singularityfinance.ai',
  [CHAIN_IDS.BASE_SEPOLIA]: 'https://sepolia.explorer.base.org',
  [CHAIN_IDS.BASE]: 'https://explorer.base.org',
} as const

// Helper functions
export function getExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address' = 'tx') {
  const baseUrl = BLOCK_EXPLORERS[chainId]
  return `${baseUrl}/${type}/${hash}`
}

export function isSupported(chainId: number): boolean {
  return Object.values(CHAIN_IDS).includes(chainId);
}

export function getNetworkName(chainId: number): string {
  return NETWORK_NAMES[chainId] || 'Unknown Network'
}