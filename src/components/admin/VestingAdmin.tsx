'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { 
  Box,
  Typography,
  TextField,
  Button,
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
import { ConnectButton } from '@/components/common/ConnectButton'
import { useAdminContract } from '@/hooks/useAdminContract'
import { CONTRACT_TYPES } from '@/config/contracts'

export function VestingAdmin() {
  const { isConnected } = useAccount()
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
    tgeTime: '',
  })

  const {
    vestingCaps,
    vestingWallets,
    proposals,
    createVestingCap,
    addVestingWallet,
    approveProposal,
    executeProposal,
    setTGE,
  } = useAdminContract()

  const [isCreatingCap, setIsCreatingCap] = useState(false)
  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSettingTGE, setIsSettingTGE] = useState(false)

  const handleCreateVestingCap = async () => {
    try {
      setError(null)
      setIsCreatingCap(true)
      await createVestingCap(
        formData.capName,
        formData.totalAllocation,
        Number(formData.cliff),
        Number(formData.vestingTerm),
        Number(formData.vestingPlan),
        Number(formData.initialRelease)
      )
      // Clear form
      setFormData(prev => ({
        ...prev,
        capName: '',
        totalAllocation: '',
        cliff: '',
        vestingTerm: '',
        vestingPlan: '',
        initialRelease: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsCreatingCap(false)
    }
  }

  const handleAddVestingWallet = async () => {
    try {
      setError(null)
      setIsAddingWallet(true)
      await addVestingWallet(
        formData.walletAddress,
        Number(formData.capId),
        formData.amount,
        formData.note || 'Beneficiary'
      )
      // Clear form
      setFormData(prev => ({
        ...prev,
        walletAddress: '',
        capId: '',
        amount: '',
        note: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsAddingWallet(false)
    }
  }

  const handleApproveProposal = async () => {
    try {
      setError(null)
      setIsApproving(true)
      await approveProposal(formData.proposalId)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleExecuteProposal = async () => {
    try {
      setError(null)
      setIsExecuting(true)
      await executeProposal(formData.proposalId)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleSetTGE = async () => {
    try {
      setError(null)
      setIsSettingTGE(true)
      await setTGE(formData.tgeTime)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSettingTGE(false)
    }
  }

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Please connect your wallet to access the admin panel
        </Typography>
        <Box sx={{ mt: 2 }}>
          <ConnectButton />
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Vesting Contract Administration
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

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Distribution</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box component="form" noValidate sx={{ mt: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  label="TGE Time"
                  type="datetime-local"
                  value={formData.tgeTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, tgeTime: e.target.value }))}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={isSettingTGE}
                />
                <Button
                  variant="contained"
                  onClick={handleSetTGE}
                  disabled={isSettingTGE || !formData.tgeTime}
                  sx={{ mt: 2 }}
                >
                  {isSettingTGE ? <CircularProgress size={24} /> : 'Set TGE Time'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
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
                    {vestingWallets?.map((wallet, index) => (
                      <TableRow key={index}>
                        <TableCell>{wallet.address}</TableCell>
                        <TableCell>{wallet.capId}</TableCell>
                        <TableCell>{ethers.formatEther(wallet.amount)}</TableCell>
                        <TableCell>{ethers.formatEther(wallet.released)}</TableCell>
                        <TableCell>{wallet.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
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
                {vestingWallets?.map((wallet, index) => (
                  <TableRow key={index}>
                    <TableCell>{wallet.address}</TableCell>
                    <TableCell>{wallet.capId}</TableCell>
                    <TableCell>{ethers.formatEther(wallet.amount)}</TableCell>
                    <TableCell>{ethers.formatEther(wallet.released)}</TableCell>
                    <TableCell>{wallet.note}</TableCell>
                  </TableRow>
                ))}
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
                {proposals?.filter(proposal => proposal.status === 'Pending').map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>{proposal.id}</TableCell>
                    <TableCell>{proposal.type}</TableCell>
                    <TableCell>{proposal.target}</TableCell>
                    <TableCell>{proposal.amount}</TableCell>
                    <TableCell>{proposal.status}</TableCell>
                    <TableCell>{proposal.approvals}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
