#!/bin/bash

echo "🧪 ArielGo System Test - Full E2E Verification"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Test 1: Check if Node.js is installed
echo "📦 Test 1: Node.js Installation"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js NOT installed${NC}"
    FAILED=1
fi
echo ""

# Test 2: Check if Python3 is installed
echo "🐍 Test 2: Python3 Installation"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python3 installed: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python3 NOT installed${NC}"
    FAILED=1
fi
echo ""

# Test 3: Check npm dependencies
echo "📚 Test 3: Node Dependencies"
if [ -d "node_modules" ]; then
    DEP_COUNT=$(ls node_modules | wc -l | xargs)
    echo -e "${GREEN}✓ Node modules installed: $DEP_COUNT packages${NC}"
else
    echo -e "${RED}✗ Node modules NOT installed - run 'npm install'${NC}"
    FAILED=1
fi
echo ""

# Test 4: Check Flask dependencies
echo "🧪 Test 4: Python Dependencies"
FLASK_CHECK=$(pip3 list 2>/dev/null | grep -i flask | wc -l | xargs)
if [ "$FLASK_CHECK" -gt "0" ]; then
    echo -e "${GREEN}✓ Flask dependencies installed${NC}"
else
    echo -e "${RED}✗ Flask NOT installed - run 'pip3 install -r admin/requirements.txt'${NC}"
    FAILED=1
fi
echo ""

# Test 5: Check database exists
echo "💾 Test 5: Database File"
if [ -f "database/arielgo.db" ]; then
    DB_SIZE=$(ls -lh database/arielgo.db | awk '{print $5}')
    echo -e "${GREEN}✓ Database exists: $DB_SIZE${NC}"
    
    # Check table count
    TABLE_COUNT=$(sqlite3 database/arielgo.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null)
    echo -e "${GREEN}  └─ Tables: $TABLE_COUNT${NC}"
else
    echo -e "${RED}✗ Database file NOT found${NC}"
    FAILED=1
fi
echo ""

# Test 6: Check .env file
echo "⚙️  Test 6: Environment Configuration"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check for critical variables
    if grep -q "EXPRESS_SESSION_SECRET" .env; then
        echo -e "${GREEN}  └─ Session secret configured${NC}"
    else
        echo -e "${YELLOW}  └─ Warning: SESSION_SECRET not set${NC}"
    fi
    
    if grep -q "STRIPE_SECRET_KEY=sk_test" .env; then
        echo -e "${YELLOW}  └─ Warning: Stripe keys are placeholders${NC}"
    fi
else
    echo -e "${RED}✗ .env file NOT found - copy from .env.example${NC}"
    FAILED=1
fi
echo ""

# Test 7: Check admin user exists
echo "👤 Test 7: Admin User"
ADMIN_COUNT=$(sqlite3 database/arielgo.db "SELECT COUNT(*) FROM admin_users WHERE username='admin';" 2>/dev/null)
if [ "$ADMIN_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✓ Admin user exists${NC}"
else
    echo -e "${RED}✗ No admin user found - create one first${NC}"
    FAILED=1
fi
echo ""

# Test 8: Check for test data
echo "🗑️  Test 8: Database Cleanliness"
BOOKING_COUNT=$(sqlite3 database/arielgo.db "SELECT COUNT(*) FROM bookings;" 2>/dev/null)
if [ "$BOOKING_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✓ Database is clean (0 bookings)${NC}"
else
    echo -e "${YELLOW}⚠ Database has $BOOKING_COUNT booking(s) - consider cleaning for demo${NC}"
fi
echo ""

# Test 9: Check OpenAI Configuration
echo "🤖 Test 9: AI Assistant (OpenAI)"
if grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo -e "${GREEN}✓ OpenAI API key configured${NC}"
else
    echo -e "${YELLOW}⚠ OpenAI API key not configured - AI assistant will not work${NC}"
    echo -e "${YELLOW}  └─ Add OPENAI_API_KEY to .env file${NC}"
fi
echo ""

# Test 10: Check critical files
echo "📁 Test 10: Critical Files"
FILES=(
    "server.js"
    "admin/app.py"
    "database/database.js"
    "website/index.html"
    "website/track.html"
    "website/driver.html"
    "website/js/main.js"
    "package.json"
)

MISSING=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file${NC}"
    else
        echo -e "${RED}  ✗ $file MISSING${NC}"
        MISSING=1
    fi
done

if [ "$MISSING" -eq "0" ]; then
    echo -e "${GREEN}✓ All critical files present${NC}"
else
    FAILED=1
fi
echo ""

# Test 11: Run API Tests
echo "🧪 Test 11: API Unit Tests"
if npm test --silent > /dev/null 2>&1; then
    TEST_COUNT=$(npm test 2>&1 | grep -o "[0-9]* passed" | head -1)
    echo -e "${GREEN}✓ All API tests passed ($TEST_COUNT)${NC}"
else
    echo -e "${RED}✗ API tests failed - run 'npm test' to see details${NC}"
    FAILED=1
fi
echo ""

# Final Summary
echo "=============================================="
if [ "$FAILED" -eq "0" ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - System Ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start Node.js: npm start"
    echo "2. Start Flask: cd admin && python3 app.py"
    echo "3. Open: http://localhost:3001"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - Fix issues above${NC}"
    exit 1
fi
