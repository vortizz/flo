import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { PageTransition } from '@/components/page-transition'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Flo — Your money, always in flow',
  description: 'Track your finances in real time across all your accounts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans`}
          suppressHydrationWarning
        >
          <Providers>
            <PageTransition>{children}</PageTransition>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
