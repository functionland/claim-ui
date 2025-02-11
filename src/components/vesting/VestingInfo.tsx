'use client'

import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Divider,
  Stack,
  useTheme
} from '@mui/material'
import { ClaimButton } from './ClaimButton'
import { formatEther } from 'viem'
import type { VestingData } from '@/types/vesting'

interface VestingInfoProps {
  vestingData: VestingData
}

export function VestingInfo({ vestingData }: VestingInfoProps) {
  if (!vestingData) return null;
  const theme = useTheme();

  const currentTime = Date.now()
  const cliffEndTime = Number(vestingData.startDate) + (Number(vestingData.cliff) * 24 * 60 * 60 * 1000)
  const isCliffReached = currentTime >= cliffEndTime

  const formatBigIntToEther = (value: bigint) => {
    if (!value) return '0'
    return Number(formatEther(value)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  const InfoItem = ({ label, value }: { label: string, value: string | number }) => (
    <Box sx={{ mb: 3 }}>
      <Typography color="text.secondary" variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
        {value}
      </Typography>
    </Box>
  )

  return (
    <Card elevation={2} sx={{ 
      borderRadius: 2,
      '&:hover': { 
        boxShadow: theme.shadows[4]
      },
      height: '100%'
    }}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              {vestingData.name}
              {vestingData.ratio && vestingData.substrateRewards && (
                <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  (Total Testnet Tokens: {formatBigIntToEther(vestingData.substrateRewards.amount)} at ratio of {vestingData.ratio}:1 $FULA)
                </Typography>
              )}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {vestingData.errorMessage ? (
            <Typography color="error">{vestingData.errorMessage}</Typography>
          ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <InfoItem 
                  label="Total Allocation To Cap"
                  value={`${formatBigIntToEther(vestingData.totalAllocation)} Tokens`}
                />
                <InfoItem 
                  label="Claimed Amount"
                  value={`${formatBigIntToEther(vestingData.walletInfo.claimed)} Tokens`}
                />
                <InfoItem 
                  label="Available to Claim"
                  value={`${formatBigIntToEther(vestingData.walletInfo.claimableAmount)} Tokens`}
                />
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <InfoItem 
                  label="Vesting Start Date"
                  value={new Date(Number(vestingData.startDate)).toLocaleString()}
                />
                <InfoItem 
                  label="Initial Release"
                  value={`${Number(vestingData.initialRelease)}%`}
                />
                <InfoItem 
                  label="Cliff Period"
                  value={`${Number(vestingData.cliff / BigInt(24 * 60 * 60))} days`}
                />
                <InfoItem 
                  label="Vesting Term"
                  value={`${Number(vestingData.vestingTerm / BigInt(30 * 24 * 60 * 60))} months (every ${Number(vestingData.vestingPlan / BigInt(30 * 24 * 60 * 60))} months)`}
                />
              </Stack>
            </Grid>
          </Grid>
          )}

          <Box sx={{ mt: 4 }}>
            <ClaimButton 
              capId={vestingData.capId}
              claimableAmount={vestingData.walletInfo?.claimableAmount || BigInt(0)}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
