import './globals.css'
import { Providers } from './providers'

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
