'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useAccount, usePublicClient, useSimulateContract } from 'wagmi'
import { type Address, parseAbiItem } from 'viem'
import { CONTRACT_CONFIG, CONTRACT_TYPES } from '@/config/contracts'
import { useContractContext } from '@/contexts/ContractContext'
import { ethers } from 'ethers'

export function useAdminContract() {
  const { activeContract } = useContractContext()
  const { address: userAddress, chainId } = useAccount()
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const contractAddress = chainId 
    ? CONTRACT_CONFIG.address[activeContract][chainId] 
    : undefined

  const contractAbi = CONTRACT_CONFIG.abi[activeContract]

  // Read contract data
  const { data: tokenProposals } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getProposals',
    enabled: !!contractAddress && activeContract === CONTRACT_TYPES.TOKEN,
  })

  const { data: vestingCaps } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVestingCaps',
    enabled: !!contractAddress && activeContract === CONTRACT_TYPES.VESTING,
  })

  const { data: vestingWallets } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVestingWallets',
    enabled: !!contractAddress && activeContract === CONTRACT_TYPES.VESTING,
  })

  const { data: proposals } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getProposals',
    enabled: !!contractAddress && activeContract === CONTRACT_TYPES.VESTING,
  })

  type TimeConfig = {
    lastActivityTime: bigint;
    roleChangeTimeLock: bigint;
    whitelistLockTime: bigint;
  };

  type WhitelistedAddressInfo = {
    address: string;
    timeConfig: TimeConfig;
    operator: string;
  };

  const [whitelistInfo, setWhitelistInfo] = useState<WhitelistedAddressInfo[]>([]);

  const isWhitelisted = async (address: string): Promise<boolean> => {
    if (!contractAddress || !publicClient) return false;

    try {
      const timeConfig = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'timeConfigs',
        args: [address as Address],
      });

      // If whitelistLockTime is not 0, the address is whitelisted
      return timeConfig.whitelistLockTime > 0n;
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      return false;
    }
  };

  const fetchWhitelistedAddresses = async () => {
    if (!contractAddress || !publicClient) {
      console.log('Missing requirements:', { contractAddress, hasPublicClient: !!publicClient });
      return;
    }

    console.log('Fetching whitelisted addresses for contract:', contractAddress);

    try {
      // Get all WalletWhitelistedOp events
      console.log('Fetching WalletWhitelistedOp events...');
      const events = await publicClient.getLogs({
        address: contractAddress,
        event: parseAbiItem('event WalletWhitelistedOp(address indexed target, address indexed operator, uint64 whitelistLockTime, uint8 operation)'),
        fromBlock: 0n,
        toBlock: 'latest'
      });

      console.log('Found events:', events);

      // Process events to track added and removed wallets
      const whitelistedWallets = new Map<string, { lockTime: bigint, operator: string }>();

      for (const event of events) {
        const { target, operator, whitelistLockTime, operation } = event.args;
        const address = target.toLowerCase();

        if (operation === 1n) {
          // Wallet added
          whitelistedWallets.set(address, {
            lockTime: whitelistLockTime,
            operator: operator
          });
        } else if (operation === 2n) {
          // Wallet removed
          whitelistedWallets.delete(address);
        }
      }

      console.log('Processing whitelisted wallets:', whitelistedWallets);

      // Get time configs for currently whitelisted addresses
      const whitelistPromises = Array.from(whitelistedWallets.entries()).map(async ([address, info]) => {
        const timeConfig = await publicClient.readContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'timeConfigs',
          args: [address as Address],
        });

        return {
          address,
          timeConfig,
          operator: info.operator
        };
      });

      const whitelistData = await Promise.all(whitelistPromises);
      console.log('Final whitelist data:', whitelistData);
      setWhitelistInfo(whitelistData);
    } catch (error) {
      console.error('Error in fetchWhitelistedAddresses:', error);
      setWhitelistInfo([]);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with:', { contractAddress, chainId, activeContract });
    if (contractAddress && chainId && activeContract === CONTRACT_TYPES.TOKEN) {
      fetchWhitelistedAddresses();
    }
  }, [contractAddress, chainId, activeContract]);

  const refetchWhitelistedAddresses = () => {
    fetchWhitelistedAddresses();
  };

  // Token contract functions
  const addToWhitelist = async (address: string) => {
    // Debug logging
    console.log('Adding to whitelist:', {
      chainId,
      activeContract,
      contractAddress,
      userAddress,
      address
    });

    if (!contractAddress) throw new Error('Contract address not found');
    if (!userAddress) throw new Error('Please connect your wallet');

    try {
      // Check if the contract exists and has code
      const code = await publicClient.getBytecode({ address: contractAddress });
      console.log('Contract bytecode:', code ? 'Found' : 'Not found');
      if (!code) throw new Error('Contract not found at the specified address');

      // Create the proposal
      const proposalArgs = [
        5n, // AddWhitelist type as uint8
        0n, // id as uint40
        address as Address, // target address
        '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`, // role as bytes32
        0n, // amount as uint96
        '0x0000000000000000000000000000000000000000' as Address, // tokenAddress
      ];
      console.log('Creating proposal with args:', proposalArgs);

      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createProposal',
        args: proposalArgs,
        account: userAddress,
      });

      console.log('Proposal simulation successful');

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request);
      console.log('Proposal creation transaction hash:', hash);
      
      // Wait for one confirmation to ensure the transaction is mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction receipt:', receipt);
      
      // Check if the transaction was successful
      if (receipt.status === 'success') {
        console.log('Proposal created successfully');
        return hash;
      } else {
        console.error('Transaction failed');
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error in addToWhitelist:', error);
      throw error;
    }
  };

  const setTransactionLimit = async (newLimit: string) => {
    if (!contractAddress) throw new Error('Contract address not found')

    try {
      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createProposal',
        args: [
          BigInt(2), // SetTransactionLimit type
          ethers.parseEther(newLimit),
          '0x0000000000000000000000000000000000000000' as Address,
          ethers.ZeroHash,
          BigInt(0),
          '0x0000000000000000000000000000000000000000' as Address,
        ],
        account: userAddress,
      })

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request)
      return hash
    } catch (err: any) {
      console.error('Error setting transaction limit:', err)
      throw new Error(err.message)
    }
  }

  const setTGE = async (tgeTime: number) => {
    if (!contractAddress) throw new Error('Contract address not found')

    try {
      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createProposal',
        args: [
          BigInt(1), // SetTGE type
          BigInt(tgeTime),
          '0x0000000000000000000000000000000000000000' as Address,
          ethers.ZeroHash,
          BigInt(0),
          '0x0000000000000000000000000000000000000000' as Address,
        ],
        account: userAddress,
      })

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request)
      return hash
    } catch (err: any) {
      console.error('Error setting TGE:', err)
      throw new Error(err.message)
    }
  }

  // Vesting contract functions
  const createVestingCap = async (
    name: string,
    totalAllocation: string,
    cliff: number,
    vestingTerm: number,
    vestingPlan: number,
    initialRelease: number
  ) => {
    if (!contractAddress) throw new Error('Contract address not found')

    try {
      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createVestingCap',
        args: [
          ethers.encodeBytes32String(name),
          ethers.parseEther(totalAllocation),
          BigInt(cliff * 86400), // Convert days to seconds
          BigInt(vestingTerm),
          BigInt(vestingPlan),
          BigInt(initialRelease),
        ],
        account: userAddress,
      })

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request)
      return hash
    } catch (err: any) {
      console.error('Error creating vesting cap:', err)
      throw new Error(err.message)
    }
  }

  const addVestingWallet = async (
    walletAddress: string,
    capId: number,
    amount: string,
    note: string
  ) => {
    if (!contractAddress) throw new Error('Contract address not found')

    try {
      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createProposal',
        args: [
          BigInt(7), // AddDistributionWallets type
          BigInt(capId),
          walletAddress as Address,
          ethers.encodeBytes32String(note),
          ethers.parseEther(amount),
          '0x0000000000000000000000000000000000000000' as Address,
        ],
        account: userAddress,
      })

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request)
      return hash
    } catch (err: any) {
      console.error('Error adding vesting wallet:', err)
      throw new Error(err.message)
    }
  }

  // Common functions for both contracts
  const approveProposal = async (proposalId: string) => {
    if (!contractAddress) throw new Error('Contract address not found')

    try {
      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'approveProposal',
        args: [proposalId],
        account: userAddress,
      })

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request)
      return hash
    } catch (err: any) {
      console.error('Error approving proposal:', err)
      throw new Error(err.message)
    }
  }

  const executeProposal = async (proposalId: string) => {
    if (!contractAddress) throw new Error('Contract address not found')

    try {
      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'executeProposal',
        args: [proposalId],
        account: userAddress,
      })

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request)
      return hash
    } catch (err: any) {
      console.error('Error executing proposal:', err)
      throw new Error(err.message)
    }
  }

  type RoleConfig = {
    transactionLimit: bigint;
    quorum: number;
  };

  type RoleConfigInfo = {
    role: string;
    config: RoleConfig;
  };

  const [roleConfigs, setRoleConfigs] = useState<RoleConfigInfo[]>([]);

  const fetchRoleConfigs = async () => {
    if (!contractAddress || !publicClient) return;

    try {
      // Get all role config update events
      const [limitEvents, quorumEvents] = await Promise.all([
        publicClient.getLogs({
          address: contractAddress,
          event: parseAbiItem('event TransactionLimitUpdated(bytes32 indexed role, uint240 limit)'),
          fromBlock: 0n,
          toBlock: 'latest'
        }),
        publicClient.getLogs({
          address: contractAddress,
          event: parseAbiItem('event QuorumUpdated(bytes32 indexed role, uint16 quorum)'),
          fromBlock: 0n,
          toBlock: 'latest'
        })
      ]);

      // Get unique roles from both event types
      const uniqueRoles = new Set([
        ...limitEvents.map(e => e.args.role),
        ...quorumEvents.map(e => e.args.role)
      ]);

      // Fetch current config for each role
      const configPromises = Array.from(uniqueRoles).map(async (role) => {
        const config = await publicClient.readContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'roleConfigs',
          args: [role],
        });

        return {
          role,
          config: {
            transactionLimit: config.transactionLimit,
            quorum: config.quorum
          }
        };
      });

      const configs = await Promise.all(configPromises);
      setRoleConfigs(configs);
    } catch (error) {
      console.error('Error fetching role configs:', error);
      setRoleConfigs([]);
    }
  };

  const setRoleTransactionLimit = async (role: string, limit: bigint) => {
    if (!contractAddress) throw new Error('Contract address not found');
    if (!userAddress) throw new Error('Please connect your wallet');

    try {
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'setRoleTransactionLimit',
        args: [role as `0x${string}`, limit],
        account: userAddress,
      });

      const hash = await writeContractAsync(request);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refetch role configs after update
      await fetchRoleConfigs();
      return hash;
    } catch (error: any) {
      console.error('Error setting transaction limit:', error);
      throw error;
    }
  };

  const setRoleQuorum = async (role: string, quorum: number) => {
    if (!contractAddress) throw new Error('Contract address not found');
    if (!userAddress) throw new Error('Please connect your wallet');
    if (quorum <= 1) throw new Error('Quorum must be greater than 1');

    try {
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'setRoleQuorum',
        args: [role as `0x${string}`, quorum],
        account: userAddress,
      });

      const hash = await writeContractAsync(request);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refetch role configs after update
      await fetchRoleConfigs();
      return hash;
    } catch (error: any) {
      console.error('Error setting role quorum:', error);
      throw error;
    }
  };

  const handleSetRoleTransactionLimit = async (role: string, limit: string) => {
    if (!role || !limit) throw new Error('Role and limit are required');
    
    try {
      // Convert ether to wei (add 18 decimals)
      let limitInWei: bigint;
      try {
        limitInWei = ethers.parseEther(limit);
      } catch (error) {
        console.error('Error parsing transaction limit:', error);
        throw new Error('Invalid transaction limit value');
      }
      
      console.log('Setting transaction limit:', {
        role,
        limitInEth: limit,
        limitInWei: limitInWei.toString()
      });
      
      return setRoleTransactionLimit(role, limitInWei);
    } catch (error: any) {
      if (error.code === 'INVALID_ARGUMENT') {
        throw new Error('Invalid transaction limit value');
      }
      throw error;
    }
  };

  const handleSetRoleQuorum = async (role: string, quorum: string) => {
    if (!role || !quorum) throw new Error('Role and quorum are required');
    
    try {
      // Convert string to uint16 (max value 65535)
      const quorumValue = parseInt(quorum);
      if (isNaN(quorumValue) || quorumValue < 1 || quorumValue > 65535) {
        throw new Error('Quorum must be a number between 1 and 65535');
      }
      return setRoleQuorum(role, quorumValue);
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to set quorum');
    }
  };

  const checkRoleConfig = async (role: string) => {
    if (!role) throw new Error('Role is required');
    if (!contractAddress) throw new Error('Contract not connected');
    if (!publicClient) throw new Error('Public client not available');
    
    try {
      console.log('Checking role config for:', { role });

      const config = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: 'roleConfigs',
        args: [role],
      }) as readonly [bigint, bigint];
      
      console.log('Raw role config result:', config);
      
      // Convert scientific notation to regular number string first
      const transactionLimitStr = config[1].toString();
      const transactionLimit = BigInt(transactionLimitStr);
      const quorum = Number(config[0]);
      
      console.log('Processed role config:', { 
        transactionLimitStr,
        transactionLimit: transactionLimit.toString(), 
        quorum 
      });
      
      return {
        transactionLimit,
        quorum
      };
    } catch (error: any) {
      console.error('Error checking role config:', error);
      if (error.message.includes('Cannot convert') || error.message.includes('overflow')) {
        // Handle the scientific notation manually
        try {
          const [base, exponent] = (config[1].toString() as string).split('e+').map(Number);
          const fullNumber = base * Math.pow(10, exponent);
          const transactionLimit = BigInt(Math.floor(fullNumber));
          console.log('Fallback conversion:', { base, exponent, fullNumber, transactionLimit: transactionLimit.toString() });
          return {
            transactionLimit,
            quorum: Number(config[0])
          };
        } catch (conversionError) {
          console.error('Error in fallback conversion:', conversionError);
          throw new Error('Failed to process transaction limit value');
        }
      }
      throw new Error(`Failed to fetch role configuration: ${error.message}`);
    }
  };

  // Fetch role configs when contract changes
  useEffect(() => {
    if (contractAddress && chainId && activeContract === CONTRACT_TYPES.TOKEN) {
      fetchRoleConfigs();
    }
  }, [contractAddress, chainId, activeContract]);

  return {
    // Token contract data
    whitelistInfo,
    tokenProposals,
    // Token contract functions
    addToWhitelist,
    setTransactionLimit,
    setTGE,
    // Vesting contract data
    vestingCaps,
    vestingWallets,
    proposals,
    // Vesting contract functions
    createVestingCap,
    addVestingWallet,
    // Common functions
    approveProposal,
    executeProposal,
    error,
    refetchWhitelistedAddresses,
    isWhitelisted,
    roleConfigs,
    handleSetRoleTransactionLimit,
    handleSetRoleQuorum,
    checkRoleConfig,
    refetchRoleConfigs: fetchRoleConfigs,
  }
}
