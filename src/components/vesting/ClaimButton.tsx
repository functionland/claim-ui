'use client'

import { useState } from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import { useVestingContract } from '@/hooks/useVestingContract'
import { formatEther } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import type { FC } from 'react'

interface ClaimButtonProps {
  readonly capId: number
  readonly claimableAmount: bigint
}

export const ClaimButton: FC<ClaimButtonProps> = ({ 
  capId,
  claimableAmount,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<string | null>(null)
  const { claimTokens } = useVestingContract()

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: transactionHash,
    onSuccess: () => {
      setIsLoading(false)
      setTransactionHash(undefined)
      // You might want to refresh the vesting data here
    },
    onError: (error) => {
      setError(`Transaction failed: ${error.message}`)
      setIsLoading(false)
      setTransactionHash(undefined)
    },
  })

  const handleClaim = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const hash = await claimTokens(capId)
      if (hash) {
        setTransactionHash(hash)
      }
    } catch (error) {
      console.error('Claim error:', error)
      setError(error instanceof Error ? error.message : 'Claim failed')
      setIsLoading(false)
    }
  }

  const isDisabled = claimableAmount <= 0n || isLoading || isConfirming

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={isDisabled}
        onClick={handleClaim}
        startIcon={(isLoading || isConfirming) && <CircularProgress size={20} color="inherit" />}
      >
        {isLoading
          ? 'Confirm in Wallet...'
          : isConfirming
          ? 'Transaction Pending...'
          : claimableAmount <= 0n
          ? 'No Tokens Available'
          : `Claim ${formatEther(claimableAmount)} Tokens`}
      </Button>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!transactionHash} 
        autoHideDuration={null}
      >
        <Alert severity="info">
          Transaction pending... 
        </Alert>
      </Snackbar>
    </>
  )
}
