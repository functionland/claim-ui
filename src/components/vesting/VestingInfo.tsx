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
import { useContractContext } from '@/contexts/ContractContext';
import type { VestingData } from '@/types/vesting'

interface VestingInfoProps {
  vestingData: VestingData
}

export function VestingInfo({ vestingData }: VestingInfoProps) {
  if (!vestingData || typeof vestingData !== 'object') return null;
  const theme = useTheme();
  const { activeContract } = useContractContext();
  const isTestnetMining = activeContract === 'testnetMining';

  const currentTime = Date.now()
  const cliff = Number(vestingData.cliff || 0)
  const startDate = Number(vestingData.startDate || 0)
  const cliffDurationMs = cliff * 24 * 60 * 60 * 1000
  const cliffEndTime = startDate + cliffDurationMs
  const isCliffReached = currentTime >= cliffEndTime

  const formatValue = (value: string | number | bigint | undefined) => {
    if (value === undefined) return 'N/A';
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return String(value);
  }

  const InfoItem = ({ label, value }: { label: string, value: string | number | bigint | undefined }) => (
    <Box sx={{ mb: 3 }}>
      <Typography color="text.secondary" variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
        {formatValue(value)}
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
          {isTestnetMining ? 'Testnet Mining Rewards' : (vestingData.name || 'Unnamed Cap')}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {vestingData.errorMessage ? (
          <Typography color="error">{vestingData.errorMessage}</Typography>
        ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <InfoItem 
                label="Total Mining Rewards"
                value={vestingData.totalAllocation ? `${formatEther(vestingData.totalAllocation)} Tokens` : undefined}
              />
              <InfoItem 
                label={isTestnetMining ? "Claimed Rewards" : "Claimed Amount"}
                value={vestingData.claimed ? `${formatEther(vestingData.claimed)} Tokens` : undefined}
              />
              <InfoItem 
                label={isTestnetMining ? "Available Rewards" : "Available to Claim"}
                value={vestingData.claimable ? `${formatEther(vestingData.claimable)} Tokens` : undefined}
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {!isTestnetMining && (
                <>
                  <InfoItem 
                    label="Vesting Start Date"
                    value={vestingData.startDate ? new Date(Number(vestingData.startDate)).toLocaleString() : undefined}
                  />
                  <InfoItem 
                    label="Initial Release"
                    value={vestingData.initialRelease !== undefined ? `${vestingData.initialRelease}%` : undefined}
                  />
                  <InfoItem 
                    label="Cliff Period"
                    value={vestingData.cliff !== undefined ? `${vestingData.cliff} days` : undefined}
                  />
                  <InfoItem 
                    label="Vesting Term"
                    value={vestingData.vestingTerm !== undefined && vestingData.vestingPlan !== undefined ? 
                      `${vestingData.vestingTerm} months (every ${vestingData.vestingPlan} months)` : 
                      undefined}
                  />
                </>
              )}
              {isTestnetMining && vestingData.substrateRewards && (
                <>
                  <InfoItem 
                    label="Last Update"
                    value={vestingData.substrateRewards.lastUpdate ? 
                      new Date(Number(vestingData.substrateRewards.lastUpdate)).toLocaleString() : 
                      undefined}
                  />
                  <InfoItem 
                    label="Substrate Rewards"
                    value={vestingData.substrateRewards.amount ? 
                      `${formatEther(vestingData.substrateRewards.amount)} Tokens` : 
                      undefined}
                  />
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
        )}

        <Box sx={{ mt: 4 }}>
          <ClaimButton 
            capId={vestingData.capId}
            claimableAmount={vestingData.claimable ?? BigInt(0)}
          />
        </Box>
      </CardContent>
    </Card>
  )
}