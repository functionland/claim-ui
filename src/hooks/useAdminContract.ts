'use client'

import { useState } from 'react'
import { useReadContract, useWriteContract, useAccount, usePublicClient, useSimulateContract } from 'wagmi'
import { type Address } from 'viem'
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
  const { data: whitelistedAddresses } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getWhitelistedAddresses',
    enabled: !!contractAddress && activeContract === CONTRACT_TYPES.TOKEN,
  })

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

  // Token contract functions
  const addToWhitelist = async (address: string) => {
    // Debug logging
    console.log('Current chainId:', chainId)
    console.log('Active Contract:', activeContract)
    console.log('Contract Address:', contractAddress)
    console.log('User Address:', userAddress)

    if (!contractAddress) throw new Error('Contract address not found')
    if (!userAddress) throw new Error('Please connect your wallet')

    try {
      // Check if the contract exists and has code
      const code = await publicClient.getBytecode({ address: contractAddress })
      console.log('Contract bytecode:', code ? 'Found' : 'Not found')
      if (!code) throw new Error('Contract not found at the specified address')

      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createProposal',
        args: [
          5n, // AddWhitelist type as uint8
          0n, // id as uint40
          address as Address, // target address
          '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`, // role as bytes32
          0n, // amount as uint96
          '0x0000000000000000000000000000000000000000' as Address, // tokenAddress
        ],
        account: userAddress,
      })

      // If simulation succeeds, send the transaction
      const hash = await writeContractAsync(request)
      
      // Wait for one confirmation to ensure the transaction is mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      // Check if the transaction was successful
      if (receipt.status === 'success') {
        return hash
      } else {
        throw new Error('Transaction failed')
      }
    } catch (err: any) {
      console.error('Error adding to whitelist:', err)
      // Provide more specific error messages based on the error
      if (err.message.includes('user rejected')) {
        throw new Error('Transaction was rejected by user')
      } else if (err.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for gas')
      } else {
        throw new Error(err.message)
      }
    }
  }

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

  return {
    // Token contract data
    whitelistedAddresses,
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
  }
}
