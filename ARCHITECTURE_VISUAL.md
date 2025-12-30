# 🏗️ ArielGo System Architecture
**Visual Reference for Technical Questions**

---

## 📐 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Website    │  │   Tracking   │  │  AI Assistant│     │
│  │ (index.html) │  │ (track.html) │  │  (ai-chat.js)│     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   REST API      │
                    │   (Node.js)     │
                    │   Port 3001     │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐    ┌──────▼──────┐    ┌─────▼─────┐
    │  Database │    │  Services   │    │  Session  │
    │  (SQLite) │    │  (Modular)  │    │   Store   │
    └───────────┘    └─────────────┘    └───────────┘

┌─────────────────────────────────────────────────────────────┐
│                     DRIVER LAYER                            │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Driver Login │  │   Dashboard  │                        │
│  │   (Auth)     │  │ (Route Opt.) │                        │
│  └──────┬───────┘  └──────┬───────┘                        │
│         │                  │                                 │
└─────────┼──────────────────┼─────────────────────────────────┘
          │                  │
          └──────────┬───────┘
                     │
            ┌────────▼────────┐
            │  Same REST API  │
            │  (Authenticated)│
            └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ADMIN LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │   Bookings   │  │    Users     │     │
│  │   (Stats)    │  │  Management  │  │  Management  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Flask Admin    │
                    │   (Python)      │
                    │   Port 5002     │
                    └────────┬────────┘
                             │
                      ┌──────▼──────┐
                      │ Same SQLite │
                      │  Database   │
                      └─────────────┘
```

---

## 🗄️ DATABASE SCHEMA

```
┌──────────────────────────────────────────────────────────┐
│ BOOKINGS TABLE                                           │
├──────────────────────────────────────────────────────────┤
│ id                 INTEGER PRIMARY KEY                   │
│ name               TEXT NOT NULL                         │
│ phone              TEXT NOT NULL                         │
│ email              TEXT NOT NULL                         │
│ address            TEXT NOT NULL                         │
│ service            TEXT (standard|same-day|rush)         │
│ pickupDate         TEXT (ISO date)                       │
│ pickupTime         TEXT                                  │
│ numberOfBags       INTEGER DEFAULT 1                     │
│ pricePerBag        INTEGER (cents)                       │
│ totalPrice         INTEGER (cents)                       │
│ status             TEXT (pending|confirmed|...)          │
│ notes              TEXT                                  │
│ paymentIntentId    TEXT                                  │
│ paymentStatus      TEXT                                  │
│ stripeCustomerId   TEXT                                  │
│ createdAt          TIMESTAMP                             │
│ updatedAt          TIMESTAMP                             │
│                                                           │
│ INDEXES: status, pickupDate                              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ADMIN_USERS TABLE                                        │
├──────────────────────────────────────────────────────────┤
│ id                 INTEGER PRIMARY KEY                   │
│ username           TEXT UNIQUE                           │
│ password_hash      TEXT (bcrypt)                         │
│ email              TEXT UNIQUE                           │
│ full_name          TEXT                                  │
│ role               TEXT (super_admin|admin|driver)       │
│ is_active          INTEGER (0|1)                         │
│ created_at         TIMESTAMP                             │
│ last_login         TIMESTAMP                             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PROMO_CODES TABLE                                        │
├──────────────────────────────────────────────────────────┤
│ id                 INTEGER PRIMARY KEY                   │
│ code               TEXT UNIQUE                           │
│ discountType       TEXT (percentage|fixed)               │
│ discountValue      INTEGER                               │
│ maxUses            INTEGER                               │
│ usedCount          INTEGER                               │
│ expiresAt          TEXT                                  │
│ active             INTEGER (0|1)                         │
│ createdAt          TIMESTAMP                             │
│                                                           │
│ INDEX: code                                              │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 REQUEST FLOW

### Customer Booking:
```
User Browser
    │
    │ POST /api/bookings
    │ {name, email, service, ...}
    ▼
Node.js Server
    │
    ├─► Validate Input (main.js)
    │
    ├─► Calculate Price (pricing-service.js)
    │
    ├─► Create Booking (database.js)
    │   └─► INSERT INTO bookings
    │
    ├─► Send Email (email-service.js)
    │   └─► nodemailer → Gmail (optional)
    │
    ├─► Send SMS (sms-service.js)
    │   └─► Twilio API (optional)
    │
    └─► Return Response
        └─► {success: true, booking: {...}}
```

### Driver Authentication:
```
Driver Browser
    │
    │ POST /api/driver/login
    │ {username, password}
    ▼
Node.js Server
    │
    ├─► Get Driver (driver-db.js)
    │   └─► SELECT FROM admin_users WHERE role='driver'
    │
    ├─► Verify Password (auth.js)
    │   └─► bcrypt.compare(password, hash)
    │
    ├─► Create Session (express-session)
    │   └─► Store in sessions.db
    │
    └─► Return Response
        └─► {success: true, driver: {...}}
```

### Route Optimization:
```
Driver Dashboard
    │
    │ GET /api/routes/optimize/2024-12-27
    ▼
Node.js Server
    │
    ├─► Authenticate (requireDriverAuth middleware)
    │
    ├─► Get Bookings (database.js)
    │   └─► SELECT WHERE pickupDate='2024-12-27'
    │
    ├─► Geocode Addresses (route-optimizer.js)
    │   └─► (placeholder - future Google Maps API)
    │
    ├─► Group by Time Windows
    │   ├─► Morning (6am-12pm)
    │   ├─► Afternoon (12pm-6pm)
    │   └─► Evening (6pm-10pm)
    │
    ├─► Optimize Route (nearest-neighbor algorithm)
    │   └─► Calculate distances & times
    │
    └─► Return Optimized Route
        └─► {routes: [{timeWindow, stops, totalDistance, totalTime}]}
```

---

## 🔌 API ENDPOINTS

### Public Endpoints:
```
GET  /api/health                    → System status
GET  /api/pricing                   → Get pricing tiers
POST /api/bookings                  → Create new booking
GET  /api/bookings/:id              → Get booking details
POST /api/assistant/chat            → Chat with AI
POST /api/assistant/suggestions     → Get conversation starters
GET  /api/assistant/tip             → Get laundry care tip
POST /api/promo/validate            → Validate promo code
```

### Driver-Only Endpoints (requires auth):
```
POST  /api/driver/login             → Driver login
POST  /api/driver/logout            → Driver logout
GET   /api/driver/session           → Check auth status
PATCH /api/bookings/:id/status      → Update booking status
GET   /api/routes/optimize/:date    → Get optimized route
POST  /api/routes/optimize          → Custom route optimization
```

### Admin Endpoints (Flask - port 5002):
```
GET  /                              → Dashboard
GET  /bookings                      → All bookings
GET  /bookings/:id                  → Booking details
POST /bookings/:id/status           → Update status
GET  /drivers                       → Driver management
POST /drivers/create                → Create driver
POST /drivers/:id/edit              → Edit driver
POST /drivers/:id/toggle            → Activate/deactivate
GET  /admin/users                   → User management (super_admin)
```

---

## 🛡️ SECURITY LAYERS

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Input Validation                              │
│ • Email format (regex)                                  │
│ • Phone format (regex)                                  │
│ • Required fields check                                 │
│ • SQL injection prevention (parameterized queries)      │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────┐
│ Layer 2: Authentication                                 │
│ • bcrypt password hashing (10 rounds)                   │
│ • Session-based auth (express-session)                  │
│ • HTTP-only cookies                                     │
│ • 8-hour session timeout                                │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────┐
│ Layer 3: Authorization                                  │
│ • Role-based access (super_admin, admin, driver)        │
│ • requireDriverAuth middleware                          │
│ • Email verification for tracking                       │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────┐
│ Layer 4: Environment Security                           │
│ • .env file (gitignored)                                │
│ • Secrets not in code                                   │
│ • Secure session secret                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 SCALING PATH

```
Phase 1: MVP (Current)
├─ SQLite (local file)
├─ Single Node.js process
├─ Flask on same machine
└─ ~100 orders/month
    Cost: $15/month

Phase 2: Growth
├─ PostgreSQL (managed)
├─ PM2 process manager
├─ Redis for caching
├─ Nginx reverse proxy
└─ ~1000 orders/month
    Cost: $150/month

Phase 3: Scale
├─ PostgreSQL (replicated)
├─ Multiple app servers
├─ Load balancer
├─ CDN for static assets
├─ Microservices extraction
└─ ~10,000 orders/month
    Cost: $1,500/month

Phase 4: Enterprise
├─ Kubernetes orchestration
├─ Auto-scaling infrastructure
├─ Message queue (RabbitMQ/SQS)
├─ Separate microservices
├─ Multi-region deployment
└─ ~100,000+ orders/month
    Cost: $10,000+/month
```

---

## 🔧 SERVICE MODULES

```
services/
├─ pricing-service.js
│  └─ Calculate totals, format prices
│
├─ payment-service.js
│  └─ Stripe integration (payments, refunds)
│
├─ email-service.js
│  └─ Nodemailer (booking confirmations, status updates)
│
├─ sms-service.js
│  └─ Twilio (SMS notifications)
│
├─ ai-assistant.js
│  └─ OpenAI/Ollama (customer support chatbot)
│
├─ route-optimizer.js
│  └─ Nearest-neighbor algorithm, geocoding
│
└─ promo-service.js
   └─ Promo code validation, usage tracking
```

---

## 💡 DATA FLOW EXAMPLE

```
Customer books laundry (Sarah Chen, Same-Day, 1 bag)
         │
         ├─► Calculate: $42 (Same-Day pricing)
         │
         ├─► Create booking in database
         │   └─► booking_id: 1
         │
         ├─► Send email confirmation (optional)
         │
         ├─► Send SMS confirmation (optional)
         │
         └─► Return booking_id to customer

Admin views dashboard
         │
         ├─► Query database for stats
         │   └─► Total: $42, Bookings: 1, Status: pending
         │
         └─► Display Sarah's booking

Admin updates status → "confirmed"
         │
         ├─► UPDATE bookings SET status='confirmed'
         │
         ├─► Send email notification (optional)
         │
         ├─► Send SMS notification (optional)
         │
         └─► Return success

Driver views routes for tomorrow
         │
         ├─► Query bookings WHERE pickupDate='tomorrow'
         │   └─► Found: Sarah Chen (1234 University Ave)
         │
         ├─► Group by time window
         │   └─► Morning: [Sarah Chen]
         │
         ├─► Optimize route (nearest-neighbor)
         │   └─► Distance: 2.5 miles, Time: 10 min
         │
         └─► Display optimized route

Customer tracks order
         │
         ├─► GET /api/bookings/1
         │
         ├─► Verify email matches
         │   └─► sarah.chen@demo.com ✓
         │
         └─► Display: Status = "confirmed"
```

---

**Use this diagram when investors ask about:**
- System architecture
- How components communicate
- Data flow
- Scalability plan
- Security implementation

**Keep this handy during Q&A!** 📊
