# Wednesday Pitch - Quick Start Guide

## 📅 MORNING OF PITCH (2 hours before)

### 1. Start Both Servers (15 min)

```bash
# Terminal 1 - Node.js Backend
cd ~/laundry-delivery-startup
npm start
# Wait for "ArielGo Backend Server Started!" message
# Should see: Server running on http://localhost:3001

# Terminal 2 - Flask Admin  
cd ~/laundry-delivery-startup/admin
python3 app.py
# Wait for "Running on http://127.0.0.1:5002"
```

**✅ Verify:**
- [ ] Terminal 1 shows no errors
- [ ] Terminal 2 shows no errors
- [ ] Both say "running on..." with port numbers

---

### 2. Test All Pages (10 min)

Open these URLs and verify they load:

```bash
# Customer Site
open http://localhost:3001

# Tracking Page
open http://localhost:3001/track.html

# Driver Login
open http://localhost:3001/driver-login.html

# Admin Dashboard
open http://localhost:5002
```

**✅ Verify:**
- [ ] All pages load without errors
- [ ] No console errors (press F12 → Console tab)
- [ ] Styling looks correct

---

### 3. Quick System Test (10 min)

**Test Booking Flow:**
1. Go to http://localhost:3001
2. Fill booking form:
   - Name: Test User
   - Email: test@test.com
   - Phone: 206-555-1234
   - Address: 123 Test St
   - Service: Same-Day
   - Date: Tomorrow
   - Time: Morning
3. Click "Book Now"
4. **EXPECTED:** Confirmation message with booking ID
5. **IF FAILS:** Check Terminal 1 for errors

**Test Admin:**
1. Go to http://localhost:5002
2. Login: username `admin` / password (your admin password)
3. **EXPECTED:** Dashboard with stats
4. **IF FAILS:** Check Terminal 2 for errors

**Test Tracking:**
1. Go to http://localhost:3001/track.html
2. Enter: Booking ID (from test above) + Email: test@test.com
3. **EXPECTED:** Order details appear
4. **IF FAILS:** Check browser console

**Clean Test Data:**
```bash
sqlite3 database/arielgo.db "DELETE FROM bookings WHERE email = 'test@test.com';"
```

---

### 4. Prepare Demo Environment (15 min)

**Close All Unnecessary Apps:**
- [ ] Close Slack, Discord, Messages
- [ ] Close email, social media
- [ ] Close music/Spotify
- [ ] Silence notifications (Do Not Disturb mode)

**Setup Browser Windows:**
1. **Window 1 - Customer:**
   - Tab 1: http://localhost:3001 (Homepage)
   - Tab 2: http://localhost:3001/track.html

2. **Window 2 - Admin:**
   - http://localhost:5002 (already logged in)

3. **Window 3 - Driver:**
   - http://localhost:3001/driver-login.html

**Arrange Windows:**
- Use macOS Mission Control (F3) to see all windows
- Practice switching between them smoothly

---

### 5. Final Checks (10 min)

**Database Check:**
```bash
sqlite3 database/arielgo.db "SELECT COUNT(*) FROM bookings;"
# Should return: 0 (or very small number)
```

**Ollama Check** (for AI demo):
```bash
curl http://localhost:11434/api/version
# Should return: {"version":"0.13.1"} or similar
```

**Admin Password Test:**
- Go to http://localhost:5002
- Try login with your admin credentials
- **IF FAILS:** You forgot your password - we'll need to reset it

**Print This Checklist:**
- [ ] Demo script (DEMO_SCRIPT_WEDNESDAY.md)
- [ ] Tech status slide (PITCH_DECK_TECH_STATUS.md)
- [ ] This quick start guide

---

## 🎬 10 MINUTES BEFORE PITCH

### Pre-Demo Checklist:

- [ ] Both servers still running (check terminals)
- [ ] Browser windows arranged
- [ ] Demo script printed and reviewed
- [ ] Laptop plugged in (100% battery + charger)
- [ ] Screen brightness at 80%+ (for projector)
- [ ] Zoom level at 100% (not zoomed in/out)
- [ ] No embarrassing tabs open
- [ ] Notifications silenced
- [ ] Water bottle nearby
- [ ] Deep breath 🧘

---

## 🚨 IF SOMETHING BREAKS

### Server Crashed:
```bash
# Stop everything
pkill -f "node.*server"
pkill -f "python.*app.py"

# Restart
cd ~/laundry-delivery-startup && npm start
cd ~/laundry-delivery-startup/admin && python3 app.py
```

### Database Locked Error:
```bash
# Close all database connections
pkill -f sqlite
# Restart servers
```

### Can't Login to Admin:
```bash
# Check admin exists
sqlite3 database/arielgo.db "SELECT username FROM admin_users;"
# Should see: admin
```

### Everything is Broken:
1. Stay calm
2. Use backup plan (show screenshots/code)
3. Say: "Technical demos are unpredictable - let me show you the code instead"
4. Open VS Code, show server.js and database schema
5. Investors respect honesty over panic

---

## 📝 DEMO DATA TO USE

**Customer Info:**
- Name: Sarah Chen
- Email: sarah.chen@demo.com
- Phone: 206-555-0123
- Address: 1234 University Ave, Seattle, WA
- Service: Same-Day ($42)
- Date: Tomorrow
- Time: Morning

**Why this data:**
- Realistic name (sounds like real customer)
- Professional email domain
- Seattle area code
- University District address (your target market)
- Same-Day service (middle tier, not cheapest/most expensive)

---

## 🎯 KEY MESSAGES TO MEMORIZE

1. **Opening:**
> "I'm going to show you a live demo of a complete laundry delivery platform we've built in 3 months with zero capital."

2. **After Customer Booking:**
> "That booking is now in our system. Real database, real API, real platform - not slides."

3. **After Admin Update:**
> "When I updated that status, the system triggered automated notifications. The infrastructure is complete."

4. **After Route Optimization:**
> "This algorithm reduces driver costs by 30%. We're not just building software - we're building operational efficiency."

5. **Closing:**
> "What you just saw is not a prototype. It's a functional platform ready for customers. We're not asking you to fund development - we're asking you to fund activation and traction."

---

## ✅ POST-DEMO

**Immediately After:**
- [ ] Save all terminal output to files
- [ ] Take screenshots of working demo
- [ ] Note any questions you couldn't answer
- [ ] Write down all feedback received

**Within 24 Hours:**
- [ ] Send thank you email
- [ ] Send GitHub link if requested
- [ ] Send architecture diagrams if interested
- [ ] Follow up on specific questions

---

## 💪 YOU'VE GOT THIS!

**Remember:**
- You built something real
- You know this code inside and out
- You've practiced the demo
- You have backups if things break
- Confidence beats perfection

**The platform works. The business makes sense. Now just show them.**

**Good luck! 🚀**

