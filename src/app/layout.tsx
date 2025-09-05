import './globals.css'
import { Providers } from './providers'
import { AuthWrapper } from '@/components/auth/AuthWrapper'
import { MobileGate } from '@/components/MobileGate'

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>

      <body>
        <MobileGate />
        <Providers>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  )
}
