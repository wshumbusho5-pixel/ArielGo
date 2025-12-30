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

    // Initialize service type switching
    initServiceTypeSwitching();

    // Initialize quantity controls
    initQuantityControls();
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
        // Check service type and get appropriate quantity data
        const serviceType = formData.service;

        if (serviceType === 'dry-cleaning' || serviceType === 'specialty') {
            // Per-item services - get selected items
            const selectedItems = getSelectedItems();
            if (selectedItems.length === 0) {
                alert('Please select at least one item.');
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }
            formData.items = selectedItems;
            formData.numberOfBags = 0; // Not applicable for per-item services
        } else {
            // Wash & Fold - get number of bags
            const bagsInput = document.getElementById('bags') || document.querySelector('input[name="bags"]');
            formData.numberOfBags = bagsInput ? parseInt(bagsInput.value) || 1 : 1;
            formData.items = [];
        }

        // Send booking to backend
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',  // Send cookies to link booking to logged-in user
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            // Get service name for display
            const serviceName = getServiceName(formData.service);
            const totalPrice = result.booking.totalPrice / 100; // Convert cents to dollars

            // Build success message
            let message = `✅ Booking Confirmed!\n\nThank you, ${formData.name}!\n\nBooking ID: #${result.booking.id}\nService: ${serviceName}\nTotal: $${totalPrice.toFixed(2)}\nPickup: ${formData.pickupDate} (${getTimeDisplay(formData.pickupTime)})`;

            // Only mention email if it was actually sent
            if (result.emailSent) {
                message += `\n\nWe've sent a confirmation email to ${formData.email}.`;
            } else {
                message += `\n\nYour booking has been saved! We'll contact you at ${formData.phone} to confirm.`;
            }

            message += `\n\nWe'll see you at your pickup time!`;

            // Show success message
            alert(message);

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

// ==================================
// SERVICE TYPE SWITCHING
// ==================================
function initServiceTypeSwitching() {
    const serviceSelect = document.getElementById('service');
    if (!serviceSelect) return;

    serviceSelect.addEventListener('change', function() {
        const selectedService = this.value;

        // Get all sections
        const bagsSection = document.getElementById('bags-section');
        const dryCleaningSection = document.getElementById('dry-cleaning-section');
        const specialtySection = document.getElementById('specialty-section');
        const orderSummary = document.getElementById('order-summary');

        // Hide all sections first
        if (bagsSection) bagsSection.style.display = 'none';
        if (dryCleaningSection) dryCleaningSection.style.display = 'none';
        if (specialtySection) specialtySection.style.display = 'none';
        if (orderSummary) orderSummary.style.display = 'none';

        // Reset all item quantities when switching service
        document.querySelectorAll('.item-qty').forEach(input => {
            input.value = 0;
            input.closest('.item-selector').classList.remove('has-quantity');
        });

        // Show appropriate section based on service type
        if (selectedService === 'standard' || selectedService === 'same-day' || selectedService === 'rush') {
            // Wash & Fold - show bags section
            if (bagsSection) bagsSection.style.display = 'block';
        } else if (selectedService === 'dry-cleaning') {
            // Dry Cleaning - show item selection
            if (dryCleaningSection) dryCleaningSection.style.display = 'block';
            if (orderSummary) orderSummary.style.display = 'block';
        } else if (selectedService === 'specialty') {
            // Specialty Items - show specialty selection
            if (specialtySection) specialtySection.style.display = 'block';
            if (orderSummary) orderSummary.style.display = 'block';
        }

        // Update order summary
        updateOrderSummary();
    });
}

// ==================================
// QUANTITY CONTROLS
// ==================================
function initQuantityControls() {
    // Handle +/- button clicks
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            const quantityControl = this.closest('.quantity-control');
            const input = quantityControl.querySelector('.item-qty');
            const itemSelector = this.closest('.item-selector');

            let currentValue = parseInt(input.value) || 0;
            const min = parseInt(input.min) || 0;
            const max = parseInt(input.max) || 99;

            if (action === 'plus' && currentValue < max) {
                currentValue++;
            } else if (action === 'minus' && currentValue > min) {
                currentValue--;
            }

            input.value = currentValue;

            // Toggle has-quantity class for styling
            if (currentValue > 0) {
                itemSelector.classList.add('has-quantity');
            } else {
                itemSelector.classList.remove('has-quantity');
            }

            // Update order summary
            updateOrderSummary();
        });
    });

    // Handle manual input changes
    document.querySelectorAll('.item-qty').forEach(input => {
        input.addEventListener('change', function() {
            const itemSelector = this.closest('.item-selector');
            const currentValue = parseInt(this.value) || 0;

            if (currentValue > 0) {
                itemSelector.classList.add('has-quantity');
            } else {
                itemSelector.classList.remove('has-quantity');
            }

            updateOrderSummary();
        });
    });
}

// ==================================
// ORDER SUMMARY
// ==================================
function updateOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total-amount');
    const orderSummary = document.getElementById('order-summary');

    if (!summaryItems || !summaryTotal) return;

    // Get all items with quantity > 0
    const selectedItems = [];
    let total = 0;

    document.querySelectorAll('.item-qty').forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const itemSelector = input.closest('.item-selector');
            const itemName = itemSelector.querySelector('.item-name').textContent;
            const priceInCents = parseInt(input.dataset.price) || 0;
            const itemTotal = qty * priceInCents;

            selectedItems.push({
                name: itemName,
                qty: qty,
                price: priceInCents,
                total: itemTotal
            });

            total += itemTotal;
        }
    });

    // Update summary display
    if (selectedItems.length > 0) {
        summaryItems.innerHTML = selectedItems.map(item => `
            <div class="summary-item">
                <span class="summary-item-name">${item.name}</span>
                <span class="summary-item-qty">x${item.qty}</span>
                <span class="summary-item-price">$${(item.total / 100).toFixed(2)}</span>
            </div>
        `).join('');

        summaryTotal.textContent = `$${(total / 100).toFixed(2)}`;
        if (orderSummary) orderSummary.style.display = 'block';
    } else {
        summaryItems.innerHTML = '<p style="color: #9ca3af; font-size: 0.85rem;">No items selected yet</p>';
        summaryTotal.textContent = '$0.00';
    }
}

// ==================================
// GET SELECTED ITEMS FOR FORM SUBMISSION
// ==================================
function getSelectedItems() {
    const items = [];
    document.querySelectorAll('.item-qty').forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const itemSelector = input.closest('.item-selector');
            items.push({
                item: input.dataset.item,
                name: itemSelector.querySelector('.item-name').textContent,
                quantity: qty,
                priceInCents: parseInt(input.dataset.price) || 0
            });
        }
    });
    return items;
}
