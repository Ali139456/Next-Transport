'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
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
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.1)' }}></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.08)' }}></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Header */}
          <div 
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              visibleSections.has('process') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-gray-600 text-sm sm:text-base uppercase tracking-wide mb-2">Process</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900">
              Four simple steps
            </h2>
            <p className="text-gray-700 text-lg sm:text-xl max-w-3xl mx-auto">
              Get your vehicle moving in minutes, not days.
            </p>
          </div>

          {/* Four Step Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { 
                number: 'One',
                title: 'Get an instant quote online',
                desc: 'Tell us where and when. Price appears in seconds.',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
              { 
                number: 'Two',
                title: 'Book and pay through our platform',
                desc: 'Secure checkout. No surprises. No phone tag.',
                image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
              { 
                number: 'Three',
                title: 'We pick up and you track live',
                desc: 'Real-time updates show exactly where your vehicle is.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
              { 
                number: 'Four',
                title: 'Delivered safely to your door',
                desc: 'Your vehicle arrives on time, every time.',
                image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
                learnLink: true,
              },
            ].map((step, index) => (
              <div
                key={index}
                className={`relative rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-500 min-h-[350px] flex flex-col ${
                  visibleSections.has('process') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${step.image})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/60"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-8">
                  <div>
                    <div className="text-white/90 text-sm sm:text-base mb-4 font-medium">{step.number}</div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-white">
                      {step.title}
                    </h3>
                    <p className="text-white/95 text-sm sm:text-base mb-6">
                      {step.desc}
                    </p>
                  </div>
                  
                  {step.learnLink && (
                    <Link href="/quote" className="text-white font-medium hover:text-accent-200 transition-colors inline-flex items-center gap-2 group/link">
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
                    className="min-w-full px-4 sm:px-6"
                  >
                    <div className={`bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 md:p-10 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all ${
                      visibleSections.has('reviews') ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 bg-white hover:bg-gray-50 shadow-lg border-2 border-gray-200 rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110"
              aria-label="Previous review"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 bg-white hover:bg-gray-50 shadow-lg border-2 border-gray-200 rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110"
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
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-5 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.2)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float-slow-reverse" style={{ backgroundColor: 'rgba(90, 155, 200, 0.15)' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl animate-pulse-slow" style={{ backgroundColor: 'rgba(71, 131, 168, 0.1)', animationDelay: '0.5s' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <div
            className={`transition-all duration-1000 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="mb-6 inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-accent-500/30 mx-auto animate-bounce-slow">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900">
              Ready to move your vehicle?
            </h2>
            <p className="text-gray-700 text-lg sm:text-xl mb-8 sm:mb-10">Get your instant quote in seconds</p>
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
      <footer className="bg-black text-white relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12 mb-12">
            {/* Logo and Description */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl sm:text-3xl font-bold">
                  <span className="text-white">NEXT</span>
                  <span className="text-accent-400">TRANSPORT</span>
                </div>
                <div className="flex gap-1">
                  <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-white/70 text-sm sm:text-base mb-6 leading-relaxed">
                Australia&apos;s leading vehicle transport service. Get instant quotes, track in real-time, and enjoy door-to-door delivery across the country.
              </p>
              <div className="flex gap-4">
                {[
                  { name: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                  { name: 'Twitter', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                  { name: 'Instagram', icon: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.533.96-.877 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.533-1.379-.877-.419-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.057-1.267-.07-1.646-.07-4.859 0-3.213.015-3.588.074-4.859.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z' },
                  { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 group"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-4">Services</h3>
              <ul className="space-y-3">
                {['Car transport', 'Ute transport', 'Motorbike transport', 'Registration help', 'Live tracking'].map((item) => (
                  <li key={item}>
                    <Link href="/quote" className="text-white/70 hover:text-accent-400 text-sm transition-colors duration-300 inline-flex items-center gap-2 group">
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                {['About us', 'How it works', 'Testimonials', 'Contact us', 'Careers'].map((item) => (
                  <li key={item}>
                    <Link href="/about" className="text-white/70 hover:text-accent-400 text-sm transition-colors duration-300 inline-flex items-center gap-2 group">
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                {['FAQ', 'Track booking', 'Insurance info', 'Pricing guide', 'Help center'].map((item) => (
                  <li key={item}>
                    <Link href="/faq" className="text-white/70 hover:text-accent-400 text-sm transition-colors duration-300 inline-flex items-center gap-2 group">
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                {['Terms of service', 'Privacy policy', 'Cookie policy', 'Disclaimer', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-white/70 hover:text-accent-400 text-sm transition-colors duration-300 inline-flex items-center gap-2 group">
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-white/60 text-sm">
                © 2025 NextTransport. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.293 12.293a1.999 1.999 0 010-2.827l4.364-4.364a8 8 0 110 11.314z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Australia-wide service</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Quote Modal - Lazy loaded */}
      {showQuoteModal && (
        <LazyQuoteModal onClose={() => setShowQuoteModal(false)} />
      )}
    </div>
  )
}

