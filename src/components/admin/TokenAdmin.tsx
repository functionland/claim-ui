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
  MenuItem,
  Paper
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ConnectButton } from '@/components/common/ConnectButton'
import { useAdminContract } from '@/hooks/useAdminContract'
import { CONTRACT_TYPES } from '@/config/contracts'
import ClientOnly from '../common/ClientOnly'
import { useContractContext } from '@/contexts/ContractContext'
import { ROLES, ROLE_NAMES } from '@/config/constants'

interface WhitelistTimeConfig {
  address: string;
  lastActivityTime: number;
  roleChangeTimeLock: number;
  whitelistLockTime: number;
}

interface TimeConfig {
  address: string;
  lastActivityTime: number;
  roleChangeTimeLock: number;
  whitelistLockTime: number;
}

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
  const [timeConfigs, setTimeConfigs] = useState<TimeConfig[]>([]);
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(false);

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

  const handleCheckWhitelist = async (address: string) => {
    try {
      setIsCheckingWhitelist(true);
      const config = await handlers.checkWhitelistConfig(address);
      setTimeConfigs(prev => {
        const existing = prev.findIndex(item => item.address === address);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...config, address };
          return updated;
        }
        return [...prev, { ...config, address }];
      });
    } catch (error: any) {
      setError(error.message || 'Failed to check whitelist configuration');
    } finally {
      setIsCheckingWhitelist(false);
    }
  };

  // Format transaction limit for display (convert from wei to ETH)
  const formatTransactionLimit = (limit: bigint | null) => {
    if (!limit) return '';
    try {
      // Convert BigInt to string and handle the 18 decimals manually
      const limitStr = limit.toString();
      const length = limitStr.length;
      
      if (length <= 18) {
        // If less than 1 ETH, pad with leading zeros
        const padded = limitStr.padStart(18, '0');
        const decimal = padded.slice(0, -18) || '0';
        const fraction = padded.slice(-18).replace(/0+$/, '');
        return fraction ? `${decimal}.${fraction}` : decimal;
      } else {
        // For numbers larger than 1 ETH
        const decimal = limitStr.slice(0, length - 18);
        const fraction = limitStr.slice(length - 18).replace(/0+$/, '');
        return fraction ? `${decimal}.${fraction}` : decimal;
      }
    } catch (error) {
      console.error('Error formatting transaction limit:', error);
      return '';
    }
  };

  // Format transaction limit for input (from ETH to wei)
  const parseTransactionLimit = (value: string): bigint => {
    try {
      return ethers.parseEther(value);
    } catch (error) {
      console.error('Error parsing transaction limit:', error);
      return BigInt(0);
    }
  };

  // Add this helper function to format the date
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getProposalType = (type: number): string => {
    switch (type) {
      case 1:
        return 'Add Role';
      case 2:
        return 'Remove Role';
      case 3:
        return 'Add Vesting Wallet';
      case 4:
        return 'Recovery';
      case 5:
        return 'Add Whitelist';
      case 6:
        return 'Remove Whitelist';
      default:
        return `Unknown (${type})`;
    }
  };

  console.log('ConnectedView rendered with data:', data);
  console.log('Role check result:', roleCheckResult);

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
                      sx={{ mr: 1 }}
                    >
                      {isCheckingRole ? <CircularProgress size={24} /> : 'Check Role Config'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        if (!formData.role) return;
                        try {
                          const result = await handlers.checkRoleConfig(formData.role);
                          if (result) {
                            const formattedLimit = formatTransactionLimit(result.transactionLimit);
                            console.log('Setting form data with:', { 
                              transactionLimit: formattedLimit,
                              quorum: result.quorum.toString()
                            });
                            setFormData(prev => ({
                              ...prev,
                              transactionLimit: formattedLimit,
                              quorum: result.quorum.toString()
                            }));
                          }
                        } catch (error: any) {
                          console.error('Error loading current values:', error);
                          setError(error.message || 'Failed to fetch current values');
                        }
                      }}
                      disabled={!formData.role}
                    >
                      Load Current Values
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
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address to Whitelist"
                      value={formData.whitelistAddress || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, whitelistAddress: e.target.value }))}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={() => handlers.handleAddToWhitelist()}
                      disabled={!formData.whitelistAddress || states.isWhitelisting}
                      sx={{ mr: 1 }}
                    >
                      {states.isWhitelisting ? <CircularProgress size={24} /> : 'Add to Whitelist'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleCheckWhitelist(formData.whitelistAddress)}
                      disabled={!formData.whitelistAddress || isCheckingWhitelist}
                    >
                      {isCheckingWhitelist ? <CircularProgress size={24} /> : 'Check Whitelist'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Whitelisted Address Details
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Role Change Lock</TableCell>
                      <TableCell>Whitelist Lock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeConfigs.map((config) => {
                      const now = Math.floor(Date.now() / 1000);
                      return (
                        <TableRow key={config.address}>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{config.address}</TableCell>
                          <TableCell>
                            {config.lastActivityTime ? 
                              new Date(config.lastActivityTime * 1000).toLocaleString() : 
                              '-'}
                          </TableCell>
                          <TableCell>
                            {config.roleChangeTimeLock ? 
                              `${config.roleChangeTimeLock} seconds` : 
                              '-'}
                          </TableCell>
                          <TableCell>
                            {config.whitelistLockTime ? (
                              <>
                                <div>{formatDateTime(config.whitelistLockTime)}</div>
                                <div style={{ 
                                  color: config.whitelistLockTime > now ? 'orange' : 'green',
                                  fontSize: '0.8em',
                                  fontWeight: 'bold'
                                }}>
                                  {config.whitelistLockTime > now ? 'Locked' : 'Unlocked'}
                                </div>
                              </>
                            ) : '-'}
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

        {/* Bridge Operations */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Bridge Operations</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={formData.bridgeAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bridgeAmount: e.target.value }))}
                      margin="normal"
                      helperText="Amount of tokens to mint/burn"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Chain ID"
                      type="number"
                      value={formData.chainId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, chainId: e.target.value }))}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Nonce"
                      type="number"
                      value={formData.nonce || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nonce: e.target.value }))}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={() => handlers.handleBridgeOp(1)}
                      disabled={!formData.bridgeAmount || !formData.chainId || !formData.nonce || states.isBridgeOp}
                      sx={{ mr: 1 }}
                      color="success"
                    >
                      {states.isBridgeOp ? <CircularProgress size={24} /> : 'Mint Tokens'}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handlers.handleBridgeOp(2)}
                      disabled={!formData.bridgeAmount || !formData.chainId || !formData.nonce || states.isBridgeOp}
                      color="error"
                    >
                      {states.isBridgeOp ? <CircularProgress size={24} /> : 'Burn Tokens'}
                    </Button>
                  </Grid>
                </Grid>

                {/* Bridge Operations Table */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Bridge Operation History
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Operation</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Chain ID</TableCell>
                          <TableCell>Operator</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.bridgeOpEvents.map((event, index) => (
                          <TableRow key={`${event.chainId}-${event.timestamp}-${index}`}>
                            <TableCell>
                              {event.opType === 1 ? (
                                <Typography color="success.main">Mint</Typography>
                              ) : (
                                <Typography color="error.main">Burn</Typography>
                              )}
                            </TableCell>
                            <TableCell>{ethers.formatEther(event.amount)} FULA</TableCell>
                            <TableCell>{event.chainId.toString()}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{event.operator}</TableCell>
                            <TableCell>{new Date(Number(event.timestamp) * 1000).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        {data.bridgeOpEvents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No bridge operations found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Transfer Operation */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Transfer Operation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Recipient Address"
                      value={formData.transferTo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, transferTo: e.target.value }))}
                      margin="normal"
                      helperText="Address must be whitelisted"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={formData.transferAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, transferAmount: e.target.value }))}
                      margin="normal"
                      helperText="Amount in FULA tokens"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handlers.handleTransfer}
                      disabled={!formData.transferTo || !formData.transferAmount || states.isTransferring}
                      sx={{ mr: 1 }}
                      color="primary"
                    >
                      {states.isTransferring ? <CircularProgress size={24} /> : 'Transfer Tokens'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Nonce Operation */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Nonce Operation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Chain ID"
                      type="number"
                      value={formData.chainId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, chainId: e.target.value }))}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nonce"
                      type="number"
                      value={formData.nonce || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nonce: e.target.value }))}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handlers.handleSetBridgeOpNonce}
                      disabled={!formData.chainId || !formData.nonce || states.isSettingNonce}
                      sx={{ mr: 1 }}
                    >
                      {states.isSettingNonce ? <CircularProgress size={24} /> : 'Set Nonce'}
                    </Button>
                  </Grid>
                </Grid>

                {/* Nonce Events Table */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Nonce Operation History
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Chain ID</TableCell>
                          <TableCell>Caller</TableCell>
                          <TableCell>Block Number</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.nonceEvents.map((event, index) => (
                          <TableRow key={`${event.chainId}-${event.blockNumber}-${index}`}>
                            <TableCell>{event.chainId.toString()}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{event.caller}</TableCell>
                            <TableCell>{event.blockNumber.toString()}</TableCell>
                          </TableRow>
                        ))}
                        {data.nonceEvents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              No nonce operations found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
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
                    {data.tokenProposals?.map((proposal) => {
                      const now = Math.floor(Date.now() / 1000);
                      // Add null checks and type safety
                      const isExpired = proposal?.config?.expiryTime ? 
                        Number(proposal.config.expiryTime) < now : false;
                      const canExecute = proposal?.config?.executionTime && proposal?.config?.status !== undefined ? 
                        Number(proposal.config.executionTime) <= now && proposal.config.status !== 1 : false;
                      
                      // Log the proposal data to help debug
                      console.log('Processing proposal:', {
                        proposal,
                        now,
                        isExpired,
                        canExecute
                      });
                      
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
                                  onClick={() => handlers.handleApproveProposal(proposal.proposalId)}
                                  disabled={states.isApproving}
                                  sx={{ mr: 1 }}
                                >
                                  {states.isApproving ? <CircularProgress size={24} /> : 'Approve'}
                                </Button>
                                {canExecute && (
                                  <Button
                                    variant="contained"
                                    onClick={() => handlers.handleExecuteProposal(proposal.proposalId)}
                                    disabled={states.isExecuting}
                                  >
                                    {states.isExecuting ? <CircularProgress size={24} /> : 'Execute'}
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
    whitelistAddress: '',
    chainId: '',
    nonce: '',
    bridgeAmount: '',
    transferTo: '',
    transferAmount: '',
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
    checkWhitelistConfig,
    setBridgeOpNonce,
    performBridgeOp,
    isBridgeOp,
    nonceEvents,
    bridgeOpEvents,
  } = useAdminContract()

  const [isAddingToWhitelist, setIsAddingToWhitelist] = useState(false)
  const [isSettingLimit, setIsSettingLimit] = useState(false)
  const [isSettingTGE, setIsSettingTGE] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isRemovingFromWhitelist, setIsRemovingFromWhitelist] = useState(false)
  const [isWhitelisting, setIsWhitelisting] = useState(false)
  const [isSettingNonce, setIsSettingNonce] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);

  // Add this effect to fetch whitelisted addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addresses = await refetchWhitelistedAddresses();
        setWhitelistedAddresses(addresses);
      } catch (error: any) {
        console.error('Error fetching whitelisted addresses:', error);
        setError(error.message || 'Failed to fetch whitelisted addresses');
      }
    };

    fetchAddresses();
  }, [refetchWhitelistedAddresses]);

  const handleAddToWhitelist = async () => {
    try {
      setError(null)
      setIsWhitelisting(true)
      await addToWhitelist(formData.whitelistAddress)
      // Clear the form and refetch the whitelist
      setFormData(prev => ({ ...prev, whitelistAddress: '' }))
      await refetchWhitelistedAddresses()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsWhitelisting(false)
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

  const handleRemoveFromWhitelist = async (address: string) => {
    try {
      setError(null)
      setIsRemovingFromWhitelist(true)
      // Implement remove from whitelist logic here
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsRemovingFromWhitelist(false)
    }
  }

  const handleSetBridgeOpNonce = async () => {
    try {
      setError(null)
      setIsSettingNonce(true)
      const { chainId, nonce } = formData

      if (!chainId || !nonce) {
        throw new Error('Please fill in both Chain ID and Nonce')
      }

      await setBridgeOpNonce(chainId, nonce)

      // Reset form
      setFormData(prev => ({
        ...prev,
        chainId: '',
        nonce: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSettingNonce(false)
    }
  }

  const handleBridgeOp = async (opType: number) => {
    try {
      setError(null)
      const { bridgeAmount, chainId, nonce } = formData

      if (!bridgeAmount || !chainId || !nonce) {
        throw new Error('Please fill in all fields')
      }

      await performBridgeOp(bridgeAmount, chainId, nonce, opType)

      // Reset form
      setFormData(prev => ({
        ...prev,
        bridgeAmount: '',
        chainId: '',
        nonce: '',
      }))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleTransfer = async () => {
    try {
      setError(null)
      setIsTransferring(true)
      const { transferTo, transferAmount } = formData

      if (!transferTo || !transferAmount) {
        throw new Error('Please fill in all fields')
      }

      // Implement transfer logic here
      // await transferFromContract(transferTo, transferAmount)

      // Reset form
      setFormData(prev => ({
        ...prev,
        transferTo: '',
        transferAmount: '',
      }))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsTransferring(false)
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
    checkWhitelistConfig,
    handleRemoveFromWhitelist,
    handleSetBridgeOpNonce,
    handleBridgeOp,
    handleTransfer,
  }

  const states = {
    isAddingToWhitelist,
    isSettingLimit,
    isSettingTGE,
    isApproving,
    isExecuting,
    isRemovingFromWhitelist,
    isWhitelisting,
    isSettingNonce,
    isBridgeOp,
    isTransferring,
  }

  const data = {
    whitelistedAddresses,
    roleConfigs,
    proposals: tokenProposals,
    nonceEvents,
    bridgeOpEvents,
  }

  if (!isConnected) {
    return <DisconnectedView />
  }

  return (
    <ClientOnly>
      <ConnectedView
        error={error}
        setError={setError}
        formData={formData}
        setFormData={setFormData}
        handlers={handlers}
        states={states}
        data={data}
      />
    </ClientOnly>
  )
}
