// src/app/page.tsx
'use client'

import { useAccount } from 'wagmi'
import { VestingDashboard } from '@/components/vesting/VestingDashboard'
import { ConnectButton } from '@/components/common/ConnectButton'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import ClientOnly from '@/components/common/ClientOnly'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Token Vesting Dashboard
          </h1>
          
          <ClientOnly>
            {!isConnected ? (
              <div className="text-center py-12">
                <h2 className="text-xl mb-4">Connect your wallet to view your vesting details</h2>
                <ConnectButton />
              </div>
            ) : (
              <VestingDashboard />
            )}
          </ClientOnly>
        </div>
      </div>
    </ErrorBoundary>
  )
}

