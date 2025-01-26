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
  console.log("Contract Address:", contractAddress)

  const { data: walletsInCap } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getWalletsInCap',
    args: [BigInt(1)],
  })

  console.log("Wallets in Cap 1:", walletsInCap)

  const parseContractError = (error: any): string => {
    // Extract error name and parameters
    const errorMatch = error.message.match(/Error: ([a-zA-Z]+)\((.*?)\)\s*\((.*?)\)/);
    if (!errorMatch) return 'Unknown error occurred';
  
    const [_, errorName, paramTypes, values] = errorMatch;
    const valueArray = values.split(',').map(v => v.trim());
  
    switch (errorName) {
      case 'CliffNotReached':
        const [currentTime, startDate, cliffEnd] = valueArray.map(v => Number(v));
        const remainingTime = cliffEnd - currentTime;
        const daysRemaining = Math.ceil(remainingTime / (24 * 60 * 60));
        return `Cliff period not reached. ${daysRemaining} days remaining until tokens can be claimed.`;
      
      case 'NoWalletBalance':
        return 'You need to have tokens in your wallet to claim rewards.';
      
      case 'NothingDue':
        return 'No tokens available to claim at this time.';
      
      // Add other error cases as needed
      
      default:
        return `${errorName}: ${valueArray.join(', ')}`;
    }
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
            const cap = await publicClient.readContract({
              address: contractAddress,
              abi: CONTRACT_ABI,
              functionName: 'vestingCaps',
              args: [capId],
            }) as VestingCap
  
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
              const [totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate] = cap as [bigint, string, bigint, bigint, bigint, bigint, bigint];
  
              console.log("here", capId, walletName, amount, claimed, totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate)
              console.log("here2", {name: name, decodedName: decodeBytes32String(name)})
              newVestingData.set(Number(capId), {
                capId: Number(capId),
                name: decodeBytes32String(name),
                totalAllocation: amount,
                claimed: claimed,
                claimable: claimableAmount,
                initialRelease: Number(initialRelease),
                cliff: Number(cliff) / 86400,
                vestingTerm: Number(vestingTerm) / (30 * 86400),
                vestingPlan: Number(vestingPlan) / (30 * 86400),
                startDate: Number(startDate) * 1000,
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
  
    try {
      console.log("Initiating claim for capId:", capId)
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'claimTokens',
        args: [BigInt(capId), BigInt(chainId || 1)],
      })
      
      console.log("Transaction hash:", hash)
      return hash
    } catch (err) {
      return Promise.reject(err instanceof Error ? err : new Error(String(err))) // Return rejected promise with an Error instance
    }
  }
  

  return {
    vestingData,
    isLoading: isLoading,
    error,
    claimTokens: handleClaim,
  }
}
