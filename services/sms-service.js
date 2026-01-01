// ==================================
// SMS SERVICE (Twilio Integration)
// ==================================

require('dotenv').config();

let twilioClient = null;

// Initialize Twilio client if valid credentials are provided
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;

if (twilioSid && twilioToken && twilioSid.startsWith('AC')) {
    try {
        const twilio = require('twilio');
        twilioClient = twilio(twilioSid, twilioToken);
        console.log('✅ Twilio SMS service initialized');
    } catch (error) {
        console.log('⚠️  Twilio initialization failed - SMS notifications disabled');
    }
} else {
    console.log('⚠️  Twilio not configured - SMS notifications disabled');
}

/**
 * Send an SMS message
 * @param {string} to - Phone number to send to (E.164 format)
 * @param {string} message - Message content
 * @returns {Promise<Object>} Result object
 */
async function sendSMS(to, message) {
    try {
        if (!twilioClient) {
            console.log('SMS not sent (Twilio not configured):', to);
            return {
                success: false,
                reason: 'SMS service not configured'
            };
        }

        // Ensure phone number is in E.164 format (+1234567890)
        const formattedPhone = formatPhoneNumber(to);

        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        console.log(`✅ SMS sent to ${to}: ${result.sid}`);

        return {
            success: true,
            messageSid: result.sid,
            status: result.status
        };

    } catch (error) {
        console.error('❌ SMS error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send booking confirmation SMS
 * @param {Object} booking - Booking details
 * @returns {Promise<Object>} Result object
 */
async function sendBookingConfirmation(booking) {
    const message = `ArielGo: Your laundry pickup is confirmed!
Order #${booking.id}
Service: ${formatService(booking.service)}
Bags: ${booking.numberOfBags}
Date: ${booking.pickupDate}
Time: ${booking.pickupTime || 'TBD'}
Total: $${(booking.totalPrice / 100).toFixed(2)}

Track: ${process.env.TRACKING_URL || 'http://localhost:3001'}/track.html?id=${booking.id}&email=${encodeURIComponent(booking.email)}

Reply STOP to unsubscribe`;

    return await sendSMS(booking.phone, message);
}

/**
 * Send status update SMS
 * @param {Object} booking - Booking details
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Result object
 */
async function sendStatusUpdate(booking, newStatus) {
    const statusMessages = {
        confirmed: `ArielGo: Order #${booking.id} confirmed! We'll pick up your laundry on ${booking.pickupDate}.`,
        in_progress: `ArielGo: We've picked up Order #${booking.id}! Your laundry is being processed.`,
        completed: `ArielGo: Order #${booking.id} is ready for delivery! Thank you for using ArielGo. 🧺✨`,
        cancelled: `ArielGo: Order #${booking.id} has been cancelled. Contact us if you have questions.`
    };

    const message = statusMessages[newStatus] || `ArielGo: Order #${booking.id} status updated to: ${newStatus}`;

    return await sendSMS(booking.phone, message);
}

/**
 * Send pickup reminder SMS (for scheduled pickups)
 * @param {Object} booking - Booking details
 * @returns {Promise<Object>} Result object
 */
async function sendPickupReminder(booking) {
    const message = `ArielGo Reminder: We'll pick up your laundry tomorrow ${booking.pickupDate} at ${booking.pickupTime || 'your scheduled time'}. Order #${booking.id}`;

    return await sendSMS(booking.phone, message);
}

/**
 * Send delivery notification SMS
 * @param {Object} booking - Booking details
 * @param {string} eta - Estimated time of arrival
 * @returns {Promise<Object>} Result object
 */
async function sendDeliveryNotification(booking, eta = '30 minutes') {
    const message = `ArielGo: Your laundry delivery for Order #${booking.id} is arriving in ${eta}! 🚗`;

    return await sendSMS(booking.phone, message);
}

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if missing (assume US +1)
    if (cleaned.length === 10) {
        cleaned = '1' + cleaned;
    }

    // Add + prefix
    return '+' + cleaned;
}

/**
 * Format service name for display
 * @param {string} service - Service code
 * @returns {string} Formatted service name
 */
function formatService(service) {
    const serviceMap = {
        'standard': 'Standard (24h)',
        'same-day': 'Same-Day',
        'rush': 'Rush (4h)'
    };
    return serviceMap[service] || service;
}

/**
 * Check if SMS service is configured
 * @returns {boolean} True if Twilio is configured
 */
function isConfigured() {
    return !!twilioClient;
}

module.exports = {
    sendSMS,
    sendBookingConfirmation,
    sendStatusUpdate,
    sendPickupReminder,
    sendDeliveryNotification,
    isConfigured
};
