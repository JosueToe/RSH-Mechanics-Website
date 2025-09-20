// Language switching functionality
class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.langToggle = document.getElementById('lang-toggle');
        this.init();
    }

    init() {
        this.langToggle.addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // Set initial language based on browser preference
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('es')) {
            this.setLanguage('es');
        }
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'es' : 'en';
        this.setLanguage(newLang);
    }

    setLanguage(lang) {
        this.currentLang = lang;
        
        // Update toggle button
        this.langToggle.textContent = lang === 'en' ? 'ES' : 'EN';
        
        // Update all elements with language attributes
        const elements = document.querySelectorAll('[data-en][data-es]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Store preference
        localStorage.setItem('preferred-language', lang);
    }
}

// OpenStreetMap Integration using Leaflet
function initMap() {
    // East South Florida coordinates (centered to cover from Coral Springs to Homestead)
    const eastSouthFlorida = [25.6586, -80.2707]; // Moved south to cover Homestead area
    
    // Initialize the map
    const map = L.map('map').setView(eastSouthFlorida, 8);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Service area circle (70km radius to cover east South Florida from Coral Springs to Homestead)
    const serviceArea = L.circle(eastSouthFlorida, {
        color: '#e53e3e',
        fillColor: '#e53e3e',
        fillOpacity: 0.15,
        radius: 70000 // 70km radius in meters to include Homestead
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
        html: '<i class="fas fa-wrench" style="color: #e53e3e; font-size: 20px;"></i>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
    });

    // Add marker for service area center
    const marker = L.marker(eastSouthFlorida, { icon: customIcon }).addTo(map);

    // Popup content
    const popupContent = `
        <div style="padding: 10px; text-align: center;">
            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 16px;">RSG Mobile Mechanics</h3>
            <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">Professional mobile auto repair<br>serving East South Florida to Homestead</p>
            <p style="margin: 0; font-weight: bold; color: #e53e3e; font-size: 16px;">(863) 223-9932</p>
            <div style="margin-top: 8px;">
                <a href="tel:8632239932" style="background: #e53e3e; color: white; padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 12px;">Call Now</a>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);

    // Add service area tooltip
    serviceArea.bindTooltip('RSG Mobile Mechanics Service Area', {
        permanent: false,
        direction: 'center'
    });

    // Fit map to service area bounds
    map.fitBounds(serviceArea.getBounds(), { padding: [20, 20] });
}

// Smooth scrolling for navigation links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Mobile menu functionality
class MobileMenu {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (this.menuBtn && this.navLinks) {
            this.menuBtn.addEventListener('click', () => {
                this.toggle();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.menuBtn.contains(e.target) && !this.navLinks.contains(e.target)) {
                    this.close();
                }
            });

            // Close menu when window is resized to desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && this.isOpen) {
                    this.close();
                }
            });
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.navLinks.style.display = 'flex';
        this.navLinks.style.flexDirection = 'column';
        this.navLinks.style.position = 'absolute';
        this.navLinks.style.top = '70px';
        this.navLinks.style.left = '0';
        this.navLinks.style.right = '0';
        this.navLinks.style.background = 'rgba(255, 255, 255, 0.98)';
        this.navLinks.style.backdropFilter = 'blur(10px)';
        this.navLinks.style.padding = '20px';
        this.navLinks.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        this.navLinks.style.borderTop = '1px solid var(--light-gray)';
        
        this.menuBtn.innerHTML = '<i class="fas fa-times"></i>';
        this.isOpen = true;
    }

    close() {
        this.navLinks.style.display = '';
        this.navLinks.style.flexDirection = '';
        this.navLinks.style.position = '';
        this.navLinks.style.top = '';
        this.navLinks.style.left = '';
        this.navLinks.style.right = '';
        this.navLinks.style.background = '';
        this.navLinks.style.backdropFilter = '';
        this.navLinks.style.padding = '';
        this.navLinks.style.boxShadow = '';
        this.navLinks.style.borderTop = '';
        
        this.menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        this.isOpen = false;
    }
}

// Navbar scroll effect
class NavbarScrollEffect {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                this.navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                this.navbar.style.boxShadow = 'none';
            }
        });
    }
}

// Intersection Observer for animations
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements that should animate in
        const animateElements = document.querySelectorAll('.service-card, .contact-item, .highlight');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }
}

// Phone number formatting
class PhoneFormatter {
    constructor() {
        this.init();
    }

    init() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Track phone clicks for analytics if needed
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'phone_call', {
                        event_category: 'contact',
                        event_label: 'header_phone'
                    });
                }
            });
        });

        const smsLinks = document.querySelectorAll('a[href^="sms:"]');
        smsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Track SMS clicks for analytics if needed
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'sms_click', {
                        event_category: 'contact',
                        event_label: 'header_sms'
                    });
                }
            });
        });
    }
}

// Loading state management
class LoadingManager {
    constructor() {
        this.init();
    }

    init() {
        // Show loading state for images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease-in-out';
                
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
                
                img.addEventListener('error', () => {
                    img.style.opacity = '0.5';
                    img.alt = 'Image could not be loaded';
                });
            }
        });
    }
}

// Performance optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }

        // Preload critical resources
        const criticalImages = [
            'images/rsg-logo.jpg',
            'images/reiner-with-van.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
}

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all functionality
    new LanguageManager();
    new SmoothScroll();
    new MobileMenu();
    new NavbarScrollEffect();
    new ScrollAnimations();
    new PhoneFormatter();
    new LoadingManager();
    new PerformanceOptimizer();

    // Set initial language from localStorage
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && savedLang !== 'en') {
        const langManager = new LanguageManager();
        langManager.setLanguage(savedLang);
    }

    // Initialize the map
    setTimeout(initializeMap, 100); // Small delay to ensure Leaflet is fully loaded
});

// Initialize map when page loads
function initializeMap() {
    // Check if Leaflet is loaded
    if (typeof L !== 'undefined') {
        initMap();
    } else {
        // Fallback if Leaflet fails to load
        console.warn('Leaflet library failed to load. Map functionality disabled.');
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #4a5568; text-align: center; padding: 20px;">
                    <div>
                        <i class="fas fa-map-marker-alt" style="font-size: 2rem; margin-bottom: 10px; color: #e53e3e;"></i>
                        <p>Serving South Florida<br>Call (863) 223-9932 for service in your area</p>
                    </div>
                </div>
            `;
        }
    }
}

// Fallback for browsers that don't support modern features
if (!window.IntersectionObserver) {
    // Fallback for older browsers
    const animateElements = document.querySelectorAll('.service-card, .contact-item, .highlight');
    animateElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
