#!/bin/bash

echo "🔍 Checking MongoDB Atlas cluster status..."
echo ""

# Quick connection test with timeout
timeout 10 node test-mongodb-connection.js 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MongoDB is ready!"
    echo "🚀 Starting development server..."
    echo ""
    npm run dev
elif [ $? -eq 124 ]; then
    echo ""
    echo "⚠️  MongoDB connection timed out (cluster might be paused)"
    echo ""
    echo "📋 Please do the following:"
    echo "1. Go to https://cloud.mongodb.com/"
    echo "2. Click 'Connect' on your strava-yearend-cluster"
    echo "3. Wait 1-2 minutes for cluster to resume"
    echo "4. Run this script again: ./start-with-check.sh"
    echo ""
    echo "Or press Enter to start the dev server anyway (it will wait for MongoDB)..."
    read
    npm run dev
else
    echo ""
    echo "❌ MongoDB connection failed"
    echo "Starting dev server anyway..."
    echo ""
    npm run dev
fi
