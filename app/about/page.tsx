export default function AboutPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-accent-500/10 rounded-full blur-2xl sm:blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-accent-600/10 rounded-full blur-2xl sm:blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 pt-4 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r from-white via-accent-300 to-white bg-clip-text text-transparent px-2">
            About NextTransport
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto font-light px-2">
            Australia&apos;s leading vehicle transport platform - Connecting customers with reliable transport services nationwide
          </p>
        </div>
        
        {/* Main Story Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl card-shadow-lg p-6 sm:p-8 md:p-10 lg:p-16 border border-gray-200 mb-8 sm:mb-10 md:mb-12">
          <div className="prose max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 text-gray-900 flex items-center flex-wrap">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mr-3 sm:mr-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Our Story
              </h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
              NextTransport.com.au was founded with a simple mission: to make vehicle transport across Australia 
              as easy as booking a ride. We recognized that transporting a vehicle shouldn&apos;t be complicated, 
              time-consuming, or stressful.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
              Today, we are Australia&apos;s leading vehicle transport booking platform, serving thousands of customers 
              from individuals moving interstate to businesses managing fleet relocations. We combine cutting-edge 
              technology with a network of trusted, professional transport operators.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              Our platform enables instant quotes, seamless online booking, secure payments, and real-time tracking - 
              all while ensuring your vehicle arrives safely and on time, every time.
            </p>
          </div>
        </div>
        
        {/* Mission & Values */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-200 hover:border-accent-400/50 transition-all duration-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                To provide a seamless, transparent, and reliable vehicle transport experience 
                for all Australians, from individuals to businesses. We believe everyone deserves 
                peace of mind when moving their vehicle.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-200 hover:border-accent-400/50 transition-all duration-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-accent-600 to-accent-700 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Our Values</h2>
              <ul className="space-y-3 text-base sm:text-lg text-gray-700">
                <li className="flex items-start">
                  <span className="text-accent-600 mr-3 mt-1 font-bold">✓</span>
                  <span><strong>Transparency:</strong> Clear pricing with no hidden fees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-600 mr-3 mt-1 font-bold">✓</span>
                  <span><strong>Reliability:</strong> Consistent service you can trust</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-600 mr-3 mt-1 font-bold">✓</span>
                  <span><strong>Innovation:</strong> Using technology to improve your experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-600 mr-3 mt-1 font-bold">✓</span>
                  <span><strong>Customer Focus:</strong> Your satisfaction is our priority</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Key Features */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-white px-2">Why Choose Us?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 card-shadow-lg border border-gray-200 hover:border-accent-400/50 transition-all duration-200 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">Fast & Efficient</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg">Get instant quotes in seconds and complete your booking in minutes. Our streamlined process saves you time.</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 card-shadow-lg border-2 border-gray-100 hover:border-accent-300 transition-all hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-100/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Secure & Reliable</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Safe transport with comprehensive insurance options. Your vehicle is protected throughout the journey.</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 card-shadow-lg border-2 border-gray-100 hover:border-accent-300 transition-all hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-100/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Nationwide Coverage</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Serving all of Australia with extensive coverage. From Sydney to Perth, we&apos;ve got you covered.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-gradient-to-br from-accent-600 via-accent-700 to-accent-600 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-center mb-12">Our Track Record</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-white to-accent-100 bg-clip-text text-transparent">1000+</div>
                <div className="text-accent-100 text-lg font-medium">Vehicles Transported</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-white to-accent-100 bg-clip-text text-transparent">98%</div>
                <div className="text-accent-100 text-lg font-medium">Customer Satisfaction</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-white to-accent-100 bg-clip-text text-transparent">50+</div>
                <div className="text-accent-100 text-lg font-medium">Cities Covered</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-white to-accent-100 bg-clip-text text-transparent">24/7</div>
                <div className="text-accent-100 text-lg font-medium">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

