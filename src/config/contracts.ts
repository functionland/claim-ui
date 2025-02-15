import { type Address } from 'viem'
import { SupportedChain } from './constants'
import { TOKEN_ABI, DISTRIBUTION_ABI, TESTNET_MINING_ABI, PROPOSAL_TYPES } from './abis';
import { ROLES } from './constants';

// Contract Addresses for vesting
export const VESTING_CONTRACT_ADDRESSES: Record<number, Address> = {
  1: process.env.NEXT_PUBLIC_MAINNET_VESTING_CONTRACT_ADDRESS as Address, // mainnet
  5: process.env.NEXT_PUBLIC_GOERLI_VESTING_CONTRACT_ADDRESS as Address,  // goerli
  31337: process.env.NEXT_PUBLIC_LOCAL_VESTING_CONTRACT_ADDRESS as Address, // local
}

// Contract Addresses for airdrop
export const AIRDROP_CONTRACT_ADDRESSES: Record<number, Address> = {
  1: process.env.NEXT_PUBLIC_MAINNET_AIRDROP_CONTRACT_ADDRESS as Address, // mainnet
  5: process.env.NEXT_PUBLIC_GOERLI_AIRDROP_CONTRACT_ADDRESS as Address,  // goerli
  31337: process.env.NEXT_PUBLIC_LOCAL_AIRDROP_CONTRACT_ADDRESS as Address, // local
}

// Contract Addresses for testnet mining
export const TESTNET_MINING_CONTRACT_ADDRESSES: Record<number, Address> = {
  1: process.env.NEXT_PUBLIC_MAINNET_TESTNET_MINING_CONTRACT_ADDRESS as Address, // mainnet
  5: process.env.NEXT_PUBLIC_GOERLI_TESTNET_MINING_CONTRACT_ADDRESS as Address,  // goerli
  31337: process.env.NEXT_PUBLIC_LOCAL_TESTNET_MINING_CONTRACT_ADDRESS as Address, // local
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
    inputs: [{ name: "", type: "uint256" }],
    name: "capIds",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
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

  // Custom Errors
  {
    type: "error",
    name: "TGENotInitiated",
    inputs: []
  },
  {
    type: "error",
    name: "NothingDue",
    inputs: []
  },
  {
    type: "error",
    name: "LowContractBalance",
    inputs: [
      { name: "available", type: "uint256" },
      { name: "required", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidAllocationParameters",
    inputs: []
  },
  {
    type: "error",
    name: "NothingToClaim",
    inputs: []
  },
  {
    type: "error",
    name: "CliffNotReached",
    inputs: [
      { name: "currentTime", type: "uint256" },
      { name: "startDate", type: "uint256" },
      { name: "cliffEnd", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "OperationFailed",
    inputs: [
      { name: "status", type: "uint8" }
    ]
  },
  {
    type: "error",
    name: "TGEAlreadyInitiated",
    inputs: []
  },
  {
    type: "error",
    name: "AllocationTooHigh",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "allocated", type: "uint256" },
      { name: "maximum", type: "uint256" },
      { name: "capId", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "InsufficientContractBalance",
    inputs: [
      { name: "required", type: "uint256" },
      { name: "available", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "CapExists",
    inputs: [
      { name: "capId", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "InvalidAllocation",
    inputs: []
  },
  {
    type: "error",
    name: "InitialReleaseTooLarge",
    inputs: []
  },
  {
    type: "error",
    name: "OutOfRangeVestingPlan",
    inputs: []
  },
  {
    type: "error",
    name: "CapHasWallets",
    inputs: []
  },
  {
    type: "error",
    name: "ExceedsMaximumSupply",
    inputs: [
      { name: "amount", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "StartDateNotSet",
    inputs: [
      { name: "capId", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "WalletExistsInCap",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "capId", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "InvalidCapId",
    inputs: [
      { name: "capId", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "WalletNotInCap",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "capId", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "NoWalletBalance",
    inputs: []
  },
] as const

// Contract Types
export const CONTRACT_TYPES = {
  TOKEN: 'token',
  VESTING: 'vesting',
  AIRDROP: 'airdrop',
  TESTNET_MINING: 'testnet_mining',
} as const

export type ContractType = typeof CONTRACT_TYPES[keyof typeof CONTRACT_TYPES];

interface ContractConfig {
  address: {
    [key in ContractType]: {
      [chainId: number]: `0x${string}`;
    };
  };
  abi: {
    [key in ContractType]: readonly any[];
  };
}

export const CONTRACT_CONFIG: ContractConfig = {
  address: {
    [CONTRACT_TYPES.TOKEN]: TOKEN_ADDRESSES,
    [CONTRACT_TYPES.VESTING]: VESTING_CONTRACT_ADDRESSES,
    [CONTRACT_TYPES.AIRDROP]: AIRDROP_CONTRACT_ADDRESSES,
    [CONTRACT_TYPES.TESTNET_MINING]: TESTNET_MINING_CONTRACT_ADDRESSES
  },
  abi: {
    [CONTRACT_TYPES.TOKEN]: TOKEN_ABI,
    [CONTRACT_TYPES.VESTING]: DISTRIBUTION_ABI,
    [CONTRACT_TYPES.AIRDROP]: DISTRIBUTION_ABI,
    [CONTRACT_TYPES.TESTNET_MINING]: TESTNET_MINING_ABI,
  },
};

// Export common types and constants
export { ROLES, PROPOSAL_TYPES };

// RPC Configuration
export const RPC_URLS: Record<SupportedChain, string> = {
  mainnet: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  goerli: `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  hardhat: 'http://127.0.0.1:8545',
}
