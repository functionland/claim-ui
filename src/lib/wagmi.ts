import { createConfig, http } from 'wagmi'
import { CONTRACT_CONFIG } from '@/config/contracts'
import { 
  customSepolia, 
  iotexTestnet, 
  skaleTestnet, 
  hardhat,

  customMainnet, 
  customBase,
  customIotex,
  customSkale,
  CHAIN_IDS 
} from '@/config/chains'

// Define chains as a const array with at least one chain to satisfy the type requirement
const chains = [customSepolia, iotexTestnet, skaleTestnet, hardhat, customMainnet, customBase, customIotex, customSkale] as const

export const config = createConfig({
  chains,
  transports: {
    [CHAIN_IDS.SEPOLIA]: http(customSepolia.rpcUrls.default.http[0]),
    [CHAIN_IDS.IOTEX_TESTNET]: http(iotexTestnet.rpcUrls.default.http[0]),
    [CHAIN_IDS.SKALE_TESTNET]: http(skaleTestnet.rpcUrls.default.http[0]),
    [CHAIN_IDS.HARDHAT]: http(),

    [CHAIN_IDS.MAINNET]: http(customMainnet.rpcUrls.default.http[0]),
    [CHAIN_IDS.BASE]: http(customBase.rpcUrls.default.http[0]),
    [CHAIN_IDS.IOTEX]: http(customIotex.rpcUrls.default.http[0]),
    [CHAIN_IDS.SKALE]: http(customSkale.rpcUrls.default.http[0]),
  },
})

export const vestingContract = {
  address: CONTRACT_CONFIG.address,
  abi: CONTRACT_CONFIG.abi,
}

export { chains }