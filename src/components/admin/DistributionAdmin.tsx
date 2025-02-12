'use client'

import { useState } from 'react'
import { useAccount, useContractRead, useContractWrite, useChainId } from 'wagmi'
import { 
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ethers } from 'ethers'
import { DISTRIBUTION_CONTRACT_ADDRESSES, CONTRACT_ABI } from '@/config/contracts'

interface Proposal {
  id: string
  type: number
  target: string
  amount: string
  status: string
  approvals: number
}

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
}

export function DistributionAdmin() {
  const { address } = useAccount()
  const chainId = useChainId()
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
    proposalId: '',
  })

  // Contract interactions for vesting cap management
  const { write: createVestingCap, isLoading: isCreatingCap } = useContractWrite({
    address: DISTRIBUTION_CONTRACT_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'createVestingCap',
  })

  // Contract interactions for vesting wallet management
  const { write: addVestingWallet, isLoading: isAddingWallet } = useContractWrite({
    address: DISTRIBUTION_CONTRACT_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'addVestingWallet',
  })

  // Contract interactions for proposal management
  const { write: approveProposal, isLoading: isApproving } = useContractWrite({
    address: DISTRIBUTION_CONTRACT_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'approveProposal',
  })

  const { write: executeProposal, isLoading: isExecuting } = useContractWrite({
    address: DISTRIBUTION_CONTRACT_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'executeProposal',
  })

  // Read contract data
  const { data: vestingCaps } = useContractRead({
    address: DISTRIBUTION_CONTRACT_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'getVestingCaps',
    watch: true,
  }) as { data: VestingCap[] }

  const { data: vestingWallets } = useContractRead({
    address: DISTRIBUTION_CONTRACT_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'getVestingWallets',
    watch: true,
  }) as { data: VestingWallet[] }

  const { data: proposals } = useContractRead({
    address: DISTRIBUTION_CONTRACT_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'getProposals',
    watch: true,
  }) as { data: Proposal[] }

  const handleCreateVestingCap = async () => {
    try {
      setError(null)
      createVestingCap?.({
        args: [
          formData.capName,
          ethers.parseEther(formData.totalAllocation),
          Number(formData.cliff) * 86400, // Convert days to seconds
          Number(formData.vestingTerm),
          Number(formData.vestingPlan),
          Number(formData.initialRelease),
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
          formData.walletAddress as `0x${string}`,
          Number(formData.capId),
          ethers.parseEther(formData.amount),
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Vesting Cap Management</Typography>
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
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleCreateVestingCap}
              disabled={isCreatingCap}
              startIcon={isCreatingCap ? <CircularProgress size={20} /> : null}
            >
              {isCreatingCap ? 'Creating...' : 'Create Vesting Cap'}
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Current Vesting Caps</Typography>
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
                {vestingCaps?.map((cap) => (
                  <TableRow key={cap.id}>
                    <TableCell>{cap.id}</TableCell>
                    <TableCell>{cap.name}</TableCell>
                    <TableCell>{ethers.formatEther(cap.totalAllocation)}</TableCell>
                    <TableCell>{cap.cliff / 86400}</TableCell>
                    <TableCell>{cap.vestingTerm}</TableCell>
                    <TableCell>{cap.vestingPlan}</TableCell>
                    <TableCell>{cap.initialRelease}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Vesting Wallet Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Wallet Address"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cap ID"
                type="number"
                value={formData.capId}
                onChange={(e) => setFormData({ ...formData, capId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                helperText="In tokens"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleAddVestingWallet}
              disabled={isAddingWallet}
              startIcon={isAddingWallet ? <CircularProgress size={20} /> : null}
            >
              {isAddingWallet ? 'Adding...' : 'Add Vesting Wallet'}
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Current Vesting Wallets</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>Cap ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Released</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vestingWallets?.map((wallet, index) => (
                  <TableRow key={index}>
                    <TableCell>{wallet.address}</TableCell>
                    <TableCell>{wallet.capId}</TableCell>
                    <TableCell>{ethers.formatEther(wallet.amount)}</TableCell>
                    <TableCell>{ethers.formatEther(wallet.released)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Proposal Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Proposal ID"
                value={formData.proposalId}
                onChange={(e) => setFormData({ ...formData, proposalId: e.target.value })}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
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
          <Box sx={{ mt: 2 }}>
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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposals?.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>{proposal.id}</TableCell>
                      <TableCell>{proposal.type}</TableCell>
                      <TableCell>{proposal.target}</TableCell>
                      <TableCell>{proposal.amount}</TableCell>
                      <TableCell>{proposal.status}</TableCell>
                      <TableCell>{proposal.approvals}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => setFormData({ ...formData, proposalId: proposal.id })}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
