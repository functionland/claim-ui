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
import { CONTRACT_TYPES, PROPOSAL_TYPES } from '@/config/constants'

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
    vestingProposals,
    createVestingCap,
    addVestingWallet,
    approveProposal,
    executeProposal,
    setTGE,
    vestingCapTable,
    isLoading,
    tgeStatus,
    initiateTGE,
  } = useAdminContract()

  const [isCreatingCap, setIsCreatingCap] = useState(false)
  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSettingTGE, setIsSettingTGE] = useState(false)

  const handleCreateCap = async () => {
    try {
      setIsCreatingCap(true)
      setError(null)

      const {
        capName,
        totalAllocation,
        cliff,
        vestingTerm,
        vestingPlan,
        initialRelease,
      } = formData

      if (!capName || !totalAllocation || !cliff || !vestingTerm || !vestingPlan || !initialRelease) {
        throw new Error('Please fill in all fields')
      }

      await createVestingCap(
        capName,
        totalAllocation,
        cliff,
        vestingTerm,
        vestingPlan,
        initialRelease
      )

      // Reset form
      setFormData({
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
    } catch (err) {
      console.error('Error creating vesting cap:', err)
      setError(err instanceof Error ? err.message : 'Failed to create vesting cap')
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

  const handleApproveProposal = async (proposalId: string) => {
    try {
      setError(null)
      setIsApproving(true)
      await approveProposal(proposalId)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleExecuteProposal = async (proposalId: string) => {
    try {
      setError(null)
      setIsExecuting(true)
      await executeProposal(proposalId)
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

  const renderVestingCapTable = () => {
    if (isLoading) {
      return <CircularProgress />
    }

    if (!vestingCapTable || vestingCapTable.length === 0) {
      return <Alert severity="info">No vesting caps found</Alert>
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cap ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Total Allocation (FIL)</TableCell>
              <TableCell>Cliff (days)</TableCell>
              <TableCell>Vesting Term (months)</TableCell>
              <TableCell>Initial Release</TableCell>
              <TableCell>Wallets</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vestingCapTable.map((cap) => (
              <TableRow key={cap.capId}>
                <TableCell>{cap.capId}</TableCell>
                <TableCell>{ethers.decodeBytes32String(cap.name)}</TableCell>
                <TableCell>{Number(ethers.formatEther(cap.totalAllocation.toString())).toLocaleString()}</TableCell>
                <TableCell>{(Number(cap.cliff) / 86400).toFixed(2)}</TableCell>
                <TableCell>{(Number(cap.vestingTerm) / (30 * 86400)).toFixed(2)}</TableCell>
                <TableCell>{Number(cap.initialRelease).toFixed(0)}%</TableCell>
                <TableCell>{cap.wallets.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const getProposalType = (type: number): string => {
    switch (type) {
      case PROPOSAL_TYPES.NA:
        return 'N/A';
      case PROPOSAL_TYPES.AddRole:
        return 'Add Role';
      case PROPOSAL_TYPES.RemoveRole:
        return 'Remove Role';
      case PROPOSAL_TYPES.Upgrade:
        return 'Upgrade';
      case PROPOSAL_TYPES.Recovery:
        return 'Recovery';
      case PROPOSAL_TYPES.AddWhitelist:
        return 'Add Whitelist';
      case PROPOSAL_TYPES.RemoveWhitelist:
        return 'Remove Whitelist';
      case PROPOSAL_TYPES.AddDistributionWallets:
        return 'Add Distribution Wallets';
      case PROPOSAL_TYPES.RemoveDistributionWallet:
        return 'Remove Distribution Wallet';
      case PROPOSAL_TYPES.AddToBlacklist:
        return 'Add to Blacklist';
      case PROPOSAL_TYPES.RemoveFromBlacklist:
        return 'Remove from Blacklist';
      case PROPOSAL_TYPES.ChangeTreasuryFee:
        return 'Change Treasury Fee';
      default:
        return `Unknown (${type})`;
    }
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString();
  };

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

      <Accordion defaultExpanded sx={{ mt: 4 }}>
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
                type="number"
                value={formData.totalAllocation}
                onChange={(e) => setFormData({ ...formData, totalAllocation: e.target.value })}
                helperText="Enter amount in FULA (e.g., 1000000 for 1M FULA)"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cliff Period"
                type="number"
                value={formData.cliff}
                onChange={(e) => setFormData({ ...formData, cliff: e.target.value })}
                helperText="Enter cliff period in days (e.g., 14 for 2 weeks)"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vesting Term"
                type="number"
                value={formData.vestingTerm}
                onChange={(e) => setFormData({ ...formData, vestingTerm: e.target.value })}
                helperText="Enter vesting term in months (e.g., 6 for half year)"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vesting Plan"
                type="number"
                value={formData.vestingPlan}
                onChange={(e) => setFormData({ ...formData, vestingPlan: e.target.value })}
                helperText="Enter vesting interval in months (1 for monthly, 3 for quarterly)"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Initial Release"
                type="number"
                value={formData.initialRelease}
                onChange={(e) => setFormData({ ...formData, initialRelease: e.target.value })}
                helperText="Enter initial release percentage (0-100)"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleCreateCap}
              disabled={isCreatingCap}
              startIcon={isCreatingCap ? <CircularProgress size={20} /> : null}
            >
              {isCreatingCap ? 'Creating...' : 'Create Vesting Cap'}
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom>Current Vesting Caps</Typography>
          {isLoading ? (
            <CircularProgress />
          ) : !vestingCapTable || vestingCapTable.length === 0 ? (
            <Alert severity="info">No vesting caps found</Alert>
          ) : (
            renderVestingCapTable()
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded sx={{ mt: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">TGE</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity={tgeStatus.isInitiated ? "success" : "info"}>
                {tgeStatus.isInitiated ? (
                  <>
                    <Typography variant="subtitle1">TGE has been initiated</Typography>
                    <Typography variant="body2">
                      Timestamp: {new Date(tgeStatus.timestamp! * 1000).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Total Required Tokens: {ethers.formatEther(tgeStatus.totalTokens!)} FULA
                    </Typography>
                  </>
                ) : (
                  <Typography>
                    TGE has not been initiated yet. Initiating TGE will start the vesting and distribution of pre-allocated tokens.
                    Make sure all vesting caps are properly configured before initiating TGE.
                  </Typography>
                )}
              </Alert>
            </Grid>

            {!tgeStatus.isInitiated && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={initiateTGE}
                    disabled={isSettingTGE}
                    startIcon={isSettingTGE ? <CircularProgress size={20} /> : null}
                  >
                    {isSettingTGE ? 'Initiating TGE...' : 'Initiate TGE'}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded sx={{ mt: 4 }}>
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
                label="Amount (FULA)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                helperText="Amount of tokens to vest in FULA"
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
          {isLoading ? (
            <CircularProgress />
          ) : !vestingCapTable || vestingCapTable.length === 0 ? (
            <Alert severity="info">No vesting wallets found</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Cap ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Amount (FULA)</TableCell>
                    <TableCell>Claimed (FULA)</TableCell>
                    <TableCell>Remaining (FULA)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vestingCapTable.flatMap(cap => 
                    cap.walletDetails?.map((wallet: any) => (
                      <TableRow key={`${wallet.address}-${cap.capId}`}>
                        <TableCell>{wallet.address}</TableCell>
                        <TableCell>{cap.capId}</TableCell>
                        <TableCell>
                          {wallet.name ? ethers.decodeBytes32String(wallet.name) : '-'}
                        </TableCell>
                        <TableCell>{ethers.formatEther(wallet.amount || '0')}</TableCell>
                        <TableCell>{ethers.formatEther(wallet.claimed || '0')}</TableCell>
                        <TableCell>
                          {ethers.formatEther(
                            BigInt(wallet.amount || '0') - BigInt(wallet.claimed || '0')
                          )}
                        </TableCell>
                      </TableRow>
                    )) || []
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Proposals */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Pending Proposals</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                  <TableCell>Expiry</TableCell>
                  <TableCell>Execution Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vestingProposals?.map((proposal) => {
                  const now = Math.floor(Date.now() / 1000);
                  const isExpired = proposal?.config?.expiryTime ? 
                    Number(proposal.config.expiryTime) < now : false;
                  const canExecute = proposal?.config?.executionTime && proposal?.config?.status !== undefined ? 
                    Number(proposal.config.executionTime) <= now && proposal.config.status !== 1 : false;
                  
                  if (!proposal || !proposal.config) {
                    console.error('Invalid proposal data:', proposal);
                    return null;
                  }

                  return (
                    <TableRow key={proposal.proposalId}>
                      <TableCell>{proposal.proposalId || 'N/A'}</TableCell>
                      <TableCell>{getProposalType(proposal.proposalType || 0)}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{proposal.target || 'N/A'}</TableCell>
                      <TableCell>{proposal.amount ? ethers.formatEther(proposal.amount) : '0'}</TableCell>
                      <TableCell>
                        {proposal.config.status === 1 ? 'Executed' : 
                         isExpired ? 'Expired' : 'Pending'}
                      </TableCell>
                      <TableCell>{proposal.config.approvals?.toString() || '0'}</TableCell>
                      <TableCell>
                        {proposal.config.expiryTime ? 
                          formatDateTime(Number(proposal.config.expiryTime)) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {proposal.config.executionTime ? 
                          formatDateTime(Number(proposal.config.executionTime)) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {proposal.config.status !== 1 && !isExpired && (
                          <>
                            <Button
                              variant="outlined"
                              onClick={() => handleApproveProposal(proposal.proposalId)}
                              disabled={isApproving}
                              sx={{ mr: 1 }}
                            >
                              {isApproving ? <CircularProgress size={24} /> : 'Approve'}
                            </Button>
                            {canExecute && (
                              <Button
                                variant="contained"
                                onClick={() => handleExecuteProposal(proposal.proposalId)}
                                disabled={isExecuting}
                              >
                                {isExecuting ? <CircularProgress size={24} /> : 'Execute'}
                              </Button>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
