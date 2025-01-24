import { createConfig, http } from 'wagmi'
import { mainnet, goerli } from 'wagmi/chains'
import { CONTRACT_CONFIG } from '@/config/contracts'
import { hardhat } from '@/config/chains'

export const chains = [mainnet, goerli]

export const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http(),
  },
})

export const vestingContract = {
  address: CONTRACT_CONFIG.address,
  abi: CONTRACT_CONFIG.abi,
}
