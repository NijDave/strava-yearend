#!/bin/bash

# Setup script for environment variables

echo "🚀 Setting up .env.local file..."

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Create .env.local file
cat > .env.local << EOF
# Database
# For local MongoDB: mongodb://localhost:27017/strava-yearend
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/strava-yearend
MONGODB_URI=mongodb://localhost:27017/strava-yearend

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Google OAuth
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth (Optional - can leave empty if not using)
APPLE_ID=your-apple-client-id
APPLE_SECRET=your-apple-client-secret
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key

# Strava API
# Get from: https://www.strava.com/settings/api
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# Strava Webhook (Optional - for real-time updates)
STRAVA_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
EOF

echo "✅ .env.local file created!"
echo ""
echo "📝 Next steps:"
echo "1. Open .env.local and fill in your API keys"
echo "2. See ENV_SETUP_GUIDE.md for detailed instructions on getting API keys"
echo ""
echo "🔑 Your NextAuth secret has been auto-generated: ${NEXTAUTH_SECRET}"

