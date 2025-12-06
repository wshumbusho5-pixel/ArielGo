// ==================================
// PAYMENT SERVICE (Stripe Integration)
// ==================================

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Payment Intent for a booking
 * @param {Object} bookingData - Booking information
 * @returns {Promise<Object>} Payment intent with client secret
 */
async function createPaymentIntent(bookingData) {
    try {
        // Validate Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.log('⚠️  Stripe not configured - payments disabled');
            return {
                success: false,
                reason: 'Payment processing not configured',
                clientSecret: null
            };
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: bookingData.totalPrice, // Amount in cents
            currency: 'usd',
            description: `ArielGo Laundry - ${bookingData.service} service (${bookingData.numberOfBags} bag${bookingData.numberOfBags > 1 ? 's' : ''})`,
            metadata: {
                customer_name: bookingData.name,
                customer_email: bookingData.email,
                customer_phone: bookingData.phone,
                service: bookingData.service,
                bags: bookingData.numberOfBags.toString(),
                pickup_date: bookingData.pickupDate,
                pickup_time: bookingData.pickupTime || 'TBD'
            },
            // Automatically capture payment when authorized
            capture_method: 'automatic',
            // Payment method types
            payment_method_types: ['card'],
            // Receipt email
            receipt_email: bookingData.email
        });

        console.log(`✅ Payment intent created: ${paymentIntent.id} for $${(bookingData.totalPrice / 100).toFixed(2)}`);

        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount
        };

    } catch (error) {
        console.error('❌ Stripe payment error:', error.message);
        return {
            success: false,
            error: error.message,
            clientSecret: null
        };
    }
}

/**
 * Retrieve a payment intent status
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Payment intent details
 */
async function getPaymentStatus(paymentIntentId) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return { success: false, reason: 'Stripe not configured' };
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        return {
            success: true,
            status: paymentIntent.status, // 'succeeded', 'processing', 'requires_payment_method', etc.
            amount: paymentIntent.amount,
            paid: paymentIntent.status === 'succeeded'
        };

    } catch (error) {
        console.error('Error retrieving payment status:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Process a refund for a booking
 * @param {string} paymentIntentId - Original payment intent ID
 * @param {number} amount - Amount to refund in cents (optional, defaults to full refund)
 * @returns {Promise<Object>} Refund result
 */
async function processRefund(paymentIntentId, amount = null) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return { success: false, reason: 'Stripe not configured' };
        }

        const refundData = {
            payment_intent: paymentIntentId
        };

        // Partial refund if amount specified
        if (amount) {
            refundData.amount = amount;
        }

        const refund = await stripe.refunds.create(refundData);

        console.log(`✅ Refund processed: ${refund.id} for $${(refund.amount / 100).toFixed(2)}`);

        return {
            success: true,
            refundId: refund.id,
            amount: refund.amount,
            status: refund.status
        };

    } catch (error) {
        console.error('Error processing refund:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create a customer in Stripe (for repeat customers)
 * @param {Object} customerData - Customer information
 * @returns {Promise<Object>} Stripe customer
 */
async function createCustomer(customerData) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return { success: false, reason: 'Stripe not configured' };
        }

        const customer = await stripe.customers.create({
            email: customerData.email,
            name: customerData.name,
            phone: customerData.phone,
            metadata: {
                source: 'arielgo-laundry'
            }
        });

        console.log(`✅ Stripe customer created: ${customer.id}`);

        return {
            success: true,
            customerId: customer.id
        };

    } catch (error) {
        console.error('Error creating Stripe customer:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if Stripe is configured
 * @returns {boolean} True if Stripe API key is set
 */
function isConfigured() {
    return !!process.env.STRIPE_SECRET_KEY;
}

module.exports = {
    createPaymentIntent,
    getPaymentStatus,
    processRefund,
    createCustomer,
    isConfigured
};
