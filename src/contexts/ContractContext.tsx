// contexts/ContractContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'
import { ContractType, CONTRACT_TYPES } from '@/config/contracts'

interface ContractContextType {
  activeContract: ContractType
  setActiveContract: (type: ContractType) => void
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: ReactNode }) {
    const [activeContract, setActiveContract] = useState<ContractType>(CONTRACT_TYPES.VESTING)
  
    return (
      <ContractContext.Provider value={{ activeContract, setActiveContract }}>
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
