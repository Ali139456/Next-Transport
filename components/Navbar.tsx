'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading: authLoading, logout } = useAuth()

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-40 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24 md:h-28">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo.png" 
              alt="NextTransport Logo" 
              className="w-auto h-12 sm:h-16 md:h-20 lg:h-24 xl:h-28"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link 
              href="/" 
              className="relative text-white font-medium transition-all text-sm xl:text-base px-3 py-2 rounded-lg group hover:bg-white/10"
            >
              <span className="relative z-10">Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/quote" 
              className="relative text-white font-medium transition-all text-sm xl:text-base px-3 py-2 rounded-lg group hover:bg-white/10"
            >
              <span className="relative z-10">Get Quote</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/tracking" 
              className="relative text-white font-medium transition-all text-sm xl:text-base px-3 py-2 rounded-lg group hover:bg-white/10"
            >
              <span className="relative z-10">Track Booking</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/about" 
              className="relative text-white font-medium transition-all text-sm xl:text-base px-3 py-2 rounded-lg group hover:bg-white/10"
            >
              <span className="relative z-10">About</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/faq" 
              className="relative text-white font-medium transition-all text-sm xl:text-base px-3 py-2 rounded-lg group hover:bg-white/10"
            >
              <span className="relative z-10">FAQ</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/contact" 
              className="relative text-white font-medium transition-all text-sm xl:text-base px-3 py-2 rounded-lg group hover:bg-white/10"
            >
              <span className="relative z-10">Contact</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {!authLoading && user && user.role === 'admin' && (
              <Link 
                href="/admin" 
                className="relative text-white font-medium transition-all text-sm xl:text-base px-3 py-2 rounded-lg group hover:bg-white/10"
              >
                <span className="relative z-10">Dashboard</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {!authLoading && user ? (
              <div className="flex items-center space-x-4 ml-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg border border-accent-400/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-white font-semibold text-sm xl:text-base">
                    {user.name || user.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 xl:px-5 py-2 xl:py-2.5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm xl:text-base"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white px-4 xl:px-5 py-2 xl:py-2.5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm xl:text-base"
              >
                Login
              </Link>
            )}
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
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-accent-500/20 font-medium transition-all rounded-lg text-base relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </span>
              </Link>
              <Link 
                href="/quote" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-accent-500/20 font-medium transition-all rounded-lg text-base relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Get Quote
                </span>
              </Link>
              <Link 
                href="/tracking" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-accent-500/20 font-medium transition-all rounded-lg text-base relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Track Booking
                </span>
              </Link>
              <Link 
                href="/about" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-accent-500/20 font-medium transition-all rounded-lg text-base relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About
                </span>
              </Link>
              <Link 
                href="/faq" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-accent-500/20 font-medium transition-all rounded-lg text-base relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  FAQ
                </span>
              </Link>
              <Link 
                href="/contact" 
                className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-accent-500/20 font-medium transition-all rounded-lg text-base relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </span>
              </Link>
              {!authLoading && user && user.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="block px-4 py-3 text-white hover:text-accent-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-accent-500/20 font-medium transition-all rounded-lg text-base relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Dashboard
                  </span>
                </Link>
              )}
              {!authLoading && user ? (
                <>
                  <div className="px-4 py-3 mx-4 my-2 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg border border-accent-400/30 flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-white font-semibold text-base">
                      {user.name || user.username}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg text-center font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 mt-2 mx-4 text-base"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white px-4 py-3 rounded-lg text-center font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 mt-2 mx-4 text-base"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

