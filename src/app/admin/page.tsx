'use client'

import { useState } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Tabs,
  Tab,
} from '@mui/material'
import { VestingAdmin } from '@/components/admin/VestingAdmin'
import { AirdropAdmin } from '@/components/admin/AirdropAdmin'
import { TestnetMiningAdmin } from '@/components/admin/TestnetMiningAdmin'
import { TokenAdmin } from '@/components/admin/TokenAdmin'
import { StakingAdmin } from '@/components/admin/StakingAdmin'
import { CONTRACT_TYPES, ContractType } from '@/config/constants'
import { useContractContext } from '@/contexts/ContractContext'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('token')
  const { setActiveContract } = useContractContext()

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
    // Update the global contract context when tab changes
    if (newValue !== 'token') {
      setActiveContract(newValue as ContractType)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contract Administration
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="contract admin tabs"
        >
          <Tab label="Token" value="token" />
          <Tab label="Distribution" value={CONTRACT_TYPES.VESTING} />
          <Tab label="Airdrop" value={CONTRACT_TYPES.AIRDROP} />
          <Tab label="Testnet Mining" value={CONTRACT_TYPES.TESTNET_MINING} />
          <Tab label="Staking" value={CONTRACT_TYPES.STAKING} />
        </Tabs>
      </Box>

      <Paper sx={{ p: 3 }}>
        {activeTab === 'token' && <TokenAdmin />}
        {activeTab === CONTRACT_TYPES.VESTING && <VestingAdmin />}
        {activeTab === CONTRACT_TYPES.AIRDROP && <AirdropAdmin />}
        {activeTab === CONTRACT_TYPES.TESTNET_MINING && <TestnetMiningAdmin />}
        {activeTab === CONTRACT_TYPES.STAKING && <StakingAdmin />}
      </Paper>
    </Container>
  )
}
