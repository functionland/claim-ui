import { keccak256, toBytes } from 'viem';

export const APP_NAME = 'Token Vesting Dashboard'
export const APP_DESCRIPTION = 'Manage and claim your vested tokens'

export const SUPPORTED_CHAINS = ['mainnet', 'goerli', 'hardhat'] as const
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]

export const CHAIN_NAMES = {
  mainnet: 'Ethereum Mainnet',
  goerli: 'Goerli Testnet',
} as const

export const DEFAULT_CHAIN = 'mainnet'

export const TIME_CONSTANTS = {
  SECONDS_PER_DAY: 86400,
  SECONDS_PER_MONTH: 2592000, // 30 days
  MILLISECONDS_PER_DAY: 86400000,
} as const

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  WRONG_NETWORK: 'Please switch to a supported network',
  NO_VESTING_DATA: 'No vesting data found',
  CLAIM_FAILED: 'Failed to claim tokens',
  INSUFFICIENT_BALANCE: 'Insufficient contract balance',
  CLIFF_NOT_REACHED: 'Cliff period not reached',
} as const

export const UI_CONSTANTS = {
  MAX_DECIMALS_DISPLAY: 6,
  TRANSACTION_TIMEOUT: 30000, // 30 seconds
  POLLING_INTERVAL: 15000, // 15 seconds
} as const

export const CONTRACT_TYPES = {
  VESTING: 'vesting',
  AIRDROP: 'airdrop',
  TESTNET_MINING: 'testnet_mining',
} as const

export type ContractType = typeof CONTRACT_TYPES[keyof typeof CONTRACT_TYPES]

export const LINKS = {
  DOCS: 'https://docs.example.com',
  TERMS: 'https://example.com/terms',
  PRIVACY: 'https://example.com/privacy',
  SUPPORT: 'https://support.example.com',
} as const

export const ROLES = {
  BRIDGE_OPERATOR_ROLE: keccak256(toBytes('BRIDGE_OPERATOR_ROLE')),
  CONTRACT_OPERATOR_ROLE: keccak256(toBytes('CONTRACT_OPERATOR_ROLE')),
  ADMIN_ROLE: keccak256(toBytes('ADMIN_ROLE')),
} as const;

export const ROLE_NAMES = {
  [ROLES.BRIDGE_OPERATOR_ROLE]: 'Bridge Operator',
  [ROLES.CONTRACT_OPERATOR_ROLE]: 'Contract Operator',
  [ROLES.ADMIN_ROLE]: 'Admin',
} as const;
