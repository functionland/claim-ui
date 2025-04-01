'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useAccount, usePublicClient } from 'wagmi'
import { type Address } from 'viem'
import { CONTRACT_CONFIG, CONTRACT_TYPES } from '@/config/contracts'
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
  const [substrateWallet, setSubstrateWallet] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('substrateWallet')
    }
    return null
  })
  const publicClient = usePublicClient()

  const contractAddress = chainId 
    ? CONTRACT_CONFIG.address[activeContract][chainId] 
    : undefined

  const contractAbi = CONTRACT_CONFIG.abi[activeContract]

  console.log("Contract Address:", contractAddress)
  console.log("activeContract:", activeContract)
  console.log("chainId:", chainId)

  const { data: walletsInCap } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getWalletsInCap',
    args: [BigInt(1)],
    query: {
      enabled: !!contractAddress
    }
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

  async function fetchVestingData() {
    setIsLoading(true)
    setError(null)

    try {
      const walletsInCap = await publicClient?.readContract({
        address: contractAddress as Address,
        abi: contractAbi,
        functionName: 'getWalletsInCap',
        args: [BigInt(0)],
      }) as Address[]

      if (!walletsInCap || !publicClient || !contractAddress) return

      const newVestingData = new Map<number, VestingData>()

      if (activeContract === CONTRACT_TYPES.TESTNET_MINING) {
        // For testnet mining, we need to get the cap IDs one by one
        let index = 0;
        const foundCapIds: bigint[] = [];
        
        while (true) {
          try {
            const capId = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'capIds',
              args: [BigInt(index)]
            }) as bigint;
            
            foundCapIds.push(capId);
            index++;
          } catch (error) {
            // When we hit an error, we've reached the end of the array
            break;
          }
        }

        for (const capId of foundCapIds) {
          const walletsInThisCap = await publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'getWalletsInCap',
            args: [capId]
          }) as Address[]

          if (walletsInThisCap.includes(userAddress as Address)) {
            console.log("Wallets in this cap:", walletsInThisCap);
            const capTuple = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'vestingCaps',
              args: [capId]
            }) as readonly [bigint, `0x${string}`, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]

            const cap: VestingCap = {
              totalAllocation: capTuple[0],
              name: capTuple[1],
              cliff: capTuple[2],
              vestingTerm: capTuple[3],
              vestingPlan: capTuple[4],
              initialRelease: capTuple[5],
              startDate: capTuple[6],
              allocatedToWallets: capTuple[7],
              wallets: [] // This will be populated by the next contract call
            }

            const walletInfo = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'vestingWallets',
              args: [userAddress as Address, capId]
            }) as any

            let claimableAmount = BigInt(0)
            let errorMessage = ''

            try {
              console.log("substrateWallet:", substrateWallet);
              if (substrateWallet) {
                claimableAmount = await publicClient.readContract({
                  address: contractAddress,
                  abi: contractAbi,
                  functionName: 'calculateDueTokens',
                  args: [userAddress as Address, substrateWallet, capId]
                }) as bigint
                console.log("Claimable amount:", claimableAmount);
              }
            } catch (error) {
              errorMessage = error instanceof Error ? error.message : String(error)
              console.error('Claim calculation error:', error)
            }

            const substrateRewards = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'getSubstrateRewards',
              args: [userAddress as Address]
            }) as [bigint, bigint]

            const [_capId, walletName, amount, claimed, monthlyClaimedRewards, lastClaimMonth] = walletInfo
            const { totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate, allocatedToWallets, maxRewardsPerMonth, ratio } = cap

            newVestingData.set(Number(capId), {
              capId: Number(capId),
              name: decodeBytes32String(name),
              totalAllocation,
              claimed: BigInt(0),  // Initialize as 0
              claimable: claimableAmount || BigInt(0),  // Use claimableAmount if available, otherwise 0
              cliff: Number(cliff),
              vestingTerm: Number(vestingTerm),
              vestingPlan: Number(vestingPlan),
              initialRelease: Number(initialRelease),
              startDate: Number(startDate),
              allocatedToWallets,
              maxRewardsPerMonth,
              ratio,
              walletInfo: {
                capId: _capId,
                name: decodeBytes32String(walletName),
                amount,
                claimed,
                monthlyClaimedRewards,
                lastClaimMonth,
                claimableAmount,
                errorMessage
              },
              substrateRewards: {
                lastUpdate: substrateRewards[0],
                amount: substrateRewards[1]
              }
            })
          }
        }
        setVestingData(newVestingData)
        setIsLoading(false)
        return
      }

      let index = 0
      while (true) {
        try {
          // Read cap ID at current index
          console.log("Index:", index, "Contract Address:", contractAddress)
          const capIds = await publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'capIds',
            args: []
          }) as bigint[]

          if (index >= capIds.length) break
          const capId = capIds[index]

          // Get cap details
          const capTuple = await publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'vestingCaps',
            args: [capId]
          }) as readonly [bigint, `0x${string}`, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]

          const cap: VestingCap = {
            totalAllocation: capTuple[0],
            name: capTuple[1],
            cliff: capTuple[2],
            vestingTerm: capTuple[3],
            vestingPlan: capTuple[4],
            initialRelease: capTuple[5],
            startDate: capTuple[6],
            allocatedToWallets: capTuple[7],
            wallets: [] // This will be populated by the next contract call
          }

          // Get wallets in this cap
          const walletsInThisCap = await publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'getWalletsInCap',
            args: [capId]
          }) as Address[]

          console.log(`Cap ${capId} wallets:`, walletsInThisCap)
          let claimableAmount = BigInt(0);
          let errorMessage = '';

          if (walletsInThisCap.includes(userAddress as Address)) {
            // Get wallet info
            const walletInfo = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'vestingWallets',
              args: [userAddress as Address, capId]
            })

            try {
              // Calculate claimable amount
              claimableAmount = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'calculateDueTokens',
                args: [userAddress as Address, capId]
              }) as bigint
            } catch (error: any) {
              errorMessage = parseContractError(error);
              console.error('Claim calculation error:', error);
            }

            const [_capId, walletName, amount, claimed] = walletInfo as [bigint, string, bigint, bigint];
            const { totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate } = cap

            console.log("here", capId, walletName, amount, claimed, totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate)
            console.log("here2", {name: name, decodedName: decodeBytes32String(name)})
            newVestingData.set(Number(capId), {
              capId: Number(capId),
              name: decodeBytes32String(name),
              totalAllocation,
              claimed: BigInt(0),  // Initialize as 0
              claimable: claimableAmount || BigInt(0),  // Use claimableAmount if available, otherwise 0
              cliff: Number(cliff),
              vestingTerm: Number(vestingTerm),
              vestingPlan: Number(vestingPlan),
              initialRelease: Number(initialRelease),
              startDate: Number(startDate),
              errorMessage,
              walletInfo: {
                capId: _capId,
                name: decodeBytes32String(walletName),
                amount,
                claimed,
                claimableAmount,
                errorMessage
              }
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

  const loadTestnetData = (wallet: string) => {
    console.log("Setting substrate wallet to:", wallet);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('substrateWallet', wallet);
    }
    setSubstrateWallet(wallet);
  }

  useEffect(() => {
    console.log("Current substrate wallet:", substrateWallet);
    const fetchVestingData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const walletsInCap = await publicClient?.readContract({
          address: contractAddress as Address,
          abi: contractAbi,
          functionName: 'getWalletsInCap',
          args: [BigInt(0)]
        }) as Address[]

        if (!walletsInCap || !publicClient || !contractAddress) return

        const newVestingData = new Map<number, VestingData>()

        if (activeContract === CONTRACT_TYPES.TESTNET_MINING) {
          // For testnet mining, we need to get the cap IDs one by one
          let index = 0;
          const foundCapIds: bigint[] = [];
          
          while (true) {
            try {
              const capId = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'capIds',
                args: [BigInt(index)]
              }) as bigint;
              
              foundCapIds.push(capId);
              index++;
            } catch (error) {
              // When we hit an error, we've reached the end of the array
              break;
            }
          }

          for (const capId of foundCapIds) {
            const walletsInThisCap = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'getWalletsInCap',
              args: [capId]
            }) as Address[]

            if (walletsInThisCap.includes(userAddress as Address)) {
              console.log("Wallets in this cap:", walletsInThisCap);
              const capTuple = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'vestingCaps',
                args: [capId]
              }) as readonly [bigint, `0x${string}`, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]

              const cap: VestingCap = {
                totalAllocation: capTuple[0],
                name: capTuple[1],
                cliff: capTuple[2],
                vestingTerm: capTuple[3],
                vestingPlan: capTuple[4],
                initialRelease: capTuple[5],
                startDate: capTuple[6],
                allocatedToWallets: capTuple[7],
                wallets: [] // This will be populated by the next contract call
              }

              const walletInfo = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'vestingWallets',
                args: [userAddress as Address, capId]
              }) as any

              let claimableAmount = BigInt(0)
              let errorMessage = ''

              try {
                if (substrateWallet) {
                  claimableAmount = await publicClient.readContract({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName: 'calculateDueTokens',
                    args: [userAddress as Address, substrateWallet, capId]
                  }) as bigint
                }
              } catch (error) {
                errorMessage = error instanceof Error ? error.message : String(error)
                console.error('Claim calculation error:', error)
              }

              const substrateRewards = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'getSubstrateRewards',
                args: [userAddress as Address]
              }) as [bigint, bigint]

              const [_capId, walletName, amount, claimed, monthlyClaimedRewards, lastClaimMonth] = walletInfo
              const { totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate, allocatedToWallets, maxRewardsPerMonth, ratio } = cap

              newVestingData.set(Number(capId), {
                capId: Number(capId),
                name: decodeBytes32String(name),
                totalAllocation,
                claimed: BigInt(0),  // Initialize as 0
                claimable: claimableAmount || BigInt(0),  // Use claimableAmount if available, otherwise 0
                cliff: Number(cliff),
                vestingTerm: Number(vestingTerm),
                vestingPlan: Number(vestingPlan),
                initialRelease: Number(initialRelease),
                startDate: Number(startDate),
                allocatedToWallets,
                maxRewardsPerMonth,
                ratio,
                walletInfo: {
                  capId: _capId,
                  name: decodeBytes32String(walletName),
                  amount,
                  claimed,
                  monthlyClaimedRewards,
                  lastClaimMonth,
                  claimableAmount,
                  errorMessage
                },
                substrateRewards: {
                  lastUpdate: substrateRewards[0],
                  amount: substrateRewards[1]
                }
              })
            }
          }
          setVestingData(newVestingData)
          setIsLoading(false)
          return
        }

        let index = 0;
        const foundCapIds: bigint[] = [];
        
        while (true) {
          try {
            const capId = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'capIds',
              args: [BigInt(index)]
            }) as bigint;
            
            foundCapIds.push(capId);
            index++;
          } catch (error) {
            // When we hit an error, we've reached the end of the array
            break;
          }
        }
        for (let i = 0; i < foundCapIds.length; i++) {
          try {
            // Read cap ID at current index
            console.log("Index:", i, "Contract Address:", contractAddress)
            const capId = foundCapIds[i]

            // Get cap details
            const capTuple = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'vestingCaps',
              args: [capId]
            }) as readonly [bigint, `0x${string}`, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]

            const cap: VestingCap = {
              totalAllocation: capTuple[0],
              name: capTuple[1],
              cliff: capTuple[2],
              vestingTerm: capTuple[3],
              vestingPlan: capTuple[4],
              initialRelease: capTuple[5],
              startDate: capTuple[6],
              allocatedToWallets: capTuple[7],
              wallets: [] // This will be populated by the next contract call
            }

            // Get wallets in this cap
            const walletsInThisCap = await publicClient.readContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'getWalletsInCap',
              args: [capId]
            }) as Address[]

            console.log(`Cap ${capId} wallets:`, walletsInThisCap)
            let claimableAmount = BigInt(0);
            let errorMessage = '';

            if (walletsInThisCap.includes(userAddress as Address)) {
              // Get wallet info
              const walletInfo = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'vestingWallets',
                args: [userAddress as Address, capId]
              })

              try {
                // Calculate claimable amount
                claimableAmount = await publicClient.readContract({
                  address: contractAddress,
                  abi: contractAbi,
                  functionName: 'calculateDueTokens',
                  args: [userAddress as Address, capId]
                }) as bigint
              } catch (error: any) {
                errorMessage = parseContractError(error);
                console.error('Claim calculation error:', error);
              }

              const [_capId, walletName, amount, claimed] = walletInfo as [bigint, string, bigint, bigint];
              const { totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate } = cap

              console.log("here", capId, walletName, amount, claimed, totalAllocation, name, cliff, vestingTerm, vestingPlan, initialRelease, startDate)
              console.log("here2", {name: name, decodedName: decodeBytes32String(name)})
              newVestingData.set(Number(capId), {
                capId: Number(capId),
                name: decodeBytes32String(name),
                totalAllocation,
                claimed: BigInt(0),  // Initialize as 0
                claimable: claimableAmount || BigInt(0),  // Use claimableAmount if available, otherwise 0
                cliff: Number(cliff),
                vestingTerm: Number(vestingTerm),
                vestingPlan: Number(vestingPlan),
                initialRelease: Number(initialRelease),
                startDate: Number(startDate),
                errorMessage,
                walletInfo: {
                  capId: _capId,
                  name: decodeBytes32String(walletName),
                  amount,
                  claimed,
                  claimableAmount,
                  errorMessage
                }
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
  }, [userAddress, contractAddress, walletsInCap, publicClient, substrateWallet])

  useEffect(() => {
    if (activeContract !== CONTRACT_TYPES.TESTNET_MINING) {
      setSubstrateWallet(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('substrateWallet');
      }
    }
  }, [activeContract]);

  const { writeContractAsync } = useWriteContract()

  const handleClaim = async (capId: number) => {
    if (!userAddress) return Promise.reject(new Error('Wallet not connected'))
    if (!contractAddress) return Promise.reject(new Error('Contract not configured'))

    try {
      console.log("Initiating claim for capId:", capId)
      console.log("Active Contract:", activeContract)
      console.log("Substrate Wallet:", substrateWallet)
      console.log("User Address:", userAddress)
      console.log("Wallets in Cap:", walletsInCap)
      console.log("contractAddress:", contractAddress)
      console.log("contractAbi:", contractAbi)

      if (activeContract === CONTRACT_TYPES.TESTNET_MINING) {
        if (!substrateWallet) {
          console.log("Substrate wallet is missing")
          return Promise.reject(new Error('Substrate wallet not provided'))
        }
        try {
          // Create a custom ABI entry for the claimTokens function with correct types
          const customClaimFunction = {
            name: 'claimTokens',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'substrateWallet', type: 'string' },
              { name: 'capId', type: 'uint256' }
            ],
            outputs: []
          };

          console.log("Simulating contract call with params:", {
            account: userAddress,
            address: contractAddress,
            functionName: 'claimTokens',
            args: [substrateWallet, BigInt(capId)]
          });

          // First simulate the contract call with the custom ABI
          const { request } = await publicClient.simulateContract({
            account: userAddress,
            address: contractAddress,
            abi: [customClaimFunction],
            functionName: 'claimTokens',
            args: [substrateWallet, BigInt(capId)],
            gas: BigInt(3000000),
          })
          
          console.log("Simulation successful, simulation result:", request)
          
          // If simulation is successful, proceed with the actual transaction
          console.log("Proceeding with actual transaction using request:", request)
          const hash = await writeContractAsync(request)
          
          console.log("Transaction hash:", hash)
          return hash
        } catch (err) {
          console.error("Full error object:", err)
          // Try to extract more detailed error information
          let errorMessage = err instanceof Error ? err.message : String(err)
          
          // Check for specific error types
          if (err.cause) {
            console.error("Error cause:", err.cause)
            errorMessage += ` (Cause: ${err.cause})`
          }
          
          // Log the error stack if available
          if (err instanceof Error && err.stack) {
            console.error("Error stack:", err.stack)
          }
          
          console.error("Detailed claim error:", errorMessage)
          throw new Error(errorMessage)
        }
      } else {
        try {
          if (!publicClient) {
            throw new Error('Public client is not initialized');
          }

          console.log("Simulating non-testnet contract call with params:", {
            account: userAddress,
            address: contractAddress,
            functionName: 'claimTokens',
            args: [BigInt(capId), BigInt(chainId || 1)]
          });

          // For other contracts, follow the same pattern
          const { request } = await publicClient.simulateContract({
            account: userAddress,
            address: contractAddress,
            abi: contractAbi,
            functionName: 'claimTokens',
            args: [BigInt(capId), BigInt(chainId || 1)]
          })
          
          console.log("Simulation successful, proceeding with transaction. Request:", request)
          const hash = await writeContractAsync(request)
          
          console.log("Transaction hash:", hash)
          return hash
        } catch (err) {
          console.error("Full error object:", err)
          const errorMessage = err instanceof Error ? err.message : String(err)
          console.error("Non-testnet claim error:", errorMessage)
          throw new Error(errorMessage)
        }
      }
    } catch (err) {
      console.error("Top-level error:", err)
      return Promise.reject(err instanceof Error ? err : new Error(String(err)))
    }
  }

  return {
    vestingData,
    isLoading: isLoading,
    error,
    claimTokens: handleClaim,
    loadTestnetData,
    substrateWallet,  // Expose the substrate wallet
  }
}
