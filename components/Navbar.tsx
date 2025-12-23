'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-black backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 md:h-28">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo.png" 
              alt="NextTransport Logo" 
              className="w-auto"
              style={{ height: '8rem' }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/" className="text-white hover:text-accent-400 font-medium transition-colors text-sm xl:text-base">
              Home
            </Link>
            <Link href="/quote" className="text-white hover:text-accent-400 font-medium transition-colors text-sm xl:text-base">
              Get Quote
            </Link>
            <Link href="/tracking" className="text-white hover:text-accent-400 font-medium transition-colors text-sm xl:text-base">
              Track Booking
            </Link>
            <Link href="/about" className="text-white hover:text-accent-400 font-medium transition-colors text-sm xl:text-base">
              About
            </Link>
            <Link href="/contact" className="text-white hover:text-accent-400 font-medium transition-colors text-sm xl:text-base">
              Contact
            </Link>
            <Link
              href="/login"
              className="bg-accent-600 text-white px-4 xl:px-5 py-2 xl:py-2.5 rounded-lg hover:bg-accent-700 font-semibold transition-all shadow-md hover:shadow-lg text-sm xl:text-base"
            >
              Admin
            </Link>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-1 pt-2">
              <Link 
                href="/" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gray-900 font-medium transition-colors rounded-lg text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/quote" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gray-900 font-medium transition-colors rounded-lg text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Quote
              </Link>
              <Link 
                href="/tracking" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gray-900 font-medium transition-colors rounded-lg text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Track Booking
              </Link>
              <Link 
                href="/about" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gray-900 font-medium transition-colors rounded-lg text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gray-900 font-medium transition-colors rounded-lg text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="block bg-accent-600 text-white px-4 py-3 rounded-lg hover:bg-accent-700 text-center font-semibold transition-colors mt-2 text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

