'use client'

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

export function ConnectButton() {
    return (
        <RainbowConnectButton 
          chainStatus="icon"
          showBalance={false}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
      )
}
