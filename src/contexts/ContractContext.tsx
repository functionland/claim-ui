// contexts/ContractContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react'
import { useAccount, usePublicClient, useReadContract, useBalance, useWalletClient } from 'wagmi'
import { type Address } from 'viem'
import { ethers } from 'ethers'
import { ContractType, CONTRACT_CONFIG } from '@/config/contracts'
import { CONTRACT_TYPES } from '@/config/constants'
import { getContract } from 'viem'

interface ContractContracts {
  staking?: ethers.Contract; // Using ethers.Contract type
  vesting?: ethers.Contract;
  token?: ethers.Contract;
  airdrop?: ethers.Contract;
  testnetMining?: ethers.Contract;
  storagePool?: ethers.Contract;
  rewardEngine?: ethers.Contract;
}

interface ContractContextType {
  activeContract: ContractType
  setActiveContract: (type: ContractType) => void
  contracts: ContractContracts
  chainId: number | undefined
  address: Address | undefined
  balance: bigint | undefined
  isConnected: boolean
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: ReactNode }) {
  const [activeContract, setActiveContract] = useState<ContractType>(CONTRACT_TYPES.VESTING)
  
  const { address, chainId, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: balance } = useBalance({
    address,
  })

  // Get wallet client for creating signers
  const { data: walletClient } = useWalletClient()

  // Create contract instances using ethers.js
  const contracts = useMemo(() => {
    if (!chainId || !publicClient) {
      console.log('No chainId or publicClient available')
      return {}
    }

    console.log('Initializing contracts for chainId:', chainId)
    
    // Create an object to hold all contract instances
    const newContracts: ContractContracts = {}
    
    try {
      // Try to create a proper ethers.js provider for direct contract interaction
      const provider = new ethers.JsonRpcProvider(publicClient.transport.url)
      
      // Initialize staking contract
      const stakingAddress = CONTRACT_CONFIG.address[CONTRACT_TYPES.STAKING]?.[chainId]
      console.log('Staking contract address for chainId', chainId, ':', stakingAddress)
      
      if (stakingAddress) {
        try {
          newContracts.staking = new ethers.Contract(
            stakingAddress,
            CONTRACT_CONFIG.abi[CONTRACT_TYPES.STAKING],
            provider
          )
          console.log('Staking contract successfully initialized')
        } catch (error) {
          console.error('Error initializing staking contract:', error)
        }
      } else {
        console.log('No staking address found for this chain')
      }
      
      // Initialize vesting contract
      const vestingAddress = CONTRACT_CONFIG.address[CONTRACT_TYPES.VESTING]?.[chainId]
      if (vestingAddress) {
        newContracts.vesting = new ethers.Contract(
          vestingAddress,
          CONTRACT_CONFIG.abi[CONTRACT_TYPES.VESTING],
          provider
        )
      }
      
      // Initialize token contract
      const tokenAddress = CONTRACT_CONFIG.address[CONTRACT_TYPES.TOKEN]?.[chainId]
      if (tokenAddress) {
        newContracts.token = new ethers.Contract(
          tokenAddress,
          CONTRACT_CONFIG.abi[CONTRACT_TYPES.TOKEN],
          provider
        )
      }
      
      // Initialize airdrop contract
      const airdropAddress = CONTRACT_CONFIG.address[CONTRACT_TYPES.AIRDROP]?.[chainId]
      if (airdropAddress) {
        newContracts.airdrop = new ethers.Contract(
          airdropAddress,
          CONTRACT_CONFIG.abi[CONTRACT_TYPES.AIRDROP],
          provider
        )
      }
      
      // Initialize testnet mining contract
      const testnetMiningAddress = CONTRACT_CONFIG.address[CONTRACT_TYPES.TESTNET_MINING]?.[chainId]
      if (testnetMiningAddress) {
        newContracts.testnetMining = new ethers.Contract(
          testnetMiningAddress,
          CONTRACT_CONFIG.abi[CONTRACT_TYPES.TESTNET_MINING],
          provider
        )
      }

      // Initialize storage pool contract
      const storagePoolAddress = CONTRACT_CONFIG.address[CONTRACT_TYPES.STORAGE_POOL]?.[chainId]
      if (storagePoolAddress) {
        newContracts.storagePool = new ethers.Contract(
          storagePoolAddress,
          CONTRACT_CONFIG.abi[CONTRACT_TYPES.STORAGE_POOL],
          provider
        )
      }

      // Initialize reward engine contract
      const rewardEngineAddress = CONTRACT_CONFIG.address[CONTRACT_TYPES.REWARD_ENGINE]?.[chainId]
      if (rewardEngineAddress) {
        newContracts.rewardEngine = new ethers.Contract(
          rewardEngineAddress,
          CONTRACT_CONFIG.abi[CONTRACT_TYPES.REWARD_ENGINE],
          provider
        )
      }

      console.log('All contracts initialized:', Object.keys(newContracts))
    } catch (error) {
      console.error('Error initializing contracts:', error)
    }
    
    return newContracts
  }, [chainId, publicClient, address])
  
  return (
    <ContractContext.Provider value={{ 
      activeContract, 
      setActiveContract,
      contracts,
      chainId,
      address,
      balance: balance?.value,
      isConnected
    }}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContractContext() {
  const context = useContext(ContractContext)
  if (!context) {
    throw new Error('useContractContext must be used within a ContractProvider')
  }
  return context
}
