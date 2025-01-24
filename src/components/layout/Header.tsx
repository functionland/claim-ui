'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Navigation } from './Navigation'
import Image from 'next/image'

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <div className="ml-4 text-xl font-semibold text-gray-900">
              Token Claim Dashboard
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            <ConnectButton 
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
