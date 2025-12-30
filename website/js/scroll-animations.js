/**
 * ArielGo Premium Scroll Effects
 * No fade-ins - only sophisticated interactions
 */

(function() {
    'use strict';

    const initPremiumEffects = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not loaded');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // ============================================
        // HERO ZOOM EFFECT - "COMING AT YOU" 3D PULL
        // Image starts deep and rushes toward viewer
        // ============================================

        const heroImage = document.querySelector('.hero-banner-image');
        const heroBanner = document.querySelector('.hero-banner');
        const heroContent = document.querySelector('.hero-banner-content');

        if (heroImage && heroBanner) {
            // Start slightly pulled back - like it's deep in the screen
            gsap.set(heroImage, {
                scale: 0.95,
                filter: 'brightness(0.9)'
            });

            // Create timeline for the "coming at you" effect
            const heroTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: heroBanner,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.3
                }
            });

            // Image RUSHES toward you - like coming out of the screen
            heroTimeline.to(heroImage, {
                scale: 1.8,
                filter: 'brightness(1.1)',
                ease: 'power2.in'
            }, 0);

            // Content gets pushed back/swallowed as image rushes forward
            if (heroContent) {
                heroTimeline.to(heroContent, {
                    scale: 0.8,
                    opacity: 0,
                    y: 50,
                    ease: 'power1.in'
                }, 0);
            }
        }

        // NO parallax on other images - only hero gets the effect

        // ============================================
        // 3D CARD TILT ON HOVER
        // ============================================

        document.querySelectorAll('.feature-card, .stat-card, .trust-badge, .how-step, .order-card, .speed-card, .story-value, .testimonial-card').forEach(card => {
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            card.style.transformStyle = 'preserve-3d';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });

        // ============================================
        // MAGNETIC BUTTONS
        // ============================================

        document.querySelectorAll('.btn-hero-primary, .btn-primary, .btn-nav-cta, .cta-button, .hero-banner-cta, .donation-cta').forEach(btn => {
            btn.style.transition = 'transform 0.15s ease';

            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });

        // ============================================
        // COUNTER ANIMATIONS
        // ============================================

        document.querySelectorAll('[data-count-to]').forEach(el => {
            const target = parseInt(el.dataset.countTo);
            const suffix = el.dataset.suffix || '';
            const originalText = el.textContent;
            let hasAnimated = false;

            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                onEnter: () => {
                    if (hasAnimated) return;
                    hasAnimated = true;

                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => {
                            if (target >= 1000) {
                                el.textContent = Math.round(obj.val).toLocaleString() + suffix;
                            } else {
                                el.textContent = Math.round(obj.val) + suffix;
                            }
                        }
                    });
                }
            });
        });

        // ============================================
        // ICONS - GENTLE FLOAT
        // ============================================

        document.querySelectorAll('.trust-icon, .feature-icon, .story-value-icon, .step-number').forEach(icon => {
            gsap.to(icon, {
                y: -5,
                duration: 2 + Math.random(),
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1
            });
        });

        // ============================================
        // SCROLL PROGRESS BAR
        // ============================================

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 2px;
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            transform-origin: left;
            transform: scaleX(0);
            z-index: 9999;
            width: 100%;
        `;
        document.body.appendChild(progressBar);

        gsap.to(progressBar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3
            }
        });

        // ============================================
        // CURSOR GLOW
        // ============================================

        const cursor = document.createElement('div');
        cursor.style.cssText = `
            position: fixed;
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 0;
            opacity: 0;
        `;
        document.body.appendChild(cursor);

        let cursorVisible = false;
        document.addEventListener('mousemove', (e) => {
            if (!cursorVisible) {
                cursor.style.opacity = '1';
                cursorVisible = true;
            }
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorVisible = false;
        });

        // ============================================
        // NAVBAR SHRINK ON SCROLL
        // ============================================

        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const originalPadding = window.getComputedStyle(navbar).padding;

            ScrollTrigger.create({
                start: 'top -50',
                onEnter: () => {
                    navbar.style.transition = 'all 0.3s ease';
                    navbar.style.padding = '0.5rem 2rem';
                    navbar.style.backdropFilter = 'blur(20px)';
                },
                onLeaveBack: () => {
                    navbar.style.padding = originalPadding;
                }
            });
        }

        // ============================================
        // SUBTLE PARALLAX ON SECTIONS
        // ============================================

        document.querySelectorAll('.how-step, .trust-badge, .feature-card').forEach((el, i) => {
            const speed = 0.02 + (i % 3) * 0.01;

            gsap.to(el, {
                yPercent: -5 * (i % 3 + 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: el.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // ============================================
        // HORIZONTAL GALLERY DRAG TO SCROLL
        // ============================================

        const galleryTrack = document.getElementById('galleryTrack');
        if (galleryTrack) {
            let isDown = false;
            let startX;
            let scrollLeft;

            galleryTrack.addEventListener('mousedown', (e) => {
                isDown = true;
                galleryTrack.style.cursor = 'grabbing';
                startX = e.pageX - galleryTrack.offsetLeft;
                scrollLeft = galleryTrack.scrollLeft;
            });

            galleryTrack.addEventListener('mouseleave', () => {
                isDown = false;
                galleryTrack.style.cursor = 'grab';
            });

            galleryTrack.addEventListener('mouseup', () => {
                isDown = false;
                galleryTrack.style.cursor = 'grab';
            });

            galleryTrack.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - galleryTrack.offsetLeft;
                const walk = (x - startX) * 2; // Scroll speed multiplier
                galleryTrack.scrollLeft = scrollLeft - walk;
            });

            // Touch support for mobile
            let touchStartX;
            let touchScrollLeft;

            galleryTrack.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].pageX - galleryTrack.offsetLeft;
                touchScrollLeft = galleryTrack.scrollLeft;
            }, { passive: true });

            galleryTrack.addEventListener('touchmove', (e) => {
                const x = e.touches[0].pageX - galleryTrack.offsetLeft;
                const walk = (x - touchStartX) * 1.5;
                galleryTrack.scrollLeft = touchScrollLeft - walk;
            }, { passive: true });
        }

        ScrollTrigger.refresh();
        console.log('✓ Premium effects loaded');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPremiumEffects);
    } else {
        initPremiumEffects();
    }

})();
