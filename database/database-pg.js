// ==================================
// POSTGRESQL DATABASE MODULE
// Production database configuration
// ==================================

const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'arielgo',
    user: process.env.DB_USER || 'arielgo_user',
    password: process.env.DB_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

/**
 * Initialize database tables
 */
async function initializeDatabase() {
    const client = await pool.connect();

    try {
        // Create bookings table
        await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                address TEXT NOT NULL,
                service TEXT NOT NULL,
                "pickupDate" TEXT NOT NULL,
                "pickupTime" TEXT,
                "numberOfBags" INTEGER DEFAULT 1,
                "pricePerBag" INTEGER NOT NULL,
                "totalPrice" INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                notes TEXT,
                "paymentIntentId" TEXT,
                "paymentStatus" TEXT DEFAULT 'pending',
                "stripeCustomerId" TEXT,
                user_id INTEGER REFERENCES users(id),
                driver_id INTEGER REFERENCES admin_users(id),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings("pickupDate")`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id)`);

        // Create promo codes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS promo_codes (
                id SERIAL PRIMARY KEY,
                code TEXT NOT NULL UNIQUE,
                "discountType" TEXT NOT NULL,
                "discountValue" INTEGER NOT NULL,
                "maxUses" INTEGER DEFAULT 0,
                "usedCount" INTEGER DEFAULT 0,
                "expiresAt" TEXT,
                active INTEGER DEFAULT 1,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code)`);

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "lastLogin" TIMESTAMP
            )
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)`);

        // Create AI usage tracking table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_usage (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                user_email TEXT NOT NULL,
                tokens_used INTEGER DEFAULT 0,
                question TEXT,
                response TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, "createdAt")`);

        console.log('✅ PostgreSQL tables initialized');

    } catch (error) {
        console.error('Error initializing PostgreSQL database:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Create a new booking
 */
async function createBooking(bookingData) {
    const sql = `
        INSERT INTO bookings (
            name, phone, email, address, service,
            "pickupDate", "pickupTime", "numberOfBags",
            "pricePerBag", "totalPrice", status, notes,
            "paymentIntentId", "paymentStatus", "stripeCustomerId", user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
    `;

    const values = [
        bookingData.name,
        bookingData.phone,
        bookingData.email,
        bookingData.address,
        bookingData.service,
        bookingData.pickupDate,
        bookingData.pickupTime,
        bookingData.numberOfBags || 1,
        bookingData.pricePerBag,
        bookingData.totalPrice,
        bookingData.status || 'pending',
        bookingData.notes || '',
        bookingData.paymentIntentId || null,
        bookingData.paymentStatus || 'pending',
        bookingData.stripeCustomerId || null,
        bookingData.user_id || null
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
}

/**
 * Get a booking by ID
 */
async function getBookingById(id) {
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0] || null;
}

/**
 * Get all bookings (with optional status filter)
 */
async function getAllBookings(status = null) {
    let sql = 'SELECT * FROM bookings';
    let params = [];

    if (status) {
        sql += ' WHERE status = $1';
        params.push(status);
    }

    sql += ' ORDER BY "createdAt" DESC';

    const result = await pool.query(sql, params);
    return result.rows;
}

/**
 * Update booking status
 */
async function updateBookingStatus(id, newStatus) {
    const sql = `
        UPDATE bookings
        SET status = $1, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;

    const result = await pool.query(sql, [newStatus, id]);
    return result.rows[0] || null;
}

/**
 * Get booking statistics
 */
async function getBookingStats() {
    const stats = {};

    const totalResult = await pool.query('SELECT COUNT(*) as count FROM bookings');
    stats.total = parseInt(totalResult.rows[0].count);

    const pendingResult = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE status = $1', ['pending']);
    stats.pending = parseInt(pendingResult.rows[0].count);

    const confirmedResult = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE status = $1', ['confirmed']);
    stats.confirmed = parseInt(confirmedResult.rows[0].count);

    const completedResult = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE status = $1', ['completed']);
    stats.completed = parseInt(completedResult.rows[0].count);

    const cancelledResult = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE status = $1', ['cancelled']);
    stats.cancelled = parseInt(cancelledResult.rows[0].count);

    const revenueResult = await pool.query('SELECT SUM("totalPrice") as total FROM bookings WHERE status != $1', ['cancelled']);
    const revenue = parseInt(revenueResult.rows[0].total || 0);
    stats.totalRevenue = revenue;
    stats.totalRevenueDollars = (revenue / 100).toFixed(2);

    const avgResult = await pool.query('SELECT AVG("totalPrice") as average FROM bookings WHERE status != $1', ['cancelled']);
    const avg = parseInt(avgResult.rows[0].average || 0);
    stats.averageOrderValue = avg;
    stats.averageOrderValueDollars = (avg / 100).toFixed(2);

    const bagsResult = await pool.query('SELECT SUM("numberOfBags") as total FROM bookings WHERE status != $1', ['cancelled']);
    stats.totalBags = parseInt(bagsResult.rows[0].total || 0);

    return stats;
}

/**
 * Get bookings for a specific date
 */
async function getBookingsByDate(date) {
    const result = await pool.query(
        'SELECT * FROM bookings WHERE "pickupDate" = $1 ORDER BY "pickupTime"',
        [date]
    );
    return result.rows;
}

/**
 * Delete a booking
 */
async function deleteBooking(id) {
    const result = await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    return result.rowCount > 0;
}

/**
 * Create a new user
 */
async function createUser(userData) {
    const sql = `
        INSERT INTO users (email, password_hash, name, phone, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    try {
        const result = await pool.query(sql, [
            userData.email,
            userData.password_hash,
            userData.name,
            userData.phone || null,
            userData.address || null
        ]);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            throw new Error('Email already exists');
        }
        throw error;
    }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
}

/**
 * Get user by ID
 */
async function getUserById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
}

/**
 * Update user's last login timestamp
 */
async function updateLastLogin(userId) {
    const result = await pool.query(
        'UPDATE users SET "lastLogin" = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
    );
    return result.rowCount > 0;
}

/**
 * Get all bookings for a specific user
 */
async function getBookingsByUserId(userId) {
    const result = await pool.query(
        'SELECT * FROM bookings WHERE user_id = $1 ORDER BY "createdAt" DESC',
        [userId]
    );
    return result.rows;
}

/**
 * Update user profile
 */
async function updateUser(userId, updates) {
    const allowedFields = ['name', 'phone', 'address'];
    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            setClause.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }
    }

    if (setClause.length === 0) {
        return null;
    }

    values.push(userId);
    const sql = `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(sql, values);
    return result.rows[0] || null;
}

/**
 * Assign driver to booking
 */
async function assignDriverToBooking(bookingId, driverId) {
    const sql = 'UPDATE bookings SET driver_id = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(sql, [driverId, bookingId]);
    return result.rows[0] || null;
}

/**
 * Get all orders assigned to a specific driver
 */
async function getDriverOrders(driverId, status = null) {
    let sql = 'SELECT * FROM bookings WHERE driver_id = $1';
    const params = [driverId];

    if (status) {
        sql += ' AND status = $2';
        params.push(status);
    }

    sql += ' ORDER BY "pickupDate" ASC, "pickupTime" ASC';

    const result = await pool.query(sql, params);
    return result.rows;
}

/**
 * Log AI usage for rate limiting and tracking
 */
async function logAIUsage(userId, userEmail, tokensUsed, question, response) {
    const sql = `
        INSERT INTO ai_usage (user_id, user_email, tokens_used, question, response)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const result = await pool.query(sql, [userId, userEmail, tokensUsed, question, response]);
    return result.rows[0];
}

/**
 * Check AI usage limit for user (5 questions per day)
 */
async function checkAIUsageLimit(userId) {
    const sql = `
        SELECT COUNT(*) as count
        FROM ai_usage
        WHERE user_id = $1
        AND DATE("createdAt") = CURRENT_DATE
    `;

    const result = await pool.query(sql, [userId]);
    const usageCount = parseInt(result.rows[0].count);
    const limit = 5;
    const remaining = Math.max(0, limit - usageCount);

    return {
        allowed: usageCount < limit,
        usageCount: usageCount,
        limit: limit,
        remaining: remaining
    };
}

/**
 * Get AI usage stats for a user
 */
async function getAIUsageStats(userId) {
    const sql = `
        SELECT
            COUNT(*) as "totalQuestions",
            SUM(tokens_used) as "totalTokens",
            DATE("createdAt") as date
        FROM ai_usage
        WHERE user_id = $1
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 30
    `;

    const result = await pool.query(sql, [userId]);
    return result.rows;
}

/**
 * Close database connection
 */
async function close() {
    await pool.end();
    console.log('PostgreSQL connection pool closed');
}

// Initialize database on module load
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
});

// Export all functions
module.exports = {
    pool, // Export pool for direct queries if needed
    createBooking,
    getBookingById,
    getAllBookings,
    updateBookingStatus,
    getBookingStats,
    getBookingsByDate,
    deleteBooking,
    assignDriverToBooking,
    getDriverOrders,
    createUser,
    getUserByEmail,
    getUserById,
    updateLastLogin,
    getBookingsByUserId,
    updateUser,
    logAIUsage,
    checkAIUsageLimit,
    getAIUsageStats,
    close
};
