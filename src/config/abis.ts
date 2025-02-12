// Common Governance Module ABI used by both Token and Distribution contracts
export const GOVERNANCE_ABI = [
  // Read functions
  {
    inputs: [{ name: "proposalId", type: "bytes32" }, { name: "account", type: "address" }],
    name: "hasProposalApproval",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "", type: "bytes32" }],
    name: "proposals",
    outputs: [
      { name: "target", type: "address" },
      { name: "proposalType", type: "uint8" },
      { name: "role", type: "bytes32" },
      { name: "amount", type: "uint96" },
      { name: "tokenAddress", type: "address" },
      { name: "config", type: "tuple", components: [
        { name: "expiryTime", type: "uint64" },
        { name: "executionTime", type: "uint64" },
        { name: "approvals", type: "uint16" },
        { name: "status", type: "uint8" }
      ]}
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "proposalCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  // Write functions
  {
    inputs: [
      { name: "proposalType", type: "uint8" },
      { name: "id", type: "uint40" },
      { name: "target", type: "address" },
      { name: "role", type: "bytes32" },
      { name: "amount", type: "uint96" },
      { name: "tokenAddress", type: "address" }
    ],
    name: "createProposal",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "proposalId", type: "bytes32" }],
    name: "approveProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "proposalId", type: "bytes32" }],
    name: "executeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "role", type: "bytes32" }, { name: "limit", type: "uint240" }],
    name: "setRoleTransactionLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "role", type: "bytes32" }, { name: "quorum", type: "uint16" }],
    name: "setRoleQuorum",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "op", type: "uint8" }],
    name: "emergencyAction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Common Contract ABI used across multiple contracts
export const CONTRACT_ABI = [
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "capIds",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: 'uint256', name: 'capId', type: 'uint256' }],
    name: 'getWalletsInCap',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
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
  }
] as const;

// Token Contract ABI
export const TOKEN_ABI = [
  ...GOVERNANCE_ABI,
  ...CONTRACT_ABI,
  // Additional Token-specific functions
  {
    inputs: [],
    name: "maxSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "blacklisted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    name: "transferFromContract",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "amount", type: "uint256" }, { name: "chain", type: "uint256" }, { name: "nonce", type: "uint256" }, { name: "op", type: "uint8" }],
    name: "bridgeOp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "chainId", type: "uint256" }, { name: "nonce", type: "uint256" }],
    name: "setBridgeOpNonce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Distribution Contract ABI
export const DISTRIBUTION_ABI = [
  ...GOVERNANCE_ABI,
  ...CONTRACT_ABI,
  // Additional Distribution-specific functions
  {
    inputs: [],
    name: "getVestingCaps",
    outputs: [{ 
      name: "", 
      type: "tuple[]",
      components: [
        { name: "id", type: "uint256" },
        { name: "name", type: "bytes32" },
        { name: "totalAllocation", type: "uint256" },
        { name: "cliff", type: "uint256" },
        { name: "vestingTerm", type: "uint256" },
        { name: "vestingPlan", type: "uint256" },
        { name: "initialRelease", type: "uint256" }
      ]
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getVestingWallets",
    outputs: [{
      name: "",
      type: "tuple[]",
      components: [
        { name: "address", type: "address" },
        { name: "capId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "released", type: "uint256" },
        { name: "note", type: "bytes32" }
      ]
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "name", type: "bytes32" },
      { name: "totalAllocation", type: "uint256" },
      { name: "cliff", type: "uint256" },
      { name: "vestingTerm", type: "uint256" },
      { name: "vestingPlan", type: "uint256" },
      { name: "initialRelease", type: "uint256" }
    ],
    name: "createVestingCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Testnet Mining Contract ABI (without common CONTRACT_ABI)
export const TESTNET_MINING_ABI = [
  {
    inputs: [{ name: "wallet", type: "address" }],
    name: "addWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Common Role Types
export const ROLE_TYPES = {
  ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  CONTRACT_OPERATOR_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000001",
  BRIDGE_OPERATOR_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000002"
} as const;

// Proposal Types
export const PROPOSAL_TYPES = {
  AddRole: 1,
  RemoveRole: 2,
  Upgrade: 3,
  Recovery: 4,
  AddWhitelist: 5,
  RemoveWhitelist: 6,
  AddToBlacklist: 7,
  RemoveFromBlacklist: 8,
  ChangeTreasuryFee: 9,
  AddDistributionWallets: 10
} as const;
