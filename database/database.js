// ==================================
// DATABASE MODULE
// Handles all database operations using SQLite
// ==================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'arielgo.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

/**
 * Initialize database tables
 */
function initializeDatabase() {
    // Create bookings table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            address TEXT NOT NULL,
            service TEXT NOT NULL,
            pickupDate TEXT NOT NULL,
            pickupTime TEXT,
            numberOfBags INTEGER DEFAULT 1,
            pricePerBag INTEGER NOT NULL,
            totalPrice INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            paymentIntentId TEXT,
            paymentStatus TEXT DEFAULT 'pending',
            stripeCustomerId TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating bookings table:', err);
        } else {
            console.log('✅ Bookings table ready');
            // Add payment columns to existing table if they don't exist
            addPaymentColumns();
        }
    });

    // Create index on status for faster queries
    db.run(`
        CREATE INDEX IF NOT EXISTS idx_status ON bookings(status)
    `);

    // Create index on pickupDate for faster date queries
    db.run(`
        CREATE INDEX IF NOT EXISTS idx_pickup_date ON bookings(pickupDate)
    `);

    // Create promo codes table
    db.run(`
        CREATE TABLE IF NOT EXISTS promo_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            discountType TEXT NOT NULL,
            discountValue INTEGER NOT NULL,
            maxUses INTEGER DEFAULT 0,
            usedCount INTEGER DEFAULT 0,
            expiresAt TEXT,
            active INTEGER DEFAULT 1,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating promo_codes table:', err);
        } else {
            console.log('✅ Promo codes table ready');
        }
    });

    // Create index on code for faster lookups
    db.run(`
        CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code)
    `);

    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            lastLogin TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('✅ Users table ready');
            addUserIdColumn();
        }
    });

    // Create index on email for faster lookups
    db.run(`
        CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)
    `);
}

/**
 * Add payment columns to existing bookings table (migration)
 */
function addPaymentColumns() {
    // Check if columns exist, if not add them
    db.all("PRAGMA table_info(bookings)", [], (err, columns) => {
        if (err) {
            console.error('Error checking table schema:', err);
            return;
        }

        const columnNames = columns.map(col => col.name);

        // Add paymentIntentId if doesn't exist
        if (!columnNames.includes('paymentIntentId')) {
            db.run('ALTER TABLE bookings ADD COLUMN paymentIntentId TEXT', (err) => {
                if (err) console.error('Error adding paymentIntentId:', err);
                else console.log('✅ Added paymentIntentId column');
            });
        }

        // Add paymentStatus if doesn't exist
        if (!columnNames.includes('paymentStatus')) {
            db.run("ALTER TABLE bookings ADD COLUMN paymentStatus TEXT DEFAULT 'pending'", (err) => {
                if (err) console.error('Error adding paymentStatus:', err);
                else console.log('✅ Added paymentStatus column');
            });
        }

        // Add stripeCustomerId if doesn't exist
        if (!columnNames.includes('stripeCustomerId')) {
            db.run('ALTER TABLE bookings ADD COLUMN stripeCustomerId TEXT', (err) => {
                if (err) console.error('Error adding stripeCustomerId:', err);
                else console.log('✅ Added stripeCustomerId column');
            });
        }
    });
}

/**
 * Add user_id column to existing bookings table (migration)
 */
function addUserIdColumn() {
    db.all("PRAGMA table_info(bookings)", [], (err, columns) => {
        if (err) {
            console.error('Error checking table schema:', err);
            return;
        }

        const columnNames = columns.map(col => col.name);

        // Add user_id if doesn't exist
        if (!columnNames.includes('user_id')) {
            db.run('ALTER TABLE bookings ADD COLUMN user_id INTEGER REFERENCES users(id)', (err) => {
                if (err) console.error('Error adding user_id:', err);
                else console.log('✅ Added user_id column to bookings');
            });
        }
    });
}

/**
 * Create a new booking
 */
function createBooking(bookingData) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO bookings (
                name, phone, email, address, service,
                pickupDate, pickupTime, numberOfBags,
                pricePerBag, totalPrice, status, notes,
                paymentIntentId, paymentStatus, stripeCustomerId, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
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
            bookingData.user_id || null  // Allow anonymous bookings
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error creating booking:', err);
                reject(err);
            } else {
                // Get the created booking
                getBookingById(this.lastID)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}

/**
 * Get a booking by ID
 */
function getBookingById(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM bookings WHERE id = ?';

        db.get(sql, [id], (err, row) => {
            if (err) {
                console.error('Error fetching booking:', err);
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

/**
 * Get all bookings (with optional status filter)
 */
function getAllBookings(status = null) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM bookings';
        let params = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY createdAt DESC';

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error fetching bookings:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Update booking status
 */
function updateBookingStatus(id, newStatus) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE bookings
            SET status = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(sql, [newStatus, id], function(err) {
            if (err) {
                console.error('Error updating booking status:', err);
                reject(err);
            } else {
                if (this.changes === 0) {
                    resolve(null); // Booking not found
                } else {
                    getBookingById(id)
                        .then(resolve)
                        .catch(reject);
                }
            }
        });
    });
}

/**
 * Get booking statistics
 */
function getBookingStats() {
    return new Promise((resolve, reject) => {
        const statsQueries = {
            total: 'SELECT COUNT(*) as count FROM bookings',
            pending: 'SELECT COUNT(*) as count FROM bookings WHERE status = "pending"',
            confirmed: 'SELECT COUNT(*) as count FROM bookings WHERE status = "confirmed"',
            completed: 'SELECT COUNT(*) as count FROM bookings WHERE status = "completed"',
            cancelled: 'SELECT COUNT(*) as count FROM bookings WHERE status = "cancelled"',
            totalRevenue: 'SELECT SUM(totalPrice) as total FROM bookings WHERE status != "cancelled"',
            averageOrderValue: 'SELECT AVG(totalPrice) as average FROM bookings WHERE status != "cancelled"',
            totalBags: 'SELECT SUM(numberOfBags) as total FROM bookings WHERE status != "cancelled"'
        };

        const stats = {};
        const promises = [];

        for (const [key, query] of Object.entries(statsQueries)) {
            promises.push(
                new Promise((res, rej) => {
                    db.get(query, [], (err, row) => {
                        if (err) {
                            rej(err);
                        } else {
                            if (key.includes('Revenue') || key.includes('OrderValue')) {
                                // Convert cents to dollars for revenue stats
                                const value = row.total || row.average || 0;
                                stats[key] = value;
                                stats[`${key}Dollars`] = (value / 100).toFixed(2);
                            } else {
                                stats[key] = row.count || row.total || row.average || 0;
                            }
                            res();
                        }
                    });
                })
            );
        }

        Promise.all(promises)
            .then(() => resolve(stats))
            .catch(reject);
    });
}

/**
 * Get bookings for a specific date
 */
function getBookingsByDate(date) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM bookings WHERE pickupDate = ? ORDER BY pickupTime';

        db.all(sql, [date], (err, rows) => {
            if (err) {
                console.error('Error fetching bookings by date:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Delete a booking (for testing/admin purposes)
 */
function deleteBooking(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM bookings WHERE id = ?';

        db.run(sql, [id], function(err) {
            if (err) {
                console.error('Error deleting booking:', err);
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

/**
 * Create a new user
 */
function createUser(userData) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (email, password_hash, name, phone, address)
            VALUES (?, ?, ?, ?, ?)
        `;

        const params = [
            userData.email,
            userData.password_hash,
            userData.name,
            userData.phone || null,
            userData.address || null
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error creating user:', err);
                if (err.message.includes('UNIQUE constraint failed')) {
                    reject(new Error('Email already exists'));
                } else {
                    reject(err);
                }
            } else {
                getUserById(this.lastID)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}

/**
 * Get user by email
 */
function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';

        db.get(sql, [email], (err, row) => {
            if (err) {
                console.error('Error fetching user by email:', err);
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

/**
 * Get user by ID
 */
function getUserById(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';

        db.get(sql, [id], (err, row) => {
            if (err) {
                console.error('Error fetching user by ID:', err);
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

/**
 * Update user's last login timestamp
 */
function updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?';

        db.run(sql, [userId], function(err) {
            if (err) {
                console.error('Error updating last login:', err);
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

/**
 * Get all bookings for a specific user
 */
function getBookingsByUserId(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM bookings WHERE user_id = ? ORDER BY createdAt DESC';

        db.all(sql, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching user bookings:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Update user profile
 */
function updateUser(userId, updates) {
    return new Promise((resolve, reject) => {
        const allowedFields = ['name', 'phone', 'address'];
        const setClause = [];
        const params = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (setClause.length === 0) {
            return resolve(null);
        }

        params.push(userId);
        const sql = `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`;

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error updating user:', err);
                reject(err);
            } else {
                getUserById(userId)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}

/**
 * Close database connection
 */
function close() {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
    });
}

// Export all functions
module.exports = {
    createBooking,
    getBookingById,
    getAllBookings,
    updateBookingStatus,
    getBookingStats,
    getBookingsByDate,
    deleteBooking,
    createUser,
    getUserByEmail,
    getUserById,
    updateLastLogin,
    getBookingsByUserId,
    updateUser,
    close
};
