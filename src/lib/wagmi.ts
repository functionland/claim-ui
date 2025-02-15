import { createConfig, http } from 'wagmi'
import { CONTRACT_CONFIG } from '@/config/contracts'
import { 
  customMainnet, 
  customSepolia, 
  iotexTestnet, 
  skaleTestnet, 
  hardhat,
  CHAIN_IDS 
} from '@/config/chains'

// Define chains as a const array with at least one chain to satisfy the type requirement
const chains = [customMainnet, customSepolia, iotexTestnet, skaleTestnet, hardhat] as const

export const config = createConfig({
  chains,
  transports: {
    [CHAIN_IDS.MAINNET]: http(customMainnet.rpcUrls.default.http[0]),
    [CHAIN_IDS.SEPOLIA]: http(customSepolia.rpcUrls.default.http[0]),
    [CHAIN_IDS.IOTEX_TESTNET]: http(iotexTestnet.rpcUrls.default.http[0]),
    [CHAIN_IDS.SKALE_TESTNET]: http(skaleTestnet.rpcUrls.default.http[0]),
    [CHAIN_IDS.HARDHAT]: http(),
  },
})

export const vestingContract = {
  address: CONTRACT_CONFIG.address,
  abi: CONTRACT_CONFIG.abi,
}

export { chains }