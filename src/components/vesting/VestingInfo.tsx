'use client'

import { Card, CardContent, Typography, Box } from '@mui/material'
import { ClaimButton } from './ClaimButton'
import { formatEther } from 'viem'
import type { VestingData } from '@/types/vesting'

interface VestingInfoProps {
  vestingData: VestingData
}

export function VestingInfo({ vestingData }: VestingInfoProps) {
  if (!vestingData) return null;

  const currentTime = Date.now()
  const cliffEndTime = vestingData.startDate + (vestingData.cliff * 24 * 60 * 60 * 1000)
  const isCliffReached = currentTime >= cliffEndTime

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {vestingData.name || 'Unnamed Cap'}
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Typography color="textSecondary" gutterBottom>
              Total Allocation
            </Typography>
            <Typography variant="h5">
              {formatEther(vestingData.totalAllocation)} Tokens
            </Typography>
            <Typography color="textSecondary" gutterBottom className="mt-4">
              Claimed Amount
            </Typography>
            <Typography variant="h5">
              {formatEther(vestingData.claimed)} Tokens
            </Typography>
            <Typography color="textSecondary" gutterBottom className="mt-4">
              Available to Claim
            </Typography>
            <Typography variant="h5">
              {formatEther(vestingData.claimable)} Tokens
            </Typography>
          </div>
          <div>
            <Typography color="textSecondary" gutterBottom>
              Vesting Start Date
            </Typography>
            <Typography>{new Date(vestingData.startDate).toLocaleString()}</Typography>
            <Typography color="textSecondary" gutterBottom>
              Initial Release
            </Typography>
            <Typography>{vestingData.initialRelease}%</Typography>
            <Typography color="textSecondary" gutterBottom className="mt-4">
              Cliff Period
            </Typography>
            <Typography>{vestingData.cliff} days</Typography>
            <Typography color="textSecondary" gutterBottom className="mt-4">
              Vesting Term
            </Typography>
            <Typography>{vestingData.vestingTerm} months</Typography>
          </div>
        </div>
        <div className="mt-6">
          <ClaimButton 
            capId={vestingData.capId}
            claimableAmount={vestingData.claimable}
            isCliffReached={isCliffReached}
          />
        </div>
      </CardContent>
    </Card>
  )
}
