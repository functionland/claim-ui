'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useAccount, usePublicClient } from 'wagmi'
import { type Address } from 'viem'
import { CONTRACT_ABI, CONTRACT_ADDRESSES } from '@/config/contracts'
import { VestingData, VestingCap } from '@/types/vesting'
import { bytesToString } from 'viem'
import { decodeBytes32String } from 'ethers'

export function useVestingContract() {
  const { address: userAddress, chainId } = useAccount()
  const [vestingData, setVestingData] = useState<Map<number, VestingData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const publicClient = usePublicClient()

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  console.log("Contract Address:", contractAddress)

  const { data: walletsInCap } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getWalletsInCap',
    args: [BigInt(1)],
  })

  console.log("Wallets in Cap 1:", walletsInCap)

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

            if (walletsInThisCap.includes(userAddress as Address)) {
              // Get wallet info
              const walletInfo = await publicClient.readContract({
                address: contractAddress,
                abi: CONTRACT_ABI,
                functionName: 'vestingWallets',
                args: [userAddress as Address, capId],
              })

              // Calculate claimable amount
              const claimableAmount = await publicClient.readContract({
                address: contractAddress,
                abi: CONTRACT_ABI,
                functionName: 'calculateDueTokens',
                args: [userAddress as Address, capId],
              })

              const [_capId, walletName, amount, claimed] = walletInfo as [bigint, string, bigint, bigint];
              const [totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate] = cap as [bigint, string, bigint, bigint, bigint, bigint, bigint];

              console.log("here", capId, walletName, amount, claimed, totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate)
              newVestingData.set(Number(capId), {
                capId: Number(capId),
                name: decodeBytes32String(name),
                totalAllocation: amount,
                claimed: claimed,
                claimable: claimableAmount as bigint || 0n,
                initialRelease: Number(initialRelease),
                cliff: Number(cliff) / 86400,
                vestingTerm: Number(vestingTerm) / (30 * 86400),
                vestingPlan: Number(vestingPlan) / (30 * 86400),
                startDate: Number(startDate) * 1000,
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

        setVestingData(newVestingData)
      } catch (err) {
        console.error('Error fetching vesting data:', err)
        setError(err instanceof Error ? err : new Error('Failed to load vesting data'))
      } finally {
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
