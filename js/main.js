// Main JavaScript for Metavibes.me landing page

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add animation on scroll for tool cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe tool cards and coming soon items
    const animatedElements = document.querySelectorAll('.tool-card, .coming-soon-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add hover effects for tool cards
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add loading animation for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('btn-primary')) {
                // Add ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    });

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        z-index: 1000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals or focus on main content
            document.activeElement.blur();
        }
    });

    // Add focus management for accessibility
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-color)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Add performance optimization
    let ticking = false;
    
    function updateAnimations() {
        ticking = false;
        // Any scroll-based animations can go here
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    });

    // Initialize tooltips for feature badges
    const featureBadges = document.querySelectorAll('.feature');
    featureBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.textContent;
            tooltip.style.cssText = `
                position: absolute;
                background: var(--text-primary);
                color: white;
                padding: 0.5rem;
                border-radius: var(--border-radius);
                font-size: 0.875rem;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
            
            this.tooltip = tooltip;
        });
        
        badge.addEventListener('mouseleave', function() {
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
        });
    });

    console.log('Metavibes.me - Landing page loaded successfully!');
}); 

// Tool Navigation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth transitions to tool navigation
    const toolNavLinks = document.querySelectorAll('.tool-nav-link');
    
    toolNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add a subtle loading state
            this.style.opacity = '0.7';
            this.style.transform = 'scale(0.98)';
            
            // Reset after a short delay
            setTimeout(() => {
                this.style.opacity = '';
                this.style.transform = '';
            }, 150);
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    const aesLink = document.querySelector('a[href*="aes.html"]');
                    if (aesLink) aesLink.click();
                    break;
                case '2':
                    e.preventDefault();
                    const base64Link = document.querySelector('a[href*="base64.html"]');
                    if (base64Link) base64Link.click();
                    break;
                case '3':
                    e.preventDefault();
                    const md5Link = document.querySelector('a[href*="md5.html"]');
                    if (md5Link) md5Link.click();
                    break;
                case 'h':
                    e.preventDefault();
                    const homeLink = document.querySelector('.tool-nav-home');
                    if (homeLink) homeLink.click();
                    break;
            }
        }
    });

    // Add tooltip for keyboard shortcuts
    const toolNavItems = document.querySelectorAll('.tool-nav-item');
    toolNavItems.forEach((item, index) => {
        const link = item.querySelector('.tool-nav-link');
        const shortcut = index + 1;
        link.title = `Alt + ${shortcut} - Quick access`;
    });

    // Add home button tooltip
    const homeButton = document.querySelector('.tool-nav-home');
    if (homeButton) {
        homeButton.title = 'Alt + H - Go to Home';
    }

    // Add page context indicator
    const currentPage = window.location.pathname;
    if (currentPage.includes('aes.html')) {
        document.title = '🔐 AES Cipher - Metavibes.me';
    } else if (currentPage.includes('base64.html')) {
        document.title = '📝 Base64 Cipher - Metavibes.me';
    } else if (currentPage.includes('md5.html')) {
        document.title = '🔒 MD5 Cipher - Metavibes.me';
    }

    // Add smooth scrolling for navigation
    const toolNav = document.querySelector('.tool-nav');
    if (toolNav) {
        toolNav.style.scrollBehavior = 'smooth';
    }

    // Add visual feedback for navigation state
    const activeLink = document.querySelector('.tool-nav-link.active');
    if (activeLink) {
        activeLink.style.animation = 'pulse 2s infinite';
    }
}); 

// Add CSS animation for active link
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
`;
document.head.appendChild(style); 

// Tool Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const toolSelector = document.querySelector('.tool-selector');
    if (toolSelector) {
        toolSelector.addEventListener('change', function() {
            const selectedTool = this.value;
            if (selectedTool) {
                window.location.href = selectedTool;
            }
        });
    }
}); 