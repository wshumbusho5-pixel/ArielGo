/**
 * ArielGo Admin Dashboard - Professional Interactions
 */

(function() {
    'use strict';

    // ============================================
    // AUTO-DISMISS ALERTS
    // ============================================

    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alert.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-8px)';
            setTimeout(() => alert.remove(), 300);
        }, 5000);

        // Click to dismiss
        alert.style.cursor = 'pointer';
        alert.addEventListener('click', () => {
            alert.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(20px)';
            setTimeout(() => alert.remove(), 200);
        });
    });

    // ============================================
    // TABLE ROW HOVER EFFECT
    // ============================================

    const tableRows = document.querySelectorAll('.bookings-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'scale(1.002)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'scale(1)';
        });
    });

    // ============================================
    // STAT CARD NUMBER ANIMATION
    // ============================================

    const statNumbers = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const animateValue = (element, start, end, duration) => {
        const startTime = performance.now();
        const isPrice = element.textContent.startsWith('$');

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOut = t => 1 - Math.pow(1 - t, 3);
            const current = start + (end - start) * easeOut(progress);

            if (isPrice) {
                element.textContent = '$' + current.toFixed(2);
            } else {
                element.textContent = Math.round(current);
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                let targetValue;

                if (text.startsWith('$')) {
                    targetValue = parseFloat(text.replace('$', '').replace(',', ''));
                } else {
                    targetValue = parseInt(text.replace(/,/g, ''));
                }

                if (!isNaN(targetValue) && targetValue > 0) {
                    animateValue(element, 0, targetValue, 1000);
                }

                statObserver.unobserve(element);
            }
        });
    }, observerOptions);

    statNumbers.forEach(num => statObserver.observe(num));

    // ============================================
    // FORM ENHANCEMENTS
    // ============================================

    // Add loading state to form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.classList.contains('loading')) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;

                // Store original content
                const originalContent = submitBtn.innerHTML;
                submitBtn.innerHTML = `
                    <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                    Processing...
                `;

                // Restore if form doesn't navigate (for validation errors)
                setTimeout(() => {
                    if (submitBtn.classList.contains('loading')) {
                        submitBtn.innerHTML = originalContent;
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }
                }, 3000);
            }
        });
    });

    // ============================================
    // STATUS SELECT ENHANCEMENT
    // ============================================

    const statusSelects = document.querySelectorAll('.status-select');
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            // Add visual feedback on change
            this.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.2)';
            setTimeout(() => {
                this.style.boxShadow = '';
            }, 300);
        });
    });

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search (if exists)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) searchInput.focus();
        }

        // Escape to close any modals or go back
        if (e.key === 'Escape') {
            const backBtn = document.querySelector('.btn-back');
            if (backBtn) backBtn.click();
        }
    });

    // ============================================
    // SMOOTH PAGE TRANSITIONS
    // ============================================

    document.querySelectorAll('a:not([target="_blank"])').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('/') && !href.startsWith('//')) {
                // Don't animate for form actions
                if (this.closest('form')) return;

                // Add fade out effect
                document.body.style.opacity = '0.95';
                document.body.style.transition = 'opacity 0.1s ease';
            }
        });
    });

    // ============================================
    // ACTION BUTTON CONFIRMATIONS
    // ============================================

    const deactivateButtons = document.querySelectorAll('.btn-action-deactivate');
    deactivateButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to deactivate this driver?')) {
                e.preventDefault();
            }
        });
    });

    // ============================================
    // RESPONSIVE TABLE SCROLL HINT
    // ============================================

    const tables = document.querySelectorAll('.bookings-table');
    tables.forEach(table => {
        const wrapper = table.closest('.table-container');
        if (wrapper && table.scrollWidth > wrapper.clientWidth) {
            wrapper.classList.add('scrollable');
        }
    });

    // ============================================
    // LIVE TIMESTAMP UPDATE
    // ============================================

    const updateTimestamps = () => {
        const timestamps = document.querySelectorAll('[data-timestamp]');
        timestamps.forEach(el => {
            const timestamp = new Date(el.dataset.timestamp);
            const now = new Date();
            const diff = Math.floor((now - timestamp) / 1000);

            let text;
            if (diff < 60) {
                text = 'Just now';
            } else if (diff < 3600) {
                const mins = Math.floor(diff / 60);
                text = `${mins} minute${mins > 1 ? 's' : ''} ago`;
            } else if (diff < 86400) {
                const hours = Math.floor(diff / 3600);
                text = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else {
                const days = Math.floor(diff / 86400);
                text = `${days} day${days > 1 ? 's' : ''} ago`;
            }

            el.textContent = text;
        });
    };

    // Update timestamps every minute
    updateTimestamps();
    setInterval(updateTimestamps, 60000);

    // ============================================
    // SEARCH BOOKINGS
    // ============================================

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

    // Make searchBookings available globally
    window.searchBookings = searchBookings;

    // ============================================
    // INITIALIZE
    // ============================================

    console.log('ArielGo Admin JS initialized');

})();
