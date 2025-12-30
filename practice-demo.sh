#!/bin/bash

echo "🎭 ArielGo Demo Practice Script"
echo "================================"
echo ""
echo "This script will guide you through practicing the demo."
echo "Follow along and perform each action as instructed."
echo ""

# Function to wait for user
wait_for_user() {
    echo ""
    read -p "Press ENTER when you've completed this step..."
    echo ""
}

# Check servers are running
echo "📡 Step 0: Verify Servers Are Running"
echo "────────────────────────────────────────"
echo "Before we begin, make sure both servers are running:"
echo ""
echo "Terminal 1: npm start (port 3001)"
echo "Terminal 2: cd admin && python3 app.py (port 5002)"
echo ""
echo "If not running, open new terminals and start them now."
wait_for_user

# Clean database
echo "🧹 Step 1: Clean Database"
echo "────────────────────────────────────────"
echo "Let's start with a clean database..."
sqlite3 database/arielgo.db "DELETE FROM bookings WHERE email LIKE '%demo%' OR email LIKE '%test%';" 2>/dev/null
BOOKING_COUNT=$(sqlite3 database/arielgo.db "SELECT COUNT(*) FROM bookings;" 2>/dev/null)
echo "✓ Database cleaned. Current bookings: $BOOKING_COUNT"
wait_for_user

# Part 1: Customer Experience
echo "👤 PART 1: Customer Experience (2 minutes)"
echo "════════════════════════════════════════════════"
echo ""
echo "🎬 ACTION: Open http://localhost:3001 in your browser"
echo ""
echo "SAY:"
echo '   "Let me show you the customer experience."'
echo '   "This is our responsive web platform."'
echo ""
echo "DO:"
echo "   1. Scroll through the landing page"
echo "   2. Point out pricing ($32/$42/$50)"
echo "   3. Point out 'How It Works' section"
echo ""
wait_for_user

echo "📝 Now create a booking with this data:"
echo "────────────────────────────────────────"
echo "   Name:     Sarah Chen"
echo "   Phone:    206-555-0123"
echo "   Email:    sarah.chen@demo.com"
echo "   Address:  1234 University Ave, Seattle, WA"
echo "   Service:  Same-Day"
echo "   Date:     Tomorrow"
echo "   Time:     Morning"
echo "   Notes:    Please call before pickup"
echo ""
echo "Click 'Book Now' and note the Booking ID that appears"
echo ""
read -p "Enter the Booking ID you received: " BOOKING_ID
echo ""
echo "✓ Booking ID saved: $BOOKING_ID"
echo ""
echo "SAY:"
echo '   "Within seconds, customer has confirmation."'
echo '   "System calculated pricing automatically."'
wait_for_user

# Part 2: Admin Dashboard
echo "🎛️  PART 2: Admin Dashboard (2 minutes)"
echo "════════════════════════════════════════════════"
echo ""
echo "🎬 ACTION: Open http://localhost:5002 in new browser window"
echo ""
echo "DO:"
echo "   1. Login with your admin credentials"
echo "   2. Show dashboard statistics"
echo "   3. Point to Sarah's booking in recent orders"
echo ""
echo "SAY:"
echo '   "This is the business operations dashboard."'
echo '   "Real-time statistics and booking management."'
echo ""
wait_for_user

echo "📊 Now update the booking status:"
echo "────────────────────────────────────────"
echo "DO:"
echo "   1. Click on Sarah Chen's booking"
echo "   2. Change status from 'Pending' to 'Confirmed'"
echo "   3. Click 'Update Status'"
echo ""
echo "SAY:"
echo '   "When I update this status, the system triggers"'
echo '   "automated notifications to the customer."'
wait_for_user

# Part 3: Driver Portal
echo "🚗 PART 3: Driver Portal (2 minutes)"
echo "════════════════════════════════════════════════"
echo ""
echo "🎬 ACTION: Open http://localhost:3001/driver-login.html"
echo ""
echo "NOTE: If you haven't created a driver account, skip this section"
echo "      and say 'Driver portal is available with authentication.'"
echo ""
read -p "Do you have a driver account set up? (y/n): " HAS_DRIVER
echo ""

if [ "$HAS_DRIVER" == "y" ] || [ "$HAS_DRIVER" == "Y" ]; then
    echo "DO:"
    echo "   1. Login with driver credentials"
    echo "   2. Select tomorrow's date"
    echo "   3. Click 'Optimize Route'"
    echo "   4. Show route grouped by time windows"
    echo "   5. Point to distance/time calculations"
    echo ""
    echo "SAY:"
    echo '   "Route optimization reduces operational costs by 30%."'
    echo '   "Driver sees all customer details and can update status."'
else
    echo "SAY:"
    echo '   "We also have a driver portal with route optimization."'
    echo '   "It uses a nearest-neighbor algorithm to minimize drive time."'
fi
wait_for_user

# Part 4: Order Tracking
echo "📍 PART 4: Customer Tracking (1 minute)"
echo "════════════════════════════════════════════════"
echo ""
echo "🎬 ACTION: Open http://localhost:3001/track.html"
echo ""
echo "DO:"
echo "   1. Enter Booking ID: $BOOKING_ID"
echo "   2. Enter Email: sarah.chen@demo.com"
echo "   3. Click 'Track My Order'"
echo "   4. Show progress tracker"
echo "   5. Point out status is now 'Confirmed'"
echo ""
echo "SAY:"
echo '   "Customers can track orders anytime."'
echo '   "Notice the status updated instantly from admin."'
wait_for_user

# Part 5: AI Assistant (Optional)
echo "🤖 PART 5: AI Assistant (Optional - 30 seconds)"
echo "════════════════════════════════════════════════"
echo ""

# Check if Ollama is running
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "✓ Ollama is running - you can demo AI assistant"
    echo ""
    echo "DO:"
    echo "   1. On main page, click AI chat widget (bottom right)"
    echo "   2. Ask: 'What are your service options?'"
    echo "   3. Show AI response with pricing and details"
    echo ""
    echo "SAY:"
    echo '   "AI assistant handles common questions 24/7."'
    echo '   "Context-aware and knows customer order history."'
else
    echo "⚠ Ollama is NOT running - skip AI assistant demo"
    echo ""
    echo "SAY:"
    echo '   "We also have an AI assistant for customer support."'
    echo '   "Happy to discuss the architecture if interested."'
fi
wait_for_user

# Closing
echo "🎬 CLOSING STATEMENT"
echo "════════════════════════════════════════════════"
echo ""
echo "SAY:"
echo '   "What you just saw is a complete, working platform."'
echo '   "Not slides, not wireframes - actual code running."'
echo '   "Real database, real API, real infrastructure."'
echo ""
echo '   "We proved we can execute technically."'
echo '   "Now we need capital to activate paid services"'
echo '   "and validate demand with real customers."'
echo ""
echo '   "We're not asking you to fund an idea."'
echo '   "We're asking you to fund traction."'
echo ""
wait_for_user

# Cleanup
echo "🧹 Demo Complete - Cleanup"
echo "════════════════════════════════════════════════"
echo ""
read -p "Do you want to clean the test booking? (y/n): " CLEAN
echo ""

if [ "$CLEAN" == "y" ] || [ "$CLEAN" == "Y" ]; then
    sqlite3 database/arielgo.db "DELETE FROM bookings WHERE email = 'sarah.chen@demo.com';" 2>/dev/null
    echo "✓ Test booking cleaned"
else
    echo "⚠ Test booking kept in database"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Practice Run Complete!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📊 Timing Estimate:"
echo "   Part 1 (Customer):   ~2 minutes"
echo "   Part 2 (Admin):      ~2 minutes"
echo "   Part 3 (Driver):     ~2 minutes"
echo "   Part 4 (Tracking):   ~1 minute"
echo "   Part 5 (AI):         ~30 seconds (optional)"
echo "   ────────────────────────────────────"
echo "   TOTAL:               ~7-8 minutes"
echo ""
echo "💡 Tips for Next Practice:"
echo "   • Speak slower - investors need to process"
echo "   • Practice transitions between windows"
echo "   • Have talking points memorized"
echo "   • Test on projector if possible"
echo ""
echo "Recommended: Practice 5-10 times before Wednesday"
echo ""
