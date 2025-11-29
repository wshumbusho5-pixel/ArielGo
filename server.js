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

// Serve static files (HTML, CSS, JS) from website folder
app.use(express.static('website'));

// Log all requests (helpful for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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

        // Calculate total price
        const pricing = pricingService.calculateBookingTotal(
            bookingData.service,
            bookingData.numberOfBags
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
            pricePerBag: pricing.pricePerBag,
            totalPrice: pricing.total,
            status: 'pending' // pending, confirmed, in_progress, completed, cancelled
        };

        // Save to database
        const booking = await db.createBooking(fullBookingData);

        // Send email notification
        try {
            await emailService.sendBookingConfirmation(booking);
            console.log('Confirmation email sent successfully');
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the booking if email fails
        }

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
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

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
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
