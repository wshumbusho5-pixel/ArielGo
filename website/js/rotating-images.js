// Rotating Images - GALLERY ONLY (No hero rotation)
// Hero stays STATIC with zoom effect. Gallery rotates on scroll-return.
(function() {
    'use strict';

    // Image sets - NO HERO ROTATION
    const imageSets = {
        gallery: [
            'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1200&q=80',
            'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&q=80',
            'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=1200&q=80',
            'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1200&q=80',
            'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=1200&q=80',
            'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&q=80',
        ],
        washfold: [
            'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80',
            'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80',
            'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80',
        ],
        drycleaning: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
            'https://images.unsplash.com/photo-1549037173-e3b717902c57?w=600&q=80',
        ],
        specialty: [
            'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=600&q=80',
            'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=600&q=80',
        ]
    };

    const imageIndexes = new Map();
    const hasLeftViewport = new Map();

    function init() {
        // NO HERO ROTATION - hero is static
        setupGalleryRotation();
        setupServiceImagesRotation();
        preloadImages();
    }

    function setupGalleryRotation() {
        const galleryImages = document.querySelectorAll('.gallery-image');
        galleryImages.forEach((img, index) => {
            img.style.transition = 'opacity 0.5s ease-in-out';
            imageIndexes.set(img, index % imageSets.gallery.length);
            hasLeftViewport.set(img, false);
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const img = entry.target;
                if (!entry.isIntersecting) {
                    hasLeftViewport.set(img, true);
                } else if (hasLeftViewport.get(img)) {
                    hasLeftViewport.set(img, false);
                    rotateImage(img, 'gallery');
                }
            });
        }, { threshold: 0, rootMargin: '-50px' });

        galleryImages.forEach(img => observer.observe(img));
    }

    function setupServiceImagesRotation() {
        const serviceImages = document.querySelectorAll('.rotating-service-img');
        serviceImages.forEach(img => {
            img.style.transition = 'opacity 0.5s ease-in-out';
            imageIndexes.set(img, 0);
            hasLeftViewport.set(img, false);
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const img = entry.target;
                const setName = img.dataset.imageSet;
                if (!setName || !imageSets[setName]) return;
                if (!entry.isIntersecting) {
                    hasLeftViewport.set(img, true);
                } else if (hasLeftViewport.get(img)) {
                    hasLeftViewport.set(img, false);
                    rotateImage(img, setName);
                }
            });
        }, { threshold: 0, rootMargin: '-30px' });

        serviceImages.forEach(img => observer.observe(img));
    }

    function rotateImage(imgElement, setName) {
        const images = imageSets[setName];
        if (!images || images.length === 0) return;
        let currentIndex = imageIndexes.get(imgElement) || 0;
        let newIndex = (currentIndex + 1) % images.length;
        imgElement.style.opacity = '0.6';
        setTimeout(() => {
            imgElement.src = images[newIndex];
            imageIndexes.set(imgElement, newIndex);
            setTimeout(() => { imgElement.style.opacity = '1'; }, 50);
        }, 300);
    }

    function preloadImages() {
        Object.values(imageSets).flat().forEach((src, i) => {
            setTimeout(() => { new Image().src = src; }, i * 100);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
