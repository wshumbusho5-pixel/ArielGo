// ==================================
// PROMO CODE SERVICE
// ==================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/arielgo.db');

/**
 * Validate and apply a promo code
 * @param {string} code - Promo code
 * @param {number} subtotal - Order subtotal in cents
 * @returns {Promise<Object>} Discount result
 */
async function validatePromoCode(code, subtotal) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);

        const query = `
            SELECT * FROM promo_codes
            WHERE code = ? COLLATE NOCASE
            AND active = 1
        `;

        db.get(query, [code.toUpperCase()], (err, promo) => {
            if (err) {
                db.close();
                return reject(err);
            }

            if (!promo) {
                db.close();
                return resolve({
                    valid: false,
                    error: 'Invalid promo code'
                });
            }

            // Check expiration
            if (promo.expiresAt) {
                const expiryDate = new Date(promo.expiresAt);
                if (expiryDate < new Date()) {
                    db.close();
                    return resolve({
                        valid: false,
                        error: 'Promo code has expired'
                    });
                }
            }

            // Check usage limit
            if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
                db.close();
                return resolve({
                    valid: false,
                    error: 'Promo code has reached maximum uses'
                });
            }

            // Calculate discount
            let discountAmount = 0;

            if (promo.discountType === 'percentage') {
                // Percentage discount (e.g., 20% off)
                discountAmount = Math.round((subtotal * promo.discountValue) / 100);
            } else if (promo.discountType === 'fixed') {
                // Fixed amount discount (e.g., $5 off)
                discountAmount = promo.discountValue;
            }

            // Ensure discount doesn't exceed subtotal
            discountAmount = Math.min(discountAmount, subtotal);

            db.close();

            resolve({
                valid: true,
                promoId: promo.id,
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                discountAmount: discountAmount,
                newTotal: subtotal - discountAmount
            });
        });
    });
}

/**
 * Increment promo code usage count
 * @param {number} promoId - Promo code ID
 * @returns {Promise<boolean>} Success status
 */
async function incrementPromoUsage(promoId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);

        const query = `
            UPDATE promo_codes
            SET usedCount = usedCount + 1
            WHERE id = ?
        `;

        db.run(query, [promoId], (err) => {
            db.close();
            if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
}

/**
 * Create a new promo code
 * @param {Object} promoData - Promo code data
 * @returns {Promise<Object>} Created promo code
 */
async function createPromoCode(promoData) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);

        const query = `
            INSERT INTO promo_codes (
                code, discountType, discountValue,
                maxUses, expiresAt, active
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            promoData.code.toUpperCase(),
            promoData.discountType,
            promoData.discountValue,
            promoData.maxUses || 0,
            promoData.expiresAt || null,
            promoData.active !== undefined ? promoData.active : 1
        ];

        db.run(query, params, function(err) {
            if (err) {
                db.close();
                return reject(err);
            }

            const promoId = this.lastID;

            db.get('SELECT * FROM promo_codes WHERE id = ?', [promoId], (err, promo) => {
                db.close();
                if (err) {
                    return reject(err);
                }
                resolve(promo);
            });
        });
    });
}

/**
 * Get all promo codes
 * @returns {Promise<Array>} List of promo codes
 */
async function getAllPromoCodes() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);

        db.all('SELECT * FROM promo_codes ORDER BY createdAt DESC', [], (err, rows) => {
            db.close();
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Deactivate a promo code
 * @param {number} id - Promo code ID
 * @returns {Promise<boolean>} Success status
 */
async function deactivatePromoCode(id) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);

        db.run('UPDATE promo_codes SET active = 0 WHERE id = ?', [id], (err) => {
            db.close();
            if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
}

/**
 * Format discount for display
 * @param {string} discountType - Type of discount
 * @param {number} discountValue - Discount value
 * @returns {string} Formatted discount
 */
function formatDiscount(discountType, discountValue) {
    if (discountType === 'percentage') {
        return `${discountValue}% off`;
    } else if (discountType === 'fixed') {
        return `$${(discountValue / 100).toFixed(2)} off`;
    }
    return '';
}

module.exports = {
    validatePromoCode,
    incrementPromoUsage,
    createPromoCode,
    getAllPromoCodes,
    deactivatePromoCode,
    formatDiscount
};
