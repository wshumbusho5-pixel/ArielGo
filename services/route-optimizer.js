// ==================================
// ROUTE OPTIMIZATION SERVICE
// Optimizes driver routes for pickups and deliveries
// ==================================

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in miles
 */
function calculateDistance(point1, point2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Optimize route using nearest neighbor algorithm
 * @param {Array} bookings - Array of booking objects with geocoded addresses
 * @param {Object} startLocation - Starting location {lat, lng}
 * @returns {Object} Optimized route
 */
function optimizeRoute(bookings, startLocation = null) {
    if (!bookings || bookings.length === 0) {
        return {
            route: [],
            totalDistance: 0,
            estimatedTime: 0
        };
    }

    // Filter bookings that have geocoded coordinates
    const geocodedBookings = bookings.filter(b => b.lat && b.lng);

    if (geocodedBookings.length === 0) {
        // Return original order if no geocoding available
        return {
            route: bookings,
            totalDistance: 0,
            estimatedTime: 0,
            note: 'Geocoding required for route optimization'
        };
    }

    // Use first booking as start if no start location provided
    const start = startLocation || {
        lat: geocodedBookings[0].lat,
        lng: geocodedBookings[0].lng
    };

    const unvisited = [...geocodedBookings];
    const route = [];
    let currentLocation = start;
    let totalDistance = 0;

    // Nearest neighbor algorithm
    while (unvisited.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        // Find nearest unvisited booking
        for (let i = 0; i < unvisited.length; i++) {
            const distance = calculateDistance(currentLocation, {
                lat: unvisited[i].lat,
                lng: unvisited[i].lng
            });

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }

        // Add nearest to route
        const nearest = unvisited.splice(nearestIndex, 1)[0];
        route.push(nearest);
        totalDistance += nearestDistance;

        // Update current location
        currentLocation = {
            lat: nearest.lat,
            lng: nearest.lng
        };
    }

    // Estimate time (assuming 30 mph average with stops)
    const estimatedTime = Math.ceil((totalDistance / 30) * 60 + (route.length * 5)); // minutes

    return {
        route: route,
        totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
        estimatedTime: estimatedTime,
        stops: route.length
    };
}

/**
 * Group bookings by time window
 * @param {Array} bookings - All bookings
 * @returns {Object} Bookings grouped by time window
 */
function groupByTimeWindow(bookings) {
    const groups = {
        morning: [],    // 8 AM - 12 PM
        afternoon: [],  // 12 PM - 5 PM
        evening: []     // 5 PM - 8 PM
    };

    bookings.forEach(booking => {
        const timeWindow = booking.pickupTime || 'afternoon';
        if (groups[timeWindow]) {
            groups[timeWindow].push(booking);
        }
    });

    return groups;
}

/**
 * Generate optimized routes for a specific date
 * @param {Array} bookings - Bookings for the date
 * @param {Object} options - Optimization options
 * @returns {Array} Optimized routes by time window
 */
function generateDailyRoutes(bookings, options = {}) {
    const grouped = groupByTimeWindow(bookings);
    const routes = [];

    // Optimize each time window separately
    for (const [timeWindow, windowBookings] of Object.entries(grouped)) {
        if (windowBookings.length > 0) {
            const optimized = optimizeRoute(windowBookings, options.startLocation);

            routes.push({
                timeWindow: timeWindow,
                ...optimized,
                timeRange: getTimeRange(timeWindow)
            });
        }
    }

    return routes;
}

/**
 * Get time range for a time window
 * @param {string} timeWindow - Time window name
 * @returns {string} Time range string
 */
function getTimeRange(timeWindow) {
    const ranges = {
        'morning': '8:00 AM - 12:00 PM',
        'afternoon': '12:00 PM - 5:00 PM',
        'evening': '5:00 PM - 8:00 PM'
    };
    return ranges[timeWindow] || timeWindow;
}

/**
 * Geocode address using a simple geocoding service
 * NOTE: In production, use Google Maps Geocoding API or similar
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} Geocoded coordinates
 */
async function geocodeAddress(address) {
    // This is a placeholder - in production, use a real geocoding service
    // For now, return mock coordinates for demo purposes

    // You could use Google Maps Geocoding API:
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    console.log(`Geocoding address: ${address}`);

    // Return mock coordinates (Seattle area)
    // In production, make actual API call
    return {
        lat: 47.6062 + (Math.random() - 0.5) * 0.1,
        lng: -122.3321 + (Math.random() - 0.5) * 0.1,
        formatted_address: address
    };
}

/**
 * Batch geocode multiple bookings
 * @param {Array} bookings - Bookings to geocode
 * @returns {Promise<Array>} Bookings with geocoded coordinates
 */
async function geocodeBookings(bookings) {
    const geocoded = [];

    for (const booking of bookings) {
        try {
            const coords = await geocodeAddress(booking.address);
            geocoded.push({
                ...booking,
                lat: coords.lat,
                lng: coords.lng
            });
        } catch (error) {
            console.error(`Failed to geocode address: ${booking.address}`, error);
            // Include without coordinates
            geocoded.push(booking);
        }
    }

    return geocoded;
}

/**
 * Calculate route metrics
 * @param {Array} route - Optimized route
 * @returns {Object} Route metrics
 */
function calculateRouteMetrics(route) {
    let totalDistance = 0;
    let totalStops = route.length;

    for (let i = 0; i < route.length - 1; i++) {
        if (route[i].lat && route[i + 1].lat) {
            totalDistance += calculateDistance(
                { lat: route[i].lat, lng: route[i].lng },
                { lat: route[i + 1].lat, lng: route[i + 1].lng }
            );
        }
    }

    return {
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalStops: totalStops,
        estimatedTime: Math.ceil((totalDistance / 30) * 60 + (totalStops * 5)),
        averageStopDistance: totalStops > 1 ? Math.round((totalDistance / (totalStops - 1)) * 10) / 10 : 0
    };
}

module.exports = {
    optimizeRoute,
    generateDailyRoutes,
    groupByTimeWindow,
    geocodeAddress,
    geocodeBookings,
    calculateDistance,
    calculateRouteMetrics
};
