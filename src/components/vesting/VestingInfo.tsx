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
  const cliffEndTime = vestingData.startDate + (vestingData.cliff * 24 * 60 * 60 * 1000)
  const isCliffReached = currentTime >= cliffEndTime

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
        boxShadow: theme.shadows[4],
        transition: 'box-shadow 0.3s ease-in-out'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          {vestingData.name || 'Unnamed Cap'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <InfoItem 
                label="Total Allocation"
                value={`${formatEther(vestingData.totalAllocation)} Tokens`}
              />
              <InfoItem 
                label="Claimed Amount"
                value={`${formatEther(vestingData.claimed)} Tokens`}
              />
              <InfoItem 
                label="Available to Claim"
                value={`${formatEther(vestingData.claimable)} Tokens`}
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <InfoItem 
                label="Vesting Start Date"
                value={new Date(vestingData.startDate).toLocaleString()}
              />
              <InfoItem 
                label="Initial Release"
                value={`${vestingData.initialRelease}%`}
              />
              <InfoItem 
                label="Cliff Period"
                value={`${vestingData.cliff} days`}
              />
              <InfoItem 
                label="Vesting Term"
                value={`${vestingData.vestingTerm} months (every ${vestingData.vestingPlan} months)`}
              />
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <ClaimButton 
            capId={vestingData.capId}
            claimableAmount={vestingData.claimable}
          />
        </Box>
      </CardContent>
    </Card>
  )
}
