# JWT_SECRET Explained

## What is JWT_SECRET?

JWT_SECRET is a secret key used to sign and verify JSON Web Tokens (JWT) for your admin authentication system. It's used to:
- **Sign** authentication tokens when users log in
- **Verify** that tokens haven't been tampered with when users access protected routes

## Why is it needed?

Your admin login system uses JWT tokens stored in cookies. Without a proper JWT_SECRET:
- Login might fail
- Admin pages won't be accessible
- Authentication tokens can't be verified

## What value should you use?

### Option 1: Use your existing JWT_SECRET (if you have one)

Check your local `.env.local` file:
```bash
grep JWT_SECRET .env.local
```

If you see a value like `JWT_SECRET=D5UDKuL7n4C6GtMOXkloBZFjxd+60N4rukjEZN/U1wk=`, use that same value in Vercel.

### Option 2: Generate a new secure secret

Generate a new random secret:

**On macOS/Linux:**
```bash
openssl rand -base64 32
```

**Or using Python:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

This will output something like:
```
D5UDKuL7n4C6GtMOXkloBZFjxd+60N4rukjEZN/U1wk=
```

## How to add it in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Set:
   - **Key:** `JWT_SECRET`
   - **Value:** Your secret key (from above)
   - **Environments:** Select all (Production, Preview, Development)
4. Click "Save"

## Important Notes

⚠️ **Security Best Practices:**

1. **Use a strong, random secret** - Don't use simple words or predictable values
2. **Keep it secret** - Never commit it to Git (already in `.gitignore`)
3. **Use the same secret everywhere** - Use the same JWT_SECRET in:
   - Local development (`.env.local`)
   - Vercel production
   - Any other environments
   
   OR use different secrets for each environment (more secure for production)

4. **Don't share it** - Keep your JWT_SECRET private

## What happens if JWT_SECRET is missing or wrong?

- ❌ Admin login will fail
- ❌ Authentication tokens won't work
- ❌ Protected admin routes will redirect to login
- ❌ Error: "JWT_SECRET is not set" in server logs

## Example Values

✅ **Good (secure, random):**
```
JWT_SECRET=D5UDKuL7n4C6GtMOXkloBZFjxd+60N4rukjEZN/U1wk=
JWT_SECRET=my-super-secret-jwt-key-change-in-production-2024
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

❌ **Bad (insecure, predictable):**
```
JWT_SECRET=secret
JWT_SECRET=password123
JWT_SECRET=jwt_secret
```

## Quick Setup for Vercel

If you need to generate a new one right now, run this command:

```bash
openssl rand -base64 32
```

Then copy the output and add it to Vercel as `JWT_SECRET`.

## Updating Your Local .env.local

If you generate a new secret, also update your local `.env.local` file:

```env
JWT_SECRET=your-generated-secret-here
```

Then restart your local dev server for changes to take effect.
