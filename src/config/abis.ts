// Common Governance Module ABI used by both Token and Distribution contracts
export const GOVERNANCE_ABI = [
  // Custom Errors
  {
    type: "error",
    name: "ExistingActiveProposal",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    inputs: [{ type: "uint8" }],
    name: "ProposalErr",
    type: "error"
  },
  {
    inputs: [
      { type: "uint16" },
      { type: "uint16" }
    ],
    name: "InsufficientApprovals",
    type: "error"
  },
  {
    inputs: [{ type: "uint8" }],
    name: "InvalidProposalType",
    type: "error"
  },
  {
    inputs: [{ type: "uint256" }],
    name: "ExecutionDelayNotMet",
    type: "error"
  },
  {
    inputs: [
      { type: "bytes32" },
      { type: "uint16" }
    ],
    name: "InvalidQuorumErr",
    type: "error"
  },
  {
    inputs: [{ type: "address" }],
    name: "TimeLockActive",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error"
  },
  {
    inputs: [],
    name: "MinimumRoleNoRequired",
    type: "error"
  },
  {
    inputs: [],
    name: "CannotRemoveSelf",
    type: "error"
  },
  {
    inputs: [{ type: "uint256" }],
    name: "CoolDownActive",
    type: "error"
  },
  {
    inputs: [],
    name: "NotPendingOwner",
    type: "error"
  },
  {
    inputs: [{ type: "bytes32" }],
    name: "InvalidRole",
    type: "error"
  },
  {
    inputs: [{ type: "address" }],
    name: "AlreadyOwnsRole",
    type: "error"
  },
  {
    inputs: [],
    name: "AlreadyUpgraded",
    type: "error"
  },
  {
    inputs: [
      { type: "address" },
      { type: "bytes32" },
      { type: "uint8" }
    ],
    name: "RoleAssignment",
    type: "error"
  },
  {
    inputs: [],
    name: "LimitTooHigh",
    type: "error"
  },
  {
    inputs: [],
    name: "AmountMustBePositive",
    type: "error"
  },
  {
    inputs: [],
    name: "TransferRestricted",
    type: "error"
  },
  {
    inputs: [{ type: "uint8" }],
    name: "Failed",
    type: "error"
  },
  {
    inputs: [
      { type: "uint256" },
      { type: "uint256" }
    ],
    name: "LowBalance",
    type: "error"
  },
  // Events
  {
    type: "event",
    name: "ProposalExecuted",
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32"
      }
    ]
  },
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
  // Token-specific errors
  {
    type: "error",
    name: "NotWhitelisted",
    inputs: [
      {
        name: "to",
        type: "address"
      }
    ]
  },
  {
    type: "error",
    name: "LocktimeActive",
    inputs: [
      {
        name: "to",
        type: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ExceedsSupply",
    inputs: [
      {
        name: "requested",
        type: "uint256"
      },
      {
        name: "supply",
        type: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "LowAllowance",
    inputs: [
      {
        name: "allowance",
        type: "uint256"
      },
      {
        name: "limit",
        type: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "UsedNonce",
    inputs: [
      {
        name: "nonce",
        type: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Unsupported",
    inputs: [
      {
        name: "chain",
        type: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ExceedsMaximumSupply",
    inputs: [
      {
        name: "requested",
        type: "uint256"
      },
      {
        name: "maxSupply",
        type: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "AlreadyWhitelisted",
    inputs: [
      {
        name: "target",
        type: "address"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidChain",
    inputs: [
      {
        name: "chainId",
        type: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "BlacklistedAddress",
    inputs: [
      {
        name: "account",
        type: "address"
      }
    ]
  },
  {
    type: "error",
    name: "AccountBlacklisted",
    inputs: [
      {
        name: "target",
        type: "address"
      }
    ]
  },
  {
    type: "error",
    name: "AccountNotBlacklisted",
    inputs: [
      {
        name: "target",
        type: "address"
      }
    ]
  },
  {
    type: "error",
    name: "FeeExceedsMax",
    inputs: [
      {
        name: "fee",
        type: "uint256"
      }
    ]
  },
  // Token-specific events
  {
    type: "event",
    name: "BridgeOperationDetails",
    inputs: [
      {
        indexed: true,
        name: "operator",
        type: "address"
      },
      {
        indexed: false,
        name: "operation",
        type: "uint8"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "chainId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "timestamp",
        type: "uint256"
      }
    ]
  },
  {
    type: "event",
    name: "TokensAllocatedToContract",
    inputs: [
      {
        indexed: true,
        name: "amount",
        type: "uint256"
      }
    ]
  },
  {
    type: "event",
    name: "SupportedChainChanged",
    inputs: [
      {
        indexed: true,
        name: "chainId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "caller",
        type: "address"
      }
    ]
  },
  {
    type: "event",
    name: "TransferFromContract",
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "caller",
        type: "address"
      }
    ]
  },
  {
    type: "event",
    name: "TokensMinted",
    inputs: [
      {
        indexed: false,
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      }
    ]
  },
  {
    type: "event",
    name: "WalletWhitelistedOp",
    inputs: [
      {
        indexed: true,
        name: "wallet",
        type: "address"
      },
      {
        indexed: false,
        name: "caller",
        type: "address"
      },
      {
        indexed: false,
        name: "lockUntil",
        type: "uint256"
      },
      {
        indexed: false,
        name: "status",
        type: "uint8"
      }
    ]
  },
  {
    type: "event",
    name: "BlackListOp",
    inputs: [
      {
        indexed: true,
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        name: "by",
        type: "address"
      },
      {
        indexed: false,
        name: "status",
        type: "uint8"
      }
    ]
  },
  {
    type: "event",
    name: "TreasuryDeployed",
    inputs: [
      {
        indexed: true,
        name: "treasury",
        type: "address"
      }
    ]
  },
  {
    type: "event",
    name: "PlatformFeeUpdated",
    inputs: [
      {
        indexed: false,
        name: "newFee",
        type: "uint256"
      }
    ]
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "target",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "whitelistLockTime",
        "type": "uint64"
      },
      {
        "indexed": false,
        "name": "operation",
        "type": "uint8"
      }
    ],
    "name": "WalletWhitelistedOp",
    "type": "event"
  },
  {
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ],
    "name": "timeConfigs",
    "outputs": [
      {
        "name": "lastActivityTime",
        "type": "uint64"
      },
      {
        "name": "roleChangeTimeLock",
        "type": "uint64"
      },
      {
        "name": "whitelistLockTime",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  ...CONTRACT_ABI,
  {
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "roleConfigs",
    "outputs": [
      {
        "name": "transactionLimit",
        "type": "uint240"
      },
      {
        "name": "quorum",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "limit",
        "type": "uint240"
      }
    ],
    "name": "setRoleTransactionLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "quorum",
        "type": "uint16"
      }
    ],
    "name": "setRoleQuorum",
    "outputs": [],
    "stateMutability": "nonpayable",
    type: "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "limit",
        "type": "uint240"
      }
    ],
    "name": "TransactionLimitUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "quorum",
        "type": "uint16"
      }
    ],
    "name": "QuorumUpdated",
    "type": "event"
  },
  // Proposal functions
  {
    inputs: [],
    name: "proposalCount",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ type: "uint256" }],
    name: "proposalRegistry",
    outputs: [{ type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ type: "bytes32" }],
    name: "proposals",
    outputs: [
      { name: "proposalType", type: "uint8" },
      { name: "target", type: "address" },
      { name: "id", type: "uint40" },
      { name: "role", type: "bytes32" },
      { name: "tokenAddress", type: "address" },
      { name: "amount", type: "uint96" },
      { 
        name: "config",
        type: "tuple",
        components: [
          { name: "expiryTime", type: "uint64" },
          { name: "executionTime", type: "uint64" },
          { name: "approvals", type: "uint16" },
          { name: "status", type: "uint8" }
        ]
      }
    ],
    stateMutability: "view",
    type: "function"
  },
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
