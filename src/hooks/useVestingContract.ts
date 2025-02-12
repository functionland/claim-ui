'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useAccount, usePublicClient } from 'wagmi'
import { type Address } from 'viem'
import { CONTRACT_ABI, VESTING_CONTRACT_ADDRESSES, CONTRACT_TYPES, AIRDROP_CONTRACT_ADDRESSES } from '@/config/contracts'
import { VestingData, VestingCap } from '@/types/vesting'
import { bytesToString } from 'viem'
import { decodeBytes32String } from 'ethers'
import { useContractContext } from '@/contexts/ContractContext'

export function useVestingContract() {
  const { activeContract } = useContractContext()
  const { address: userAddress, chainId } = useAccount()
  const [vestingData, setVestingData] = useState<Map<number, VestingData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const publicClient = usePublicClient()
  

  const contractAddress = activeContract === CONTRACT_TYPES.VESTING 
    ? VESTING_CONTRACT_ADDRESSES[chainId as keyof typeof VESTING_CONTRACT_ADDRESSES]
    : AIRDROP_CONTRACT_ADDRESSES[chainId as keyof typeof AIRDROP_CONTRACT_ADDRESSES]
  console.log("Chain ID:", chainId)
  console.log("Contract Address:", contractAddress)
  console.log("Active Contract Type:", activeContract)
  console.log("Available Contract Addresses:", {
    vesting: VESTING_CONTRACT_ADDRESSES,
    airdrop: AIRDROP_CONTRACT_ADDRESSES
  })

  const { data: walletsInCap } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getWalletsInCap',
    args: [BigInt(1)],
  })

  console.log("Wallets in Cap 1:", walletsInCap)

  const parseContractError = (error: any): string => {
    console.log("Raw error message:", error.message); // Add logging to see the exact error format
    
    // First try to match the format: Error: ErrorName()
    const simpleErrorMatch = error.message.match(/Error: ([a-zA-Z]+)\(\)/);
    if (simpleErrorMatch) {
      const [_, errorName] = simpleErrorMatch;
      switch (errorName) {
        case 'NoWalletBalance':
          return 'You need to have tokens in your wallet to claim rewards.';
        default:
          return `${errorName} error occurred`;
      }
    }

    // If no simple match, try the more complex format with parameters
    const complexErrorMatch = error.message.match(/Error: ([a-zA-Z]+)\((.*?)\)\s*\((.*?)\)/);
    if (complexErrorMatch) {
      const [_, errorName, paramTypes, values] = complexErrorMatch;
      const valueArray = values.split(',').map(v => v.trim());
    
      switch (errorName) {
        case 'CliffNotReached':
          const [currentTime, startDate, cliffEnd] = valueArray.map(v => Number(v));
          const remainingTime = cliffEnd - currentTime;
          const daysRemaining = Math.ceil(remainingTime / (24 * 60 * 60));
          return `Cliff period not reached. ${daysRemaining} days remaining until tokens can be claimed.`;
        
        case 'NothingDue':
          return 'No tokens available to claim at this time.';
        
        default:
          return `${errorName}: ${valueArray.join(', ')}`;
      }
    }
    
    // If no matches found, return the raw error message
    return error.message || 'Unknown error occurred';
  };

  useEffect(() => {
    const fetchVestingData = async () => {
      try {
        setIsLoading(true)
        if (!walletsInCap || !publicClient || !contractAddress) return
  
        const newVestingData = new Map<number, VestingData>()
        let index = 0
  
        while (true) {
          try {
            // Read cap ID at current index
            const capId = await publicClient.readContract({
              address: contractAddress,
              abi: CONTRACT_ABI,
              functionName: 'capIds',
              args: [BigInt(index)],
            }) as bigint
  
            // Get cap details
            const capData = await publicClient.readContract({
              address: contractAddress,
              abi: CONTRACT_ABI,
              functionName: 'vestingCaps',
              args: [capId],
            }) as readonly [bigint, `0x${string}`, bigint, bigint, bigint, bigint, bigint, bigint]

            const cap: VestingCap = {
              totalAllocation: capData[0],
              name: capData[1],
              cliff: capData[2],
              vestingTerm: capData[3],
              vestingPlan: capData[4],
              initialRelease: capData[5],
              startDate: capData[6],
              allocatedToWallets: capData[7],
              wallets: [] // This will be populated by the next contract call
            }
  
            // Get wallets in this cap
            const walletsInThisCap = await publicClient.readContract({
              address: contractAddress,
              abi: CONTRACT_ABI,
              functionName: 'getWalletsInCap',
              args: [capId],
            }) as Address[]
  
            console.log(`Cap ${capId} wallets:`, walletsInThisCap)
            let claimableAmount = BigInt(0);
            let errorMessage = '';
  
            if (walletsInThisCap.includes(userAddress as Address)) {
              // Get wallet info
              const walletInfo = await publicClient.readContract({
                address: contractAddress,
                abi: CONTRACT_ABI,
                functionName: 'vestingWallets',
                args: [userAddress as Address, capId],
              })
  
              try {
                // Calculate claimable amount
                claimableAmount = await publicClient.readContract({
                  address: contractAddress,
                  abi: CONTRACT_ABI,
                  functionName: 'calculateDueTokens',
                  args: [userAddress as Address, capId],
                }) as bigint
              } catch (error: any) {
                errorMessage = parseContractError(error);
                console.error('Claim calculation error:', error);
              }
  
              const [_capId, walletName, amount, claimed] = walletInfo as [bigint, string, bigint, bigint];
              console.log("here", capId, walletName, amount, claimed, cap.totalAllocation, decodeBytes32String(cap.name), cap.cliff, cap.vestingTerm, cap.vestingPlan, cap.initialRelease, cap.startDate)
              console.log("here2", {name: cap.name, decodedName: decodeBytes32String(cap.name)})
              newVestingData.set(Number(capId), {
                capId: Number(capId),
                name: decodeBytes32String(cap.name),
                totalAllocation: amount,
                claimed: claimed,
                claimable: claimableAmount,
                initialRelease: Number(cap.initialRelease),
                cliff: Number(cap.cliff) / 86400,
                vestingTerm: Number(cap.vestingTerm) / (30 * 86400),
                vestingPlan: Number(cap.vestingPlan) / (30 * 86400),
                startDate: Number(cap.startDate) * 1000,
                errorMessage: errorMessage,
              })
            }
            
            index++
          } catch (e) {
            console.log(e)
            // We've hit the end of the array
            console.log("Finished reading caps at index:", index)
            break
          }
        }
        
        console.log("we are here")
        setVestingData(newVestingData)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching vesting data:', err)
        setError(err instanceof Error ? err : new Error('Failed to load vesting data'))
        setIsLoading(false)
      }
    }
  
    if (userAddress && contractAddress) {
      fetchVestingData()
    }
  }, [userAddress, contractAddress, walletsInCap, publicClient])
  

  const { writeContractAsync } = useWriteContract()

  const handleClaim = async (capId: number) => {
    if (!userAddress) return Promise.reject(new Error('Wallet not connected'))
    if (!contractAddress) return Promise.reject(new Error('Contract not configured'))
    if (!publicClient) return Promise.reject(new Error('Public client not initialized'))
    if (!chainId) return Promise.reject(new Error('Chain ID not available'))
  
    try {
      console.log("Initiating claim for capId:", capId, "chainId:", chainId)
      
      // Set up event watching
      const unwatch = publicClient.watchContractEvent({
        address: contractAddress,
        abi: CONTRACT_ABI,
        eventName: 'TokensClaimed',
        onLogs: logs => {
          console.log('Claim event logs:', logs)
          // Clean up the watcher after receiving the event
          unwatch()
        }
      })

      // Simulate the transaction first
      const { request } = await publicClient.simulateContract({
        account: userAddress,
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'claimTokens',
        args: [BigInt(capId), BigInt(chainId)],
      })

      // If simulation succeeds, execute the actual transaction
      const hash = await writeContractAsync(request)
      
      console.log("Transaction hash:", hash)
      return hash
    } catch (err) {
      console.error("Claim error:", err)
      if (err instanceof Error) {
        if (err.message.includes('simulation failed')) {
          return Promise.reject(new Error('Transaction would fail. Please check your claimable balance and try again.'))
        }
        // Add specific handling for chain-related errors
        if (err.message.includes('0x7a69')) {
          return Promise.reject(new Error('Chain configuration error. Please make sure you are connected to the correct network.'))
        }
        return Promise.reject(err)
      }
      return Promise.reject(new Error(String(err)))
    }
  }
  

  return {
    vestingData,
    isLoading: isLoading,
    error,
    claimTokens: handleClaim,
  }
}
