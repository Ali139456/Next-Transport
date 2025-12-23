# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in all required values (see below)

3. **Set Up MongoDB**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud)
   - Update `MONGODB_URI` in `.env.local`

4. **Set Up Stripe**
   - Create a Stripe account at https://stripe.com
   - Get your test API keys from the dashboard
   - Add them to `.env.local`
   - Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

5. **Set Up Email (SMTP)**
   - Use Gmail with App Password, or
   - Use SendGrid, AWS SES, or similar service
   - Add credentials to `.env.local`

6. **Add Hero Image (Optional)**
   - Place a hero background image at `/public/images/hero-bg.jpg`
   - Or update the Parallax component in `components/HomePage.tsx` to use a different image

7. **Run Development Server**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### Database
- `MONGODB_URI` - MongoDB connection string

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_`)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with `pk_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as above (for client-side)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)

### Email
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP port (usually 587)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password/app password

### SMS (Optional)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

### App
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)

## Testing the Application

1. **Test Quote Calculator**
   - Go to homepage
   - Click "Get Instant Quote"
   - Fill in the form and submit
   - Verify quote is calculated

2. **Test Booking Flow**
   - Complete a quote
   - Click "Book Now"
   - Fill in booking details
   - Complete payment (use Stripe test card: 4242 4242 4242 4242)

3. **Test Tracking**
   - After booking, you'll be redirected to tracking page
   - Or manually go to `/tracking/[bookingId]`

4. **Test Admin Portal**
   - Go to `/admin`
   - View bookings
   - Update booking status

## Production Deployment Checklist

- [ ] Set up production MongoDB database
- [ ] Configure production Stripe keys
- [ ] Set up production SMTP service
- [ ] Configure Stripe webhook for production URL
- [ ] Set up SSL certificate
- [ ] Configure environment variables on hosting platform
- [ ] Set up monitoring and error tracking
- [ ] Test all payment flows
- [ ] Test email notifications
- [ ] Set up backups

## Common Issues

### "Cannot find module 'next/server'"
- Run `npm install` to install dependencies

### MongoDB connection errors
- Verify `MONGODB_URI` is correct
- Ensure MongoDB is running (if local)
- Check network/firewall settings (if cloud)

### Stripe payment not working
- Verify all Stripe keys are set correctly
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Ensure webhook is configured in Stripe dashboard

### Email not sending
- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Check firewall/network settings

