'use client'

import { useState } from 'react'
import QuoteModal from './QuoteModal'
import Link from 'next/link'

export default function HomePage() {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [currentReview, setCurrentReview] = useState(0)
  
  const reviews = [
    {
      name: 'Wade Bartlett',
      title: 'Director Of Fleet Avenue',
      text: 'NextTransport is by far the best service provider in this field. You will find that the competition are mainly transport companies and do not understand the concept of customer satisfaction and customer service. I know if our clients go through NextTransport I can guarantee 100% of the time the client is going to be very happy with the end of the process.',
    },
    {
      name: 'Sarah Johnson',
      title: 'Business Owner',
      text: 'Fast, reliable, and professional. The online booking process was seamless, and the team kept me informed every step of the way. Would definitely use NextTransport again for my next vehicle transport needs.',
    },
    {
      name: 'Michael Brown',
      title: 'Fleet Manager',
      text: 'Excellent service from start to finish. The tracking system kept me informed every step of the way, and my vehicle arrived safely and on time. Highly recommend NextTransport for anyone needing vehicle transport services.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Fixed background optimized for performance */}
      <div className="h-screen relative overflow-hidden">
        {/* Background image - optimized with will-change and transform for GPU acceleration */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/images/hero-bg.jpg)',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        />
        {/* Content overlay */}
        <div className="flex items-center justify-center h-screen bg-gradient-to-b from-black/70 via-black/60 to-black/70 relative z-10">
          {/* Simplified background elements - reduced blur for performance */}
          <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500/15 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-600/15 rounded-full blur-2xl opacity-50"></div>
          
          <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
            <div className="mb-4 sm:mb-6 inline-block">
              <span className="bg-accent-600/95 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg">
                Australia&apos;s #1 Vehicle Transport
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 md:mb-8 leading-tight drop-shadow-2xl">
              <span className="block bg-gradient-to-r from-white via-accent-100 to-white bg-clip-text text-transparent">
                Vehicle Transport
              </span>
              <span className="block text-white mt-1 sm:mt-2">Made Easy</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto text-gray-100 leading-relaxed font-light px-2">
              Get instant quotes, book online, and track your vehicle transport across Australia
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-3.5 sm:py-4 md:py-5 px-6 sm:px-8 md:px-12 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl transition-colors duration-200 shadow-2xl hover:shadow-accent-500/50 flex items-center justify-center gap-2 sm:gap-3"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Instant Quote
              </button>
              <a
                href="/quote"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 sm:py-4 md:py-5 px-6 sm:px-8 md:px-12 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl transition-colors duration-200 border-2 border-white/30 hover:border-white/50 shadow-xl text-center"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-accent-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-white via-accent-300 to-white bg-clip-text text-transparent px-2">
              Why Choose NextTransport?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">Trusted by thousands of customers across Australia</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group text-center p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-accent-400/50 card-shadow-lg hover:shadow-2xl transition-all duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 shadow-xl transition-transform duration-200 group-hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-white">Instant Quotes</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">Get accurate pricing in seconds with our smart calculator. No waiting, no hassle.</p>
              </div>
            </div>
            <div className="group text-center p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-accent-400/50 card-shadow-lg hover:shadow-2xl transition-all duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 shadow-xl transition-transform duration-200 group-hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-white">Secure Payments</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">Safe and secure online payments with Stripe. Your financial data is protected.</p>
              </div>
            </div>
            <div className="group text-center p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-accent-400/50 card-shadow-lg hover:shadow-2xl transition-all duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 shadow-xl transition-transform duration-200 group-hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-white">Real-Time Tracking</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">Track your vehicle from pickup to delivery. Stay informed every step of the way.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 md:mb-6 text-white px-2">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">Simple, fast, and reliable - Get started in minutes</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 opacity-30"></div>
            
            <div className="text-center group relative">
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 text-xl sm:text-2xl md:text-3xl font-bold shadow-2xl transition-transform duration-200 group-hover:scale-110 relative z-10">
                1
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl card-shadow border border-white/20 group-hover:border-accent-400/50 transition-all duration-200">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Book</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">Get an instant quote and book online in just a few clicks</p>
              </div>
            </div>
            <div className="text-center group relative">
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 text-xl sm:text-2xl md:text-3xl font-bold shadow-2xl transition-transform duration-200 group-hover:scale-110 relative z-10">
                2
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl card-shadow border border-white/20 group-hover:border-accent-400/50 transition-colors duration-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Pickup</h3>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg">We collect your vehicle at your preferred location</p>
              </div>
            </div>
            <div className="text-center group relative">
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 text-xl sm:text-2xl md:text-3xl font-bold shadow-2xl transition-transform duration-200 group-hover:scale-110 relative z-10">
                3
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl card-shadow border border-white/20 group-hover:border-accent-400/50 transition-colors duration-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Track</h3>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg">Monitor your vehicle&apos;s journey in real-time with GPS</p>
              </div>
            </div>
            <div className="text-center group relative">
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 text-xl sm:text-2xl md:text-3xl font-bold shadow-2xl transition-transform duration-200 group-hover:scale-110 relative z-10">
                4
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl card-shadow border border-white/20 group-hover:border-accent-400/50 transition-colors duration-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Delivered</h3>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg">Your vehicle arrives safely at its destination</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/20 p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-accent-400/30 hover:border-accent-400/50 transition-colors duration-200 card-shadow">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent mb-3 sm:mb-4">
                  1000+
                </div>
                <div className="text-base sm:text-lg md:text-xl text-white font-semibold">Vehicles Transported</div>
                <p className="text-sm sm:text-base text-gray-300 mt-2">Successfully delivered across Australia</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/20 p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-accent-400/30 hover:border-accent-400/50 transition-colors duration-200 card-shadow">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent mb-3 sm:mb-4">
                  98%
                </div>
                <div className="text-xl text-gray-200 font-semibold">Customer Satisfaction</div>
                <p className="text-gray-400 mt-2">Highly rated by our customers</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/20 p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-accent-400/30 hover:border-accent-400/50 transition-colors duration-200 card-shadow">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent mb-3 sm:mb-4">
                  24/7
                </div>
                <div className="text-xl text-gray-200 font-semibold">Support Available</div>
                <p className="text-gray-400 mt-2">We&apos;re here whenever you need us</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Section Header with decorative lines */}
          <div className="flex items-center justify-center mb-12 sm:mb-16 px-4">
            <div className="hidden sm:flex flex-1 h-px bg-white/20 max-w-[100px] lg:max-w-[200px]"></div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-wide sm:tracking-wider mx-4 sm:mx-8 text-center">
              What Our Clients Are Saying
            </h2>
            <div className="hidden sm:flex flex-1 h-px bg-white/20 max-w-[100px] lg:max-w-[200px]"></div>
          </div>
          
          {/* Main Content: Stats Block + Testimonial */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Left: Stats Block with Accent Background */}
            <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl order-2 lg:order-1">
              {/* Radial gradient pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center text-white">
                {/* Car Icon */}
                <div className="mb-6 sm:mb-8">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25a2.625 2.625 0 012.625-2.625h1.5c.621 0 1.125-.504 1.125-1.125a1.875 1.875 0 011.875-1.875h9.75c.621 0 1.125.504 1.125 1.125 0 .621.504 1.125 1.125 1.125h1.5a2.625 2.625 0 012.625 2.625v3.375c0 .621-.504 1.125-1.125 1.125H15.75m-7.5 0a1.5 1.5 0 013 0m3 0a1.5 1.5 0 013 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m2.25 0h3m-3 0V9.75a.75.75 0 00-.75-.75h-2.25V6.75a.75.75 0 00-.75-.75h-9a.75.75 0 00-.75.75v1.5m9 0h-9" />
                  </svg>
                </div>
                
                {/* Large Number */}
                <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-3 sm:mb-4 tracking-tight">
                  24000+
                </div>
                
                {/* Text */}
                <div className="text-base sm:text-lg md:text-xl font-semibold uppercase tracking-wider px-2">
                  Vehicle Deliveries
                </div>
              </div>
            </div>
            
            {/* Right: Testimonial Block */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-2xl border border-white/20 relative order-1 lg:order-2">
              {/* Client Name and Stars */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white uppercase tracking-wide sm:tracking-wider mb-1 sm:mb-2 leading-tight">
                    {reviews[currentReview].name}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-300">
                    {reviews[currentReview].title}
                  </p>
                </div>
                {/* Star Rating */}
                <div className="flex gap-1 sm:mt-0 flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Quote with large quotation marks */}
              <div className="relative min-h-[200px] sm:min-h-[250px]">
                {/* Opening Quote Mark */}
                <div className="absolute -top-2 -left-1 sm:-top-4 sm:-left-2 text-accent-500 pointer-events-none" style={{ fontSize: 'clamp(50px, 12vw, 80px)', lineHeight: '1', fontFamily: 'serif' }}>
                  &quot;
                </div>
                
                {/* Testimonial Text */}
                <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed sm:leading-relaxed italic pl-6 sm:pl-8 pr-4 sm:pr-8 pt-2 sm:pt-4 relative z-10">
                  {reviews[currentReview].text}
                </p>
                
                {/* Closing Quote Mark */}
                <div className="absolute -bottom-6 sm:-bottom-8 -right-1 sm:-right-2 text-accent-500 pointer-events-none" style={{ fontSize: 'clamp(50px, 12vw, 80px)', lineHeight: '1', fontFamily: 'serif' }}>
                  &quot;
                </div>
              </div>
              
              {/* Navigation Dots */}
              <div className="flex gap-2 mt-10 sm:mt-14 md:mt-16 pt-4 sm:pt-6 md:pt-8 justify-center sm:justify-start">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReview(index)}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${
                      index === currentReview
                        ? 'bg-accent-500'
                        : 'border-2 border-gray-300 hover:border-accent-400 active:border-accent-500'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-accent-600/10 via-transparent to-accent-500/10"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent-500/10 rounded-full blur-2xl opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-600/10 rounded-full blur-2xl opacity-50"></div>
        
        <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 sm:mb-8 px-2">
            <span className="bg-gradient-to-r from-white via-accent-300 to-white bg-clip-text text-transparent">
              Ready to Transport
            </span>
            <br />
            <span className="text-white">Your Vehicle?</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-10 md:mb-12 text-gray-300 max-w-3xl mx-auto font-light px-2">
            Get an instant quote and book online in minutes. Fast, secure, and reliable.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-6 px-14 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-accent-500/50 hover:scale-110 transform flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started Now
            </button>
            <a
              href="/contact"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold py-6 px-14 rounded-2xl text-xl transition-all duration-300 border-2 border-white/30 hover:border-white/50 shadow-xl"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Quote Modal */}
      {showQuoteModal && (
        <QuoteModal onClose={() => setShowQuoteModal(false)} />
      )}
    </div>
  )
}

