#!/bin/bash
cd /home/blueroad/idea_demos/resume_mcp/ai-candidate-bff
echo "🚀 Starting server in background..."
npm start > server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

echo "⏳ Waiting for server to start..."
sleep 5

echo "🔧 Running tool call test..."
node quick_fix_test.js

echo "🛑 Stopping server..."
kill $SERVER_PID

echo "✅ Test completed!" 