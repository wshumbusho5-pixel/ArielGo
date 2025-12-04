// ArielGo Admin Dashboard JavaScript

// Auto-hide flash messages after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');

    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 5000);
    });
});

// Confirm status changes
const statusForms = document.querySelectorAll('.status-update-section form');

statusForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        const select = this.querySelector('select[name="status"]');
        const newStatus = select.value;

        if (!confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
            e.preventDefault();
        }
    });
});

// Add search functionality to bookings table (if needed in future)
function searchBookings(query) {
    const rows = document.querySelectorAll('.bookings-table tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
