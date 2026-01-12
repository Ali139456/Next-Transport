'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

const faqCategories = [
  {
    title: 'Pricing',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    questions: [
      {
        q: 'How is the quote price calculated?',
        a: 'Our pricing is based on several factors including the distance between pickup and delivery locations, vehicle type and size, transport type (open or enclosed), vehicle condition (running or non-running), and any optional add-ons like insurance. All prices include GST and are transparent with no hidden fees.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No, all prices are transparent and include GST. The quote you receive is the final price you pay, unless you request additional services or modifications to your booking.',
      },
      {
        q: 'Do you offer discounts for multiple vehicles?',
        a: 'Yes, we offer competitive rates for multiple vehicle transports. Contact us directly for a custom quote on fleet or multiple vehicle bookings.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards, debit cards, and bank transfers through our secure Stripe payment system. You can choose to pay in full or pay a deposit with the balance due before delivery.',
      },
    ],
  },
  {
    title: 'Pickup & Delivery',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    questions: [
      {
        q: 'How do I schedule a pickup?',
        a: 'When you create a booking, you can select your preferred pickup date. Our team will confirm the exact pickup window (typically 3-7 days from your preferred date) and coordinate with you directly.',
      },
      {
        q: 'Do you provide door-to-door service?',
        a: 'Yes, we offer door-to-door service across Australia. Our drivers will pick up your vehicle from your specified location and deliver it directly to your destination address.',
      },
      {
        q: 'What if I need to change my pickup or delivery address?',
        a: 'You can contact our support team to modify your booking. Changes may affect pricing depending on the new locations. We recommend contacting us as soon as possible to avoid any delays.',
      },
      {
        q: 'Can someone else be present for pickup/delivery?',
        a: 'Yes, as long as they have authorization and can provide the booking details. We recommend having the booking confirmation email or booking ID available for verification.',
      },
    ],
  },
  {
    title: 'Insurance',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    questions: [
      {
        q: 'Is my vehicle insured during transport?',
        a: 'All vehicles are covered by our comprehensive transport insurance during transit. This covers damage that may occur during transport. We also offer additional insurance options for extra peace of mind.',
      },
      {
        q: 'What does the insurance cover?',
        a: 'Our standard insurance covers damage to your vehicle during transport, including collision, theft, and weather-related incidents. Personal items left in the vehicle are not covered. Full terms and conditions are provided with your booking confirmation.',
      },
      {
        q: 'Do I need additional insurance?',
        a: 'While our standard insurance provides comprehensive coverage, you can opt for additional insurance for high-value vehicles or extra protection. This is optional and can be added during booking.',
      },
      {
        q: 'What should I do if my vehicle is damaged?',
        a: 'Contact us immediately if you notice any damage. We will guide you through the claims process. All vehicles are inspected and documented with condition reports at pickup and delivery.',
      },
    ],
  },
  {
    title: 'Registration',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    questions: [
      {
        q: 'Do you handle vehicle registration transfers?',
        a: 'Yes, we can assist with registration transfers as part of our comprehensive service. This is especially useful when moving interstate. Contact us for details on registration handling in your state.',
      },
      {
        q: 'What documents do I need for transport?',
        a: "You will need your vehicle registration, proof of ownership, and a valid driver's license. For interstate moves, you may need additional documentation. Our team will guide you through all requirements.",
      },
      {
        q: 'Can you transport unregistered vehicles?',
        a: 'Yes, we can transport unregistered vehicles. However, additional documentation and permits may be required. Please contact us to discuss your specific situation.',
      },
    ],
  },
  {
    title: 'Tracking',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    questions: [
      {
        q: 'How can I track my vehicle?',
        a: "You can track your booking using your Booking ID and email or mobile number on our tracking page. You’ll receive real-time updates on your vehicle’s status, location, and estimated delivery time.",
      },
      {
        q: 'Will I receive updates during transport?',
        a: "Yes, you’ll receive automatic updates via email and SMS at key stages: when your driver is assigned, when pickup is confirmed, during transit, and when delivery is scheduled.",
      },
      {
        q: 'Can I see the driver\'s location in real-time?',
        a: 'For active bookings, you can view the driver\'s approximate location on our live map tracking feature. This is available once your vehicle has been picked up and is in transit.',
      },
      {
        q: "What if I don't receive tracking updates?",
        a: "If you’re not receiving updates, please check your spam folder and ensure your contact details are correct. You can also track your booking manually using your Booking ID on our website.",
      },
    ],
  },
  {
    title: 'Payments',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    questions: [
      {
        q: 'When do I need to pay?',
        a: 'You can choose to pay in full at booking or pay a deposit (typically 50%) with the balance due before delivery. Payment is required to confirm your booking.',
      },
      {
        q: 'Is my payment secure?',
        a: 'Yes, all payments are processed through Stripe, a PCI-compliant payment processor. We never store your full card details, and all transactions are encrypted.',
      },
      {
        q: 'What is your refund policy?',
        a: 'Refunds are available for cancelled bookings according to our terms and conditions. Cancellation fees may apply depending on when you cancel. Full details are provided at booking.',
      },
      {
        q: 'Can I pay in installments?',
        a: 'We offer deposit + balance payment options. The deposit secures your booking, and the balance is due before delivery. Contact us if you need a custom payment arrangement.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const toggleCategory = (categoryTitle: string) => {
    setOpenCategory(openCategory === categoryTitle ? null : categoryTitle)
    setOpenQuestion(null) // Close any open questions when switching categories
  }

  const toggleQuestion = (questionKey: string) => {
    setOpenQuestion(openQuestion === questionKey ? null : questionKey)
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
      {/* Animated blob gradients */}
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      <div className="blob-extra"></div>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Find answers to common questions about vehicle transport, pricing, insurance, and more.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {faqCategories.map((category, categoryIndex) => {
            const isCategoryOpen = openCategory === category.title
            return (
              <div
                key={category.title}
                className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl border-2 border-white/30 overflow-hidden transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.title)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-accent-600">{category.icon}</div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-accent-900">
                      {category.title}
                    </h2>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isCategoryOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Category Questions */}
                {isCategoryOpen && (
                  <div className="border-t-2 border-accent-200/50 bg-gradient-to-br from-accent-50/80 to-white/80">
                    <div className="px-6 py-4 space-y-2">
                      {category.questions.map((faq, questionIndex) => {
                        const questionKey = `${category.title}-${questionIndex}`
                        const isQuestionOpen = openQuestion === questionKey
                        return (
                          <div
                            key={questionKey}
                            className="bg-white/90 backdrop-blur-sm rounded-lg border-2 border-accent-200/50 overflow-hidden shadow-md hover:shadow-lg transition-all"
                          >
                            <button
                              onClick={() => toggleQuestion(questionKey)}
                              className="w-full px-5 py-4 flex items-start justify-between text-left hover:bg-accent-50/50 transition-colors"
                            >
                              <span className="font-medium text-accent-900 pr-4 flex-1">
                                {faq.q}
                              </span>
                              <svg
                                className={`w-5 h-5 text-accent-600 flex-shrink-0 transition-transform duration-200 ${
                                  isQuestionOpen ? 'transform rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isQuestionOpen && (
                              <div className="px-5 pb-4 pt-2 border-t border-accent-200/50 bg-accent-50/30">
                                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-12 bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl p-8 border-2 border-white/30 text-center shadow-2xl">
          <h3 className="text-2xl font-semibold text-accent-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-700 mb-6">
            Our support team is here to help. Get in touch and we&apos;ll respond as soon as possible.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
