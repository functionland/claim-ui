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
  MenuItem,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ethers } from 'ethers'
import { ConnectButton } from '@/components/common/ConnectButton'
import { useAdminContract } from '@/hooks/useAdminContract'

export function RewardEngineAdmin() {
  const { isConnected } = useAccount()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tokenAddress: '',
    amount: '',
    recipient: '',
    monthlyRewardPerPeer: '',
    expectedPeriod: '',
    upgradeAddress: '',
    account: '',
    peerId: '',
    poolId: '',
    targetAddress: '',
    role: '',
    proposalId: '',
  })

  const {
    emergencyAction,
    upgradeContract,
    createProposal,
    approveProposal,
    executeProposal,
    rewardEngineProposals,
  } = useAdminContract()

  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [isSettingReward, setIsSettingReward] = useState(false)
  const [isSettingPeriod, setIsSettingPeriod] = useState(false)
  const [isTripping, setIsTripping] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isCreatingRoleProposal, setIsCreatingRoleProposal] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleEmergencyWithdraw = async () => {
    try {
      setIsWithdrawing(true)
      setError(null)

      if (!formData.tokenAddress || !formData.amount) {
        throw new Error('Please enter token address and amount')
      }

      // This would need to be implemented in useAdminContract
      // await emergencyWithdraw(formData.tokenAddress, formData.amount)

      setFormData(prev => ({ ...prev, tokenAddress: '', amount: '' }))
    } catch (err) {
      console.error('Error performing emergency withdraw:', err)
      setError(err instanceof Error ? err.message : 'Failed to perform emergency withdraw')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleAdminRecoverERC20 = async () => {
    try {
      setIsRecovering(true)
      setError(null)

      if (!formData.tokenAddress || !formData.recipient || !formData.amount) {
        throw new Error('Please enter token address, recipient, and amount')
      }

      // This would need to be implemented in useAdminContract
      // await adminRecoverERC20(formData.tokenAddress, formData.recipient, formData.amount)

      setFormData(prev => ({ ...prev, tokenAddress: '', recipient: '', amount: '' }))
    } catch (err) {
      console.error('Error recovering ERC20:', err)
      setError(err instanceof Error ? err.message : 'Failed to recover ERC20')
    } finally {
      setIsRecovering(false)
    }
  }

  const handleSetMonthlyRewardPerPeer = async () => {
    try {
      setIsSettingReward(true)
      setError(null)

      if (!formData.monthlyRewardPerPeer) {
        throw new Error('Please enter monthly reward per peer')
      }

      // This would need to be implemented in useAdminContract
      // await setMonthlyRewardPerPeer(formData.monthlyRewardPerPeer)

      setFormData(prev => ({ ...prev, monthlyRewardPerPeer: '' }))
    } catch (err) {
      console.error('Error setting monthly reward per peer:', err)
      setError(err instanceof Error ? err.message : 'Failed to set monthly reward per peer')
    } finally {
      setIsSettingReward(false)
    }
  }

  const handleSetExpectedPeriod = async () => {
    try {
      setIsSettingPeriod(true)
      setError(null)

      if (!formData.expectedPeriod) {
        throw new Error('Please enter expected period')
      }

      // This would need to be implemented in useAdminContract
      // await setExpectedPeriod(formData.expectedPeriod)

      setFormData(prev => ({ ...prev, expectedPeriod: '' }))
    } catch (err) {
      console.error('Error setting expected period:', err)
      setError(err instanceof Error ? err.message : 'Failed to set expected period')
    } finally {
      setIsSettingPeriod(false)
    }
  }

  const handleTripCircuitBreaker = async () => {
    try {
      setIsTripping(true)
      setError(null)

      // This would need to be implemented in useAdminContract
      // await tripCircuitBreaker()
    } catch (err) {
      console.error('Error tripping circuit breaker:', err)
      setError(err instanceof Error ? err.message : 'Failed to trip circuit breaker')
    } finally {
      setIsTripping(false)
    }
  }

  const handleResetCircuitBreaker = async () => {
    try {
      setIsResetting(true)
      setError(null)

      // This would need to be implemented in useAdminContract
      // await resetCircuitBreaker()
    } catch (err) {
      console.error('Error resetting circuit breaker:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset circuit breaker')
    } finally {
      setIsResetting(false)
    }
  }

  const handleCreateRoleProposal = async () => {
    try {
      setIsCreatingRoleProposal(true)
      setError(null)

      if (!formData.targetAddress || !formData.role) {
        throw new Error('Please enter target address and select a role')
      }

      if (!ethers.isAddress(formData.targetAddress)) {
        throw new Error('Invalid target address')
      }

      // Get role hash
      const getRoleHash = (role: string): string => {
        return ethers.keccak256(ethers.toUtf8Bytes(role))
      }

      const hash = await createProposal(
        1, // AddRole proposal type
        0,
        formData.targetAddress,
        getRoleHash(formData.role),
        '0',
        ethers.ZeroAddress
      )
      console.log('Role proposal created with transaction hash:', hash)

      setFormData(prev => ({ ...prev, targetAddress: '', role: '' }))
    } catch (error: any) {
      console.error(error)
      setError(error.message)
    } finally {
      setIsCreatingRoleProposal(false)
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

  const handleCreateUpgradeProposal = async () => {
    try {
      setIsUpgrading(true)
      setError(null)

      if (!ethers.isAddress(formData.upgradeAddress)) {
        throw new Error('Invalid Ethereum address')
      }

      const hash = await createProposal(
        3, // Upgrade proposal type
        0,
        formData.upgradeAddress,
        ethers.ZeroHash,
        '0',
        ethers.ZeroAddress
      )
      console.log('Upgrade proposal created with transaction hash:', hash)

      setFormData(prev => ({ ...prev, upgradeAddress: '' }))
    } catch (error: any) {
      console.error(error)
      setError(error.message)
    } finally {
      setIsUpgrading(false)
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
        Reward Engine Contract Administration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Accordion defaultExpanded sx={{ mt: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Emergency Functions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1" gutterBottom>Emergency Withdraw</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Token Address"
                value={formData.tokenAddress}
                onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                helperText="Address of the token to withdraw"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                helperText="Amount to withdraw"
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleEmergencyWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? <CircularProgress size={24} /> : 'Emergency Withdraw'}
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>Admin Recover ERC20</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Token Address"
                value={formData.tokenAddress}
                onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                helperText="Address of the token to recover"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Recipient"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                helperText="Address to send recovered tokens"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                helperText="Amount to recover"
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleAdminRecoverERC20}
              disabled={isRecovering}
            >
              {isRecovering ? <CircularProgress size={24} /> : 'Recover ERC20'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Reward Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Reward Per Peer"
                type="number"
                value={formData.monthlyRewardPerPeer}
                onChange={(e) => setFormData({ ...formData, monthlyRewardPerPeer: e.target.value })}
                helperText="Monthly reward amount per peer"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Period"
                type="number"
                value={formData.expectedPeriod}
                onChange={(e) => setFormData({ ...formData, expectedPeriod: e.target.value })}
                helperText="Expected period in seconds"
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSetMonthlyRewardPerPeer}
              disabled={isSettingReward}
            >
              {isSettingReward ? <CircularProgress size={24} /> : 'Set Monthly Reward'}
            </Button>
            <Button
              variant="contained"
              onClick={handleSetExpectedPeriod}
              disabled={isSettingPeriod}
            >
              {isSettingPeriod ? <CircularProgress size={24} /> : 'Set Expected Period'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Circuit Breaker</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Circuit breaker controls can halt reward operations in emergency situations.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleTripCircuitBreaker}
              disabled={isTripping}
            >
              {isTripping ? <CircularProgress size={24} /> : 'Trip Circuit Breaker'}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleResetCircuitBreaker}
              disabled={isResetting}
            >
              {isResetting ? <CircularProgress size={24} /> : 'Reset Circuit Breaker'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Reward Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            View reward information for specific accounts and peers.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Account Address"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                helperText="Account address to check rewards"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Peer ID"
                value={formData.peerId}
                onChange={(e) => setFormData({ ...formData, peerId: e.target.value })}
                helperText="Peer ID to check rewards"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pool ID"
                type="number"
                value={formData.poolId}
                onChange={(e) => setFormData({ ...formData, poolId: e.target.value })}
                helperText="Pool ID to check rewards"
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                // This would need to be implemented to call view functions
                console.log('Check rewards for:', formData.account, formData.peerId, formData.poolId)
              }}
            >
              Check Rewards
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Role Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1" gutterBottom>Grant Role</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Address"
                value={formData.targetAddress}
                onChange={(e) => setFormData({ ...formData, targetAddress: e.target.value })}
                helperText="Address to receive the role"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                helperText="Select role to grant"
              >
                <MenuItem value="ADMIN_ROLE">Admin Role</MenuItem>
                <MenuItem value="CONTRACT_OPERATOR_ROLE">Contract Operator Role</MenuItem>
                <MenuItem value="BRIDGE_OPERATOR_ROLE">Bridge Operator Role</MenuItem>
                <MenuItem value="POOL_ADMIN_ROLE">Pool Admin Role</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleCreateRoleProposal}
              disabled={isCreatingRoleProposal}
            >
              {isCreatingRoleProposal ? <CircularProgress size={24} /> : 'Create Role Proposal'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Pending Proposals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {rewardEngineProposals && rewardEngineProposals.length > 0 ? (
            <Box>
              {rewardEngineProposals.map((proposal) => {
                const now = Math.floor(Date.now() / 1000)
                const isExpired = proposal?.config?.expiryTime ?
                  Number(proposal.config.expiryTime) < now : false
                const canExecute = proposal?.config?.executionTime &&
                  proposal?.config?.status !== undefined &&
                  proposal?.config?.approvals !== undefined ?
                  Number(proposal.config.executionTime) <= now &&
                  proposal.config.status === 0 &&
                  Number(proposal.config.approvals) >= 2 : false

                return (
                  <Box key={proposal.proposalId} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Proposal ID: {proposal.proposalId}</Typography>
                    <Typography variant="body2">Type: {proposal.proposalType === 1 ? 'Add Role' : proposal.proposalType === 3 ? 'Upgrade' : 'Other'}</Typography>
                    <Typography variant="body2">Target: {proposal.target}</Typography>
                    <Typography variant="body2">Status: {proposal.config.status === 1 ? 'Executed' : isExpired ? 'Expired' : 'Pending'}</Typography>
                    <Typography variant="body2">Approvals: {proposal.config.approvals?.toString() || '0'}</Typography>

                    {proposal.config.status !== 1 && !isExpired && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleApproveProposal(proposal.proposalId)}
                          disabled={isApproving}
                          sx={{ mr: 1 }}
                        >
                          {isApproving ? <CircularProgress size={20} /> : 'Approve'}
                        </Button>
                        {canExecute && (
                          <Button
                            variant="contained"
                            onClick={() => handleExecuteProposal(proposal.proposalId)}
                            disabled={isExecuting}
                          >
                            {isExecuting ? <CircularProgress size={20} /> : 'Execute'}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          ) : (
            <Alert severity="info">No pending proposals found</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Upgrade Proposal</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Contract Address"
                value={formData.upgradeAddress}
                onChange={(e) => setFormData({ ...formData, upgradeAddress: e.target.value })}
                helperText="Enter the new contract address"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleCreateUpgradeProposal}
              disabled={isUpgrading}
            >
              {isUpgrading ? <CircularProgress size={24} /> : 'Create Upgrade Proposal'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Execute Upgrade</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Implementation Address"
                value={formData.upgradeAddress || ''}
                onChange={(e) => setFormData({ ...formData, upgradeAddress: e.target.value })}
                helperText="Enter the new contract implementation address"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    setError(null);
                    if (!formData.upgradeAddress || !ethers.isAddress(formData.upgradeAddress)) {
                      throw new Error('Invalid contract address');
                    }
                    await upgradeContract(formData.upgradeAddress);
                    setFormData(prev => ({ ...prev, upgradeAddress: '' }));
                  } catch (error: any) {
                    console.error('Error executing upgrade:', error);
                    setError(error.message);
                  }
                }}
                disabled={!formData.upgradeAddress || !ethers.isAddress(formData.upgradeAddress)}
              >
                Execute Upgrade
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Emergency Actions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="warning"
                onClick={async () => {
                  try {
                    setError(null);
                    await emergencyAction(1);
                  } catch (error: any) {
                    console.error('Error pausing contract:', error);
                    setError(error.message);
                  }
                }}
                sx={{ mr: 2 }}
              >
                Pause
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={async () => {
                  try {
                    setError(null);
                    await emergencyAction(2);
                  } catch (error: any) {
                    console.error('Error unpausing contract:', error);
                    setError(error.message);
                  }
                }}
              >
                Unpause
              </Button>
            </Grid>
          </Grid>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
