'use client'

import { useState, useEffect } from 'react'
import { useVestingContract } from '@/hooks/useVestingContract'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Alert, Typography } from '@mui/material'
import { VestingInfo } from './VestingInfo'
import ClientOnly from '@/components/common/ClientOnly'
import { useContractContext } from '@/contexts/ContractContext'
import { CONTRACT_TYPES } from '@/config/contracts'

export function VestingDashboard() {
  const { activeContract } = useContractContext()
  const { vestingData, isLoading, error } = useVestingContract()

  const getTitle = () => {
    return activeContract === CONTRACT_TYPES.VESTING 
      ? "Token Vesting Allocations"
      : activeContract === CONTRACT_TYPES.TESTNET_MINING
        ? "Testnet Mining Allocations"
        : "Airdrop Vesting Allocations"
  }

  return (
    <ClientOnly>
      <Typography variant="h5" gutterBottom>
        {getTitle()}
      </Typography>
      <div className="space-y-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert severity="error" className="mb-4">
            Error loading vesting data: {error.message}
          </Alert>
        ) : vestingData.size === 0 ? (
          <Alert severity="info" className="mb-4">
            No vesting allocations found for your wallet
          </Alert>
        ) : (
          Array.from(vestingData.values()).map((data) => (
            <VestingInfo key={data.capId} vestingData={data} />
          ))
        )}
      </div>
    </ClientOnly>
  )
}
