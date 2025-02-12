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
import { CONTRACT_TYPES } from '@/config/constants';
import type { VestingData } from '@/types/vesting'

interface VestingInfoProps {
  vestingData: VestingData
}

export function VestingInfo({ vestingData }: VestingInfoProps) {
  if (!vestingData || typeof vestingData !== 'object') return null;
  
  // Convert BigInt values to strings for logging
  const loggableData = Object.fromEntries(
    Object.entries(vestingData).map(([key, value]) => [
      key,
      typeof value === 'bigint' ? value.toString() : value
    ])
  );
  
  console.log("Vesting Data:");
  console.log(JSON.stringify(loggableData, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
  
  const theme = useTheme();
  const { activeContract } = useContractContext();
  console.log({activeContract});
  const isTestnetMining = activeContract === CONTRACT_TYPES.TESTNET_MINING;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * (isTestnetMining ? 1000 : 1)).toLocaleDateString();
  };

  const getClaimed = () => {
    console.log({isTestnetMining});
    if (isTestnetMining) {
      console.log({"no": vestingData.walletInfo?.claimed});
      let a = vestingData.walletInfo?.claimed || BigInt(0);
      console.log({"yes": a});
      return a;
    }
    return vestingData.claimed || BigInt(0);
  };

  const getClaimable = () => {
    if (isTestnetMining) {
      return vestingData.walletInfo?.claimableAmount || BigInt(0);
    }
    return vestingData.claimable || BigInt(0);
  };

  const getTotalAllocation = () => {
    if (isTestnetMining) {
      return vestingData.walletInfo?.amount || BigInt(0);
    }
    return vestingData.totalAllocation || BigInt(0);
  };

  const getErrorMessage = () => {
    if (isTestnetMining) {
      return vestingData.walletInfo?.errorMessage || '';
    }
    return vestingData.errorMessage || '';
  };

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
        {getErrorMessage() ? (
          <Typography color="error">{getErrorMessage()}</Typography>
        ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <InfoItem 
                label="Total Mining Rewards"
                value={`${formatEther(getTotalAllocation())} Tokens`}
              />
              <InfoItem 
                label={isTestnetMining ? "Claimed Rewards" : "Claimed Amount"}
                value={`${formatEther(getClaimed())} Tokens`}
              />
              <InfoItem 
                label={isTestnetMining ? "Available Rewards" : "Available to Claim"}
                value={`${formatEther(getClaimable())} Tokens`}
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {!isTestnetMining && (
                <>
                  <InfoItem 
                    label="Vesting Start Date"
                    value={vestingData.startDate ? formatDate(Number(vestingData.startDate)) : undefined}
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
            claimableAmount={getClaimable()}
          />
        </Box>
      </CardContent>
    </Card>
  )
}