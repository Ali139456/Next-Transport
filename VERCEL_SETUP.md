# Vercel Deployment Setup for MongoDB Atlas

## Environment Variables to Add in Vercel

After migrating to MongoDB Atlas, you need to update your Vercel environment variables.

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your "Next-Transport" project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click on **Environment Variables** in the sidebar

3. **Add/Update MongoDB Connection String**
   
   Click **Add New** and add the following:

   **Variable Name:**
   ```
   MONGODB_URI
   ```

   **Value:**
   ```
   mongodb+srv://nexttransport:Ali-3104@cluster0.gqyda11.mongodb.net/nexttransport?retryWrites=true&w=majority
   ```

   **Environments:** 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   
   (Check all three to use the same database for all environments)

4. **Verify Other Environment Variables**

   Make sure you also have these variables set (if not already present):

   ```
   JWT_SECRET=your-jwt-secret-key-here
   ```
   
   If you don't have a JWT_SECRET, you can generate one:
   ```bash
   openssl rand -base64 32
   ```

   **Stripe Keys (if using payments):**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Important: Update Network Access in MongoDB Atlas**

   Since Vercel uses dynamic IPs, you need to:
   
   - Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
   - Navigate to **Security** → **Network Access**
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
     - ⚠️ For production, consider adding Vercel's IP ranges instead for better security

6. **Redeploy Your Application**

   After adding/updating environment variables:
   - Go to the **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger automatic deployment

## Quick Checklist

- [ ] Added `MONGODB_URI` with Atlas connection string
- [ ] Set `JWT_SECRET` for authentication
- [ ] Updated Network Access in Atlas to allow Vercel
- [ ] Verified Stripe keys (if using payments)
- [ ] Redeployed the application

## Testing After Deployment

1. Visit your deployed site
2. Try accessing the admin login: `https://your-domain.vercel.app/login`
3. Login with your admin credentials:
   - Username: `admin`
   - Password: `admin123`
4. Verify that bookings and data are saving to MongoDB Atlas

## Troubleshooting

**If deployment fails:**
- Check that `MONGODB_URI` is correctly set in Vercel
- Verify the connection string format
- Check MongoDB Atlas Network Access settings

**If authentication doesn't work:**
- Verify `JWT_SECRET` is set in Vercel
- Make sure it matches your local `.env.local` (or generate a new one)

**If database connection fails:**
- Check MongoDB Atlas Network Access - your Vercel IPs might not be whitelisted
- Verify the database user credentials are correct
- Check MongoDB Atlas cluster status

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use strong passwords** for MongoDB Atlas database users
3. **Consider IP whitelisting** - Instead of allowing all IPs (`0.0.0.0/0`), you can:
   - Find Vercel's IP ranges (they publish these)
   - Add specific IP ranges for better security
4. **Rotate secrets** - Change passwords and secrets regularly in production
