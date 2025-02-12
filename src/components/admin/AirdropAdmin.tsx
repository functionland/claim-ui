'use client'

import { useState } from 'react'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { 
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material'
import { ethers } from 'ethers'
import { CONTRACT_CONFIG, CONTRACT_TYPES } from '@/config/contracts'

export function AirdropAdmin() {
  const { address } = useAccount()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    capId: '',
    name: '',
    totalAllocation: '',
    cliff: '',
    vestingTerm: '',
    vestingPlan: '',
    initialRelease: '',
    beneficiaryAddress: '',
    beneficiaryAmount: '',
  })

  // Contract interactions
  const { write: addVestingCap, isLoading: isAddingCap } = useContractWrite({
    address: CONTRACT_CONFIG.address[CONTRACT_TYPES.AIRDROP][1], // Using mainnet for now
    abi: CONTRACT_CONFIG.abi[CONTRACT_TYPES.AIRDROP],
    functionName: 'addVestingCap',
  })

  const { write: createProposal, isLoading: isCreatingProposal } = useContractWrite({
    address: CONTRACT_CONFIG.address[CONTRACT_TYPES.AIRDROP][1],
    abi: CONTRACT_CONFIG.abi[CONTRACT_TYPES.AIRDROP],
    functionName: 'createProposal',
  })

  const handleAddCap = async () => {
    try {
      setError(null)
      addVestingCap?.({
        args: [
          BigInt(formData.capId),
          ethers.encodeBytes32String(formData.name),
          ethers.parseEther(formData.totalAllocation),
          BigInt(Number(formData.cliff) * 86400), // Convert days to seconds
          BigInt(Number(formData.vestingTerm)), // Months
          BigInt(Number(formData.vestingPlan)), // Months
          BigInt(Number(formData.initialRelease)),
        ],
      })
    } catch (error) {
      setError('Failed to add airdrop cap')
    }
  }

  const handleAddBeneficiary = async () => {
    try {
      setError(null)
      createProposal?.({
        args: [
          BigInt(7), // AddDistributionWallets type
          BigInt(formData.capId),
          formData.beneficiaryAddress as `0x${string}`,
          ethers.encodeBytes32String('Beneficiary'),
          ethers.parseEther(formData.beneficiaryAmount),
          '0x0000000000000000000000000000000000000000',
        ],
      })
    } catch (error) {
      setError('Failed to add beneficiary')
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Airdrop Contract Administration
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage airdrop caps and beneficiaries
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Airdrop Cap
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cap ID"
              value={formData.capId}
              onChange={(e) => setFormData({ ...formData, capId: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Total Allocation"
              value={formData.totalAllocation}
              onChange={(e) => setFormData({ ...formData, totalAllocation: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cliff (days)"
              value={formData.cliff}
              onChange={(e) => setFormData({ ...formData, cliff: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vesting Term (months)"
              value={formData.vestingTerm}
              onChange={(e) => setFormData({ ...formData, vestingTerm: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vesting Plan (months)"
              value={formData.vestingPlan}
              onChange={(e) => setFormData({ ...formData, vestingPlan: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Initial Release (%)"
              value={formData.initialRelease}
              onChange={(e) => setFormData({ ...formData, initialRelease: e.target.value })}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddCap}
            disabled={isAddingCap}
            startIcon={isAddingCap ? <CircularProgress size={20} /> : null}
          >
            {isAddingCap ? 'Adding...' : 'Add Cap'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Beneficiary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Beneficiary Address"
              value={formData.beneficiaryAddress}
              onChange={(e) => setFormData({ ...formData, beneficiaryAddress: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              value={formData.beneficiaryAmount}
              onChange={(e) => setFormData({ ...formData, beneficiaryAmount: e.target.value })}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddBeneficiary}
            disabled={isCreatingProposal}
            startIcon={isCreatingProposal ? <CircularProgress size={20} /> : null}
          >
            {isCreatingProposal ? 'Adding...' : 'Add Beneficiary'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
