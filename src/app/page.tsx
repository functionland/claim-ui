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
  useTheme
} from '@mui/material'
import Image from 'next/image'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import TokenIcon from '@mui/icons-material/Token'
import Shield from '@mui/icons-material/Shield'

export default function Home() {
  const { isConnected } = useAccount()
  const theme = useTheme()

  const instructions = [
    {
      icon: <AccountBalanceWalletIcon />,
      text: 'Put your wallet network on Ethereum Mainnet and Connect your wallet to view your vesting allocations'
    },
    {
      icon: <AccessTimeIcon />,
      text: 'Check your vesting schedule and cliff period for each allocation'
    },
    {
      icon: <TokenIcon />,
      text: 'Claim your tokens once they become available after the cliff period'
    },
    {
      icon: <Shield />,
      text: 'We suggest you transfer your tokens to a secure wallet after claiming'
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
                  Token Vesting Dashboard
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
                  <VestingDashboard />
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
              display: 'flex', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              {instructions.map((instruction, index) => (
                <Paper key={index} sx={{ 
                  p: 4, 
                  maxWidth: 300,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  flex: '1 1 250px'
                }}>
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
      </Box>
    </ErrorBoundary>
  )
}
