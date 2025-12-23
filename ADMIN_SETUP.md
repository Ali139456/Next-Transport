# Admin Login Setup

This document explains how to set up admin authentication for the NextTransport application.

## Creating Your First Admin User

1. **Make sure MongoDB is running:**
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or check if it's already running
   mongosh --eval "db.adminCommand('ping')"
   ```

2. **Create an admin user:**
   ```bash
   npm run create-admin <username> <password> <name>
   ```
   
   Example:
   ```bash
   npm run create-admin admin mypassword123 "Admin User"
   ```
   
   Or directly with node:
   ```bash
   node scripts/create-admin.js admin mypassword123 "Admin User"
   ```

3. **Access the admin panel:**
   - Navigate to `/login` in your browser
   - Enter your username and password
   - You'll be redirected to `/admin` upon successful login

## Default Admin Credentials

After running the create-admin script, you can login with:
- **Username:** The username you provided
- **Password:** The password you provided

## Security Notes

- Passwords are hashed using bcrypt before storage
- Sessions are managed via HTTP-only cookies with JWT tokens
- Admin routes are protected by middleware
- Only users with `role: 'admin'` can access admin pages

## Login Flow

1. User goes to `/login`
2. Enters username and password
3. Server validates credentials against MongoDB
4. If valid, a JWT token is created and stored in an HTTP-only cookie
5. User is redirected to `/admin`
6. All admin API routes check for valid authentication token

## Logout

Click the "Logout" button in the admin panel to log out. This will clear the authentication cookie.

## Creating Additional Admin Users

Run the create-admin script again with different credentials:

```bash
npm run create-admin newadmin securepassword "New Admin"
```

## Troubleshooting

**Login fails:**
- Verify the admin user exists: `mongosh nexttransport --eval "db.users.find({role: 'admin'})"`
- Check that MongoDB is running
- Verify JWT_SECRET is set in `.env.local`

**Can't access /admin:**
- Make sure you're logged in (check for `admin-token` cookie)
- Verify the token is valid by checking `/api/auth/me`

**Forgot password:**
- Currently, you'll need to manually update the password in MongoDB or create a new admin user
