/**
 * ArielGo Premium Scroll Animations
 * Professional GSAP-powered scroll effects
 * No vibe coding - just premium, polished animations
 */

(function() {
    'use strict';

    // Wait for GSAP and ScrollTrigger to load
    const initAnimations = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not loaded');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Smooth scroll configuration
        const smoothConfig = {
            ease: 'power3.out',
            duration: 1
        };

        // ============================================
        // PARALLAX DEPTH SYSTEM
        // Elements move at different speeds for 3D depth
        // ============================================

        const initParallax = () => {
            // Slow parallax (background feel)
            document.querySelectorAll('[data-parallax="slow"]').forEach(el => {
                gsap.to(el, {
                    y: () => -ScrollTrigger.maxScroll(window) * 0.05,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el.closest('section') || el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.5
                    }
                });
            });

            // Medium parallax
            document.querySelectorAll('[data-parallax="medium"]').forEach(el => {
                gsap.to(el, {
                    y: () => -ScrollTrigger.maxScroll(window) * 0.1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el.closest('section') || el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            });

            // Fast parallax (foreground feel - comes OUT of screen)
            document.querySelectorAll('[data-parallax="fast"]').forEach(el => {
                gsap.to(el, {
                    y: () => -ScrollTrigger.maxScroll(window) * 0.2,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el.closest('section') || el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.5
                    }
                });
            });

            // Image parallax within container
            document.querySelectorAll('[data-parallax="image"]').forEach(container => {
                const img = container.querySelector('img');
                if (img) {
                    gsap.to(img, {
                        yPercent: -15,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true
                        }
                    });
                }
            });
        };

        // ============================================
        // REVEAL ANIMATIONS
        // Elements fade/slide in when entering viewport
        // ============================================

        const initRevealAnimations = () => {
            // Fade up reveals
            gsap.utils.toArray('[data-reveal="up"]').forEach(el => {
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        y: 60,
                        scale: 0.98
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            // Fade from left
            gsap.utils.toArray('[data-reveal="left"]').forEach(el => {
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        x: -80,
                        rotateY: 5
                    },
                    {
                        opacity: 1,
                        x: 0,
                        rotateY: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            // Fade from right
            gsap.utils.toArray('[data-reveal="right"]').forEach(el => {
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        x: 80,
                        rotateY: -5
                    },
                    {
                        opacity: 1,
                        x: 0,
                        rotateY: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            // Scale reveal (zoom in)
            gsap.utils.toArray('[data-reveal="scale"]').forEach(el => {
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        scale: 0.8
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 1.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            // 3D flip reveal
            gsap.utils.toArray('[data-reveal="flip"]').forEach(el => {
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        rotateX: 30,
                        y: 40,
                        transformPerspective: 1000
                    },
                    {
                        opacity: 1,
                        rotateX: 0,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        };

        // ============================================
        // STAGGER ANIMATIONS
        // Children animate in sequence
        // ============================================

        const initStaggerAnimations = () => {
            document.querySelectorAll('[data-stagger]').forEach(container => {
                const children = container.children;
                const direction = container.dataset.staggerDirection || 'up';
                const delay = parseFloat(container.dataset.staggerDelay) || 0.1;

                let fromVars = { opacity: 0, y: 40 };

                if (direction === 'left') fromVars = { opacity: 0, x: -40 };
                if (direction === 'right') fromVars = { opacity: 0, x: 40 };
                if (direction === 'scale') fromVars = { opacity: 0, scale: 0.9 };
                if (direction === 'rotate') fromVars = { opacity: 0, rotation: -10, y: 20 };

                gsap.fromTo(children,
                    fromVars,
                    {
                        opacity: 1,
                        y: 0,
                        x: 0,
                        scale: 1,
                        rotation: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: delay,
                        scrollTrigger: {
                            trigger: container,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        };

        // ============================================
        // SCRUB ANIMATIONS
        // Tied directly to scroll position
        // ============================================

        const initScrubAnimations = () => {
            // Rotate on scroll
            document.querySelectorAll('[data-scrub="rotate"]').forEach(el => {
                const rotation = parseFloat(el.dataset.scrubAmount) || 180;
                gsap.to(el, {
                    rotation: rotation,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            });

            // Scale on scroll
            document.querySelectorAll('[data-scrub="scale"]').forEach(el => {
                const scaleAmount = parseFloat(el.dataset.scrubAmount) || 1.2;
                gsap.fromTo(el,
                    { scale: 0.9 },
                    {
                        scale: scaleAmount,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom',
                            end: 'center center',
                            scrub: 1
                        }
                    }
                );
            });

            // Horizontal movement on scroll
            document.querySelectorAll('[data-scrub="horizontal"]').forEach(el => {
                const direction = el.dataset.scrubDirection === 'right' ? 100 : -100;
                gsap.fromTo(el,
                    { x: 0 },
                    {
                        x: direction,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: el.closest('section') || el,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.5
                        }
                    }
                );
            });
        };

        // ============================================
        // TEXT ANIMATIONS
        // Character and word-level animations
        // ============================================

        const initTextAnimations = () => {
            // Split text into words
            document.querySelectorAll('[data-text-reveal="words"]').forEach(el => {
                const text = el.textContent;
                const words = text.split(' ');
                el.innerHTML = words.map(word =>
                    `<span class="word-wrapper"><span class="word">${word}</span></span>`
                ).join(' ');

                const wordEls = el.querySelectorAll('.word');
                gsap.fromTo(wordEls,
                    {
                        y: '100%',
                        opacity: 0
                    },
                    {
                        y: '0%',
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.05,
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            // Split text into characters
            document.querySelectorAll('[data-text-reveal="chars"]').forEach(el => {
                const text = el.textContent;
                el.innerHTML = text.split('').map(char =>
                    char === ' ' ? ' ' : `<span class="char">${char}</span>`
                ).join('');

                const charEls = el.querySelectorAll('.char');
                gsap.fromTo(charEls,
                    {
                        opacity: 0,
                        y: 20,
                        rotateX: 90
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        stagger: 0.02,
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            // Line by line reveal
            document.querySelectorAll('[data-text-reveal="lines"]').forEach(el => {
                const lines = el.innerHTML.split('<br>');
                el.innerHTML = lines.map(line =>
                    `<span class="line-wrapper"><span class="line">${line}</span></span>`
                ).join('');

                const lineEls = el.querySelectorAll('.line');
                gsap.fromTo(lineEls,
                    {
                        y: '100%',
                        opacity: 0
                    },
                    {
                        y: '0%',
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.15,
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        };

        // ============================================
        // COUNTER ANIMATIONS
        // Numbers count up when visible
        // ============================================

        const initCounterAnimations = () => {
            document.querySelectorAll('[data-counter]').forEach(el => {
                const target = parseInt(el.dataset.counter) || parseInt(el.textContent) || 0;
                const suffix = el.dataset.counterSuffix || '';
                const prefix = el.dataset.counterPrefix || '';
                const duration = parseFloat(el.dataset.counterDuration) || 2;

                const counter = { value: 0 };

                gsap.to(counter, {
                    value: target,
                    duration: duration,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    onUpdate: () => {
                        el.textContent = prefix + Math.round(counter.value).toLocaleString() + suffix;
                    }
                });
            });
        };

        // ============================================
        // 3D CARD TILT EFFECT
        // Cards tilt towards cursor
        // ============================================

        const init3DCards = () => {
            document.querySelectorAll('[data-tilt]').forEach(card => {
                const intensity = parseFloat(card.dataset.tiltIntensity) || 10;

                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -intensity;
                    const rotateY = ((x - centerX) / centerX) * intensity;

                    gsap.to(card, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        duration: 0.3,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                });
            });
        };

        // ============================================
        // MAGNETIC BUTTONS
        // Buttons follow cursor slightly
        // ============================================

        const initMagneticButtons = () => {
            document.querySelectorAll('[data-magnetic]').forEach(btn => {
                const strength = parseFloat(btn.dataset.magneticStrength) || 0.3;

                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    gsap.to(btn, {
                        x: x * strength,
                        y: y * strength,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });

                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'elastic.out(1, 0.5)'
                    });
                });
            });
        };

        // ============================================
        // SECTION TRANSITIONS
        // Smooth color/opacity changes between sections
        // ============================================

        const initSectionTransitions = () => {
            document.querySelectorAll('[data-section-bg]').forEach(section => {
                const bgColor = section.dataset.sectionBg;

                ScrollTrigger.create({
                    trigger: section,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    onEnter: () => {
                        gsap.to('body', {
                            backgroundColor: bgColor,
                            duration: 0.5,
                            ease: 'power2.inOut'
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to('body', {
                            backgroundColor: '',
                            duration: 0.5,
                            ease: 'power2.inOut'
                        });
                    }
                });
            });
        };

        // ============================================
        // FLOATING ELEMENTS
        // Continuous subtle floating animation
        // ============================================

        const initFloatingElements = () => {
            document.querySelectorAll('[data-float]').forEach(el => {
                const intensity = parseFloat(el.dataset.floatIntensity) || 10;
                const duration = parseFloat(el.dataset.floatDuration) || 3;

                gsap.to(el, {
                    y: intensity,
                    duration: duration,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1
                });
            });
        };

        // ============================================
        // PROGRESS INDICATOR
        // Shows scroll progress
        // ============================================

        const initScrollProgress = () => {
            const progressBar = document.querySelector('[data-scroll-progress]');
            if (progressBar) {
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
            }
        };

        // ============================================
        // NAVBAR HIDE/SHOW
        // Hide navbar on scroll down, show on scroll up
        // ============================================

        const initNavbarBehavior = () => {
            const navbar = document.querySelector('[data-navbar-scroll]');
            if (!navbar) return;

            let lastScroll = 0;

            ScrollTrigger.create({
                start: 'top top',
                end: 'max',
                onUpdate: (self) => {
                    const scroll = self.scroll();
                    const direction = scroll > lastScroll ? 'down' : 'up';

                    if (direction === 'down' && scroll > 100) {
                        gsap.to(navbar, {
                            y: -100,
                            duration: 0.3,
                            ease: 'power2.inOut'
                        });
                    } else {
                        gsap.to(navbar, {
                            y: 0,
                            duration: 0.3,
                            ease: 'power2.inOut'
                        });
                    }

                    lastScroll = scroll;
                }
            });
        };

        // ============================================
        // IMAGE REVEAL MASK
        // Images reveal with a sliding mask
        // ============================================

        const initImageMaskReveal = () => {
            document.querySelectorAll('[data-mask-reveal]').forEach(container => {
                const direction = container.dataset.maskReveal || 'left';

                let clipFrom, clipTo;

                switch(direction) {
                    case 'left':
                        clipFrom = 'inset(0 100% 0 0)';
                        clipTo = 'inset(0 0% 0 0)';
                        break;
                    case 'right':
                        clipFrom = 'inset(0 0 0 100%)';
                        clipTo = 'inset(0 0 0 0%)';
                        break;
                    case 'top':
                        clipFrom = 'inset(0 0 100% 0)';
                        clipTo = 'inset(0 0 0% 0)';
                        break;
                    case 'bottom':
                        clipFrom = 'inset(100% 0 0 0)';
                        clipTo = 'inset(0% 0 0 0)';
                        break;
                }

                gsap.fromTo(container,
                    { clipPath: clipFrom },
                    {
                        clipPath: clipTo,
                        duration: 1.2,
                        ease: 'power3.inOut',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        };

        // ============================================
        // INITIALIZE ALL ANIMATIONS
        // ============================================

        const init = () => {
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                // Show all elements immediately without animation
                document.querySelectorAll('[data-reveal], [data-stagger] > *, [data-text-reveal]').forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
                return;
            }

            // Initialize all animation systems
            initParallax();
            initRevealAnimations();
            initStaggerAnimations();
            initScrubAnimations();
            initTextAnimations();
            initCounterAnimations();
            init3DCards();
            initMagneticButtons();
            initSectionTransitions();
            initFloatingElements();
            initScrollProgress();
            initNavbarBehavior();
            initImageMaskReveal();

            // Refresh ScrollTrigger after all initializations
            ScrollTrigger.refresh();
        };

        // Run initialization
        init();

        // Re-initialize on dynamic content load
        window.ArielGoScrollAnimations = {
            refresh: () => {
                ScrollTrigger.refresh();
            },
            init: init
        };
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
        initAnimations();
    }

    // Also initialize after window load for any late-loading content
    window.addEventListener('load', () => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    });

})();
