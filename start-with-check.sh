#!/bin/bash

echo "🔍 Checking MongoDB Atlas cluster status..."
echo ""

# Quick connection test (macOS compatible)
node test-mongodb-connection.js 2>&1 &
TEST_PID=$!

# Wait up to 10 seconds for the test
COUNTER=0
while kill -0 $TEST_PID 2>/dev/null && [ $COUNTER -lt 10 ]; do
    sleep 1
    COUNTER=$((COUNTER + 1))
done

# Kill the test if it's still running
if kill -0 $TEST_PID 2>/dev/null; then
    kill $TEST_PID 2>/dev/null
    wait $TEST_PID 2>/dev/null
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
fi

echo ""
echo "🚀 Starting development server..."
echo ""
npm run dev

