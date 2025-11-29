// ==================================
// ARIELGO WEBSITE JAVASCRIPT
// ==================================

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log('ArielGo website loaded successfully!');

    // Initialize smooth scrolling
    initSmoothScrolling();

    // Initialize booking form
    initBookingForm();

    // Set minimum date for pickup (today)
    setMinimumPickupDate();
});

// ==================================
// SMOOTH SCROLLING FOR NAVIGATION
// ==================================
function initSmoothScrolling() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Smooth scroll to the section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================================
// SET MINIMUM PICKUP DATE
// ==================================
function setMinimumPickupDate() {
    const pickupDateInput = document.getElementById('pickup-date');

    if (pickupDateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        pickupDateInput.setAttribute('min', today);

        // Set default value to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        pickupDateInput.value = tomorrowString;
    }
}

// ==================================
// BOOKING FORM HANDLING
// ==================================
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                service: document.getElementById('service').value,
                address: document.getElementById('address').value,
                pickupDate: document.getElementById('pickup-date').value,
                pickupTime: document.getElementById('pickup-time').value,
                notes: document.getElementById('notes').value
            };

            // Validate form
            if (validateForm(formData)) {
                // Process the booking
                handleBooking(formData);
            }
        });
    }
}

// ==================================
// FORM VALIDATION
// ==================================
function validateForm(formData) {
    // Check if all required fields are filled
    if (!formData.name || !formData.phone || !formData.email ||
        !formData.service || !formData.address || !formData.pickupDate ||
        !formData.pickupTime) {
        alert('Please fill in all required fields.');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }

    return true;
}

// ==================================
// HANDLE BOOKING SUBMISSION
// ==================================
async function handleBooking(formData) {
    // Disable submit button to prevent double submission
    const submitButton = document.querySelector('#bookingForm button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    try {
        // Add number of bags to formData (default to 1 for now)
        formData.numberOfBags = 1;

        // Send booking to backend
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            // Get service name for display
            const serviceName = getServiceName(formData.service);
            const totalPrice = result.booking.totalPrice / 100; // Convert cents to dollars

            // Show success message
            alert(`✅ Booking Confirmed!\n\nThank you, ${formData.name}!\n\nBooking ID: #${result.booking.id}\nService: ${serviceName}\nTotal: $${totalPrice.toFixed(2)}\nPickup: ${formData.pickupDate} (${getTimeDisplay(formData.pickupTime)})\n\nWe've sent a confirmation email to ${formData.email}.\nWe'll see you at your pickup time!`);

            // Reset the form
            document.getElementById('bookingForm').reset();
            setMinimumPickupDate();

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Show error message
            alert(`❌ Booking Failed\n\n${result.error}\n\nPlease try again or contact us directly.`);
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert(`❌ Connection Error\n\nUnable to connect to the booking system.\n\nPlease check that the server is running or try again later.`);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// ==================================
// HELPER FUNCTIONS
// ==================================
function getServiceName(serviceValue) {
    const serviceMap = {
        'standard': 'Standard (24-hour) - $32',
        'same-day': 'Same-Day - $42',
        'rush': 'Rush (4-hour) - $50'
    };
    return serviceMap[serviceValue] || serviceValue;
}

function getTimeDisplay(timeValue) {
    const timeMap = {
        'morning': '8:00 AM - 12:00 PM',
        'afternoon': '12:00 PM - 5:00 PM',
        'evening': '5:00 PM - 8:00 PM'
    };
    return timeMap[timeValue] || timeValue;
}

// ==================================
// FUTURE ENHANCEMENTS (Coming Soon)
// ==================================

/*
 * TODO: Add these features as you learn more:
 *
 * 1. BACKEND INTEGRATION
 *    - Replace mailto with actual form submission to a server
 *    - Store bookings in a database
 *    - Send automated confirmation emails
 *
 * 2. PAYMENT INTEGRATION
 *    - Add Stripe or Square for payment processing
 *    - Allow prepayment or save card info
 *
 * 3. REAL-TIME FEATURES
 *    - Show available pickup time slots
 *    - Live driver tracking
 *    - SMS/email notifications
 *
 * 4. USER ACCOUNTS
 *    - Customer login/signup
 *    - Order history
 *    - Saved addresses and preferences
 *
 * 5. ANALYTICS
 *    - Track which services are most popular
 *    - Monitor conversion rates
 *    - A/B test different pricing displays
 */
