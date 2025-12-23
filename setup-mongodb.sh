#!/bin/bash

# MongoDB Setup Script for Next Transport
# This script helps set up MongoDB for local development

echo "🚀 Setting up MongoDB for Next Transport..."

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null && ! command -v mongosh &> /dev/null; then
    echo "❌ MongoDB is not installed."
    echo ""
    echo "Please install MongoDB using one of these methods:"
    echo ""
    echo "Option 1: Install via Homebrew (Recommended for macOS):"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community"
    echo ""
    echo "Option 2: Install via MongoDB official installer:"
    echo "  Visit: https://www.mongodb.com/try/download/community"
    echo ""
    echo "Option 3: Use Docker (if you have Docker installed):"
    echo "  docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo ""
    exit 1
fi

echo "✅ MongoDB is installed"

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    
    # Try to start MongoDB
    if command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null || \
        brew services start mongodb-community@7 2>/dev/null || \
        brew services start mongodb-community@6 2>/dev/null || \
        mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongod.log || {
            echo "❌ Failed to start MongoDB. Please start it manually:"
            echo "   brew services start mongodb-community"
            echo "   or"
            echo "   mongod --dbpath ~/data/db"
            exit 1
        }
    else
        echo "⚠️  Please start MongoDB manually"
        echo "   mongod --dbpath ~/data/db"
        exit 1
    fi
    
    sleep 2
    echo "✅ MongoDB started"
fi

# Create database directory if it doesn't exist
mkdir -p ~/data/db

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/nexttransport

# Stripe (Add your keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT (Change this in production!)
JWT_SECRET=$(openssl rand -base64 32)

# NextAuth
NEXTAUTH_URL=http://localhost:3000

# Email (SMTP) - Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio) - Optional
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
EOF
    echo "✅ Created .env.local file"
    echo "⚠️  Please update .env.local with your actual API keys"
else
    echo "✅ .env.local already exists"
fi

# Test MongoDB connection
echo ""
echo "🔍 Testing MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1 || \
   mongo --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful!"
    echo ""
    echo "📊 MongoDB is ready to use!"
    echo "   Connection string: mongodb://localhost:27017/nexttransport"
    echo ""
    echo "✨ Setup complete! You can now run: npm run dev"
else
    echo "❌ Failed to connect to MongoDB"
    echo "   Please make sure MongoDB is running"
    exit 1
fi
