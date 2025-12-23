# NextTransport.com.au

A modern, AI-ready, SEO/GEO friendly mobile-first transport booking platform for vehicle transport across Australia.

## Features

- ✅ **Instant Online Quotes** - Smart pricing calculator with real-time quotes
- ✅ **Online Booking & Payment** - Stripe integration with full payment or deposit options
- ✅ **Real-Time Tracking** - Track vehicle pickup/delivery with GPS integration
- ✅ **Admin Portal** - Manage bookings, drivers, and pricing
- ✅ **Document Upload** - Upload photos and documents
- ✅ **Automated Notifications** - Email and SMS notifications
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Parallax Scrolling** - Modern homepage with parallax effects

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (via Mongoose)
- **Payments**: Stripe
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Nodemailer (Email) + Twilio (SMS)
- **File Upload**: React Dropzone

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or cloud)
- Stripe account (for payments)
- SMTP credentials (for emails)
- Twilio account (optional, for SMS)

### Installation

1. Clone the repository:
```bash
cd "Next Transport"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/nexttransport

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT
JWT_SECRET=your-secret-key-here

# NextAuth
NEXTAUTH_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio - Optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# App
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── bookings/      # Booking API endpoints
│   │   ├── quote/         # Quote calculation API
│   │   ├── stripe/        # Stripe webhook
│   │   └── upload/        # File upload API
│   ├── admin/             # Admin portal pages
│   ├── booking/           # Booking page
│   ├── tracking/          # Tracking pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── HomePage.tsx       # Homepage component
│   ├── QuoteModal.tsx     # Quote modal
│   ├── QuoteCalculator.tsx # Quote calculator
│   ├── DocumentUpload.tsx # Document upload
│   └── Navbar.tsx         # Navigation bar
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # MongoDB connection
│   ├── pricing.ts         # Pricing engine
│   ├── stripe.ts          # Stripe integration
│   └── notifications.ts   # Email/SMS notifications
├── models/                # Mongoose models
│   ├── Booking.ts         # Booking model
│   └── User.ts            # User model
└── public/                # Static files
```

## Key Features Implementation

### Pricing Engine
The pricing engine (`lib/pricing.ts`) calculates quotes based on:
- Distance between pickup and delivery postcodes
- Vehicle type (sedan, SUV, ute, van, light truck, bike)
- Vehicle condition (running/non-running)
- Transport type (open/enclosed)
- Add-ons (insurance, etc.)

**Note**: The current distance calculation is simplified. In production, integrate with Google Maps Distance Matrix API for accurate distances.

### Stripe Integration
- Full payment or deposit (10-20%) options
- Secure payment processing via Stripe Checkout
- Webhook handling for payment status updates
- Customer tokenization for saved cards

### Tracking System
- Real-time booking status updates
- GPS location tracking (requires driver app integration)
- Status history timeline
- Estimated pickup/delivery times

### Admin Portal
- View all bookings with filtering
- Update booking status
- Assign drivers
- Override prices (to be implemented)
- Export reports (to be implemented)

## API Routes

### Public Routes
- `POST /api/quote/calculate` - Calculate instant quote
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/[bookingId]` - Get booking details
- `POST /api/upload` - Upload documents/photos

### Admin Routes
- `GET /api/admin/bookings` - List all bookings (with filters)
- `PATCH /api/admin/bookings/[bookingId]/status` - Update booking status

### Webhooks
- `POST /api/stripe/webhook` - Stripe payment webhook

## Environment Variables

See `.env.example` for all required environment variables.

## Production Deployment

1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure Stripe production keys
3. Set up SMTP service (SendGrid, AWS SES, etc.)
4. Configure Twilio for SMS (optional)
5. Deploy to Vercel, AWS, or your preferred hosting platform
6. Set up Stripe webhook endpoint pointing to your production URL

## Future Enhancements

- [ ] Google Maps integration for accurate distance calculation
- [ ] Driver mobile app/webapp for GPS tracking
- [ ] Advanced admin features (pricing rules, driver management)
- [ ] Customer login/account system
- [ ] Review and rating system
- [ ] Multi-language support
- [ ] Advanced analytics and reporting

## License

Proprietary - All rights reserved

## Support

For support, email support@nexttransport.com.au

