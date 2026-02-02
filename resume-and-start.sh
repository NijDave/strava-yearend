#!/bin/bash

echo "🔄 Attempting to connect to MongoDB Atlas..."
echo "This will automatically resume your paused cluster."
echo ""
echo "⏳ Waiting for cluster to wake up (this may take 1-2 minutes)..."
echo ""

# Try to connect - this will trigger auto-resume
node test-mongodb-connection.js

# Check if connection was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MongoDB is ready!"
    echo ""
    echo "🚀 Starting development server..."
    echo ""
    npm run dev
else
    echo ""
    echo "❌ MongoDB connection failed."
    echo ""
    echo "Please:"
    echo "1. Go to https://cloud.mongodb.com/"
    echo "2. Manually resume your cluster: strava-yearend-cluster"
    echo "3. Wait 1-2 minutes"
    echo "4. Run this script again: ./resume-and-start.sh"
fi
