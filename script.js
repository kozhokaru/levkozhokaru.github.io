// Smooth scroll
function scrollToContent() {
    document.getElementById('blog').scrollIntoView({ behavior: 'smooth' });
}

// Navbar reveal on scroll
const navbar = document.getElementById('navbar');
const hero = document.getElementById('hero');

const observer = new IntersectionObserver(
    ([entry]) => {
        if (!entry.isIntersecting) {
            navbar.classList.add('visible');
            navbar.classList.remove('hidden');
        } else {
            navbar.classList.add('hidden');
            navbar.classList.remove('visible');
        }
    },
    { threshold: 0.1 }
);

observer.observe(hero);

// Dark mode
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

document.getElementById('theme-toggle').addEventListener('click', () => {
    const iconWrapper = document.querySelector('.icon-wrapper');
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    // Add animation class
    iconWrapper.classList.add('animating');
    
    // Change theme
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    
    // Remove animation class after animation completes
    setTimeout(() => {
        iconWrapper.classList.remove('animating');
    }, 400);
});

// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.carousel-card');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (!track || !cards.length) return; // Exit if no carousel
    
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // Create dots
    cards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.carousel-dot');
    
    // Update card classes based on position
    function updateCardClasses() {
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next', 'far');
            
            if (index === currentIndex) {
                card.classList.add('active');
            } else if (index === (currentIndex - 1 + totalCards) % totalCards) {
                card.classList.add('prev');
            } else if (index === (currentIndex + 1) % totalCards) {
                card.classList.add('next');
            } else {
                card.classList.add('far');
            }
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentIndex = index;
        updateCardClasses();
        
        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
            const targetCard = cards[index];
            
            // Get the card's current position
            const cardRect = targetCard.getBoundingClientRect();
            
            // Calculate the center points
            const cardCenter = cardRect.left + (cardRect.width / 2);
            const viewportCenter = window.innerWidth / 2;
            
            // Calculate how much to move to center the card
            const offset = viewportCenter - cardCenter;
            
            // Get current transform or default to 0
            const currentTransform = parseFloat(
                track.style.transform.replace('translateX(', '').replace('px)', '') || '0'
            );
            
            // Apply the new transform
            const newTransform = currentTransform + offset;
            track.style.transform = `translateX(${newTransform}px)`;
            
            console.log(`Centering card ${index}: offset=${offset}, transform=${newTransform}px`);
        });
    }
    
    // Navigation
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        goToSlide(currentIndex);
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalCards;
        goToSlide(currentIndex);
    });
    
    // Mouse wheel support
    let isScrolling = false;
    track.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (!isScrolling) {
            isScrolling = true;
            if (e.deltaY > 0) {
                currentIndex = (currentIndex + 1) % totalCards;
            } else {
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            }
            goToSlide(currentIndex);
            setTimeout(() => { isScrolling = false; }, 300);
        }
    });
    
    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            currentIndex = (currentIndex + 1) % totalCards;
            goToSlide(currentIndex);
        }
        if (touchEndX > touchStartX + 50) {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            goToSlide(currentIndex);
        }
    }
    
    // Click to navigate to post
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) {
                // For now just alert since we don't have real posts
                console.log('Navigate to:', card.querySelector('h2').textContent);
            }
        });
    });
    
    // Initialize
    goToSlide(0);
    
    // Handle resize
    window.addEventListener('resize', () => {
        goToSlide(currentIndex);
    });
});