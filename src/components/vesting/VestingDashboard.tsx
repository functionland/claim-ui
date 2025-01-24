'use client'

import { useVestingContract } from '@/hooks/useVestingContract'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Alert } from '@mui/material'
import { VestingInfo } from './VestingInfo'
import ClientOnly from '@/components/common/ClientOnly'

export function VestingDashboard() {
  const { vestingData, isLoading, error } = useVestingContract()

  return (
    <ClientOnly>
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
