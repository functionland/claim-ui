'use client'

import { useState, useEffect } from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import { useVestingContract } from '@/hooks/useVestingContract'
import { formatEther } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import type { FC } from 'react'
import { isContractError } from '../../utils/errors';

interface ClaimButtonProps {
  readonly capId: number
  readonly claimableAmount: bigint
}

export const ClaimButton: FC<ClaimButtonProps> = ({ 
  capId,
  claimableAmount,
}) => {
  const [isWalletLoading, setIsWalletLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<string | null>(null)
  const { claimTokens } = useVestingContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError, isLoadingError, isPending } = useWaitForTransactionReceipt({
    hash: transactionHash,
  })

  useEffect(() => {
    console.log('isConfirmed:', isConfirmed, 'isConfirming:', isConfirming, 'isError:', isError, 'isLoadingError:', isLoadingError, 'isPending:', isPending)
    if (isConfirmed) {
      setIsWalletLoading(false)
      setTransactionHash(undefined)
      claimableAmount = 0n
      // Additional success handling
    }
  }, [isConfirmed, isConfirming, isError, isLoadingError, isPending])

  const handleClaim = async () => {
    try {
      setIsWalletLoading(true)
      setError(null)
      
      const hash = await claimTokens(capId)
      if (hash) {
        setTransactionHash(hash)
      }
    } catch (err) {
      console.error('Claim error:', err)
      if (err.code === -32603) {
        setError('Transaction failed. Please check your wallet has enough funds for gas fees.')
      } else {
        setError(err instanceof Error ? err.message : 'Claim failed')
      }
    } finally {
      setIsWalletLoading(false)
    }
  }
  
  

  const isDisabled = claimableAmount <= 0n || isWalletLoading || isConfirming

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={isDisabled}
        onClick={handleClaim}
        startIcon={(isWalletLoading || isConfirming) && <CircularProgress size={20} color="inherit" />}
      >
        {isWalletLoading
          ? 'Confirm in Wallet...'
          : isConfirming
          ? 'Transaction Pending...'
          : isConfirmed
          ? 'Transaction Confirmed'
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
        open={!!transactionHash && isConfirming} 
        autoHideDuration={null}
      >
        <Alert severity="info">
          Transaction pending... 
        </Alert>
      </Snackbar>
    </>
  )
}
