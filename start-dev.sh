#!/bin/bash

echo "🚀 Starting Next.js development server..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ ERROR: .env.local file not found!"
    echo "Please create .env.local with your environment variables"
    exit 1
fi

# Check for required env vars
if ! grep -q "MONGODB_URI" .env.local; then
    echo "⚠️  WARNING: MONGODB_URI not found in .env.local"
fi

if ! grep -q "NEXTAUTH_SECRET" .env.local; then
    echo "⚠️  WARNING: NEXTAUTH_SECRET not found in .env.local"
fi

echo "✅ Environment check passed"
echo ""
echo "Starting server..."
echo ""

npm run dev

