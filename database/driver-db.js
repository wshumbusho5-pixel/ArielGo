const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { verifyPassword } = require('../middleware/auth');

const DB_PATH = path.join(__dirname, 'arielgo.db');

/**
 * Get database connection
 * @returns {sqlite3.Database}
 */
function getConnection() {
  return new sqlite3.Database(DB_PATH);
}

/**
 * Get driver by username from admin_users table
 * @param {string} username - Driver username
 * @returns {Promise<object|null>} - Driver object or null if not found
 */
function getDriverByUsername(username) {
  return new Promise((resolve, reject) => {
    const db = getConnection();
    const sql = `
      SELECT * FROM admin_users
      WHERE username = ? AND role = 'driver'
    `;

    db.get(sql, [username], (err, row) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Get driver by ID
 * @param {number} driverId - Driver ID
 * @returns {Promise<object|null>} - Driver object or null if not found
 */
function getDriverById(driverId) {
  return new Promise((resolve, reject) => {
    const db = getConnection();
    const sql = `
      SELECT * FROM admin_users
      WHERE id = ? AND role = 'driver'
    `;

    db.get(sql, [driverId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Verify driver credentials
 * @param {string} username - Driver username
 * @param {string} password - Plain text password
 * @returns {Promise<object|null>} - Driver object if valid, null otherwise
 */
async function verifyDriverCredentials(username, password) {
  try {
    const driver = await getDriverByUsername(username);

    if (!driver) {
      return null;
    }

    // Check if driver is active
    if (!driver.is_active) {
      return null;
    }

    // Verify password (IMPORTANT: await the async function)
    const isValid = await verifyPassword(password, driver.password_hash);
    if (!isValid) {
      return null;
    }

    // Don't return password hash
    const { password_hash, ...driverWithoutPassword } = driver;
    return driverWithoutPassword;
  } catch (error) {
    console.error('Error verifying driver credentials:', error);
    return null;
  }
}

/**
 * Update driver's last login timestamp
 * @param {number} driverId - Driver ID
 * @returns {Promise<boolean>} - Success status
 */
function updateLastLogin(driverId) {
  return new Promise((resolve, reject) => {
    const db = getConnection();
    const sql = `
      UPDATE admin_users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ? AND role = 'driver'
    `;

    db.run(sql, [driverId], function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Get all active drivers
 * @returns {Promise<Array>} - Array of driver objects
 */
function getAllActiveDrivers() {
  return new Promise((resolve, reject) => {
    const db = getConnection();
    const sql = `
      SELECT id, username, email, full_name, is_active, created_at, last_login
      FROM admin_users
      WHERE role = 'driver' AND is_active = 1
      ORDER BY full_name
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

module.exports = {
  getDriverByUsername,
  getDriverById,
  verifyDriverCredentials,
  updateLastLogin,
  getAllActiveDrivers
};
