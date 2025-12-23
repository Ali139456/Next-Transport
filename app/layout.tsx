import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NextTransport.com.au - Vehicle Transport Made Easy',
  description: 'Get instant quotes, book online, and track your vehicle transport across Australia. Fast, reliable, and secure.',
  keywords: 'car transport, vehicle transport, car shipping, auto transport Australia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundaryWrapper>
        <Navbar />
        {children}
        <Toaster position="top-right" />
        </ErrorBoundaryWrapper>
      </body>
    </html>
  )
}

