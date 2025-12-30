#!/usr/bin/env node
// ==================================
// DATABASE MIGRATION SCRIPT
// Migrate data from SQLite to PostgreSQL
// ==================================

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// SQLite database
const sqliteDb = new sqlite3.Database(
    path.join(__dirname, 'arielgo.db'),
    (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err);
            process.exit(1);
        }
    }
);

// PostgreSQL connection
const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'arielgo',
    user: process.env.DB_USER || 'arielgo_user',
    password: process.env.DB_PASSWORD,
});

/**
 * Migrate a table from SQLite to PostgreSQL
 */
async function migrateTable(tableName, columns) {
    console.log(`\n📦 Migrating table: ${tableName}`);

    return new Promise((resolve, reject) => {
        // Get all rows from SQLite
        sqliteDb.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
            if (err) {
                console.log(`⚠️  Table ${tableName} doesn't exist in SQLite, skipping...`);
                return resolve(0);
            }

            if (rows.length === 0) {
                console.log(`  ✓ No data to migrate`);
                return resolve(0);
            }

            console.log(`  Found ${rows.length} rows`);

            try {
                let migrated = 0;

                for (const row of rows) {
                    // Build INSERT query
                    const cols = columns.join(', ');
                    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                    const values = columns.map(col => row[col]);

                    const sql = `
                        INSERT INTO ${tableName} (${cols})
                        VALUES (${placeholders})
                        ON CONFLICT DO NOTHING
                    `;

                    await pgPool.query(sql, values);
                    migrated++;
                }

                console.log(`  ✅ Migrated ${migrated} rows`);
                resolve(migrated);

            } catch (error) {
                console.error(`  ❌ Error migrating ${tableName}:`, error.message);
                reject(error);
            }
        });
    });
}

/**
 * Main migration function
 */
async function migrate() {
    console.log('\n========================================');
    console.log('🔄 DATABASE MIGRATION: SQLite → PostgreSQL');
    console.log('========================================\n');

    try {
        // Test PostgreSQL connection
        await pgPool.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL');

        // Migrate users table
        await migrateTable('users', [
            'email', 'password_hash', 'name', 'phone', 'address'
        ]);

        // Migrate bookings table
        await migrateTable('bookings', [
            'name', 'phone', 'email', 'address', 'service',
            'pickupDate', 'pickupTime', 'numberOfBags',
            'pricePerBag', 'totalPrice', 'status', 'notes',
            'paymentIntentId', 'paymentStatus', 'stripeCustomerId',
            'user_id', 'driver_id'
        ]);

        // Migrate promo codes table
        await migrateTable('promo_codes', [
            'code', 'discountType', 'discountValue',
            'maxUses', 'usedCount', 'expiresAt', 'active'
        ]);

        // Migrate AI usage table (if exists)
        await migrateTable('ai_usage', [
            'user_id', 'user_email', 'tokens_used',
            'question', 'response'
        ]);

        console.log('\n========================================');
        console.log('✅ MIGRATION COMPLETE!');
        console.log('========================================\n');
        console.log('Next steps:');
        console.log('1. Verify data in PostgreSQL');
        console.log('2. Update .env to use DATABASE_URL');
        console.log('3. Restart your application\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        // Close connections
        sqliteDb.close();
        await pgPool.end();
    }
}

// Run migration
migrate();
