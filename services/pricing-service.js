// ==================================
// PRICING SERVICE
// Handles all pricing calculations
// ==================================

// Pricing in cents (to avoid floating point errors)
const PRICING = {
    standard: {
        name: 'Standard (24-hour)',
        pricePerBag: 3200, // $32.00 in cents
        displayPrice: '$32',
        turnaround: '24 hours'
    },
    'same-day': {
        name: 'Same-Day',
        pricePerBag: 4200, // $42.00 in cents
        displayPrice: '$42',
        turnaround: 'Same day'
    },
    rush: {
        name: 'Rush (4-hour)',
        pricePerBag: 5000, // $50.00 in cents
        displayPrice: '$50',
        turnaround: '4 hours'
    }
};

/**
 * Get all pricing information
 */
function getAllPricing() {
    return Object.keys(PRICING).map(key => ({
        serviceType: key,
        ...PRICING[key],
        pricePerBagDollars: (PRICING[key].pricePerBag / 100).toFixed(2)
    }));
}

/**
 * Get pricing for a specific service
 */
function getServicePricing(serviceType) {
    if (!PRICING[serviceType]) {
        return null;
    }
    return {
        serviceType: serviceType,
        ...PRICING[serviceType],
        pricePerBagDollars: (PRICING[serviceType].pricePerBag / 100).toFixed(2)
    };
}

/**
 * Calculate total price for a booking
 * @param {string} serviceType - Type of service (standard, same-day, rush)
 * @param {number} numberOfBags - Number of bags to clean
 * @returns {object} Pricing breakdown
 */
function calculateBookingTotal(serviceType, numberOfBags) {
    // Validate service type
    if (!PRICING[serviceType]) {
        return {
            success: false,
            error: `Invalid service type: ${serviceType}. Must be one of: ${Object.keys(PRICING).join(', ')}`
        };
    }

    // Validate number of bags
    if (!numberOfBags || numberOfBags < 1) {
        return {
            success: false,
            error: 'Number of bags must be at least 1'
        };
    }

    const pricePerBag = PRICING[serviceType].pricePerBag;
    const totalCents = pricePerBag * numberOfBags;

    return {
        success: true,
        serviceType: serviceType,
        serviceName: PRICING[serviceType].name,
        pricePerBag: pricePerBag,
        pricePerBagDollars: (pricePerBag / 100).toFixed(2),
        numberOfBags: numberOfBags,
        total: totalCents,
        totalDollars: (totalCents / 100).toFixed(2),
        turnaround: PRICING[serviceType].turnaround,
        breakdown: {
            basePrice: `${PRICING[serviceType].displayPrice} per bag`,
            quantity: `${numberOfBags} bag${numberOfBags > 1 ? 's' : ''}`,
            total: `$${(totalCents / 100).toFixed(2)}`
        }
    };
}

/**
 * Format price in cents to dollar string
 */
function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate recommended pricing based on competitor analysis
 * (For future use when adjusting pricing)
 */
function getRecommendedPricing(competitorPrices) {
    // Average competitor pricing
    const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;

    // Price 15% below average (penetration pricing strategy)
    const recommendedPrice = Math.floor(avgCompetitorPrice * 0.85);

    return {
        averageCompetitorPrice: formatPrice(avgCompetitorPrice),
        recommendedPrice: formatPrice(recommendedPrice),
        strategy: 'Penetration pricing (15% below market average)'
    };
}

/**
 * Calculate monthly subscription pricing
 * (For future subscription feature)
 */
function calculateSubscriptionDiscount(monthlyBags, serviceType) {
    const normalPricing = calculateBookingTotal(serviceType, monthlyBags);

    if (!normalPricing.success) {
        return normalPricing;
    }

    // 20% discount for subscription customers
    const discountRate = 0.20;
    const discountedTotal = Math.floor(normalPricing.total * (1 - discountRate));
    const savings = normalPricing.total - discountedTotal;

    return {
        success: true,
        normalTotal: normalPricing.total,
        normalTotalDollars: normalPricing.totalDollars,
        discountRate: `${discountRate * 100}%`,
        subscriptionTotal: discountedTotal,
        subscriptionTotalDollars: formatPrice(discountedTotal),
        savings: savings,
        savingsDollars: formatPrice(savings)
    };
}

// Export all functions
module.exports = {
    getAllPricing,
    getServicePricing,
    calculateBookingTotal,
    formatPrice,
    getRecommendedPricing,
    calculateSubscriptionDiscount,
    PRICING
};
