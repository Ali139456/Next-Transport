'use client'

import { useState, useEffect, useRef } from 'react'
import QuoteModal from './QuoteModal'
import Link from 'next/link'

export default function HomePage() {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [currentReview, setCurrentReview] = useState(0)
  const [vehicleCount, setVehicleCount] = useState(0)
  const [transportedCount, setTransportedCount] = useState(0)
  const [satisfactionRate, setSatisfactionRate] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const statsRef = useRef<HTMLDivElement>(null)
  const trustBadgesRef = useRef<HTMLDivElement>(null)
  const hasAnimatedStatsRef = useRef(false)
  const hasAnimatedTrustRef = useRef(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  
  const reviews = [
    {
      name: 'Wade Bartlett',
      location: 'Sydney, NSW',
      rating: 5,
      text: 'NextTransport is by far the best service provider in this field. You will find that the competition are mainly transport companies and do not understand the concept of customer satisfaction and customer service. I know if our clients go through NextTransport I can guarantee 100% of the time the client is going to be very happy with the end of the process.',
    },
    {
      name: 'Sarah Johnson',
      location: 'Melbourne, VIC',
      rating: 5,
      text: 'Fast, reliable, and professional. The online booking process was seamless, and the team kept me informed every step of the way. Would definitely use NextTransport again for my next vehicle transport needs.',
    },
    {
      name: 'Michael Brown',
      location: 'Brisbane, QLD',
      rating: 5,
      text: 'Excellent service from start to finish. The tracking system kept me informed every step of the way, and my vehicle arrived safely and on time. Highly recommend NextTransport for anyone needing vehicle transport services.',
    },
    {
      name: 'Emma Wilson',
      location: 'Perth, WA',
      rating: 5,
      text: 'Outstanding service! The team was professional, communication was excellent, and my car arrived exactly when promised. The online tracking made it so easy to follow the journey.',
    },
    {
      name: 'David Chen',
      location: 'Adelaide, SA',
      rating: 5,
      text: 'Best vehicle transport experience I\'ve had. Transparent pricing, easy booking process, and my vehicle arrived in perfect condition. Highly recommended!',
    },
  ]

  // Scroll and mouse tracking for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [reviews.length])
  

  // Scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id')
          if (sectionId) {
            setVisibleSections((prev) => new Set(prev).add(sectionId))
          }
        }
      })
    }, observerOptions)

    const sections = document.querySelectorAll('[data-section-id]')
    sections.forEach((section) => observer.observe(section))

    return () => sections.forEach((section) => observer.unobserve(section))
  }, [])

  // Count-up animation for main stats (24000+)
  useEffect(() => {
    if (hasAnimatedStatsRef.current || !statsRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedStatsRef.current) {
            hasAnimatedStatsRef.current = true
            
            const targetCount = 24000
            const duration = 2000 // 2 seconds
            const startTime = Date.now()
            
            const animate = () => {
              const now = Date.now()
              const elapsed = now - startTime
              const progress = Math.min(elapsed / duration, 1)
              
              // Easing function for smooth animation
              const easeOutCubic = 1 - Math.pow(1 - progress, 3)
              const currentCount = Math.floor(easeOutCubic * targetCount)
              
              setVehicleCount(currentCount)
              
              if (progress < 1) {
                requestAnimationFrame(animate)
              } else {
                setVehicleCount(targetCount)
              }
            }
            
            requestAnimationFrame(animate)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Count-up animation for trust badges (1000+, 98%, etc.)
  useEffect(() => {
    if (hasAnimatedTrustRef.current || !trustBadgesRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedTrustRef.current) {
            hasAnimatedTrustRef.current = true
            
            const duration = 2000 // 2 seconds
            const startTime = Date.now()
            
            const animate = () => {
              const now = Date.now()
              const elapsed = now - startTime
              const progress = Math.min(elapsed / duration, 1)
              
              // Easing function for smooth animation
              const easeOutCubic = 1 - Math.pow(1 - progress, 3)
              
              // Animate transported count (1000+)
              const transportedTarget = 1000
              const currentTransported = Math.floor(easeOutCubic * transportedTarget)
              setTransportedCount(currentTransported)
              
              // Animate satisfaction rate (98%)
              const satisfactionTarget = 98
              const currentSatisfaction = Math.floor(easeOutCubic * satisfactionTarget)
              setSatisfactionRate(currentSatisfaction)
              
              if (progress < 1) {
                requestAnimationFrame(animate)
              } else {
                setTransportedCount(transportedTarget)
                setSatisfactionRate(satisfactionTarget)
              }
            }
            
            requestAnimationFrame(animate)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (trustBadgesRef.current) {
      observer.observe(trustBadgesRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(to bottom, #5a9bc8, #4783A8, #3a6b8a)' }}>
      {/* Hero Section - Fixed background optimized for performance */}
      <div 
        ref={heroRef}
        data-section-id="hero"
        className="h-screen relative overflow-hidden"
      >
        {/* Animated background image with parallax */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out"
          style={{ 
            backgroundImage: 'url(/images/hero-bg.jpg)',
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
            willChange: 'transform',
          }}
        />
        
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(71, 131, 168, 0.2) 0%, transparent 50%), linear-gradient(to bottom, rgba(71, 131, 168, 0.85), rgba(58, 107, 138, 0.8), rgba(71, 131, 168, 0.85))`
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5 animate-pulse-slow"></div>
        <div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float-slow"
          style={{
            backgroundColor: 'rgba(71, 131, 168, 0.3)',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse"
          style={{
            backgroundColor: 'rgba(90, 155, 200, 0.25)',
            transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`,
          }}
        />
        
        {/* Content overlay with fade-in animation */}
        <div className="flex items-center justify-center h-screen relative z-10">
          <div 
            className={`text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 transition-all duration-1000 ${
              visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="mb-4 sm:mb-6 inline-block animate-bounce-slow">
              <span className="text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(71, 131, 168, 0.9)' }}>
                Australia&apos;s #1 Vehicle Transport
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 md:mb-6 leading-tight drop-shadow-2xl">
              <span className="block bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-gradient">
                Door Transport & Registration
              </span>
              <span className="block text-white mt-1 sm:mt-2 animate-slide-up">Made Easy</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-gray-100 font-medium px-2 animate-fade-in-delay">
              Cars • Light Commercials • Motorbikes
            </p>
            <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 text-gray-200 px-2 animate-fade-in-delay-2">
              Australia-wide, tracked end-to-end
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center px-2 animate-fade-in-delay-3">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="group w-full sm:w-auto text-white font-bold py-3 sm:py-4 px-6 sm:px-8 md:px-10 rounded-xl text-base sm:text-lg md:text-xl transition-all duration-300 shadow-2xl hover:scale-105 flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: 'linear-gradient(to right, #4783A8, #3a6b8a)' }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, #5a9bc8, #4783A8)' }}></span>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="relative z-10">Get Instant Quote</span>
              </button>
              <Link
                href="/tracking"
                className="text-white hover:text-blue-300 font-semibold text-base sm:text-lg md:text-xl transition-all duration-300 flex items-center gap-2 group relative"
              >
                <span className="relative z-10">Track Existing Booking</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-6 group-hover:translate-x-2 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-scroll-indicator"></div>
          </div>
        </div>
      </div>

      {/* Trust Signals Strip */}
      <section className="py-8 sm:py-10 relative overflow-hidden border-b-2 border-white/20" style={{ background: 'linear-gradient(to right, #4783A8, #5a9bc8, #4783A8)' }}>
        <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-shimmer"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            {[
              { icon: '⭐', title: '4.9', subtitle: 'Google Reviews', gradient: 'from-yellow-400 to-orange-500' },
              { icon: '🛡', title: 'Fully Insured', subtitle: 'Transport', gradient: 'from-red-400 to-red-600' },
              { icon: '🚚', title: 'Trusted by', subtitle: 'Dealers & Fleets', gradient: 'from-orange-400 to-orange-600' },
              { icon: '🇦🇺', title: 'Australia-wide', subtitle: 'Coverage', gradient: 'from-blue-400 to-blue-600' },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-xl border-2 border-white/30 group hover:scale-110 hover:shadow-2xl transition-all duration-300 ${
                  visibleSections.has('hero') ? 'animate-slide-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg sm:text-xl text-accent-900 group-hover:text-accent-700 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 font-medium">{item.subtitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Snapshot */}
      <section 
        data-section-id="services"
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #5a9bc8, #4783A8, #3a6b8a)' }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.2)' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div 
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              visibleSections.has('services') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
              Our Services
            </h2>
            <p className="text-white/90 text-lg sm:text-xl">Comprehensive vehicle transport solutions</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: '🚗', title: 'Car Transport', desc: 'Safe and secure transport for all car types across Australia', link: 'Get Quote', gradient: 'from-red-400 to-red-600', bgGradient: 'from-red-50 to-white' },
              { icon: '🚙', title: 'Light Commercials', desc: 'Professional transport for utes, vans, and light trucks', link: 'Get Quote', gradient: 'from-blue-400 to-blue-600', bgGradient: 'from-blue-50 to-white' },
              { icon: '🏍️', title: 'Motorbike Transport', desc: 'Specialized handling for motorcycles and bikes', link: 'Get Quote', gradient: 'from-purple-400 to-purple-600', bgGradient: 'from-purple-50 to-white' },
            ].map((service, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-white/30 group hover:scale-110 hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                  visibleSections.has('services') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <span className="text-4xl sm:text-5xl filter drop-shadow-lg">
                      {service.icon}
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-accent-900 group-hover:text-accent-700 transition-colors duration-300 text-center">
                    {service.title}
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base mb-6 text-center font-medium">
                    {service.desc}
                  </p>
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className={`w-full bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white font-semibold text-sm sm:text-base py-3 px-6 rounded-xl flex items-center justify-center gap-2 group/link transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105`}
                  >
                    {service.link}
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
                
                {/* Decorative corner element */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-20 rounded-bl-full transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NextTransport Section */}
      <section 
        ref={featuresRef}
        data-section-id="why-nexttransport"
        className="py-16 sm:py-20 md:py-24 xl:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #4783A8, #3a6b8a, #2d5470)' }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.2)' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div 
            className={`grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center transition-all duration-1000 ${
              visibleSections.has('why-nexttransport') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Left: Bullet Points */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-white drop-shadow-lg">
                Why NextTransport?
              </h2>
              <ul className="space-y-4 sm:space-y-5">
                {[
                  { text: 'Transparent pricing', icon: '💰', color: 'from-yellow-400 to-yellow-500' },
                  { text: 'No phone calls required', icon: '📱', color: 'from-green-400 to-green-500' },
                  { text: 'Real-time tracking', icon: '📍', color: 'from-blue-400 to-blue-500' },
                  { text: 'Registration handling available', icon: '📋', color: 'from-purple-400 to-purple-500' },
                  { text: 'Backed by InTraffic expertise', icon: '⭐', color: 'from-orange-400 to-orange-500' },
                ].map((point, index) => (
                  <li
                    key={index}
                    className={`transition-all duration-700 ${
                      visibleSections.has('why-nexttransport') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-xl border-2 border-white/30 hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${point.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <span className="text-2xl sm:text-3xl">{point.icon}</span>
                        </div>
                        <span className="text-base sm:text-lg md:text-xl text-accent-900 font-semibold flex-1 group-hover:text-accent-700 transition-colors">
                          {point.text}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Transport Image */}
            <div className="relative w-full lg:w-auto">
              <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border-2 border-white/30 relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                {/* Transport Illustration */}
                <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-accent-600 to-accent-700">
                  {/* Vehicle Transport Scene */}
                  <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                    {/* Road/Highway */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gray-800/80">
                      <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-yellow-400/50 border-dashed border-t-2 border-yellow-300"></div>
                    </div>
                    
                    {/* Transport Truck with Vehicle */}
                    <div className="relative z-10 transform group-hover:translate-x-2 sm:group-hover:translate-x-4 transition-transform duration-1000">
                      {/* Truck */}
                      <svg className="w-32 h-20 sm:w-48 sm:h-32 md:w-64 md:h-40 text-white" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                        {/* Truck Body */}
                        <rect x="20" y="60" width="100" height="40" fill="currentColor" rx="4"/>
                        <rect x="120" y="70" width="50" height="30" fill="currentColor" rx="4"/>
                        {/* Wheels */}
                        <circle cx="50" cy="100" r="12" fill="#1a1a1a"/>
                        <circle cx="50" cy="100" r="8" fill="#333"/>
                        <circle cx="130" cy="100" r="12" fill="#1a1a1a"/>
                        <circle cx="130" cy="100" r="8" fill="#333"/>
                        {/* Vehicle on Truck */}
                        <rect x="30" y="50" width="80" height="30" fill="#2563eb" rx="3"/>
                        <rect x="35" y="45" width="70" height="20" fill="#3b82f6" rx="2"/>
                        {/* Windows */}
                        <rect x="40" y="48" width="25" height="15" fill="#1e40af" rx="1"/>
                        <rect x="70" y="48" width="25" height="15" fill="#1e40af" rx="1"/>
                      </svg>
                    </div>
                    
                    {/* Map/Tracking Elements */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/30">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 18.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V5.618a1 1 0 00-.553-.894L15 3m0 13V3m0 0L9 7" />
                      </svg>
                    </div>
                    
                    {/* Location Pins */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 border-2 border-white/50">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute bottom-8 right-4 sm:bottom-10 sm:right-8 md:bottom-12 md:right-12 bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 border-2 border-white/50">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Route Line */}
                    <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 300" preserveAspectRatio="none">
                      <path d="M 50 200 Q 150 150, 250 180 T 350 200" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
                    </svg>
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-700/50 to-transparent"></div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-accent-400/30 rounded-full blur-xl animate-float-slow"></div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-full blur-xl animate-float-slow-reverse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={howItWorksRef}
        data-section-id="how-it-works"
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #5a9bc8, #4783A8, #3a6b8a)' }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.2)' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div 
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              visibleSections.has('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
              How It Works
            </h2>
            <p className="text-white/90 text-lg sm:text-xl">Simple steps to get your vehicle transported</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { title: 'Get a Quote', desc: 'Instant online pricing in seconds', gradient: 'from-yellow-400 to-orange-500', icon: '💵' },
              { title: 'Book Online', desc: 'Secure Stripe checkout', gradient: 'from-blue-400 to-blue-600', icon: '📱' },
              { title: 'Pickup & Track', desc: 'Live updates and ETA', gradient: 'from-green-400 to-green-600', icon: '🚚' },
              { title: 'Delivered Safely', desc: 'Door-to-door, no stress', gradient: 'from-purple-400 to-purple-600', icon: '✅' },
            ].map((step, index) => (
              <div
                key={index}
                className={`text-center group transition-all duration-700 hover:scale-110 ${
                  visibleSections.has('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-white/30 group-hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.gradient} flex flex-col items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden`}>
                      <span className="text-3xl sm:text-4xl mb-1">{step.icon}</span>
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-accent-900 group-hover:text-accent-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base font-medium">{step.desc}</p>
                  </div>
                  
                  {/* Decorative corner element */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-20 rounded-bl-full transition-opacity duration-300`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section 
        data-section-id="trust-badges"
        className="py-12 sm:py-16 md:py-20 lg:py-24 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #4783A8, #3a6b8a, #2d5470)' }}
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.2)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.15)' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div ref={trustBadgesRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {[
              { value: transportedCount.toLocaleString(), suffix: '+', title: 'Vehicles Transported', desc: 'Successfully delivered across Australia' },
              { value: satisfactionRate, suffix: '%', title: 'Customer Satisfaction', desc: 'Highly rated by our customers' },
              { value: '24/7', suffix: '', title: 'Support Available', desc: "We're here whenever you need us" },
            ].map((badge, index) => (
              <div 
                key={index}
                className={`text-center group transition-all duration-700 hover:scale-105 ${
                  visibleSections.has('trust-badges') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl transition-all duration-500 card-shadow hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(71, 131, 168, 0.3)' }}>
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" style={{ background: 'linear-gradient(to right, transparent, rgba(71, 131, 168, 0.2), transparent)' }}></div>
                  <div className="relative z-10">
                    <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block text-white">
                      {badge.value}{badge.suffix}
                    </div>
                    <div className="text-base sm:text-lg md:text-xl text-white font-semibold group-hover:text-blue-200 transition-colors duration-300">{badge.title}</div>
                    <p className="text-sm sm:text-base text-gray-300 mt-2">{badge.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Carousel */}
      <section 
        data-section-id="reviews"
        className="py-16 sm:py-24 md:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #4783A8, #3a6b8a, #2d5470)' }}
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.2)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(71, 131, 168, 0.15)' }}></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div 
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              visibleSections.has('reviews') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">⭐</span>
              <span className="text-2xl sm:text-3xl font-bold text-white">4.9</span>
              <span className="text-gray-400 text-sm sm:text-base">Google Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              What Our Clients Are Saying
            </h2>
          </div>
          
          {/* Reviews Carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentReview * 100}%)` }}
              >
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="min-w-full px-4 sm:px-6"
                  >
                    <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-2xl border-2 shadow-xl" style={{ borderColor: 'rgba(71, 131, 168, 0.3)' }}>
                      {/* Google Star Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-300">Google</span>
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: '#1a1a1a' }}>
                        {review.text}
                      </p>
                      
                      {/* Name and Location */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg sm:text-xl" style={{ color: '#4783A8' }}>
                            {review.name}
                          </div>
                          <div className="text-sm" style={{ color: '#666' }}>
                            {review.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110"
              aria-label="Previous review"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110"
              aria-label="Next review"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Navigation Dots */}
            <div className="flex gap-2 justify-center mt-8">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentReview
                      ? 'w-8 sm:w-10'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  style={index === currentReview ? { backgroundColor: '#4783A8' } : {}}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section 
        data-section-id="cta"
        className="py-16 sm:py-20 md:py-24 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(to right, #4783A8, #3a6b8a)' }}
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-10 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow-reverse"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <div
            className={`transition-all duration-1000 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 sm:mb-8 text-white">
              Ready to move your vehicle?
            </h2>
            <button
              onClick={() => setShowQuoteModal(true)}
              className="group bg-white font-bold py-4 sm:py-5 px-8 sm:px-12 rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-2xl transition-all duration-300 shadow-2xl hover:shadow-white/50 hover:scale-110 transform flex items-center justify-center gap-3 mx-auto relative overflow-hidden"
              style={{ color: '#4783A8' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <svg className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="relative z-10">Get Instant Quote</span>
            </button>
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

