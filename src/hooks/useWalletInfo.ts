import { useAccount, useBalance, useNetwork } from 'wagmi'
import { useState, useEffect } from 'react'

export function useWalletInfo() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [ensName, setEnsName] = useState<string | null>(null)

  const { data: balance } = useBalance({
    address,
    enabled: !!address,
  })

  // Fetch ENS name if on mainnet
  useEffect(() => {
    const fetchEnsName = async () => {
      if (address && chain?.id === 1) {
        try {
          const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
          const data = await response.json()
          setEnsName(data.name || null)
        } catch (error) {
          console.error('Failed to fetch ENS name:', error)
          setEnsName(null)
        }
      }
    }

    fetchEnsName()
  }, [address, chain?.id])

  return {
    address,
    ensName,
    balance: balance?.value || 0n,
    chainId: chain?.id || 1,
    isConnected,
    isSupported: chain?.unsupported !== true,
  }
}
