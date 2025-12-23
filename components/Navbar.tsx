'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-black backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo.png" 
              alt="NextTransport Logo" 
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-accent-400 font-medium transition-colors">
              Home
            </Link>
            <Link href="/quote" className="text-white hover:text-accent-400 font-medium transition-colors">
              Get Quote
            </Link>
            <Link href="/tracking" className="text-white hover:text-accent-400 font-medium transition-colors">
              Track Booking
            </Link>
            <Link href="/about" className="text-white hover:text-accent-400 font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white hover:text-accent-400 font-medium transition-colors">
              Contact
            </Link>
            <Link
              href="/login"
              className="bg-accent-600 text-white px-5 py-2.5 rounded-lg hover:bg-accent-700 font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link href="/" className="block py-2 text-white hover:text-accent-400 font-medium">
              Home
            </Link>
            <Link href="/quote" className="block py-2 text-white hover:text-accent-400 font-medium">
              Get Quote
            </Link>
            <Link href="/tracking" className="block py-2 text-white hover:text-accent-400 font-medium">
              Track Booking
            </Link>
            <Link href="/about" className="block py-2 text-white hover:text-accent-400 font-medium">
              About
            </Link>
            <Link href="/contact" className="block py-2 text-white hover:text-accent-400 font-medium">
              Contact
            </Link>
            <Link
              href="/login"
              className="block bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 text-center font-semibold"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

