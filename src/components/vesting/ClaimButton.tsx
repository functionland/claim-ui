'use client'

import { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import { useVestingContract } from '@/hooks/useVestingContract'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import type { FC } from 'react'

interface ClaimButtonProps {
  readonly capId: number
  readonly claimableAmount: bigint
}

export const ClaimButton: FC<ClaimButtonProps> = ({ 
  capId,
  claimableAmount
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { claimTokens } = useVestingContract()

  const handleClaim = async () => {
    try {
      setIsLoading(true)
      await claimTokens(capId)
    } catch (error) {
      console.error('Claim error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = claimableAmount <= 0n || isLoading

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      disabled={isDisabled}
      onClick={handleClaim}
      startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
    >
      {isLoading
        ? 'Claiming...'
        : claimableAmount <= 0n
        ? 'No Tokens Available'
        : `Claim ${formatEther(claimableAmount)} Tokens`}
    </Button>
  )
}
