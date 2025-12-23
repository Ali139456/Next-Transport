/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    // Stripe is optional - only include if configured
    ...(process.env.STRIPE_SECRET_KEY && { STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY }),
    ...(process.env.STRIPE_PUBLISHABLE_KEY && { STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY }),
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  },
}

module.exports = nextConfig

