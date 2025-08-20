// Newsletter form handling
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('.email-input');
            const email = emailInput.value;
            
            // Simple email validation
            if (validateEmail(email)) {
                // In a real application, you would send this to your backend
                showNotification('Thank you for subscribing! Check your email for confirmation.');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add reading progress bar for blog posts
    if (document.querySelector('.blog-post')) {
        createReadingProgress();
    }
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Add copy button to code blocks
    document.querySelectorAll('pre code').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.textContent = 'Copy';
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent);
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        });
        
        const pre = block.parentElement;
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function createReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #0066cc, #87ceeb);
        z-index: 1000;
        transition: width 0.2s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .copy-code-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 5px 10px;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .copy-code-btn:hover {
        background: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
`;

document.head.appendChild(style);