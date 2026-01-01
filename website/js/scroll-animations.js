/**
 * ArielGo Premium Scroll Effects
 * Apple-inspired animations with GSAP + ScrollTrigger
 */

(function() {
    'use strict';

    // ============================================
    // TEXT SPLITTING UTILITY
    // ============================================

    function splitTextIntoWords(element) {
        if (!element || element.dataset.split === 'true') return [];

        const text = element.textContent;
        const words = text.split(' ').filter(w => w.length > 0);

        element.innerHTML = words.map(word =>
            `<span class="word"><span class="word-inner">${word}</span></span>`
        ).join(' ');

        element.dataset.split = 'true';
        return element.querySelectorAll('.word-inner');
    }

    function splitTextIntoChars(element) {
        if (!element || element.dataset.split === 'true') return [];

        const text = element.textContent;
        const chars = text.split('');

        element.innerHTML = chars.map(char =>
            char === ' ' ? ' ' : `<span class="char">${char}</span>`
        ).join('');

        element.dataset.split = 'true';
        return element.querySelectorAll('.char');
    }

    // ============================================
    // MAIN INITIALIZATION
    // ============================================

    const initAppleEffects = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not loaded');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.log('Reduced motion preferred - minimal animations');
            return initMinimalEffects();
        }

        // ============================================
        // HERO SECTION - THE SHOWSTOPPER
        // ============================================

        const heroBanner = document.querySelector('.hero-banner');
        const heroImage = document.querySelector('.hero-banner-image');
        const heroContent = document.querySelector('.hero-banner-content');
        const heroHeadline = document.querySelector('.hero-banner h1');
        const heroSubtext = document.querySelector('.hero-banner p');
        const heroCTA = document.querySelector('.hero-banner-cta');

        if (heroBanner && heroHeadline) {
            // Split headline into words for animation
            const headlineWords = splitTextIntoWords(heroHeadline);

            // Initial states
            gsap.set(headlineWords, {
                y: 80,
                opacity: 0,
                rotationX: -40
            });

            if (heroSubtext) {
                gsap.set(heroSubtext, { y: 30, opacity: 0 });
            }

            if (heroCTA) {
                gsap.set(heroCTA, { y: 30, opacity: 0, scale: 0.9 });
            }

            // Hero entrance timeline (plays on load)
            const heroEntrance = gsap.timeline({ delay: 0.3 });

            heroEntrance
                .to(headlineWords, {
                    y: 0,
                    opacity: 1,
                    rotationX: 0,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power3.out'
                })
                .to(heroSubtext, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power2.out'
                }, '-=0.5')
                .to(heroCTA, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                }, '-=0.4');

            // Hero scroll timeline (plays as you scroll)
            if (heroImage) {
                const heroScrollTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: heroBanner,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.5
                    }
                });

                heroScrollTL
                    .to(heroImage, {
                        scale: 1.3,
                        y: 100,
                        ease: 'none'
                    }, 0)
                    .to(heroContent, {
                        y: -80,
                        opacity: 0,
                        ease: 'power1.in'
                    }, 0);
            }
        }

        // ============================================
        // SECTION HEADERS - TEXT REVEAL
        // ============================================

        document.querySelectorAll('.section-header h2, .story-section h2').forEach(heading => {
            const words = splitTextIntoWords(heading);

            gsap.set(words, { y: 60, opacity: 0 });

            gsap.to(words, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.05,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Section subtext fade in
        document.querySelectorAll('.section-header p').forEach(subtext => {
            gsap.set(subtext, { y: 30, opacity: 0 });

            gsap.to(subtext, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: subtext,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // ============================================
        // HOW IT WORKS - STAGGER SEQUENCE
        // ============================================

        const howSteps = document.querySelectorAll('.how-step');
        if (howSteps.length) {
            gsap.set(howSteps, { y: 80, opacity: 0 });

            gsap.to(howSteps, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.how-it-works',
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // PRICING CARDS - DRAMATIC ENTRANCE
        // ============================================

        const speedCards = document.querySelectorAll('.speed-card');
        if (speedCards.length) {
            gsap.set(speedCards, {
                y: 100,
                opacity: 0,
                scale: 0.9
            });

            gsap.to(speedCards, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.services-section',
                    start: 'top 65%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // TRUST BADGES - SCALE IN
        // ============================================

        const trustBadges = document.querySelectorAll('.trust-badge');
        if (trustBadges.length) {
            gsap.set(trustBadges, {
                scale: 0.8,
                opacity: 0
            });

            gsap.to(trustBadges, {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: '.trust-section',
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // TESTIMONIALS - SLIDE IN
        // ============================================

        const testimonialCards = document.querySelectorAll('.testimonial-card');
        if (testimonialCards.length) {
            gsap.set(testimonialCards, {
                x: 60,
                opacity: 0
            });

            gsap.to(testimonialCards, {
                x: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.testimonials-section',
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // FEATURE CARDS - GRID STAGGER
        // ============================================

        const featureCards = document.querySelectorAll('.feature-card');
        if (featureCards.length) {
            gsap.set(featureCards, {
                y: 60,
                opacity: 0
            });

            gsap.to(featureCards, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: {
                    each: 0.1,
                    grid: 'auto',
                    from: 'start'
                },
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '#features',
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // STORY VALUES - STAGGER FROM CENTER
        // ============================================

        const storyValues = document.querySelectorAll('.story-value');
        if (storyValues.length) {
            gsap.set(storyValues, {
                y: 50,
                opacity: 0,
                scale: 0.95
            });

            gsap.to(storyValues, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.7,
                stagger: {
                    each: 0.15,
                    from: 'center'
                },
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.story-section',
                    start: 'top 60%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // BOOKING FORM - SMOOTH REVEAL
        // ============================================

        const bookingForm = document.querySelector('.booking-form');
        if (bookingForm) {
            gsap.set(bookingForm, {
                y: 40,
                opacity: 0
            });

            gsap.to(bookingForm, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '#booking',
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // 3D CARD TILT - ENHANCED
        // ============================================

        const tiltCards = document.querySelectorAll('.feature-card, .stat-card, .trust-badge, .how-step, .speed-card, .story-value, .testimonial-card');

        tiltCards.forEach(card => {
            card.style.transition = 'transform 0.3s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.3s ease';
            card.style.transformStyle = 'preserve-3d';
            card.style.willChange = 'transform';

            let bounds;

            const rotateCard = (e) => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const leftX = mouseX - bounds.x;
                const topY = mouseY - bounds.y;
                const center = {
                    x: leftX - bounds.width / 2,
                    y: topY - bounds.height / 2
                };
                const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

                card.style.transform = `
                    perspective(1000px)
                    rotateX(${center.y / -15}deg)
                    rotateY(${center.x / 15}deg)
                    scale3d(1.03, 1.03, 1.03)
                `;
                card.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
            };

            card.addEventListener('mouseenter', () => {
                bounds = card.getBoundingClientRect();
                document.addEventListener('mousemove', rotateCard);
            });

            card.addEventListener('mouseleave', () => {
                document.removeEventListener('mousemove', rotateCard);
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                card.style.boxShadow = '';
            });
        });

        // ============================================
        // MAGNETIC BUTTONS - ENHANCED
        // ============================================

        const magneticBtns = document.querySelectorAll('.btn-hero-primary, .btn-primary, .btn-nav-cta, .cta-button, .hero-banner-cta, .donation-cta');

        magneticBtns.forEach(btn => {
            btn.style.transition = 'transform 0.3s cubic-bezier(0.03, 0.98, 0.52, 0.99)';

            let bounds;

            const magnetize = (e) => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const leftX = mouseX - bounds.x;
                const topY = mouseY - bounds.y;
                const center = {
                    x: leftX - bounds.width / 2,
                    y: topY - bounds.height / 2
                };

                btn.style.transform = `translate(${center.x * 0.3}px, ${center.y * 0.3}px) scale(1.05)`;
            };

            btn.addEventListener('mouseenter', () => {
                bounds = btn.getBoundingClientRect();
                document.addEventListener('mousemove', magnetize);
            });

            btn.addEventListener('mouseleave', () => {
                document.removeEventListener('mousemove', magnetize);
                btn.style.transform = 'translate(0, 0) scale(1)';
            });

            // Ripple effect on click
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.classList.add('btn-ripple');

                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

                btn.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // ============================================
        // COUNTER ANIMATIONS - ENHANCED
        // ============================================

        document.querySelectorAll('[data-count-to]').forEach(el => {
            const target = parseInt(el.dataset.countTo);
            const suffix = el.dataset.suffix || '';
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
                        duration: 2.5,
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
        // FLOATING ICONS - SUBTLE
        // ============================================

        document.querySelectorAll('.trust-icon, .feature-icon, .story-value-icon, .step-number').forEach((icon, i) => {
            gsap.to(icon, {
                y: -6,
                duration: 2.5 + (i * 0.2),
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1
            });
        });

        // ============================================
        // SCROLL PROGRESS BAR
        // ============================================

        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
            transform-origin: left;
            transform: scaleX(0);
            z-index: 9999;
            width: 100%;
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
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
        // CURSOR GLOW EFFECT
        // ============================================

        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        cursorGlow.style.cssText = `
            position: fixed;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 0;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(cursorGlow);

        let cursorVisible = false;
        let cursorX = 0, cursorY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            if (!cursorVisible) {
                cursorGlow.style.opacity = '1';
                cursorVisible = true;
            }
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
            cursorVisible = false;
        });

        // Smooth cursor follow
        function updateCursor() {
            glowX += (cursorX - glowX) * 0.1;
            glowY += (cursorY - glowY) * 0.1;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // ============================================
        // NAVBAR - SMART HIDE/SHOW
        // ============================================

        const navbar = document.querySelector('.navbar');
        if (navbar) {
            let lastScroll = 0;
            const originalPadding = window.getComputedStyle(navbar).padding;

            ScrollTrigger.create({
                start: 'top -80',
                onUpdate: (self) => {
                    const currentScroll = window.pageYOffset;

                    // Shrink navbar on scroll
                    if (currentScroll > 50) {
                        navbar.style.padding = '0.5rem 2rem';
                        navbar.style.backdropFilter = 'blur(20px)';
                        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    } else {
                        navbar.style.padding = originalPadding;
                        navbar.style.backdropFilter = '';
                        navbar.style.background = '';
                    }

                    lastScroll = currentScroll;
                }
            });
        }

        // ============================================
        // GALLERY DRAG SCROLL
        // ============================================

        const galleryTrack = document.getElementById('galleryTrack');
        if (galleryTrack) {
            let isDown = false;
            let startX;
            let scrollLeft;
            let velocity = 0;

            galleryTrack.style.cursor = 'grab';

            galleryTrack.addEventListener('mousedown', (e) => {
                isDown = true;
                galleryTrack.style.cursor = 'grabbing';
                startX = e.pageX - galleryTrack.offsetLeft;
                scrollLeft = galleryTrack.scrollLeft;
                velocity = 0;
            });

            galleryTrack.addEventListener('mouseleave', () => {
                isDown = false;
                galleryTrack.style.cursor = 'grab';
            });

            galleryTrack.addEventListener('mouseup', () => {
                isDown = false;
                galleryTrack.style.cursor = 'grab';
                // Momentum scroll
                const momentum = () => {
                    if (Math.abs(velocity) > 0.5) {
                        galleryTrack.scrollLeft += velocity;
                        velocity *= 0.95;
                        requestAnimationFrame(momentum);
                    }
                };
                momentum();
            });

            galleryTrack.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - galleryTrack.offsetLeft;
                const walk = (x - startX) * 2;
                velocity = (x - startX) * 0.2;
                galleryTrack.scrollLeft = scrollLeft - walk;
            });

            // Touch support
            let touchStartX;
            let touchScrollLeft;
            let touchVelocity = 0;

            galleryTrack.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].pageX - galleryTrack.offsetLeft;
                touchScrollLeft = galleryTrack.scrollLeft;
            }, { passive: true });

            galleryTrack.addEventListener('touchmove', (e) => {
                const x = e.touches[0].pageX - galleryTrack.offsetLeft;
                const walk = (x - touchStartX) * 1.5;
                touchVelocity = (x - touchStartX) * 0.15;
                galleryTrack.scrollLeft = touchScrollLeft - walk;
            }, { passive: true });

            galleryTrack.addEventListener('touchend', () => {
                const momentum = () => {
                    if (Math.abs(touchVelocity) > 0.5) {
                        galleryTrack.scrollLeft += touchVelocity;
                        touchVelocity *= 0.95;
                        requestAnimationFrame(momentum);
                    }
                };
                momentum();
            }, { passive: true });
        }

        // ============================================
        // PROMISE SECTION - HONEST SOCIAL PROOF
        // ============================================

        const promiseCards = document.querySelectorAll('.promise-card');
        if (promiseCards.length) {
            gsap.set(promiseCards, {
                y: 60,
                opacity: 0
            });

            gsap.to(promiseCards, {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.promise-section',
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        }

        const firstCustomerCTA = document.querySelector('.first-customer-cta');
        if (firstCustomerCTA) {
            gsap.set(firstCustomerCTA, {
                y: 40,
                opacity: 0,
                scale: 0.98
            });

            gsap.to(firstCustomerCTA, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: firstCustomerCTA,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ============================================
        // DONATION SECTION - SPECIAL TREATMENT
        // ============================================

        const donationSection = document.querySelector('.donation-section');
        if (donationSection) {
            const donationContent = donationSection.querySelector('.donation-content');
            const donationVisual = donationSection.querySelector('.donation-visual');

            if (donationContent) {
                gsap.set(donationContent, { x: -50, opacity: 0 });
                gsap.to(donationContent, {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: donationSection,
                        start: 'top 70%'
                    }
                });
            }

            if (donationVisual) {
                gsap.set(donationVisual, { x: 50, opacity: 0 });
                gsap.to(donationVisual, {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: 0.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: donationSection,
                        start: 'top 70%'
                    }
                });
            }
        }

        ScrollTrigger.refresh();
        console.log('Apple-level effects loaded');
    };

    // ============================================
    // MINIMAL EFFECTS (for reduced motion)
    // ============================================

    const initMinimalEffects = () => {
        // Just show everything, no animations
        document.querySelectorAll('.word-inner, .char').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    };

    // ============================================
    // PAGE LOADER
    // ============================================

    const initPageLoader = () => {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            // Hide loader after content loads
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loader.classList.add('loaded');
                }, 800);
            });

            // Fallback - hide after 3 seconds max
            setTimeout(() => {
                loader.classList.add('loaded');
            }, 3000);
        }
    };

    // ============================================
    // CUSTOM CURSOR
    // ============================================

    const initCustomCursor = () => {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');

        if (!dot || !ring) return;

        // Check for touch device
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            dot.style.display = 'none';
            ring.style.display = 'none';
            return;
        }

        let mouseX = 0, mouseY = 0;
        let dotX = 0, dotY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor animation
        const animateCursor = () => {
            // Dot follows closely
            dotX += (mouseX - dotX) * 0.3;
            dotY += (mouseY - dotY) * 0.3;
            dot.style.left = dotX + 'px';
            dot.style.top = dotY + 'px';

            // Ring follows with more lag
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Click effect
        document.addEventListener('mousedown', () => {
            dot.classList.add('clicking');
        });

        document.addEventListener('mouseup', () => {
            dot.classList.remove('clicking');
        });

        // Hover effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn-book-unique, .speed-card, .feature-card, .trust-badge');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                ring.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                ring.classList.remove('hovering');
            });
        });

        // Center cursor elements
        dot.style.transform = 'translate(-50%, -50%)';
        ring.style.transform = 'translate(-50%, -50%)';
    };

    // ============================================
    // INITIALIZE
    // ============================================

    // Start loader immediately
    initPageLoader();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initAppleEffects();
            initCustomCursor();
        });
    } else {
        initAppleEffects();
        initCustomCursor();
    }

})();
