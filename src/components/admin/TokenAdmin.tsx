'use client'

import { useState, useEffect } from 'react'
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
import ClientOnly from '../common/ClientOnly'
import { useContractContext } from '@/contexts/ContractContext'

function DisconnectedView() {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Connect Wallet
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Please connect your wallet to access the admin features
      </Typography>
      <ConnectButton />
    </Box>
  )
}

function ConnectedView({ error, formData, setFormData, handlers, states, data }: any) {
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h5" gutterBottom component="h2">
        Token Administration
      </Typography>

      <Grid container spacing={3}>
        {/* Whitelist Management */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Whitelist Management</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                  margin="normal"
                  disabled={states.isAddingToWhitelist}
                />
                <Button
                  variant="contained"
                  onClick={handlers.handleAddToWhitelist}
                  disabled={states.isAddingToWhitelist || !formData.walletAddress}
                  sx={{ mt: 2 }}
                >
                  {states.isAddingToWhitelist ? <CircularProgress size={24} /> : 'Add to Whitelist'}
                </Button>
              </Box>

              <TableContainer sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Whitelisted Addresses
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.whitelistedAddresses?.map((address) => (
                      <TableRow key={address}>
                        <TableCell>{address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Transaction Limit */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Transaction Limit</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Transaction Limit (in tokens)"
                  value={formData.transactionLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionLimit: e.target.value }))}
                  margin="normal"
                  type="number"
                  disabled={states.isSettingLimit}
                />
                <Button
                  variant="contained"
                  onClick={handlers.handleSetTransactionLimit}
                  disabled={states.isSettingLimit || !formData.transactionLimit}
                  sx={{ mt: 2 }}
                >
                  {states.isSettingLimit ? <CircularProgress size={24} /> : 'Set Transaction Limit'}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* TGE Time */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">TGE Time</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate sx={{ mt: 1 }}>
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
                  disabled={states.isSettingTGE}
                />
                <Button
                  variant="contained"
                  onClick={handlers.handleSetTGE}
                  disabled={states.isSettingTGE || !formData.tgeTime}
                  sx={{ mt: 2 }}
                >
                  {states.isSettingTGE ? <CircularProgress size={24} /> : 'Set TGE Time'}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Proposals */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Proposals</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.tokenProposals?.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell>{proposal.id}</TableCell>
                        <TableCell>{proposal.description}</TableCell>
                        <TableCell>{proposal.status}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => handlers.handleApproveProposal(proposal.id)}
                            disabled={states.isApproving}
                            sx={{ mr: 1 }}
                          >
                            {states.isApproving ? <CircularProgress size={24} /> : 'Approve'}
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handlers.handleExecuteProposal(proposal.id)}
                            disabled={states.isExecuting}
                          >
                            {states.isExecuting ? <CircularProgress size={24} /> : 'Execute'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  )
}

export function TokenAdmin() {
  const { isConnected } = useAccount()
  const { setActiveContract } = useContractContext()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    walletAddress: '',
    transactionLimit: '',
    tgeTime: '',
    proposalId: '',
  })

  // Set the active contract to TOKEN when the component mounts
  useEffect(() => {
    setActiveContract(CONTRACT_TYPES.TOKEN)
  }, [setActiveContract])

  const {
    whitelistedAddresses,
    tokenProposals,
    addToWhitelist,
    setTransactionLimit,
    setTGE,
    approveProposal,
    executeProposal,
  } = useAdminContract()

  const [isAddingToWhitelist, setIsAddingToWhitelist] = useState(false)
  const [isSettingLimit, setIsSettingLimit] = useState(false)
  const [isSettingTGE, setIsSettingTGE] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleAddToWhitelist = async () => {
    try {
      setError(null)
      setIsAddingToWhitelist(true)
      await addToWhitelist(formData.walletAddress)
      // Clear form
      setFormData(prev => ({
        ...prev,
        walletAddress: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsAddingToWhitelist(false)
    }
  }

  const handleSetTransactionLimit = async () => {
    try {
      setError(null)
      setIsSettingLimit(true)
      await setTransactionLimit(formData.transactionLimit)
      // Clear form
      setFormData(prev => ({
        ...prev,
        transactionLimit: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSettingLimit(false)
    }
  }

  const handleSetTGE = async () => {
    try {
      setError(null)
      setIsSettingTGE(true)
      // Convert date string to Unix timestamp
      const tgeDate = new Date(formData.tgeTime)
      await setTGE(Math.floor(tgeDate.getTime() / 1000))
      // Clear form
      setFormData(prev => ({
        ...prev,
        tgeTime: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSettingTGE(false)
    }
  }

  const handleApproveProposal = async (id: string) => {
    try {
      setError(null)
      setIsApproving(true)
      await approveProposal(id)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleExecuteProposal = async (id: string) => {
    try {
      setError(null)
      setIsExecuting(true)
      await executeProposal(id)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsExecuting(false)
    }
  }

  const handlers = {
    handleAddToWhitelist,
    handleSetTransactionLimit,
    handleSetTGE,
    handleApproveProposal,
    handleExecuteProposal,
  }

  const states = {
    isAddingToWhitelist,
    isSettingLimit,
    isSettingTGE,
    isApproving,
    isExecuting,
  }

  const data = {
    whitelistedAddresses,
    tokenProposals,
  }

  return (
    <ClientOnly>
      {isConnected ? (
        <ConnectedView 
          error={error}
          formData={formData}
          setFormData={setFormData}
          handlers={handlers}
          states={states}
          data={data}
        />
      ) : (
        <DisconnectedView />
      )}
    </ClientOnly>
  )
}
