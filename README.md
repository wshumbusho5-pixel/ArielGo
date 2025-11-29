# ArielGo - Laundry Delivery Service

A complete web application for managing laundry delivery bookings with automated pricing, database storage, and email notifications.

## 🚀 Quick Start

### 1. Install Node.js

**For Mac:**
```bash
# Using Homebrew
brew install node

# OR download from https://nodejs.org/
```

### 2. Install Dependencies

```bash
cd /Users/willyshumbusho/laundry-delivery-startup
npm install
```

### 3. Configure Settings

Edit the `.env` file to add your contact information:
- Update `BUSINESS_PHONE` with your phone number
- Update `BUSINESS_EMAIL` with your email
- (Optional) Add email credentials to enable automated emails

### 4. Start the Server

```bash
npm start
```

The website will be available at: **http://localhost:3000**

---

## 📁 Project Structure

```
laundry-delivery-startup/
├── website/              # Frontend files
│   ├── index.html       # Main website page
│   ├── css/
│   │   └── style.css    # Website styling
│   └── js/
│       └── main.js      # Frontend JavaScript
│
├── database/            # Database files
│   ├── database.js      # Database operations
│   └── arielgo.db       # SQLite database (created automatically)
│
├── services/            # Backend services
│   ├── pricing-service.js   # Pricing calculations
│   └── email-service.js     # Email notifications
│
├── server.js            # Main backend server
├── package.json         # Project dependencies
├── .env                 # Configuration (your settings)
└── README.md            # This file
```

---

## 💰 Pricing

The system automatically calculates totals based on:

| Service | Price per Bag | Turnaround |
|---------|--------------|------------|
| Standard | $32 | 24 hours |
| Same-Day | $42 | Same day |
| Rush | $50 | 4 hours |

**Example:**
- 1 bag × Standard service = $32
- 2 bags × Same-Day service = $84
- 1 bag × Rush service = $50

---

## 🔧 How It Works

### Frontend (What Customers See)
1. Customer visits http://localhost:3000
2. Fills out booking form with:
   - Name, phone, email
   - Service type
   - Pickup address and time
3. Clicks "Schedule Pickup"

### Backend (What Happens Behind the Scenes)
1. **Form submission** → JavaScript sends data to `/api/bookings`
2. **Validation** → Server checks all required fields
3. **Pricing** → Automatically calculates total based on service type
4. **Database** → Stores booking in SQLite database
5. **Email** → Sends confirmation to customer + notification to you
6. **Response** → Shows confirmation message with booking ID and total

---

## 📊 API Endpoints

Your backend provides these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check if server is running |
| GET | `/api/pricing` | Get all pricing information |
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get a specific booking |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| GET | `/api/stats` | Get booking statistics |

### Example API Usage

**Get all bookings:**
```bash
curl http://localhost:3000/api/bookings
```

**Get statistics:**
```bash
curl http://localhost:3000/api/stats
```

**Update booking status:**
```bash
curl -X PATCH http://localhost:3000/api/bookings/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

---

## 🗄️ Database

Bookings are stored in SQLite (`database/arielgo.db`).

**Booking statuses:**
- `pending` - Just submitted, awaiting confirmation
- `confirmed` - You've confirmed the pickup
- `in_progress` - Currently being processed
- `completed` - Finished and delivered
- `cancelled` - Customer cancelled

**View your database:**
```bash
# Install SQLite browser
brew install --cask db-browser-for-sqlite

# Open database
open database/arielgo.db
```

---

## 📧 Email Notifications (Optional)

To enable automated emails:

1. **For Gmail:**
   - Go to Google Account → Security
   - Enable 2-factor authentication
   - Create an "App Password"
   - Add to `.env`:
     ```
     EMAIL_SERVICE=gmail
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     EMAIL_TO=your-email@gmail.com
     ```

2. **Test it:**
   - Restart server: `npm start`
   - Submit a test booking
   - Check your email!

---

## 🎓 Learning Guide

### Technologies Used

**Frontend:**
- **HTML** - Structure of the website
- **CSS** - Styling and layout
- **JavaScript** - Interactive forms and API calls

**Backend:**
- **Node.js** - JavaScript runtime
- **Express** - Web server framework
- **SQLite** - Database
- **Nodemailer** - Email sending

### Key Concepts

**Client-Server Model:**
```
Customer's Browser (Frontend)
         ↓
    [Makes request]
         ↓
   Your Server (Backend)
         ↓
    [Processes data]
    [Saves to database]
    [Sends emails]
         ↓
    [Sends response]
         ↓
Customer's Browser (Frontend)
```

**Database Flow:**
```
New Booking → Validate → Calculate Total → Save to DB → Send Emails → Confirm
```

---

## 🚀 Next Steps

### Immediate
- [ ] Install Node.js
- [ ] Run `npm install`
- [ ] Update `.env` with your contact info
- [ ] Test the booking system

### Phase 1 (MVP)
- [ ] Set up email notifications
- [ ] Test with 5 beta customers
- [ ] Gather feedback

### Phase 2 (Improvements)
- [ ] Add payment processing (Stripe/Square)
- [ ] Create admin dashboard to manage bookings
- [ ] Add SMS notifications
- [ ] Create customer accounts

### Phase 3 (Scale)
- [ ] Deploy to production server
- [ ] Add mobile app
- [ ] Build driver/operator app
- [ ] Implement route optimization

---

## 🆘 Troubleshooting

**Server won't start:**
```bash
# Check if Node.js is installed
node --version

# If not installed, install it:
brew install node
```

**Port 3000 already in use:**
```bash
# Change PORT in .env file to 3001 or another number
PORT=3001
```

**Emails not sending:**
- Check `.env` has correct email credentials
- Verify Gmail app password is set up
- Check server logs for errors

**Database errors:**
```bash
# Delete and recreate database
rm database/arielgo.db
npm start
# Database will be recreated automatically
```

---

## 📈 Business Metrics

Track these in your database:

```bash
# Get statistics
curl http://localhost:3000/api/stats
```

Returns:
- Total bookings
- Revenue (total, average)
- Bookings by status
- Total bags processed

---

## 🎯 Your Business Plan

According to your business plan (`LAUNDRY_BUSINESS_PLAN.md`):

**Phase 1 Goals (Months 1-6):**
- ✅ Website built
- ✅ Backend system ready
- ⬜ 50+ customers
- ⬜ 120+ bags/month
- ⬜ 15%+ gross margin

**Unit Economics:**
- Price: $32/bag (standard)
- Your cost: ~$27/bag
- Profit: ~$5/bag (15.6% margin)

---

## 📞 Support

Need help? Check these files:
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `LAUNDRY_BUSINESS_PLAN.md` - Your full business plan

---

**Built with ❤️ for ArielGo - Seattle's Fastest Laundry Delivery**
# ArielGo
