export default function AboutPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float-slow-reverse"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">
            About NextTransport
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Australia&apos;s leading vehicle transport platform - Connecting customers with reliable transport services nationwide
          </p>
        </div>

        {/* Who NextTransport Is */}
        <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 mb-8 border-2 border-white/30">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl p-3 flex-shrink-0 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-accent-900">Who NextTransport Is</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                NextTransport.com.au is Australia&apos;s leading vehicle transport booking platform, making it easy 
                to move your vehicle anywhere in the country. We combine cutting-edge technology with a network of 
                trusted, professional transport operators to deliver a seamless experience.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our platform enables instant quotes, seamless online booking, secure payments, and real-time tracking - 
                all while ensuring your vehicle arrives safely and on time, every time. Whether you&apos;re moving interstate, 
                buying a car from another state, or relocating your fleet, we make vehicle transport simple and stress-free.
              </p>
            </div>
          </div>
        </div>

        {/* Backed by InTraffic */}
        <div className="bg-gradient-to-br from-accent-50/95 to-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 mb-8 border-2 border-white/30">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl p-3 flex-shrink-0 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900">Backed by InTraffic</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                NextTransport is powered by InTraffic, Australia&apos;s trusted commercial vehicle transport experts. 
                With years of experience serving dealers, fleets, and commercial clients, InTraffic brings proven 
                operational expertise and industry-leading standards to every booking.
              </p>
              <p className="text-gray-700 leading-relaxed">
                This commercial expertise means you get the same professional service that businesses trust for their 
                vehicle transport needs. Our operational excellence, safety standards, and customer service are built 
                on InTraffic&apos;s foundation of reliability and trust.
              </p>
            </div>
          </div>
        </div>

        {/* Nationwide Carrier Network */}
        <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 mb-8 border-2 border-white/30">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl p-3 flex-shrink-0 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900">Nationwide Carrier Network</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We work with a carefully vetted network of professional carriers across Australia. From Sydney to Perth, 
                Melbourne to Darwin, our network ensures your vehicle is transported by experienced, licensed, and 
                insured professionals.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our carriers are selected based on their safety records, insurance coverage, customer service standards, 
                and ability to handle various vehicle types. Whether you need to transport a car, ute, van, or motorbike, 
                we have the right carrier for your needs.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Licensed and insured carriers nationwide</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Experience with all vehicle types and sizes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Regular safety audits and performance reviews</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 support and tracking capabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Safety & Compliance Focus */}
        <div className="bg-gradient-to-br from-accent-50/95 to-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 mb-8 border-2 border-white/30">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl p-3 flex-shrink-0 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900">Safety & Compliance Focus</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Safety and compliance are at the heart of everything we do. We maintain the highest standards to ensure 
                your vehicle is transported safely and legally, with full compliance to all Australian transport regulations.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-gradient-to-br from-accent-100/50 to-white rounded-lg p-5 border-2 border-accent-200/50 shadow-md">
                  <h3 className="font-semibold text-accent-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Comprehensive Insurance
                  </h3>
                    <p className="text-gray-700 text-sm">
                    All vehicles are covered by comprehensive transport insurance. Additional coverage options available for peace of mind.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Condition Reports
                  </h3>
                    <p className="text-gray-700 text-sm">
                    Detailed condition reports at pickup and delivery ensure your vehicle&apos;s condition is properly documented.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Licensed Operators
                  </h3>
                    <p className="text-gray-700 text-sm">
                    All carriers are fully licensed and comply with Australian transport regulations and safety standards.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Real-Time Tracking
                  </h3>
                    <p className="text-gray-700 text-sm">
                    Track your vehicle in real-time with live updates on location, status, and estimated delivery time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

