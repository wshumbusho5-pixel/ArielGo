const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt (secure password hashing)
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 * Supports both bcrypt (new) and SHA256 (legacy) for migration
 * @param {string} password - Plain text password
 * @param {string} hash - Stored password hash
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, hash) {
  // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (hash.startsWith('$2')) {
    return await bcrypt.compare(password, hash);
  }

  // Legacy SHA256 support (for migration period)
  const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
  return sha256Hash === hash;
}

/**
 * Middleware to require driver authentication
 * Checks if request has valid driver session
 * Returns 401 if not authenticated
 */
function requireDriverAuth(req, res, next) {
  if (!req.session || !req.session.driver) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please login.'
    });
  }

  // Check if driver is active
  if (!req.session.driver.is_active) {
    return res.status(403).json({
      success: false,
      error: 'Account is deactivated. Please contact admin.'
    });
  }

  next();
}

/**
 * Middleware to require user (customer) authentication
 * Checks if request has valid user session
 * Returns 401 if not authenticated
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please login to use AI assistant.',
      requireLogin: true
    });
  }

  next();
}

/**
 * Check if request has authenticated driver session
 * @param {object} req - Express request object
 * @returns {boolean} - True if authenticated
 */
function isDriverAuthenticated(req) {
  return req.session && req.session.driver && req.session.driver.is_active;
}

/**
 * Check if request has authenticated user (customer) session
 * @param {object} req - Express request object
 * @returns {boolean} - True if authenticated
 */
function isUserAuthenticated(req) {
  return req.session && req.session.user;
}

module.exports = {
  hashPassword,
  verifyPassword,
  requireDriverAuth,
  requireAuth,
  isDriverAuthenticated,
  isUserAuthenticated
};
