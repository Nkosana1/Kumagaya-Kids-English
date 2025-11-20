// Image Lazy Loading Handler
document.addEventListener('DOMContentLoaded', function() {
    // Add lazy loading to all images that don't have it
    const images = document.querySelectorAll('img:not([loading])');
    
    images.forEach(img => {
        // Skip if already has loading attribute
        if (img.hasAttribute('loading')) return;
        
        // Add lazy loading for images below the fold
        if (img.offsetTop > window.innerHeight) {
            img.setAttribute('loading', 'lazy');
            img.classList.add('img-skeleton');
            
            // Handle image load
            img.addEventListener('load', function() {
                this.classList.remove('img-skeleton');
                this.classList.add('loaded');
            });
            
            // Handle image error
            img.addEventListener('error', function() {
                this.classList.remove('img-skeleton');
                this.alt = 'Image failed to load';
            });
        }
    });
    
    // Intersection Observer for better lazy loading
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

