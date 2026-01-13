'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Lazy load QuoteModal for better performance
const LazyQuoteModal = dynamic(() => import('./QuoteModal'), {
  ssr: false,
  loading: () => null,
})

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
  
  // Memoize particles for performance
  const particles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }))
  }, [])

  // Memoize gradient overlay style to reduce re-renders
  const gradientOverlayStyle = useMemo(() => ({
    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(71, 131, 168, 0.2) 0%, transparent 50%), linear-gradient(to bottom, rgba(71, 131, 168, 0.85), rgba(58, 107, 138, 0.8), rgba(71, 131, 168, 0.85))`
  }), [mousePosition.x, mousePosition.y])

  // Memoize reviews to prevent recreation on every render
  const reviews = useMemo(() => [
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
  ], [])

  // Scroll and mouse tracking for parallax effects - throttled for performance
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    let mouseTimeout: NodeJS.Timeout
    
    const handleScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        setScrollY(window.scrollY)
        scrollTimeout = undefined as any
      }, 16) // ~60fps
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseTimeout) return
      mouseTimeout = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
        mouseTimeout = undefined as any
      }, 50) // Throttle mouse moves more aggressively
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      if (scrollTimeout) clearTimeout(scrollTimeout)
      if (mouseTimeout) clearTimeout(mouseTimeout)
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
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Hero Section - Fixed background optimized for performance */}
      <div 
        ref={heroRef}
        data-section-id="hero"
        className="h-screen relative overflow-hidden"
      >
        {/* Animated background image with parallax - optimized */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out"
          style={{ 
            backgroundImage: 'url(/images/hero-bg.jpg)',
            transform: `translate3d(0, ${scrollY * 0.5}px, 0) scale(1.1)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        />
        
        {/* Animated gradient overlay - memoized for performance */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={gradientOverlayStyle}
        />
        
        {/* Floating particles - memoized for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
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
      </div>

      {/* Trust Signals Strip */}
      <section className="py-12 sm:py-16 relative overflow-hidden bg-black border-b border-white/10">
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 max-w-7xl mx-auto">
            {[
              { icon: '⭐', title: '4.9', subtitle: 'Google Reviews', gradient: 'from-yellow-400 to-orange-500', glow: 'shadow-yellow-500/50' },
              { icon: '🛡', title: 'Fully Insured', subtitle: 'Transport', gradient: 'from-red-400 to-red-600', glow: 'shadow-red-500/50' },
              { icon: '🚚', title: 'Trusted by', subtitle: 'Dealers & Fleets', gradient: 'from-orange-400 to-orange-600', glow: 'shadow-orange-500/50' },
              { icon: '🇦🇺', title: 'Australia-wide', subtitle: 'Coverage', gradient: 'from-blue-400 to-blue-600', glow: 'shadow-blue-500/50' },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/20 group hover:scale-110 hover:shadow-2xl transition-all duration-500 hover:border-white/40 ${
                  visibleSections.has('hero') ? 'animate-slide-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${item.glow} shadow-xl`}>
                    <span className="text-3xl sm:text-4xl">{item.icon}</span>
                  </div>
                  <div>
                    <div className="font-bold text-xl sm:text-2xl text-white group-hover:text-accent-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-sm sm:text-base text-white/70 font-medium">{item.subtitle}</div>
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
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.1)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.08)' }}></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div 
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              visibleSections.has('services') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-gray-600 text-sm sm:text-base uppercase tracking-wide mb-2">Services</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              What we transport
            </h2>
            <p className="text-gray-700 text-lg sm:text-xl">Secure relocation for sedans, SUVs, and all standard passenger vehicles Australia-wide.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                category: 'Cars',
                title: 'Car transport', 
                desc: 'Get your vehicle moved safely and on time.', 
                image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80',
                bgGradient: 'linear-gradient(135deg, rgba(55, 48, 43, 0.85) 0%, rgba(35, 28, 23, 0.9) 100%)',
              },
              { 
                category: '',
                title: 'Light commercial transport', 
                desc: 'Professional handling for utes, vans, and light trucks.', 
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
                bgGradient: 'linear-gradient(135deg, rgba(180, 120, 70, 0.85) 0%, rgba(140, 80, 40, 0.9) 100%)',
              },
              { 
                category: '',
                title: 'Motorbike transport', 
                desc: 'Specialized care for motorcycles and bikes across the country.', 
                image: 'https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=800&h=600&fit=crop&q=80',
                bgGradient: 'linear-gradient(135deg, rgba(70, 120, 110, 0.85) 0%, rgba(50, 90, 80, 0.9) 100%)',
              },
            ].map((service, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-6 sm:p-8 md:p-10 min-h-[400px] flex flex-col justify-between group hover:scale-105 transition-all duration-500 overflow-hidden ${
                  visibleSections.has('services') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ 
                  transitionDelay: `${index * 150}ms` 
                }}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${service.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                
                {/* Gradient Overlay */}
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: service.bgGradient,
                  }}
                ></div>
                
                {/* Icon in top left for cards 2 and 3 */}
                {index > 0 && (
                  <div className="absolute top-6 left-6 w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm z-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                
                {/* Category label (only for first card) */}
                {service.category && (
                  <div className="relative z-10 text-white/90 text-sm mb-2 font-medium">{service.category}</div>
                )}
                
                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-end">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
                    {service.title}
                  </h3>
                  <p className="text-white/95 text-sm sm:text-base mb-6">
                    {service.desc}
                  </p>
                  
                  {/* Buttons */}
                  <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => setShowQuoteModal(true)}
                      className="px-6 py-2.5 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    Quote
                  </button>
                    <Link href="/about" className="text-white font-medium hover:text-accent-200 transition-colors inline-flex items-center gap-2 group/link">
                      Learn
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose NextTransport Section */}
      <section 
        ref={featuresRef}
        data-section-id="why-nexttransport"
        className="py-16 sm:py-20 md:py-24 xl:py-32 relative overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.1)' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.08)' }}></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Header */}
          <div 
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              visibleSections.has('why-nexttransport') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900">
              Why choose NextTransport
              </h2>
            <p className="text-gray-700 text-lg sm:text-xl max-w-3xl mx-auto">
              We built this for people tired of the old way.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { 
                title: 'Transparent pricing, always',
                desc: 'See the full cost upfront with no hidden fees.',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
              { 
                title: 'Digital from start to finish',
                desc: 'Book online, track live, no phone calls needed.',
                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
              { 
                title: 'Real-time tracking included',
                desc: 'Know exactly where your vehicle is every step.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
              { 
                title: 'Registration support built in',
                desc: 'We handle the paperwork so you don\'t have to.',
                image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
            ].map((feature, index) => (
              <div
                    key={index}
                className={`relative rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-500 min-h-[300px] flex flex-col ${
                  visibleSections.has('why-nexttransport') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${feature.image})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/60"></div>
            </div>

                {/* Icon in top left */}
                <div className="absolute top-6 left-6 w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm z-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-white/95 text-sm sm:text-base mb-6">
                    {feature.desc}
                  </p>
                  
                  {feature.learnLink && (
                    <Link href="/about" className="text-white font-medium hover:text-accent-200 transition-colors inline-flex items-center gap-2 group/link">
                      Learn
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                    </div>
                    </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Four Simple Steps */}
      <section 
        ref={howItWorksRef}
        data-section-id="process"
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80")',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-accent-700/90 via-accent-600/85 to-accent-800/90"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Header */}
          <div 
            className={`text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 ${
              visibleSections.has('process') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-accent-300 text-sm font-bold mb-3 flex items-center justify-center gap-2">
              <span>↓</span>
              <span>CHECK OUR STEPS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Our Vehicle Transport Process
            </h2>
          </div>

          {/* Steps Container with Diagonal Arrows */}
          <div className="relative flex flex-col lg:flex-row items-center justify-between mb-16 lg:mb-32">
            {[
              { 
                number: '1',
                title: 'Get Instant Quote',
                desc: 'Enter your pickup and delivery locations. Receive an accurate quote in seconds with transparent pricing.',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              { 
                number: '2',
                title: 'Book & Pay Securely',
                desc: 'Complete your booking through our secure platform. No hidden fees, no phone calls needed.',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
              { 
                number: '3',
                title: 'Track Live',
                desc: 'Monitor your vehicle in real-time from pickup to delivery. Get updates every step of the way.',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.293 12.293a1.999 1.999 0 010-2.827l4.364-4.364a8 8 0 110 11.314z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              { 
                number: '4',
                title: 'Safe Delivery',
                desc: 'Your vehicle arrives safely at your door. On time, every time, with full condition reports.',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((step, index) => {
              return (
                <React.Fragment key={index}>
                  {/* Step Card */}
                  <div className="flex-1 relative z-10 mb-8 lg:mb-0 flex flex-col">
                    <div 
                      className={`flex flex-col items-start px-6 lg:px-8 transition-all duration-500 flex-1 ${
                        visibleSections.has('process') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${index * 150}ms`, minHeight: '320px' }}
                    >
                      {/* Icon and Label */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center flex-shrink-0">
                          <div className="text-accent-300">
                            {step.icon}
                          </div>
                        </div>
                        <div className="text-accent-300 text-xl lg:text-2xl font-bold">STEP - {step.number}</div>
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4">{step.title}</h3>
                      <p className="text-gray-300 text-base leading-relaxed flex-1">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Large Diagonal Arrow Divider - Only show between steps on large screens */}
                  {index < 3 && (
                    <div className="hidden lg:flex w-24 flex-shrink-0 items-center justify-center self-stretch">
                      <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: '320px' }}>
                        <svg viewBox="0 0 100 300" className="w-full h-full max-h-[200px]" preserveAspectRatio="none">
                          <path 
                            d="M 20 50 L 80 150 L 20 250" 
                            stroke="#60a5fa" 
                            strokeWidth="2" 
                            fill="none"
                            opacity="0.6"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-accent-300 to-accent-400 rounded-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent-200 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-200 rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>
            
            {/* Squiggle decoration */}
            <svg className="absolute bottom-8 right-40 w-24 h-24 text-accent-700 opacity-20 hidden lg:block" viewBox="0 0 100 50">
              <path d="M 10 25 Q 20 10, 30 25 T 50 25 T 70 25 T 90 25" stroke="currentColor" strokeWidth="3" fill="none"/>
            </svg>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-accent-900 leading-tight max-w-2xl text-center lg:text-left">
                We Are Best Transport Agency For<br />Give Best Quality Service
              </h2>
              <button 
                onClick={() => setShowQuoteModal(true)}
                className="bg-accent-700 hover:bg-accent-800 text-white px-8 lg:px-10 py-4 lg:py-5 rounded-lg font-bold text-base lg:text-lg transition-all whitespace-nowrap shadow-lg hover:shadow-xl"
              >
                Request Services <span className="ml-2">»</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section 
        data-section-id="trust-badges"
        className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.2)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.15)' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div ref={trustBadgesRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {[
              { value: transportedCount.toLocaleString(), suffix: '+', title: 'Vehicles Transported', desc: 'Successfully delivered across Australia', gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50' },
              { value: satisfactionRate, suffix: '%', title: 'Customer Satisfaction', desc: 'Highly rated by our customers', gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-50 to-emerald-50' },
              { value: '24/7', suffix: '', title: 'Support Available', desc: "We're here whenever you need us", gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-50 to-pink-50' },
            ].map((badge, index) => (
              <div 
                key={index}
                className={`text-center group transition-all duration-700 hover:scale-105 ${
                  visibleSections.has('trust-badges') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-br ${badge.bgGradient} p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl transition-all duration-500 shadow-lg hover:shadow-xl relative overflow-hidden border-2 border-gray-100`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block bg-gradient-to-br ${badge.gradient} bg-clip-text text-transparent`}>
                      {badge.value}{badge.suffix}
                    </div>
                    <div className="text-base sm:text-lg md:text-xl text-gray-900 font-semibold group-hover:text-gray-700 transition-colors duration-300">{badge.title}</div>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">{badge.desc}</p>
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
        className="py-16 sm:py-24 md:py-32 relative overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.15)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.1)' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.05)', animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div 
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              visibleSections.has('reviews') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-bounce-slow">
              <span className="text-3xl">⭐</span>
            </div>
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 block">4.9</span>
                <span className="text-gray-600 text-sm sm:text-base">Google Reviews</span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              What Our Clients Are Saying
            </h2>
            <p className="text-gray-600 text-lg">Real feedback from real customers</p>
          </div>
          
          {/* Reviews Carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentReview * 100}%)` }}
              >
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="min-w-full px-4 sm:px-6 flex"
                  >
                    <div className={`bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 md:p-10 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all w-full flex flex-col ${
                      visibleSections.has('reviews') ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms`, minHeight: '320px' }}
                    >
                      {/* Google Star Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <svg key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">Google</span>
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-base sm:text-lg leading-relaxed mb-6 flex-1" style={{ color: '#1a1a1a' }}>
                        {review.text}
                      </p>
                      
                      {/* Name and Location */}
                      <div className="flex items-center justify-between mt-auto">
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
            
            {/* Navigation Arrows - Positioned outside the card container */}
            <button
              onClick={() => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 bg-white hover:bg-gray-50 shadow-lg border-2 border-gray-200 rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110 z-10"
              aria-label="Previous review"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 bg-white hover:bg-gray-50 shadow-lg border-2 border-gray-200 rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110 z-10"
              aria-label="Next review"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      : 'bg-sky-300/60 hover:bg-sky-300/80'
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
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80")',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-accent-700/90 via-accent-600/85 to-accent-800/90"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <div
            className={`transition-all duration-1000 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="mb-6 inline-block">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl shadow-accent-500/30 mx-auto animate-bounce-slow border border-white/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-white">
              Ready to move your vehicle?
            </h2>
            <p className="text-white/90 text-lg sm:text-xl mb-8 sm:mb-10">Get your instant quote in seconds</p>
            <button
              onClick={() => setShowQuoteModal(true)}
              className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 font-bold py-4 sm:py-5 px-8 sm:px-12 rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-2xl transition-all duration-300 shadow-2xl hover:shadow-accent-500/50 hover:scale-110 transform flex items-center justify-center gap-3 mx-auto relative overflow-hidden border border-white/20"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <svg className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="relative z-10">Get Instant Quote</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60 text-sm">
            © 2025 NextTransport. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Quote Modal - Lazy loaded */}
      {showQuoteModal && (
        <LazyQuoteModal onClose={() => setShowQuoteModal(false)} />
      )}
    </div>
  )
}

