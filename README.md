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
- ✅ **Modern UI** - Beautiful, fast, and user-friendly interface

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

### Quick Setup

1. **Clone the repository:**
```bash
cd "Next Transport"
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up MongoDB:**

**Option A: Use MongoDB Atlas (Recommended - Cloud)**
- Follow the guide in [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)
- Get your connection string from Atlas dashboard
- Update `.env.local` with your Atlas connection string

**Option B: Use Local MongoDB**
```bash
# Run the setup script (macOS/Linux)
./setup-mongodb.sh

# Or manually start MongoDB:
# macOS with Homebrew:
brew services start mongodb-community

# Or start MongoDB directly:
mongod --dbpath ~/data/db
```

4. **Set up environment variables:**
Create a `.env.local` file in the root directory with your configuration:

```env
# Database
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/nexttransport
# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexttransport?retryWrites=true&w=majority

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT (generated automatically by setup script)
JWT_SECRET=your-secret-key-here

# NextAuth
NEXTAUTH_URL=http://localhost:3000

# Email (SMTP) - Optional but recommended
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio) - Optional
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## MongoDB Setup Details

### Local MongoDB Setup

The project uses MongoDB for data storage. The database name is `nexttransport`.

**Connection String:**
```
mongodb://localhost:27017/nexttransport
```

**Starting MongoDB:**
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod` or `mongod --dbpath ~/data/db`
- **Windows:** Start MongoDB service from Services panel or run `mongod`

**Verify MongoDB is running:**
```bash
mongosh --eval "db.adminCommand('ping')"
```

### Using MongoDB Atlas (Cloud)

If you prefer cloud MongoDB:

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexttransport
```

## Database Models

- **Booking**: Stores booking information, customer details, vehicle info, and tracking data
- **User**: Stores user accounts (admin, driver, customer)

## API Routes

- `/api/quote/calculate` - Calculate transport quotes
- `/api/bookings/create` - Create new bookings
- `/api/bookings/[bookingId]` - Get booking details
- `/api/admin/bookings` - Admin: List all bookings
- `/api/admin/bookings/[bookingId]/status` - Admin: Update booking status
- `/api/upload` - Upload documents/photos
- `/api/stripe/webhook` - Stripe payment webhooks

## Environment Variables

All environment variables are stored in `.env.local` (not committed to git).

Required:
- `MONGODB_URI` - MongoDB connection string
  - Local: `mongodb://localhost:27017/nexttransport`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/nexttransport?retryWrites=true&w=majority`
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `JWT_SECRET` - Secret for JWT tokens

Optional:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - For email notifications
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - For SMS notifications

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important:** Make sure to add all environment variables in Vercel's project settings.

## License

Private project
