// ==================================
// ARIELGO BACKEND SERVER
// ==================================

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import our custom modules
const db = require('./database/database');
const emailService = require('./services/email-service');
const pricingService = require('./services/pricing-service');
const paymentService = require('./services/payment-service');
const smsService = require('./services/sms-service');
const promoService = require('./services/promo-service');
const routeOptimizer = require('./services/route-optimizer');
const aiAssistant = require('./services/ai-assistant');

// Import authentication modules
const bcrypt = require('bcrypt');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { requireDriverAuth, requireAuth } = require('./middleware/auth');
const driverDb = require('./database/driver-db');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ==================================
// MIDDLEWARE CONFIGURATION
// ==================================

// Enable CORS (allows frontend to talk to backend)
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware for driver authentication
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './database'
  }),
  secret: process.env.EXPRESS_SESSION_SECRET || 'driver-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 hours (typical driver shift)
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Serve static files (HTML, CSS, JS) from website folder
app.use(express.static('website'));

// Log all requests (helpful for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ==================================
// HELPER FUNCTIONS
// ==================================

// Mask phone number (show last 4 digits only)
function maskPhone(phone) {
    if (!phone || phone.length < 4) return '***';
    return '***-***-' + phone.slice(-4);
}

// Mask address (show area only, not full address)
function maskAddress(address) {
    if (!address) return 'Address hidden';
    const parts = address.split(',');
    if (parts.length > 1) {
        return parts[parts.length - 1].trim() + ' area';
    }
    const words = address.split(' ');
    if (words.length > 2) {
        return words.slice(-2).join(' ') + ' area';
    }
    return 'Address hidden';
}

// ==================================
// API ROUTES
// ==================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ArielGo backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Get pricing information
app.get('/api/pricing', (req, res) => {
    try {
        const pricing = pricingService.getAllPricing();
        res.json({
            success: true,
            pricing: pricing
        });
    } catch (error) {
        console.error('Error fetching pricing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pricing information'
        });
    }
});

// Submit a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        console.log('Received booking request:', req.body);

        // Extract booking data from request
        const bookingData = {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            service: req.body.service,
            pickupDate: req.body.pickupDate,
            pickupTime: req.body.pickupTime,
            numberOfBags: req.body.numberOfBags || 1, // Default to 1 bag
            items: req.body.items || [], // Per-item services (dry-cleaning, specialty)
            notes: req.body.notes || ''
        };

        // Validate required fields
        if (!bookingData.name || !bookingData.phone || !bookingData.email ||
            !bookingData.address || !bookingData.service || !bookingData.pickupDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Calculate total price (handles both per-bag and per-item pricing)
        const pricing = pricingService.calculateBookingTotal(
            bookingData.service,
            bookingData.numberOfBags,
            bookingData.items
        );

        if (!pricing.success) {
            return res.status(400).json({
                success: false,
                error: pricing.error
            });
        }

        // Add pricing to booking data
        const fullBookingData = {
            ...bookingData,
            pricePerBag: pricing.pricePerBag || 0, // 0 for per-item services
            totalPrice: pricing.total,
            pricingType: pricing.pricingType, // 'per-bag' or 'per-item'
            itemsJson: pricing.pricingType === 'per-item' ? JSON.stringify(pricing.items) : null, // Store items breakdown
            status: 'pending', // pending, confirmed, in_progress, completed, cancelled
            user_id: req.session && req.session.user ? req.session.user.id : null // Link to user if logged in
        };

        // Save to database
        const booking = await db.createBooking(fullBookingData);

        // Send email notification
        let emailSent = false;
        try {
            const emailResult = await emailService.sendBookingConfirmation(booking);
            emailSent = emailResult.success;
            if (emailSent) {
                console.log('Confirmation email sent successfully');
            } else {
                console.log('Email not sent:', emailResult.reason || 'Email not configured');
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the booking if email fails
        }

        // Send SMS notification
        let smsSent = false;
        try {
            const smsResult = await smsService.sendBookingConfirmation(booking);
            smsSent = smsResult.success;
            if (smsSent) {
                console.log('Confirmation SMS sent successfully');
            } else {
                console.log('SMS not sent:', smsResult.reason || 'SMS not configured');
            }
        } catch (smsError) {
            console.error('Failed to send SMS:', smsError);
            // Don't fail the booking if SMS fails
        }

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            emailSent: emailSent,
            smsSent: smsSent,
            booking: {
                id: booking.id,
                name: booking.name,
                service: booking.service,
                pickupDate: booking.pickupDate,
                pickupTime: booking.pickupTime,
                numberOfBags: booking.numberOfBags,
                totalPrice: booking.totalPrice,
                status: booking.status
            }
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking. Please try again.'
        });
    }
});

// Get all bookings (for admin/dashboard)
app.get('/api/bookings', async (req, res) => {
    try {
        const status = req.query.status; // Optional filter by status
        const bookings = await db.getAllBookings(status);

        res.json({
            success: true,
            count: bookings.length,
            bookings: bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
});

// Get user's bookings (must be before :id route)
app.get('/api/bookings/my-orders', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const bookings = await db.getBookingsByUserId(req.session.user.id);

        res.json({
            success: true,
            bookings: bookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
});

// Get a specific booking by ID
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await db.getBookingById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Store tracked booking in session for anonymous messaging
        if (!req.session.trackedBookings) {
            req.session.trackedBookings = [];
        }
        if (!req.session.trackedBookings.includes(parseInt(bookingId))) {
            req.session.trackedBookings.push(parseInt(bookingId));
        }

        res.json({
            success: true,
            booking: booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking'
        });
    }
});

// Update booking status (driver only)
app.patch('/api/bookings/:id/status', requireDriverAuth, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const newStatus = req.body.status;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const updated = await db.updateBookingStatus(bookingId, newStatus);

        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Send SMS notification for status change
        try {
            const smsResult = await smsService.sendStatusUpdate(updated, newStatus);
            if (smsResult.success) {
                console.log('Status update SMS sent successfully');
            }
        } catch (smsError) {
            console.error('Failed to send status update SMS:', smsError);
            // Don't fail the update if SMS fails
        }

        // Send email notification for status change
        try {
            const emailResult = await emailService.sendStatusUpdate(updated, newStatus);
            if (emailResult.success) {
                console.log('Status update email sent successfully');
            }
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
            // Don't fail the update if email fails
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            booking: updated
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking status'
        });
    }
});

// Assign driver to booking (admin only - for now anyone can assign)
app.patch('/api/bookings/:id/assign-driver', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { driver_id } = req.body;

        if (!driver_id) {
            return res.status(400).json({
                success: false,
                error: 'Driver ID is required'
            });
        }

        // Verify driver exists and is active
        const driver = await driverDb.getDriverById(driver_id);
        if (!driver || !driver.is_active) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or inactive driver'
            });
        }

        // Update booking with driver assignment
        const updated = await db.assignDriverToBooking(bookingId, driver_id);

        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Driver assigned successfully',
            booking: updated
        });
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign driver'
        });
    }
});

// Get driver's assigned orders (driver only)
app.get('/api/driver/orders', requireDriverAuth, async (req, res) => {
    try {
        const driverId = req.session.driver.id;
        const status = req.query.status; // Optional filter by status

        const orders = await db.getDriverOrders(driverId, status);

        // Mask contact info based on order status
        const maskedOrders = orders.map(order => {
            // For completed orders, mask sensitive info
            if (order.status === 'completed') {
                return {
                    ...order,
                    phone: maskPhone(order.phone),
                    address: maskAddress(order.address),
                    email: '***@***.com'
                };
            }
            // For active orders, show full info
            return order;
        });

        res.json({
            success: true,
            orders: maskedOrders,
            count: orders.length
        });
    } catch (error) {
        console.error('Error fetching driver orders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
});

// Get booking statistics (for dashboard)
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.getBookingStats();

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// ==================================
// DRIVER AUTHENTICATION ROUTES
// ==================================

// Driver login
app.post('/api/driver/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Verify credentials
        const driver = await driverDb.verifyDriverCredentials(username, password);

        if (!driver) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

        // Update last login
        await driverDb.updateLastLogin(driver.id);

        // Create session
        req.session.driver = {
            id: driver.id,
            username: driver.username,
            email: driver.email,
            full_name: driver.full_name,
            role: driver.role,
            is_active: driver.is_active
        };

        res.json({
            success: true,
            driver: {
                id: driver.id,
                username: driver.username,
                email: driver.email,
                full_name: driver.full_name
            }
        });
    } catch (error) {
        console.error('Driver login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.'
        });
    }
});

// Driver logout
app.post('/api/driver/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// Check driver session
app.get('/api/driver/session', (req, res) => {
    if (req.session && req.session.driver && req.session.driver.is_active) {
        res.json({
            authenticated: true,
            driver: {
                id: req.session.driver.id,
                username: req.session.driver.username,
                email: req.session.driver.email,
                full_name: req.session.driver.full_name
            }
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// ==================================
// CUSTOMER USER AUTHENTICATION ROUTES
// ==================================

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and name are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await db.createUser({
            email,
            password_hash,
            name,
            phone: phone || null,
            address: address || null
        });

        // Create session
        req.session.user = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Get user by email
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        await db.updateLastLogin(user.id);

        // Create session
        req.session.user = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.'
        });
    }
});

// User logout
app.post('/api/auth/logout', (req, res) => {
    // Clear only user session, preserve driver session if exists
    if (req.session.user) {
        delete req.session.user;
    }

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.json({
                authenticated: false
            });
        }

        // Get fresh user data from database
        const user = await db.getUserById(req.session.user.id);

        if (!user) {
            delete req.session.user;
            return res.json({
                authenticated: false
            });
        }

        res.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            authenticated: false,
            error: 'Failed to get user information'
        });
    }
});

// ==================================
// PAYMENT ROUTES
// ==================================

// Create payment intent for a booking
app.post('/api/payments/create-intent', async (req, res) => {
    try {
        const bookingData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            service: req.body.service,
            numberOfBags: req.body.numberOfBags || 1,
            totalPrice: req.body.totalPrice,
            pickupDate: req.body.pickupDate,
            pickupTime: req.body.pickupTime
        };

        const result = await paymentService.createPaymentIntent(bookingData);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error || result.reason
            });
        }

        res.json({
            success: true,
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntentId,
            amount: result.amount
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment intent'
        });
    }
});

// Check payment status
app.get('/api/payments/:paymentIntentId/status', async (req, res) => {
    try {
        const result = await paymentService.getPaymentStatus(req.params.paymentIntentId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error || result.reason
            });
        }

        res.json({
            success: true,
            status: result.status,
            paid: result.paid
        });

    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check payment status'
        });
    }
});

// Process refund
app.post('/api/payments/:paymentIntentId/refund', async (req, res) => {
    try {
        const amount = req.body.amount || null; // Optional partial refund

        const result = await paymentService.processRefund(req.params.paymentIntentId, amount);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error || result.reason
            });
        }

        res.json({
            success: true,
            refundId: result.refundId,
            amount: result.amount,
            status: result.status
        });

    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process refund'
        });
    }
});

// Get Stripe publishable key
app.get('/api/payments/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
        configured: paymentService.isConfigured()
    });
});

// ==================================
// PROMO CODE ROUTES
// ==================================

// Validate promo code
app.post('/api/promo/validate', async (req, res) => {
    try {
        const { code, subtotal } = req.body;

        if (!code || !subtotal) {
            return res.status(400).json({
                success: false,
                error: 'Code and subtotal are required'
            });
        }

        const result = await promoService.validatePromoCode(code, subtotal);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            promo: result
        });

    } catch (error) {
        console.error('Error validating promo code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate promo code'
        });
    }
});

// Create promo code (admin)
app.post('/api/promo/create', async (req, res) => {
    try {
        const promoData = {
            code: req.body.code,
            discountType: req.body.discountType, // 'percentage' or 'fixed'
            discountValue: req.body.discountValue, // e.g., 20 for 20% or 500 for $5.00
            maxUses: req.body.maxUses || 0,
            expiresAt: req.body.expiresAt || null,
            active: req.body.active !== undefined ? req.body.active : 1
        };

        const promo = await promoService.createPromoCode(promoData);

        res.status(201).json({
            success: true,
            promo: promo
        });

    } catch (error) {
        console.error('Error creating promo code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create promo code'
        });
    }
});

// Get all promo codes (admin)
app.get('/api/promo/all', async (req, res) => {
    try {
        const promos = await promoService.getAllPromoCodes();

        res.json({
            success: true,
            promos: promos
        });

    } catch (error) {
        console.error('Error fetching promo codes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch promo codes'
        });
    }
});

// Deactivate promo code (admin)
app.patch('/api/promo/:id/deactivate', async (req, res) => {
    try {
        await promoService.deactivatePromoCode(req.params.id);

        res.json({
            success: true,
            message: 'Promo code deactivated'
        });

    } catch (error) {
        console.error('Error deactivating promo code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate promo code'
        });
    }
});

// ==================================
// AI ASSISTANT ROUTES
// ==================================

// Chat with AI assistant (LOGGED-IN USERS ONLY, RATE LIMITED)
app.post('/api/assistant/chat', requireAuth, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.session.user.id;
        const userEmail = req.session.user.email;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Check rate limit (5 questions per day)
        const usageLimit = await db.checkAIUsageLimit(userId);

        if (!usageLimit.allowed) {
            return res.status(429).json({
                success: false,
                error: `Daily AI limit reached. You can ask ${usageLimit.limit} questions per day. Try again tomorrow!`,
                usageCount: usageLimit.usageCount,
                limit: usageLimit.limit,
                remaining: 0
            });
        }

        // Build user context
        const context = {};

        // Get user's bookings
        const userBookings = await db.getBookingsByUserId(userId);

        // Get active orders
        const activeOrders = userBookings.filter(b =>
            ['pending', 'confirmed', 'in_progress'].includes(b.status)
        );

        // Build context
        context.userEmail = userEmail;
        context.userName = req.session.user.name;
        context.activeOrders = activeOrders;
        context.orderHistory = {
            totalOrders: userBookings.length,
            lastOrderDate: userBookings.length > 0
                ? userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].pickupDate
                : null
        };

        // Get AI response
        const aiResponse = await aiAssistant.chat(message, context);

        // Log AI usage if successful
        if (aiResponse.success) {
            await db.logAIUsage(
                userId,
                userEmail,
                aiResponse.tokensUsed || 0,
                message,
                aiResponse.message
            );
        }

        // Add remaining questions to response
        const newLimit = await db.checkAIUsageLimit(userId);
        aiResponse.remaining = newLimit.remaining;
        aiResponse.usageCount = newLimit.usageCount;
        aiResponse.limit = newLimit.limit;

        res.json(aiResponse);

    } catch (error) {
        console.error('Error in AI chat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get AI response'
        });
    }
});

// Get conversation suggestions (LOGGED-IN USERS ONLY)
app.post('/api/assistant/suggestions', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Build user context
        const context = {};
        const userBookings = await db.getBookingsByUserId(userId);
        const activeOrders = userBookings.filter(b =>
            ['pending', 'confirmed', 'in_progress'].includes(b.status)
        );

        context.activeOrders = activeOrders;

        const suggestions = aiAssistant.getSuggestions(context);

        // Check usage limit to show remaining questions
        const usageLimit = await db.checkAIUsageLimit(userId);

        res.json({
            success: true,
            suggestions: suggestions,
            remaining: usageLimit.remaining,
            limit: usageLimit.limit
        });

    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get suggestions'
        });
    }
});

// Get laundry care tip (PUBLIC - no login required, but rate limited)
app.get('/api/assistant/tip', async (req, res) => {
    try {
        // Tips are free and don't count toward user limit
        // But we'll only generate them occasionally to save costs

        // For now, return static tips instead of AI-generated
        const staticTips = [
            "Always check garment care labels before washing to prevent damage.",
            "Separate whites from colors to prevent color bleeding in the wash.",
            "Turn jeans inside out before washing to preserve color and prevent fading.",
            "Use cold water for most loads to save energy and prevent shrinking.",
            "Don't overload your washing machine - clothes need room to get clean.",
            "Remove clothes from the dryer promptly to prevent wrinkles.",
            "Clean your lint trap after every load for efficiency and safety.",
            "Pre-treat stains as soon as possible for best results."
        ];

        const randomTip = staticTips[Math.floor(Math.random() * staticTips.length)];

        res.json({
            success: true,
            tip: randomTip,
            provider: 'static'
        });

    } catch (error) {
        console.error('Error getting laundry tip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get laundry tip'
        });
    }
});

// Check if AI assistant is configured
app.get('/api/assistant/status', (req, res) => {
    const providerInfo = aiAssistant.getProviderInfo();

    let message = '';
    if (providerInfo.configured) {
        if (providerInfo.provider === 'openai') {
            message = `AI Assistant ready (OpenAI ${providerInfo.model})`;
        } else if (providerInfo.provider === 'ollama') {
            message = `AI Assistant ready (Ollama ${providerInfo.model})`;
        }
    } else {
        message = 'AI Assistant not configured. Add OPENAI_API_KEY to .env or install Ollama.';
    }

    res.json({
        ...providerInfo,
        message: message
    });
});

// ==================================
// ROUTE OPTIMIZATION (Driver Tools)
// ==================================

// Get optimized route for a specific date (driver only)
app.get('/api/routes/optimize/:date', requireDriverAuth, async (req, res) => {
    try {
        const date = req.params.date;

        // Get all confirmed bookings for the date
        const allBookings = await db.getAllBookings();
        const dateBookings = allBookings.filter(b =>
            b.pickupDate === date &&
            (b.status === 'confirmed' || b.status === 'in_progress')
        );

        if (dateBookings.length === 0) {
            return res.json({
                success: true,
                routes: [],
                message: 'No bookings for this date'
            });
        }

        // Geocode bookings if needed
        const geocodedBookings = await routeOptimizer.geocodeBookings(dateBookings);

        // Generate optimized routes
        const routes = routeOptimizer.generateDailyRoutes(geocodedBookings);

        res.json({
            success: true,
            date: date,
            routes: routes,
            totalBookings: dateBookings.length
        });

    } catch (error) {
        console.error('Error optimizing route:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to optimize route'
        });
    }
});

// Get route for specific time window (driver only)
app.post('/api/routes/optimize', requireDriverAuth, async (req, res) => {
    try {
        const { bookingIds, startLocation } = req.body;

        if (!bookingIds || bookingIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Booking IDs required'
            });
        }

        // Get bookings by IDs
        const bookings = [];
        for (const id of bookingIds) {
            const booking = await db.getBookingById(id);
            if (booking) {
                bookings.push(booking);
            }
        }

        // Geocode and optimize
        const geocodedBookings = await routeOptimizer.geocodeBookings(bookings);
        const optimized = routeOptimizer.optimizeRoute(geocodedBookings, startLocation);

        res.json({
            success: true,
            ...optimized
        });

    } catch (error) {
        console.error('Error optimizing custom route:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to optimize route'
        });
    }
});

// ==================================
// MESSAGING ROUTES
// ==================================

// Get messages for a booking (driver or customer)
app.get('/api/messages/:bookingId', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.bookingId);

        // Determine who is requesting (driver, logged-in customer, or anonymous tracker)
        let readerType = null;
        let readerId = null;
        let isAnonymousTracker = false;

        if (req.session.driver) {
            readerType = 'driver';
            readerId = req.session.driver.id;
        } else if (req.session.user) {
            readerType = 'customer';
            readerId = req.session.user.id;
        } else if (req.session.trackedBookings && req.session.trackedBookings.includes(bookingId)) {
            // Anonymous user who has tracked this booking
            readerType = 'customer';
            isAnonymousTracker = true;
        } else {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please track your order first.'
            });
        }

        // Get the booking to verify access
        const booking = await db.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Verify access: drivers assigned to order, or customer who owns order
        if (readerType === 'customer' && !isAnonymousTracker && booking.user_id !== readerId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        if (readerType === 'driver' && booking.driver_id !== readerId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Get messages
        const messages = await db.getMessagesByBookingId(bookingId);

        // Mark messages as read
        await db.markMessagesAsRead(bookingId, readerType);

        res.json({
            success: true,
            messages: messages,
            booking: {
                id: booking.id,
                status: booking.status,
                // Mask contact info for drivers on completed orders
                customerName: booking.name,
                phone: (readerType === 'driver' && booking.status === 'completed')
                    ? maskPhone(booking.phone)
                    : booking.phone,
                address: (readerType === 'driver' && booking.status === 'completed')
                    ? maskAddress(booking.address)
                    : booking.address
            }
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch messages'
        });
    }
});

// Send a message (driver or customer)
app.post('/api/messages/:bookingId', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Determine sender (driver, logged-in customer, or anonymous tracker)
        let senderType = null;
        let senderId = null;
        let isAnonymousTracker = false;

        if (req.session.driver) {
            senderType = 'driver';
            senderId = req.session.driver.id;
        } else if (req.session.user) {
            senderType = 'customer';
            senderId = req.session.user.id;
        } else if (req.session.trackedBookings && req.session.trackedBookings.includes(bookingId)) {
            // Anonymous user who has tracked this booking
            senderType = 'customer';
            senderId = 0; // Anonymous sender
            isAnonymousTracker = true;
        } else {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please track your order first.'
            });
        }

        // Get the booking to verify access and status
        const booking = await db.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Don't allow messaging on completed orders
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(403).json({
                success: false,
                error: 'Cannot send messages on completed or cancelled orders'
            });
        }

        // Verify access (skip for anonymous trackers - they verified by tracking)
        if (senderType === 'customer' && !isAnonymousTracker && booking.user_id !== senderId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        if (senderType === 'driver' && booking.driver_id !== senderId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Create message
        const newMessage = await db.createMessage({
            booking_id: bookingId,
            sender_type: senderType,
            sender_id: senderId,
            message: message.trim()
        });

        res.status(201).json({
            success: true,
            message: newMessage
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
});

// Get unread message count for driver dashboard
app.get('/api/messages/unread/count', async (req, res) => {
    try {
        if (!req.session.driver) {
            return res.status(401).json({
                success: false,
                error: 'Driver authentication required'
            });
        }

        const driverId = req.session.driver.id;

        // Get all orders assigned to this driver
        const orders = await db.getDriverOrders(driverId);

        // Count unread messages across all orders
        let totalUnread = 0;
        const unreadByOrder = {};

        for (const order of orders) {
            if (order.status !== 'completed' && order.status !== 'cancelled') {
                const count = await db.getUnreadMessageCount(order.id, 'driver');
                if (count > 0) {
                    totalUnread += count;
                    unreadByOrder[order.id] = count;
                }
            }
        }

        res.json({
            success: true,
            totalUnread: totalUnread,
            unreadByOrder: unreadByOrder
        });

    } catch (error) {
        console.error('Error counting unread messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to count unread messages'
        });
    }
});

// ==================================
// ERROR HANDLING
// ==================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred'
    });
});

// ==================================
// START SERVER
// ==================================

app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('🚀 ArielGo Backend Server Started!');
    console.log('========================================');
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌐 Website available at: http://localhost:${PORT}`);
    console.log(`🔌 API endpoints:`);
    console.log(`   - GET  /api/health`);
    console.log(`   - GET  /api/pricing`);
    console.log(`   - POST /api/bookings`);
    console.log(`   - GET  /api/bookings`);
    console.log(`   - GET  /api/bookings/:id`);
    console.log(`   - PATCH /api/bookings/:id/status`);
    console.log(`   - GET  /api/stats`);
    console.log(`   - POST /api/payments/create-intent`);
    console.log(`   - GET  /api/payments/:id/status`);
    console.log(`   - POST /api/payments/:id/refund`);
    console.log(`   - GET  /api/payments/config`);
    console.log(`   - POST /api/assistant/chat`);
    console.log(`   - POST /api/assistant/suggestions`);
    console.log(`   - GET  /api/assistant/tip`);
    console.log(`   - GET  /api/assistant/status`);
    console.log('========================================');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    db.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    db.close();
    process.exit(0);
});
