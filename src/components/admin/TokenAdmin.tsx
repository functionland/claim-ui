'use client'

import { useState, useEffect } from 'react'
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
import { TOKEN_ADDRESSES, CONTRACT_ABI } from '@/config/contracts'

interface Proposal {
  id: string
  type: number
  target: string
  amount: string
  status: string
  approvals: number
}

export function TokenAdmin() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    role: '',
    quorum: '',
    transactionLimit: '',
    whitelistAddress: '',
    proposalId: '',
    tgeAmount: '',
    tgeTime: '',
  })

  // Contract interactions for role management
  const { write: setQuorum, isLoading: isSettingQuorum } = useContractWrite({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'setRoleQuorum',
  })

  const { write: setLimit, isLoading: isSettingLimit } = useContractWrite({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'setRoleTransactionLimit',
  })

  // Contract interactions for whitelist management
  const { write: createWhitelistProposal, isLoading: isCreatingWhitelist } = useContractWrite({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'createProposal',
  })

  // Contract interactions for proposal management
  const { write: approveProposal, isLoading: isApproving } = useContractWrite({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'approveProposal',
  })

  const { write: executeProposal, isLoading: isExecuting } = useContractWrite({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'executeProposal',
  })

  // Contract interactions for TGE
  const { write: initiateTGE, isLoading: isInitiatingTGE } = useContractWrite({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'initiateTGE',
  })

  // Read contract data
  const { data: proposals } = useContractRead({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'getProposals',
    watch: true,
  }) as { data: Proposal[] }

  const { data: whitelistedAddresses } = useContractRead({
    address: TOKEN_ADDRESSES[chainId],
    abi: CONTRACT_ABI,
    functionName: 'getWhitelistedAddresses',
    watch: true,
  }) as { data: string[] }

  const handleSetQuorum = async () => {
    try {
      setError(null)
      setQuorum?.({
        args: [
          ethers.id(formData.role),
          BigInt(formData.quorum),
        ],
      })
    } catch (error) {
      setError('Failed to set quorum')
    }
  }

  const handleSetTransactionLimit = async () => {
    try {
      setError(null)
      setLimit?.({
        args: [
          ethers.id(formData.role),
          ethers.parseEther(formData.transactionLimit),
        ],
      })
    } catch (error) {
      setError('Failed to set transaction limit')
    }
  }

  const handleCreateWhitelistProposal = async () => {
    try {
      setError(null)
      createWhitelistProposal?.({
        args: [
          5, // AddWhitelist type
          0,
          formData.whitelistAddress as `0x${string}`,
          ethers.ZeroHash,
          0,
          ethers.ZeroAddress,
        ],
      })
    } catch (error) {
      setError('Failed to create whitelist proposal')
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

  const handleInitiateTGE = async () => {
    try {
      setError(null)
      initiateTGE?.({
        args: [
          ethers.parseEther(formData.tgeAmount),
          BigInt(new Date(formData.tgeTime).getTime() / 1000),
        ],
      })
    } catch (error) {
      setError('Failed to initiate TGE')
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Token Contract Administration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Role Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                helperText="ADMIN_ROLE, CONTRACT_OPERATOR_ROLE, or BRIDGE_OPERATOR_ROLE"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quorum"
                type="number"
                value={formData.quorum}
                onChange={(e) => setFormData({ ...formData, quorum: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Transaction Limit"
                value={formData.transactionLimit}
                onChange={(e) => setFormData({ ...formData, transactionLimit: e.target.value })}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSetQuorum}
              disabled={isSettingQuorum}
              startIcon={isSettingQuorum ? <CircularProgress size={20} /> : null}
            >
              {isSettingQuorum ? 'Setting...' : 'Set Quorum'}
            </Button>
            <Button
              variant="contained"
              onClick={handleSetTransactionLimit}
              disabled={isSettingLimit}
              startIcon={isSettingLimit ? <CircularProgress size={20} /> : null}
            >
              {isSettingLimit ? 'Setting...' : 'Set Transaction Limit'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Whitelist Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address to Whitelist"
                value={formData.whitelistAddress}
                onChange={(e) => setFormData({ ...formData, whitelistAddress: e.target.value })}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleCreateWhitelistProposal}
              disabled={isCreatingWhitelist}
              startIcon={isCreatingWhitelist ? <CircularProgress size={20} /> : null}
            >
              {isCreatingWhitelist ? 'Creating...' : 'Create Whitelist Proposal'}
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Whitelisted Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {whitelistedAddresses?.map((address, index) => (
                    <TableRow key={index}>
                      <TableCell>{address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Token Generation Event (TGE)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="TGE Amount"
                value={formData.tgeAmount}
                onChange={(e) => setFormData({ ...formData, tgeAmount: e.target.value })}
                helperText="Amount of tokens for TGE"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="TGE Time"
                value={formData.tgeTime}
                onChange={(e) => setFormData({ ...formData, tgeTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleInitiateTGE}
              disabled={isInitiatingTGE}
              startIcon={isInitiatingTGE ? <CircularProgress size={20} /> : null}
            >
              {isInitiatingTGE ? 'Initiating...' : 'Initiate TGE'}
            </Button>
          </Box>
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
