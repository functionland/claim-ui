'use client'

import { useAccount } from 'wagmi'
import { VestingDashboard } from '@/components/vesting/VestingDashboard'
import { ConnectButton } from '@/components/common/ConnectButton'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import ClientOnly from '@/components/common/ClientOnly'
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Stack, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import { useState } from 'react'
import Image from 'next/image'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import TokenIcon from '@mui/icons-material/Token'
import Shield from '@mui/icons-material/Shield'

interface ManualImportInfo {
  contractAddress?: string;
  symbol: string;
  decimals: number;
  network: string;
}

export default function Home() {
  const { isConnected } = useAccount()
  const theme = useTheme()
  const [showManualImportModal, setShowManualImportModal] = useState(false)
  const [manualImportInfo, setManualImportInfo] = useState<ManualImportInfo | null>(null)

  const instructions = [
    {
      icon: <AccountBalanceWalletIcon />,
      text: 'Put your wallet network on Ethereum Mainnet and Connect your wallet to view your vesting allocations'
    },
    {
      icon: <AccessTimeIcon />,
      text: 'Import $FULA token in your wallet by clicking here',
      action: (wallet: string | undefined) => {
        const manualInfo = {
          contractAddress: process.env.NEXT_PUBLIC_LOCAL_TOKEN_ADDRESS,
          symbol: 'FULA',
          decimals: 18,
          network: 'Ethereum Mainnet'
        }
  
        // If MetaMask is detected
        if (typeof window.ethereum !== 'undefined' && wallet === 'MetaMask') {
          return {
            type: 'metamask',
            handler: async (setManualImportInfo: Function, setShowManualImportModal: Function) => {
              try {
                await window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: process.env.NEXT_PUBLIC_LOCAL_TOKEN_ADDRESS,
                      symbol: 'FULA',
                      decimals: 18
                    },
                  },
                })
              } catch (error) {
                console.error('Error adding token:', error)
                // Show manual instructions if MetaMask method fails
                setManualImportInfo(manualInfo)
                setShowManualImportModal(true)
              }
            }
          }
        }
        // For other wallets, show manual import info
        return {
          type: 'manual',
          info: manualInfo
        }
      }
    },
    {
      icon: <TokenIcon />,
      text: 'Claim your tokens once they become available after the cliff period'
    },
    {
      icon: <Shield />,
      text: 'We suggest you transfer your tokens to a secure cold or multi-sig wallet after claiming'
    }
  ]

  return (
    <ErrorBoundary>
      <Box sx={{ 
        bgcolor: 'grey.100', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Main Content */}
        <Box sx={{ 
          flex: 1,
          py: 4,
          backgroundImage: 'linear-gradient(to bottom, #f3f4f6, #ffffff)'
        }}>
          <Container maxWidth="lg">
            <Paper sx={{ 
              p: 4,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 4
              }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #1976d2, #64b5f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  $FULA Token Vesting Dashboard
                </Typography>
                <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ mb: 4 }} />
              {/* ... rest of your header content ... */}
              
              <ClientOnly>
                {!isConnected ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    px: 4,
                    bgcolor: 'grey.50',
                    borderRadius: 2
                  }}>
                    <Stack spacing={3} alignItems="center">
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'text.secondary',
                          maxWidth: 'sm',
                          mb: 2
                        }}
                      >
                        Connect your wallet to view your vesting details
                      </Typography>
                      <ConnectButton />
                    </Stack>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 2,
                      px: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}>
                      <Stack spacing={0} alignItems="center">
                        <ConnectButton />
                      </Stack>
                    </Box>
                    <VestingDashboard />
                  </>
                )}
              </ClientOnly>
            </Paper>
          </Container>
        </Box>

        {/* Instructions Footer */}
        <Box sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 6,
          mt: 4
        }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                How to Use the Vesting Dashboard
              </Typography>
              <Typography variant="subtitle1" color="rgba(255, 255, 255, 0.8)">
                Please ensure the URL starts with https://claim.fx.land
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: 'repeat(4, 1fr)',
              },
              gap: 3
            }}>
              {instructions.map((instruction, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 4, 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    cursor: instruction.action ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                    '&:hover': instruction.action ? {
                      transform: 'translateY(-2px)',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                    } : {}
                  }}
                  onClick={async () => {
                    if (instruction.action) {
                      const result = instruction.action('MetaMask') // You should get this from your wallet connection
                      if (result.type === 'metamask') {
                        await result.handler(setManualImportInfo, setShowManualImportModal)
                      } else if (result.type === 'manual') {
                        setManualImportInfo(result.info)
                        setShowManualImportModal(true)
                      }
                    }
                  }}
                >
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      p: 1,
                      borderRadius: '50%'
                    }}>
                      {instruction.icon}
                    </Box>
                    <Typography variant="h6">
                      Step {index + 1}
                    </Typography>
                  </Stack>
                  <Typography>
                    {instruction.text}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Manual Import Modal */}
        <Dialog 
          open={showManualImportModal} 
          onClose={() => setShowManualImportModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Manual Token Import</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
              To import FULA token manually, add these details to your wallet:
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Contract Address" 
                  secondary={manualImportInfo?.contractAddress} 
                  secondaryTypographyProps={{ 
                    sx: { wordBreak: 'break-all' } 
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Symbol" 
                  secondary={manualImportInfo?.symbol} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Decimals" 
                  secondary={manualImportInfo?.decimals} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Network" 
                  secondary={manualImportInfo?.network} 
                />
              </ListItem>
            </List>
          </DialogContent>
        </Dialog>
      </Box>
    </ErrorBoundary>
  )
}
