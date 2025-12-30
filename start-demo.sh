#!/bin/bash

echo "🚀 Starting ArielGo Demo Environment"
echo "====================================="
echo ""

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "python.*app.py" 2>/dev/null
sleep 2

# Start Node.js backend
echo "📦 Starting Node.js backend..."
echo "   (This will open in a new terminal window)"
osascript -e 'tell app "Terminal" to do script "cd ~/laundry-delivery-startup && npm start"'
sleep 3

# Start Flask admin
echo "🐍 Starting Flask admin dashboard..."
echo "   (This will open in a new terminal window)"
osascript -e 'tell app "Terminal" to do script "cd ~/laundry-delivery-startup/admin && python3 app.py"'
sleep 3

echo ""
echo "✅ Servers starting in separate terminal windows"
echo ""
echo "📍 Your services will be available at:"
echo "   Customer Site:  http://localhost:3001"
echo "   Admin Dashboard: http://localhost:5002"
echo ""
echo "🎬 Opening browser windows..."
sleep 2

# Open browser windows
open http://localhost:3001
sleep 1
open http://localhost:3001/track.html
sleep 1
open http://localhost:5002

echo ""
echo "✅ Demo environment ready!"
echo ""
echo "Next steps:"
echo "1. Check both terminal windows for 'running' messages"
echo "2. Login to admin dashboard (localhost:5002)"
echo "3. Follow DEMO_SCRIPT_WEDNESDAY.md"
echo ""
echo "To stop servers: Press Ctrl+C in each terminal window"
echo ""
