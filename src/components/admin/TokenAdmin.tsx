'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
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
  MenuItem
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ConnectButton } from '@/components/common/ConnectButton'
import { useAdminContract } from '@/hooks/useAdminContract'
import { CONTRACT_TYPES } from '@/config/contracts'
import ClientOnly from '../common/ClientOnly'
import { useContractContext } from '@/contexts/ContractContext'
import { ROLES, ROLE_NAMES } from '@/config/constants'

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

function ConnectedView({ error, setError, formData, setFormData, handlers, states, data }: any) {
  const [roleCheckResult, setRoleCheckResult] = useState<{ transactionLimit: bigint, quorum: number } | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  const handleCheckRole = async () => {
    if (!formData.role) return;
    
    try {
      setIsCheckingRole(true);
      setError(null);
      const result = await handlers.checkRoleConfig(formData.role);
      if (result && result.transactionLimit !== undefined && result.quorum !== undefined) {
        // Convert BigInt to string for display
        setRoleCheckResult({
          transactionLimit: result.transactionLimit,
          quorum: Number(result.quorum)
        });
      } else {
        setError('Failed to fetch role configuration');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to check role configuration');
    } finally {
      setIsCheckingRole(false);
    }
  };

  // Format transaction limit for display (convert from wei to ETH)
  const formatTransactionLimit = (limit: bigint | null) => {
    if (!limit) return '';
    try {
      return ethers.formatEther(limit);
    } catch (error) {
      console.error('Error formatting transaction limit:', error);
      return '';
    }
  };

  console.log('ConnectedView rendered with data:', data);
  console.log('Whitelist info:', data.whitelistInfo);

  const roleOptions = Object.entries(ROLES).map(([key, value]) => ({
    value,
    label: ROLE_NAMES[value as keyof typeof ROLE_NAMES],
  }));

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
        {/* Role Configuration */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Role Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Role"
                      value={formData.role || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      margin="normal"
                    >
                      {roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Transaction Limit (ETH)"
                      type="number"
                      value={formData.transactionLimit || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, transactionLimit: e.target.value }))}
                      margin="normal"
                      inputProps={{
                        step: "0.000000000000000001" // Allow for 18 decimal places
                      }}
                      helperText="Enter the limit in ETH"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quorum"
                      type="number"
                      value={formData.quorum || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, quorum: e.target.value }))}
                      margin="normal"
                      inputProps={{
                        min: "1",
                        max: "65535",
                        step: "1"
                      }}
                      helperText="Enter a number between 1 and 65535"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handlers.handleSetTransactionLimit}
                      disabled={!formData.role || !formData.transactionLimit || states.isSettingLimit}
                      sx={{ mr: 1 }}
                    >
                      {states.isSettingLimit ? <CircularProgress size={24} /> : 'Set Transaction Limit'}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handlers.handleSetQuorum}
                      disabled={
                        !formData.role || 
                        !formData.quorum || 
                        Number(formData.quorum) < 1 || 
                        Number(formData.quorum) > 65535 || 
                        states.isSettingLimit
                      }
                      sx={{ mr: 1 }}
                    >
                      {states.isSettingLimit ? <CircularProgress size={24} /> : 'Set Quorum'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCheckRole}
                      disabled={!formData.role || isCheckingRole}
                    >
                      {isCheckingRole ? <CircularProgress size={24} /> : 'Check Role Config'}
                    </Button>
                  </Grid>
                  {roleCheckResult && (
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Role Configuration:</Typography>
                        <Typography>
                          Transaction Limit: {formatTransactionLimit(roleCheckResult.transactionLimit)} ETH
                        </Typography>
                        <Typography>
                          Quorum: {roleCheckResult.quorum}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <TableContainer sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Role Configurations
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Transaction Limit</TableCell>
                      <TableCell>Quorum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.roleConfigs?.map((info) => (
                      <TableRow key={info.role}>
                        <TableCell>{ROLE_NAMES[info.role as keyof typeof ROLE_NAMES] || info.role}</TableCell>
                        <TableCell>{formatTransactionLimit(info.config.transactionLimit)} ETH</TableCell>
                        <TableCell>{info.config.quorum}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>

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
                  Current Whitelisted Addresses ({data.whitelistInfo?.length ?? 0})
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Role Change Lock</TableCell>
                      <TableCell>Whitelist Lock</TableCell>
                      <TableCell>Operator</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.whitelistInfo?.map((info) => {
                      const now = BigInt(Math.floor(Date.now() / 1000));
                      const isLocked = info.timeConfig.whitelistLockTime > now;
                      
                      return (
                        <TableRow key={info.address}>
                          <TableCell>{info.address}</TableCell>
                          <TableCell>
                            {new Date(Number(info.timeConfig.lastActivityTime) * 1000).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(Number(info.timeConfig.roleChangeTimeLock) * 1000).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(Number(info.timeConfig.whitelistLockTime) * 1000).toLocaleString()}
                          </TableCell>
                          <TableCell>{info.operator}</TableCell>
                          <TableCell>
                            {isLocked ? (
                              <Typography color="warning.main">Locked</Typography>
                            ) : (
                              <Typography color="success.main">Unlocked</Typography>
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
                  label="Transaction Limit (ETH)"
                  type="number"
                  value={formData.transactionLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionLimit: e.target.value }))}
                  margin="normal"
                  type="number"
                  disabled={states.isSettingLimit}
                  inputProps={{
                    step: "0.000000000000000001" // Allow for 18 decimal places
                  }}
                  helperText="Enter the limit in ETH"
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
  console.log('TokenAdmin component rendered');

  const { isConnected } = useAccount()
  const { setActiveContract } = useContractContext()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    walletAddress: '',
    transactionLimit: '',
    tgeTime: '',
    proposalId: '',
    role: '',
    quorum: '',
  })

  // Set the active contract to TOKEN when the component mounts
  useEffect(() => {
    setActiveContract(CONTRACT_TYPES.TOKEN)
  }, [setActiveContract])

  const {
    whitelistInfo,
    tokenProposals,
    addToWhitelist,
    setTransactionLimit,
    setTGETime,
    createProposal,
    approveProposal,
    executeProposal,
    refetchWhitelistedAddresses,
    handleSetRoleTransactionLimit,
    handleSetRoleQuorum,
    roleConfigs,
    checkRoleConfig,
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
      // Clear the form and refetch the whitelist
      setFormData(prev => ({ ...prev, walletAddress: '' }))
      await refetchWhitelistedAddresses()
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
      await handleSetRoleTransactionLimit(formData.role, formData.transactionLimit)
      // Clear form
      setFormData(prev => ({
        ...prev,
        role: '',
        transactionLimit: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSettingLimit(false)
    }
  }

  const handleSetQuorum = async () => {
    try {
      setError(null)
      setIsSettingLimit(true)
      await handleSetRoleQuorum(formData.role, formData.quorum)
      // Clear form
      setFormData(prev => ({
        ...prev,
        role: '',
        quorum: '',
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
      await setTGETime(Math.floor(tgeDate.getTime() / 1000))
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
    handleSetQuorum,
    checkRoleConfig,
  }

  const states = {
    isAddingToWhitelist,
    isSettingLimit,
    isSettingTGE,
    isApproving,
    isExecuting,
  }

  const data = {
    whitelistInfo,
    tokenProposals,
    roleConfigs,
  }

  return (
    <ClientOnly>
      {isConnected ? (
        <ConnectedView 
          error={error}
          setError={setError}
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
