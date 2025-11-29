# ⚡ ArielGo Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Node.js (One-time Setup)
```bash
# On Mac - using Homebrew
brew install node

# OR download from: https://nodejs.org/
```

### 2. Install Project Dependencies
```bash
cd /Users/willyshumbusho/laundry-delivery-startup
npm install
```

### 3. Start the Server
```bash
npm start
```

### 4. Open Your Website
Open browser to: **http://localhost:3000**

---

## 📝 How to Take Your First Booking

1. Open http://localhost:3000
2. Scroll to "Schedule Your First Pickup"
3. Fill out the form
4. Click "Schedule Pickup"
5. You'll see confirmation with Booking ID and total price!

---

## 📊 How to View Bookings

### In Browser:
- http://localhost:3000/api/bookings → See all bookings
- http://localhost:3000/api/stats → See statistics

### In Terminal:
```bash
# View all bookings
curl http://localhost:3000/api/bookings | json_pp

# View statistics
curl http://localhost:3000/api/stats | json_pp
```

---

## 💰 How Pricing Works

The system **automatically calculates** totals:

| Service | Price/Bag | Example (1 bag) | Example (2 bags) |
|---------|-----------|-----------------|------------------|
| Standard | $32 | $32.00 | $64.00 |
| Same-Day | $42 | $42.00 | $84.00 |
| Rush | $50 | $50.00 | $100.00 |

**You don't need to do any math!** The system does it automatically.

---

## 🗄️ Where Data is Stored

**Database Location:** `database/arielgo.db`

This SQLite file contains:
- All customer bookings
- Payment totals
- Booking statuses
- Timestamps

**To view database:**
```bash
# Install DB Browser
brew install --cask db-browser-for-sqlite

# Open your database
open database/arielgo.db
```

---

## 📧 Setting Up Emails (Optional)

Edit `.env` file and add your Gmail:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_TO=your-email@gmail.com
```

**How to get Gmail App Password:**
1. Go to: https://myaccount.google.com/security
2. Enable 2-factor authentication
3. Search for "App passwords"
4. Generate password for "Mail"
5. Copy and paste into `.env`

---

## 🔧 Common Commands

```bash
# Start server
npm start

# Stop server
Ctrl + C

# View all bookings
curl http://localhost:3000/api/bookings

# View statistics
curl http://localhost:3000/api/stats

# Test if server is running
curl http://localhost:3000/api/health
```

---

## 📱 Update Your Contact Info

Edit `.env` file:

```env
BUSINESS_NAME=ArielGo
BUSINESS_PHONE=(206) YOUR-NUMBER    ← Change this
BUSINESS_EMAIL=your@email.com       ← Change this
```

Also update `website/index.html` around line 325:
```html
<p>Phone: (206) XXX-XXXX</p>    ← Change this
<p>Email: hello@arielgo.com</p>  ← Change this
```

---

## 🎯 Daily Operations

### Morning Routine:
1. Start server: `npm start`
2. Check new bookings: http://localhost:3000/api/bookings?status=pending
3. Confirm bookings (call/text customers)

### After Confirming a Pickup:
```bash
# Mark booking #1 as confirmed
curl -X PATCH http://localhost:3000/api/bookings/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

### After Completing Delivery:
```bash
# Mark booking #1 as completed
curl -X PATCH http://localhost:3000/api/bookings/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### End of Day:
```bash
# Check today's stats
curl http://localhost:3000/api/stats
```

---

## 🆘 Troubleshooting

### Server won't start
```bash
# Check if Node.js is installed
node --version

# Should show: v20.x.x or similar
# If not, install: brew install node
```

### Port already in use
```bash
# Edit .env and change:
PORT=3001

# Then restart
```

### Can't see bookings
```bash
# Make sure server is running
# Check: http://localhost:3000/api/health
# Should say: "status": "ok"
```

### Email not working
- Check `.env` has email credentials
- Or leave EMAIL_USER blank to disable emails
- Emails are optional - bookings still save!

---

## 📈 Track Your Growth

### Daily:
- Check pending bookings
- Confirm with customers
- Update statuses

### Weekly:
```bash
# Get stats
curl http://localhost:3000/api/stats

# Track:
# - Total bookings
# - Total revenue
# - Average order value
```

### Monthly:
- Review growth vs goals
- Adjust pricing if needed
- Plan marketing

---

## 🎓 Learning Resources

**Read these files in order:**
1. `QUICK_START.md` ← You are here
2. `WHAT_WE_BUILT.md` → Understand the system
3. `README.md` → Complete reference
4. `SETUP_INSTRUCTIONS.md` → Detailed setup

**When you're ready to code:**
- `website/index.html` → Learn HTML
- `website/css/style.css` → Learn CSS
- `website/js/main.js` → Learn JavaScript
- `server.js` → Learn backend

---

## ⚡ That's It!

You're ready to start taking bookings!

**Remember:**
- `npm start` to run server
- http://localhost:3000 for website
- http://localhost:3000/api/bookings to see orders
- http://localhost:3000/api/stats for business metrics

**Good luck with ArielGo! 🧺✨**
