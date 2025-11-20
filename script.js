// ============================================
// Hamburger Menu Toggle Functionality
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        // Toggle menu on hamburger click
        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded attribute
            hamburger.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle active class on nav menu
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open on mobile
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on a link (mobile)
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Only close on mobile (when hamburger is visible)
                if (window.innerWidth < 768) {
                    hamburger.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Close menu when clicking outside (mobile)
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && window.innerWidth < 768) {
                if (navMenu.classList.contains('active')) {
                    hamburger.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
        
        // Handle window resize - close menu if resizing to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                hamburger.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Handle escape key to close menu
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                hamburger.focus(); // Return focus to hamburger button
            }
        });
    }
});

