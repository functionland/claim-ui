'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAccount } from 'wagmi'

export function Navigation() {
  const pathname = usePathname()
  const { isConnected } = useAccount()

  const navigation = [
    { name: 'Dashboard', href: '/', requiresAuth: false },
    { name: 'My Claims', href: '/claims', requiresAuth: true },
    { name: 'Vesting Schedule', href: '/schedule', requiresAuth: true },
  ]

  return (
    <nav className="flex space-x-8">
      {navigation.map((item) => {
        if (item.requiresAuth && !isConnected) return null

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              inline-flex items-center px-1 pt-1 text-sm font-medium
              ${
                pathname === item.href
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }
            `}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
