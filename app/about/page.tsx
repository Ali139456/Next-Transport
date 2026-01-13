'use client'

import { useState, useEffect, useRef } from 'react'

export default function AboutPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [contentMargins, setContentMargins] = useState({ left: '0', right: '0' })

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

  useEffect(() => {
    const updateMargins = () => {
      if (window.innerWidth >= 1024) {
        setContentMargins({ left: '200px', right: '200px' })
      } else {
        setContentMargins({ left: '0', right: '0' })
      }
    }

    updateMargins()
    window.addEventListener('resize', updateMargins)
    return () => window.removeEventListener('resize', updateMargins)
  }, [])

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
      {/* Animated blob gradients */}
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      <div className="blob-extra"></div>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10 z-0"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float-slow pointer-events-none z-0"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent-300/10 rounded-full blur-3xl animate-float-slow-reverse pointer-events-none z-0"></div>
      
      {/* Hero Section - Full Width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div 
          data-section-id="hero"
          className={`text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 ${
            visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-6 shadow-2xl shadow-accent-500/30 animate-bounce-slow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">
            About NextTransport
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Australia&apos;s leading vehicle transport platform - Connecting customers with reliable transport services nationwide
          </p>
        </div>
      </div>

      {/* Content Cards - 2 Column Layout with Margins */}
      <div className="w-full relative z-10">
        <div 
          className="grid lg:grid-cols-2 gap-6 lg:gap-8 px-4 sm:px-6"
          style={{ marginLeft: contentMargins.left, marginRight: contentMargins.right }}
        >
          {/* Who NextTransport Is */}
          <div 
            data-section-id="who-we-are"
            ref={(el) => (sectionsRef.current['who-we-are'] = el)}
            className={`bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-xl p-8 border border-sky-200/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              visibleSections.has('who-we-are') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-3 text-gray-900">Who We Are</h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Australia&apos;s leading vehicle transport platform. We combine cutting-edge technology with trusted transport operators to deliver seamless vehicle relocation nationwide.
                </p>
              </div>
            </div>
          </div>

          {/* Backed by InTraffic */}
          <div 
            data-section-id="intraffic"
            ref={(el) => (sectionsRef.current['intraffic'] = el)}
            className={`bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-xl p-8 border border-sky-200/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              visibleSections.has('intraffic') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-3 text-gray-900">Backed by InTraffic</h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Powered by Australia&apos;s trusted commercial transport experts. Years of experience delivering professional service to dealers, fleets, and businesses nationwide.
                </p>
              </div>
            </div>
          </div>

          {/* Nationwide Carrier Network */}
          <div 
            data-section-id="network"
            ref={(el) => (sectionsRef.current['network'] = el)}
            className={`bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-xl p-8 border border-sky-200/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              visibleSections.has('network') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-3 text-gray-900">Nationwide Network</h2>
                <p className="text-gray-600 leading-relaxed text-sm mb-4">
                  Carefully vetted professional carriers across Australia. Licensed, insured, and experienced in all vehicle types.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    'Licensed & Insured',
                    'All Vehicle Types',
                    'Safety Audited',
                    '24/7 Support',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Compliance Focus */}
          <div 
            data-section-id="safety"
            ref={(el) => (sectionsRef.current['safety'] = el)}
            className={`bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-xl p-8 border border-sky-200/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              visibleSections.has('safety') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-3 text-gray-900">Safety First</h2>
                <p className="text-gray-600 leading-relaxed text-sm mb-4">
                  Highest safety standards with full compliance to Australian transport regulations. Your vehicle&apos;s safety is our priority.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    'Full Insurance',
                    'Condition Reports',
                    'Licensed Operators',
                    'Live Tracking',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
