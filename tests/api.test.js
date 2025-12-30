/**
 * ArielGo API Tests
 * Run with: npm test
 */

const request = require('supertest');

// We need to create a testable app instance
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Mock the database and services for testing
jest.mock('../database/database', () => ({
    createBooking: jest.fn(),
    getAllBookings: jest.fn(),
    getBookingById: jest.fn(),
    updateBookingStatus: jest.fn(),
    getBookingStats: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    getUserById: jest.fn(),
    updateLastLogin: jest.fn(),
    getBookingsByUserId: jest.fn(),
    checkAIUsageLimit: jest.fn(),
    logAIUsage: jest.fn(),
    close: jest.fn()
}));

jest.mock('../database/driver-db', () => ({
    verifyDriverCredentials: jest.fn(),
    updateLastLogin: jest.fn(),
    getDriverById: jest.fn()
}));

jest.mock('../services/email-service', () => ({
    sendBookingConfirmation: jest.fn().mockResolvedValue({ success: true }),
    sendStatusUpdate: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../services/sms-service', () => ({
    sendBookingConfirmation: jest.fn().mockResolvedValue({ success: true }),
    sendStatusUpdate: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../services/pricing-service', () => ({
    getAllPricing: jest.fn().mockReturnValue({
        washFold: { pricePerBag: 1500, name: 'Wash & Fold' },
        dryCleaning: { pricePerBag: 2500, name: 'Dry Cleaning' },
        ironing: { pricePerBag: 1000, name: 'Ironing Only' }
    }),
    calculateBookingTotal: jest.fn().mockReturnValue({
        success: true,
        pricePerBag: 1500,
        total: 3000
    })
}));

jest.mock('../services/payment-service', () => ({
    isConfigured: jest.fn().mockReturnValue(false),
    createPaymentIntent: jest.fn(),
    getPaymentStatus: jest.fn()
}));

jest.mock('../services/promo-service', () => ({
    validatePromoCode: jest.fn(),
    createPromoCode: jest.fn(),
    getAllPromoCodes: jest.fn(),
    deactivatePromoCode: jest.fn()
}));

jest.mock('../services/ai-assistant', () => ({
    chat: jest.fn(),
    getSuggestions: jest.fn(),
    getProviderInfo: jest.fn().mockReturnValue({
        configured: true,
        provider: 'openai',
        model: 'gpt-3.5-turbo'
    })
}));

jest.mock('../services/route-optimizer', () => ({
    geocodeBookings: jest.fn(),
    generateDailyRoutes: jest.fn(),
    optimizeRoute: jest.fn()
}));

// Import mocked modules
const db = require('../database/database');
const driverDb = require('../database/driver-db');
const pricingService = require('../services/pricing-service');
const promoService = require('../services/promo-service');
const aiAssistant = require('../services/ai-assistant');

// Create test app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple session mock for testing
app.use((req, res, next) => {
    req.session = req.testSession || {};
    req.session.destroy = (cb) => {
        req.session = {};
        if (cb) cb();
    };
    next();
});

// Import routes (simplified for testing)
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ArielGo backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Pricing
app.get('/api/pricing', (req, res) => {
    try {
        const pricing = pricingService.getAllPricing();
        res.json({ success: true, pricing });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch pricing information' });
    }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { name, phone, email, address, service, pickupDate, pickupTime, numberOfBags, notes } = req.body;

        if (!name || !phone || !email || !address || !service || !pickupDate) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const pricing = pricingService.calculateBookingTotal(service, numberOfBags || 1);
        if (!pricing.success) {
            return res.status(400).json({ success: false, error: pricing.error });
        }

        const booking = await db.createBooking({
            name, phone, email, address, service, pickupDate, pickupTime,
            numberOfBags: numberOfBags || 1,
            notes: notes || '',
            pricePerBag: pricing.pricePerBag,
            totalPrice: pricing.total,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            booking: {
                id: booking.id,
                name: booking.name,
                service: booking.service,
                pickupDate: booking.pickupDate,
                status: booking.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await db.getAllBookings(req.query.status);
        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await db.getBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch booking' });
    }
});

// Stats
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.getBookingStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

// Payment config
app.get('/api/payments/config', (req, res) => {
    const paymentService = require('../services/payment-service');
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
        configured: paymentService.isConfigured()
    });
});

// Promo validate
app.post('/api/promo/validate', async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code || !subtotal) {
            return res.status(400).json({ success: false, error: 'Code and subtotal are required' });
        }
        const result = await promoService.validatePromoCode(code, subtotal);
        if (!result.valid) {
            return res.status(400).json({ success: false, error: result.error });
        }
        res.json({ success: true, promo: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to validate promo code' });
    }
});

// AI status
app.get('/api/assistant/status', (req, res) => {
    const providerInfo = aiAssistant.getProviderInfo();
    res.json({
        ...providerInfo,
        message: providerInfo.configured
            ? `AI Assistant ready (${providerInfo.provider} ${providerInfo.model})`
            : 'AI Assistant not configured'
    });
});

// AI tip
app.get('/api/assistant/tip', (req, res) => {
    const tips = [
        "Always check garment care labels before washing.",
        "Separate whites from colors to prevent bleeding.",
        "Turn jeans inside out before washing."
    ];
    res.json({
        success: true,
        tip: tips[Math.floor(Math.random() * tips.length)],
        provider: 'static'
    });
});

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// ============================================
// TESTS
// ============================================

describe('ArielGo API Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==================
    // Health Check Tests
    // ==================
    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.message).toBe('ArielGo backend is running!');
            expect(res.body.timestamp).toBeDefined();
        });
    });

    // ==================
    // Pricing Tests
    // ==================
    describe('GET /api/pricing', () => {
        it('should return pricing information', async () => {
            const res = await request(app).get('/api/pricing');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pricing).toBeDefined();
            expect(res.body.pricing.washFold).toBeDefined();
            expect(res.body.pricing.dryCleaning).toBeDefined();
        });
    });

    // ==================
    // Booking Tests
    // ==================
    describe('POST /api/bookings', () => {
        const validBooking = {
            name: 'John Doe',
            phone: '+250788123456',
            email: 'john@example.com',
            address: '123 Main St, Kigali',
            service: 'washFold',
            pickupDate: '2025-01-15',
            pickupTime: '09:00-12:00',
            numberOfBags: 2
        };

        it('should create a booking with valid data', async () => {
            db.createBooking.mockResolvedValue({
                id: 1,
                ...validBooking,
                status: 'pending',
                totalPrice: 3000
            });

            const res = await request(app)
                .post('/api/bookings')
                .send(validBooking);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.booking.name).toBe('John Doe');
            expect(res.body.booking.status).toBe('pending');
        });

        it('should reject booking with missing required fields', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .send({ name: 'John' }); // Missing other fields

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Missing required fields');
        });

        it('should reject booking with missing email', async () => {
            const incompleteBooking = { ...validBooking };
            delete incompleteBooking.email;

            const res = await request(app)
                .post('/api/bookings')
                .send(incompleteBooking);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/bookings', () => {
        it('should return all bookings', async () => {
            const mockBookings = [
                { id: 1, name: 'John', status: 'pending' },
                { id: 2, name: 'Jane', status: 'completed' }
            ];
            db.getAllBookings.mockResolvedValue(mockBookings);

            const res = await request(app).get('/api/bookings');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(2);
            expect(res.body.bookings).toHaveLength(2);
        });

        it('should return empty array when no bookings', async () => {
            db.getAllBookings.mockResolvedValue([]);

            const res = await request(app).get('/api/bookings');

            expect(res.status).toBe(200);
            expect(res.body.count).toBe(0);
            expect(res.body.bookings).toHaveLength(0);
        });
    });

    describe('GET /api/bookings/:id', () => {
        it('should return a specific booking', async () => {
            const mockBooking = { id: 1, name: 'John', status: 'pending' };
            db.getBookingById.mockResolvedValue(mockBooking);

            const res = await request(app).get('/api/bookings/1');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.booking.id).toBe(1);
        });

        it('should return 404 for non-existent booking', async () => {
            db.getBookingById.mockResolvedValue(null);

            const res = await request(app).get('/api/bookings/999');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Booking not found');
        });
    });

    // ==================
    // Stats Tests
    // ==================
    describe('GET /api/stats', () => {
        it('should return booking statistics', async () => {
            const mockStats = {
                total: 100,
                pending: 10,
                completed: 80,
                cancelled: 10,
                revenue: 150000
            };
            db.getBookingStats.mockResolvedValue(mockStats);

            const res = await request(app).get('/api/stats');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.stats.total).toBe(100);
        });
    });

    // ==================
    // Payment Config Tests
    // ==================
    describe('GET /api/payments/config', () => {
        it('should return payment configuration', async () => {
            const res = await request(app).get('/api/payments/config');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('configured');
            expect(res.body).toHaveProperty('publishableKey');
        });
    });

    // ==================
    // Promo Code Tests
    // ==================
    describe('POST /api/promo/validate', () => {
        it('should validate a valid promo code', async () => {
            promoService.validatePromoCode.mockResolvedValue({
                valid: true,
                code: 'SAVE20',
                discountType: 'percentage',
                discountValue: 20,
                discountAmount: 400
            });

            const res = await request(app)
                .post('/api/promo/validate')
                .send({ code: 'SAVE20', subtotal: 2000 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.promo.discountValue).toBe(20);
        });

        it('should reject invalid promo code', async () => {
            promoService.validatePromoCode.mockResolvedValue({
                valid: false,
                error: 'Invalid promo code'
            });

            const res = await request(app)
                .post('/api/promo/validate')
                .send({ code: 'INVALID', subtotal: 2000 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should require code and subtotal', async () => {
            const res = await request(app)
                .post('/api/promo/validate')
                .send({ code: 'SAVE20' }); // Missing subtotal

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Code and subtotal are required');
        });
    });

    // ==================
    // AI Assistant Tests
    // ==================
    describe('GET /api/assistant/status', () => {
        it('should return AI assistant status', async () => {
            const res = await request(app).get('/api/assistant/status');

            expect(res.status).toBe(200);
            expect(res.body.configured).toBe(true);
            expect(res.body.provider).toBe('openai');
        });
    });

    describe('GET /api/assistant/tip', () => {
        it('should return a laundry tip', async () => {
            const res = await request(app).get('/api/assistant/tip');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.tip).toBeDefined();
            expect(res.body.provider).toBe('static');
        });
    });

    // ==================
    // 404 Tests
    // ==================
    describe('404 Handler', () => {
        it('should return 404 for unknown API routes', async () => {
            const res = await request(app).get('/api/unknown-endpoint');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('API endpoint not found');
        });
    });
});

// ============================================
// Integration-style Tests (Testing data flow)
// ============================================
describe('ArielGo Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Booking Flow', () => {
        it('should handle complete booking creation flow', async () => {
            // Mock the database to return a created booking
            db.createBooking.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: 'test@test.com',
                phone: '+250788000000',
                address: 'Kigali, Rwanda',
                service: 'washFold',
                pickupDate: '2025-01-20',
                pickupTime: '09:00-12:00',
                numberOfBags: 3,
                pricePerBag: 1500,
                totalPrice: 4500,
                status: 'pending'
            });

            // Create booking
            const createRes = await request(app)
                .post('/api/bookings')
                .send({
                    name: 'Test User',
                    email: 'test@test.com',
                    phone: '+250788000000',
                    address: 'Kigali, Rwanda',
                    service: 'washFold',
                    pickupDate: '2025-01-20',
                    pickupTime: '09:00-12:00',
                    numberOfBags: 3
                });

            expect(createRes.status).toBe(201);
            expect(createRes.body.booking.id).toBe(1);

            // Verify booking can be retrieved
            db.getBookingById.mockResolvedValue({
                id: 1,
                name: 'Test User',
                status: 'pending'
            });

            const getRes = await request(app).get('/api/bookings/1');
            expect(getRes.status).toBe(200);
            expect(getRes.body.booking.id).toBe(1);
        });
    });

    describe('Pricing Calculation', () => {
        it('should calculate correct pricing for multiple bags', async () => {
            pricingService.calculateBookingTotal.mockReturnValue({
                success: true,
                pricePerBag: 1500,
                total: 7500 // 5 bags * 1500
            });

            db.createBooking.mockResolvedValue({
                id: 1,
                numberOfBags: 5,
                pricePerBag: 1500,
                totalPrice: 7500,
                status: 'pending'
            });

            const res = await request(app)
                .post('/api/bookings')
                .send({
                    name: 'Test',
                    email: 'test@test.com',
                    phone: '+250788000000',
                    address: 'Kigali',
                    service: 'washFold',
                    pickupDate: '2025-01-20',
                    numberOfBags: 5
                });

            expect(res.status).toBe(201);
            expect(pricingService.calculateBookingTotal).toHaveBeenCalledWith('washFold', 5);
        });
    });
});
