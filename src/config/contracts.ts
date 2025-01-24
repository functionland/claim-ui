import { type Address } from 'viem'
import { SupportedChain } from './constants'

// Contract Addresses
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  1: process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS as Address, // mainnet
  5: process.env.NEXT_PUBLIC_GOERLI_CONTRACT_ADDRESS as Address,  // goerli
  31337: process.env.NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS as Address, // local
}

// Token Addresses
export const TOKEN_ADDRESSES: Record<number, Address> = {
  1: process.env.NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS as Address,
  5: process.env.NEXT_PUBLIC_GOERLI_TOKEN_ADDRESS as Address,
  31337: process.env.NEXT_PUBLIC_LOCAL_TOKEN_ADDRESS as Address,
}

// Contract ABI
export const CONTRACT_ABI = [
  {
    inputs: [], // No inputs for getting the full array
    name: 'capIds',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
      // Automatically generated getter for array elements
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'capIds',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
  },
  // Add this for getWalletsInCap function
  {
    inputs: [{ internalType: 'uint256', name: 'capId', type: 'uint256' }],
    name: 'getWalletsInCap',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Vesting Cap Functions
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'vestingCaps',
    outputs: [
      { internalType: 'uint256', name: 'totalAllocation', type: 'uint256' },
      { internalType: 'bytes32', name: 'name', type: 'bytes32' },
      { internalType: 'uint256', name: 'cliff', type: 'uint256' },
      { internalType: 'uint256', name: 'vestingTerm', type: 'uint256' },
      { internalType: 'uint256', name: 'vestingPlan', type: 'uint256' },
      { internalType: 'uint256', name: 'initialRelease', type: 'uint256' },
      { internalType: 'uint256', name: 'startDate', type: 'uint256' },
      { internalType: 'uint256', name: 'allocatedToWallets', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Vesting Wallet Functions
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'vestingWallets',
    outputs: [
      { internalType: 'uint256', name: 'capId', type: 'uint256' },
      { internalType: 'bytes32', name: 'name', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'claimed', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Claim Function
  {
    inputs: [
      { internalType: 'uint256', name: 'capId', type: 'uint256' },
      { internalType: 'uint256', name: 'chainId', type: 'uint256' },
    ],
    name: 'claimTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Calculate Due Tokens Function
  {
    inputs: [
      { internalType: 'address', name: 'wallet', type: 'address' },
      { internalType: 'uint256', name: 'capId', type: 'uint256' },
    ],
    name: 'calculateDueTokens',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Contract Config
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESSES,
  abi: CONTRACT_ABI,
} as const

// RPC Configuration
export const RPC_URLS: Record<SupportedChain, string> = {
  mainnet: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  goerli: `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  hardhat: 'http://127.0.0.1:3000',
}
