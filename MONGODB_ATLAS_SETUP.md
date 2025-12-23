# MongoDB Atlas Setup Guide

This guide will help you connect your NextTransport application to MongoDB Atlas (cloud MongoDB).

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (or sign in if you already have one)
3. The free tier (M0) is perfect for development and small applications

## Step 2: Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose the **FREE** (M0) tier
3. Select a cloud provider and region (choose the one closest to you)
4. Give your cluster a name (e.g., "nexttransport")
5. Click **"Create Cluster"** (it takes 3-5 minutes to create)

## Step 3: Create a Database User

1. In the Security section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `nexttransport-admin`)
5. Enter a strong password (save this - you'll need it!)
6. Under "Database User Privileges", select **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Configure Network Access

1. In the Security section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - ⚠️ **Security Note**: For production, add only your server IP addresses
4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** as the driver
4. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your Connection String

1. Replace `<username>` with your database username
2. Replace `<password>` with your database password
3. Add your database name at the end (before the `?`):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nexttransport?retryWrites=true&w=majority
   ```

**Important**: If your password contains special characters, you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- etc.

## Step 7: Update Your Environment Variables

1. Open your `.env.local` file in the project root
2. Update the `MONGODB_URI` with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/nexttransport?retryWrites=true&w=majority
```

3. **Never commit this file to Git** (it's already in `.gitignore`)

## Step 8: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try accessing your app - if it connects successfully, you'll see "✅ Connected to MongoDB" in the server logs

3. You can also test by creating an admin user:
   ```bash
   npm run create-admin admin yourpassword "Admin User"
   ```

## Step 9: Migrate Data (Optional)

If you have data in your local MongoDB that you want to migrate to Atlas:

### Option A: Using mongodump/mongorestore (Recommended)

```bash
# Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/nexttransport" --out=./backup

# Import to Atlas
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nexttransport" ./backup/nexttransport
```

### Option B: Using MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your local MongoDB
3. Export collections as JSON
4. Connect to your Atlas cluster
5. Import the JSON files

## Troubleshooting

### Connection Timeout
- Check that your IP address is whitelisted in Network Access
- Verify your connection string is correct
- Check if your firewall is blocking the connection

### Authentication Failed
- Verify your username and password are correct
- Make sure special characters in password are URL-encoded
- Check that the database user has proper permissions

### SSL/TLS Errors
- MongoDB Atlas requires SSL/TLS connections
- The connection string should use `mongodb+srv://` (not `mongodb://`)
- Mongoose handles SSL automatically with `mongodb+srv://` URIs

### Connection String Format
Make sure your connection string includes:
- Protocol: `mongodb+srv://`
- Username and password (URL-encoded if needed)
- Cluster address
- Database name
- Query parameters: `?retryWrites=true&w=majority`

Example:
```
mongodb+srv://admin:mySecurePass%40123@cluster0.abc123.mongodb.net/nexttransport?retryWrites=true&w=majority
```

## For Production (Vercel/Other Hosting)

When deploying to production:

1. Add your `MONGODB_URI` to your hosting platform's environment variables
   - **Vercel**: Project Settings → Environment Variables
   - Add `MONGODB_URI` with your Atlas connection string

2. Update Network Access in Atlas:
   - Remove `0.0.0.0/0` (Allow from anywhere)
   - Add only your hosting provider's IP ranges or use Vercel's IP ranges

3. Consider upgrading to a paid tier for production workloads

## Security Best Practices

1. **Never commit connection strings to Git** - Always use `.env.local` (already in `.gitignore`)
2. **Use strong passwords** for database users
3. **Limit network access** - Only allow IPs that need access
4. **Use environment-specific users** - Different users for dev/staging/production
5. **Enable encryption at rest** (available in paid tiers)
6. **Regular backups** - Configure automatic backups in Atlas

## Next Steps

- Your app is now connected to MongoDB Atlas! 🎉
- You can create admin users using: `npm run create-admin <username> <password> <name>`
- All data will be stored in your Atlas cluster
- Monitor your usage in the Atlas dashboard
