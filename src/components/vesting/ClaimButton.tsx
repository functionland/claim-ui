'use client'

import { useState, useEffect } from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import { useVestingContract } from '@/hooks/useVestingContract'
import { formatEther } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import type { FC } from 'react'
import { isContractError } from '../../utils/errors';
import { useContractContext } from '@/contexts/ContractContext';
import { useSearchParams } from 'next/navigation';

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
  const [isClaimTimeEnabled, setIsClaimTimeEnabled] = useState(false)
  const { claimTokens, substrateWallet } = useVestingContract()
  const { activeContract } = useContractContext()
  const searchParams = useSearchParams()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError, isLoadingError, isPending } = useWaitForTransactionReceipt({
    hash: transactionHash,
  })

  // Check if the current time is 12:00 PM UTC or if the special code is in URL
  useEffect(() => {
    const checkTimeAndCode = () => {
      // Check for code=ehsan in URL
      const codeParam = searchParams.get('code')
      const hasSpecialCode = codeParam === 'ehsan'
      
      // Check if it's 12:00 PM UTC
      const now = new Date()
      const isNoonUTC = now.getUTCHours() === 12 && now.getUTCMinutes() === 0
      
      setIsClaimTimeEnabled(isNoonUTC || hasSpecialCode)
    }
    
    // Check immediately and then every minute
    checkTimeAndCode()
    const intervalId = setInterval(checkTimeAndCode, 60000)
    
    return () => clearInterval(intervalId)
  }, [searchParams])

  useEffect(() => {
    console.log('isConfirmed:', isConfirmed, 'isConfirming:', isConfirming, 'isError:', isError, 'isLoadingError:', isLoadingError, 'isPending:', isPending)
    if (isConfirmed) {
      setIsWalletLoading(false)
      setTransactionHash(undefined)
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
  
  // Button is disabled if:
  // 1. No claimable amount, or
  // 2. A transaction is in progress, or
  // 3. It's not 12:00 PM UTC and there's no special code in the URL
  const isDisabled = claimableAmount <= 0n || isWalletLoading || isConfirming || !isClaimTimeEnabled

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
          : !isClaimTimeEnabled
          ? 'Claiming available at 12:00 PM UTC'
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
