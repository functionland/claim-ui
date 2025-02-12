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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ethers } from 'ethers'
import { CONTRACT_CONFIG, CONTRACT_TYPES } from '@/config/contracts'

interface VestingCap {
  id: number
  name: string
  totalAllocation: string
  cliff: number
  vestingTerm: number
  vestingPlan: number
  initialRelease: number
}

interface VestingWallet {
  address: string
  capId: number
  amount: string
  released: string
  note: string
}

interface Proposal {
  id: string
  type: number
  target: string
  amount: string
  status: string
  approvals: number
}

export function VestingAdmin() {
  const { address } = useAccount()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    capName: '',
    totalAllocation: '',
    cliff: '',
    vestingTerm: '',
    vestingPlan: '',
    initialRelease: '',
    walletAddress: '',
    capId: '',
    amount: '',
    note: '',
    proposalId: '',
  })

  // Contract interactions
  const { write: createVestingCap, isLoading: isCreatingCap } = useContractWrite({
    address: CONTRACT_CONFIG.address[CONTRACT_TYPES.VESTING][1], // Using mainnet for now
    abi: CONTRACT_CONFIG.abi[CONTRACT_TYPES.VESTING],
    functionName: 'createVestingCap',
  })

  const { write: addVestingWallet, isLoading: isAddingWallet } = useContractWrite({
    address: CONTRACT_CONFIG.address[CONTRACT_TYPES.VESTING][1],
    abi: CONTRACT_CONFIG.abi[CONTRACT_TYPES.VESTING],
    functionName: 'addVestingWallet',
  })

  const { write: approveProposal, isLoading: isApproving } = useContractWrite({
    address: CONTRACT_CONFIG.address[CONTRACT_TYPES.VESTING][1],
    abi: CONTRACT_CONFIG.abi[CONTRACT_TYPES.VESTING],
    functionName: 'approveProposal',
  })

  const { write: executeProposal, isLoading: isExecuting } = useContractWrite({
    address: CONTRACT_CONFIG.address[CONTRACT_TYPES.VESTING][1],
    abi: CONTRACT_CONFIG.abi[CONTRACT_TYPES.VESTING],
    functionName: 'executeProposal',
  })

  const handleCreateVestingCap = async () => {
    try {
      setError(null)
      createVestingCap?.({
        args: [
          ethers.encodeBytes32String(formData.capName),
          ethers.parseEther(formData.totalAllocation),
          BigInt(Number(formData.cliff) * 86400), // Convert days to seconds
          BigInt(Number(formData.vestingTerm)), // Months
          BigInt(Number(formData.vestingPlan)), // Months
          BigInt(Number(formData.initialRelease)),
        ],
      })
    } catch (error) {
      setError('Failed to create vesting cap')
    }
  }

  const handleAddVestingWallet = async () => {
    try {
      setError(null)
      addVestingWallet?.({
        args: [
          formData.walletAddress,
          BigInt(formData.capId),
          ethers.parseEther(formData.amount),
          ethers.encodeBytes32String(formData.note),
        ],
      })
    } catch (error) {
      setError('Failed to add vesting wallet')
    }
  }

  const handleApproveProposal = async () => {
    try {
      setError(null)
      approveProposal?.({
        args: [formData.proposalId],
      })
    } catch (error) {
      setError('Failed to approve proposal')
    }
  }

  const handleExecuteProposal = async () => {
    try {
      setError(null)
      executeProposal?.({
        args: [formData.proposalId],
      })
    } catch (error) {
      setError('Failed to execute proposal')
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Distribution Contract Administration
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage vesting caps and beneficiaries
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Vesting Caps</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cap Name"
                value={formData.capName}
                onChange={(e) => setFormData({ ...formData, capName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Allocation"
                value={formData.totalAllocation}
                onChange={(e) => setFormData({ ...formData, totalAllocation: e.target.value })}
                helperText="In tokens"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cliff Period"
                type="number"
                value={formData.cliff}
                onChange={(e) => setFormData({ ...formData, cliff: e.target.value })}
                helperText="In days"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vesting Term"
                type="number"
                value={formData.vestingTerm}
                onChange={(e) => setFormData({ ...formData, vestingTerm: e.target.value })}
                helperText="In months"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vesting Plan"
                type="number"
                value={formData.vestingPlan}
                onChange={(e) => setFormData({ ...formData, vestingPlan: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Initial Release"
                type="number"
                value={formData.initialRelease}
                onChange={(e) => setFormData({ ...formData, initialRelease: e.target.value })}
                helperText="Percentage (0-100)"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleCreateVestingCap}
              disabled={isCreatingCap}
              startIcon={isCreatingCap ? <CircularProgress size={20} /> : null}
            >
              {isCreatingCap ? 'Creating...' : 'Create Vesting Cap'}
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom>Current Vesting Caps</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Total Allocation</TableCell>
                  <TableCell>Cliff (days)</TableCell>
                  <TableCell>Vesting Term (months)</TableCell>
                  <TableCell>Vesting Plan</TableCell>
                  <TableCell>Initial Release (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Add vesting caps data here */}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Vesting Wallets</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Wallet Address"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                helperText="Beneficiary wallet address"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cap ID"
                type="number"
                value={formData.capId}
                onChange={(e) => setFormData({ ...formData, capId: e.target.value })}
                helperText="ID of the vesting cap to use"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                helperText="Amount of tokens to vest"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                helperText="Optional note for the beneficiary"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleAddVestingWallet}
              disabled={isAddingWallet}
              startIcon={isAddingWallet ? <CircularProgress size={20} /> : null}
            >
              {isAddingWallet ? 'Creating Proposal...' : 'Add Vesting Wallet'}
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom>Current Vesting Wallets</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>Cap ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Released</TableCell>
                  <TableCell>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Add vesting wallets data here */}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Pending Proposals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Proposal ID"
                value={formData.proposalId}
                onChange={(e) => setFormData({ ...formData, proposalId: e.target.value })}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleApproveProposal}
              disabled={isApproving}
              startIcon={isApproving ? <CircularProgress size={20} /> : null}
            >
              {isApproving ? 'Approving...' : 'Approve Proposal'}
            </Button>
            <Button
              variant="contained"
              onClick={handleExecuteProposal}
              disabled={isExecuting}
              startIcon={isExecuting ? <CircularProgress size={20} /> : null}
            >
              {isExecuting ? 'Executing...' : 'Execute Proposal'}
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Approvals</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Add pending proposals data here */}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
