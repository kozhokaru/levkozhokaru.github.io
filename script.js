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
    
    // Carousel scroll isolation
    const carouselContainer = document.querySelector('.carousel-container');
    let isCarouselHovered = false;
    let isCarouselScrolling = false;
    let scrollAccumulator = 0;
    let scrollTimeout = null;
    
    // Track carousel hover state
    carouselContainer.addEventListener('mouseenter', () => {
        isCarouselHovered = true;
        carouselContainer.classList.add('scrolling');
    });
    
    carouselContainer.addEventListener('mouseleave', () => {
        isCarouselHovered = false;
        carouselContainer.classList.remove('scrolling');
        scrollAccumulator = 0;
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
    });
    
    // Handle wheel events on carousel with better throttling
    carouselContainer.addEventListener('wheel', (e) => {
        if (isCarouselHovered) {
            e.preventDefault();
            e.stopPropagation();
            
            // Only process scroll if not in cooldown
            if (!isCarouselScrolling) {
                // Accumulate scroll delta
                const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
                const delta = isHorizontal ? e.deltaX : e.deltaY;
                scrollAccumulator += delta;
                
                // Clear existing timeout
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                
                // Set threshold for triggering navigation (prevents hair-trigger scrolling)
                const scrollThreshold = 80; // Requires more intentional scrolling
                
                if (Math.abs(scrollAccumulator) >= scrollThreshold) {
                    // Clear any pending reset timeout
                    if (scrollTimeout) {
                        clearTimeout(scrollTimeout);
                        scrollTimeout = null;
                    }
                    
                    // Navigate based on accumulated scroll
                    if (scrollAccumulator > 0) {
                        currentIndex = (currentIndex + 1) % totalCards;
                    } else {
                        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
                    }
                    
                    goToSlide(currentIndex);
                    
                    // Reset accumulator and set cooldown
                    scrollAccumulator = 0;
                    isCarouselScrolling = true;
                    
                    // Cooldown period to prevent rapid navigation
                    setTimeout(() => { 
                        isCarouselScrolling = false;
                        scrollAccumulator = 0; // Extra safety reset
                    }, 700);
                } else {
                    // Reset accumulator after a pause in scrolling
                    scrollTimeout = setTimeout(() => {
                        scrollAccumulator = 0;
                    }, 150);
                }
            }
        }
    }, { passive: false });
    
    // Prevent page scroll when hovering carousel
    document.addEventListener('wheel', (e) => {
        if (isCarouselHovered) {
            e.preventDefault();
        }
    }, { passive: false });
    
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
    
    // Click to open modal with post content
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) {
                openPostModal(card, index);
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

// Modal functionality
const modal = document.getElementById('post-modal');
const modalOverlay = modal.querySelector('.modal-overlay');
const modalClose = modal.querySelector('.modal-close');
const modalBody = modal.querySelector('.modal-body');

// Sample post content (in a real app, this would come from files or API)
const postContent = {
    0: {
        title: "The Art of Writing Clean Code",
        date: "Jan 23, 2025",
        content: `
            <p>Clean code is not just about making it work. It's about making it obvious, maintainable, and elegant. When you write clean code, you're not just solving today's problem – you're making tomorrow's changes easier.</p>
            
            <h2>Why Clean Code Matters</h2>
            <p>We spend far more time reading code than writing it. Studies show that developers spend about 10 times more time comprehending existing code than writing new code. This ratio alone should convince us that optimizing for readability is crucial.</p>
            
            <h2>Principles of Clean Code</h2>
            <p>The foundation of clean code rests on several key principles:</p>
            <p><strong>Clarity over cleverness:</strong> Your code should be immediately understandable to someone reading it for the first time. Avoid clever one-liners that require mental gymnastics to decipher.</p>
            <p><strong>Single Responsibility:</strong> Each function, class, or module should do one thing and do it well. When something needs to change, you should only need to modify one place.</p>
            <p><strong>Meaningful names:</strong> Variables, functions, and classes should have names that clearly express their purpose. A good name eliminates the need for a comment.</p>
            
            <h2>Refactoring as a Habit</h2>
            <p>Clean code doesn't happen on the first try. It emerges through continuous refactoring. Every time you touch a piece of code, leave it a little better than you found it. This "Boy Scout Rule" ensures your codebase improves over time rather than degrading.</p>
            
            <p>Remember: clean code is a skill that develops with practice. Start small, be consistent, and always think about the next developer who will read your code – even if that developer is you, six months from now.</p>
        `
    },
    1: {
        title: "Debugging Production Issues Like a Detective",
        date: "Jan 22, 2025",
        content: `
            <p>When production breaks at 3 AM, you need more than just logs. You need a systematic approach, the right tools, and a detective's mindset to track down elusive bugs.</p>
            
            <h2>The Detective's Toolkit</h2>
            <p>Just as a detective needs forensic tools, a developer debugging production needs the right instruments. Distributed tracing, structured logging, and real-time metrics form the foundation of your investigative arsenal.</p>
            
            <h2>Building a Timeline</h2>
            <p>Every production issue tells a story. Start by establishing a timeline: when did the issue first appear? What changed around that time? Correlate deployments, configuration changes, and traffic patterns to identify potential triggers.</p>
            
            <h2>The Art of Hypothesis Testing</h2>
            <p>Form hypotheses about what might be wrong, then systematically test each one. Use feature flags to isolate problematic code paths. Implement canary deployments to test fixes on a subset of traffic before full rollout.</p>
            
            <p>Most importantly, document everything. Your investigation notes become invaluable for post-mortems and preventing similar issues in the future.</p>
        `
    },
    2: {
        title: "Why Performance Still Matters in 2025",
        date: "Jan 21, 2025",
        content: `
            <p>Hardware is faster than ever, but users expect instant responses. In an age of blazing-fast processors and gigabit internet, why do we still obsess over milliseconds?</p>
            
            <h2>The Psychology of Speed</h2>
            <p>Human perception of speed hasn't evolved with our hardware. Users still perceive anything over 100ms as sluggish. A 1-second delay in page load time can result in a 7% reduction in conversions. Speed isn't just a nice-to-have; it's a business requirement.</p>
            
            <h2>The Mobile Reality</h2>
            <p>While your development machine might have 32GB of RAM and a latest-gen processor, your users might be on a three-year-old phone with a spotty 3G connection. Performance optimization ensures your application works for everyone, not just those with the latest hardware.</p>
            
            <h2>Environmental Impact</h2>
            <p>Efficient code isn't just about user experience – it's about sustainability. Every CPU cycle consumes energy. Multiply inefficient code by millions of executions, and you're talking about significant environmental impact.</p>
            
            <p>Performance optimization is an act of respect: respect for your users' time, their devices' limitations, and our planet's resources.</p>
        `
    },
    3: {
        title: "Simplicity Scales, Complexity Fails",
        date: "Jan 20, 2025",
        content: `
            <p>The best systems are boringly simple. They do one thing well and compose beautifully with others. In our industry's obsession with the new and shiny, we often forget that simplicity is the ultimate sophistication.</p>
            
            <h2>The Complexity Tax</h2>
            <p>Every layer of abstraction, every clever pattern, every "just in case" feature adds to your complexity budget. This tax compounds over time, making changes slower, bugs more frequent, and onboarding harder.</p>
            
            <h2>YAGNI and the Art of Saying No</h2>
            <p>"You Aren't Gonna Need It" isn't just a principle; it's a survival strategy. That generic system that handles every possible future requirement? It will slow you down today for a tomorrow that may never come.</p>
            
            <h2>Composition Over Complexity</h2>
            <p>Simple components that compose well beat complex monoliths every time. Unix pipes, HTTP APIs, and functional programming all demonstrate the power of simple, composable abstractions.</p>
            
            <p>When faced with a choice, always lean toward simplicity. Your future self, your team, and your users will thank you.</p>
        `
    },
    4: {
        title: "Code Reviews Are Not About Finding Bugs",
        date: "Jan 19, 2025",
        content: `
            <p>The best code reviews teach, share context, and build team consensus. Finding bugs is just a side effect. If you're only looking for bugs in code reviews, you're missing 90% of their value.</p>
            
            <h2>Knowledge Transfer in Action</h2>
            <p>Code reviews are one of the most effective ways to spread knowledge across a team. Junior developers learn patterns and practices. Senior developers stay informed about all parts of the codebase. Everyone benefits from diverse perspectives.</p>
            
            <h2>Building Shared Standards</h2>
            <p>Through code reviews, teams organically develop shared coding standards. These standards aren't imposed from above but emerge from collective discussion and agreement. This bottom-up approach leads to better buy-in and compliance.</p>
            
            <h2>The Human Element</h2>
            <p>Remember that there's a person on the other side of that pull request. Frame feedback constructively. Ask questions instead of making demands. Celebrate elegant solutions. A positive review culture encourages experimentation and learning.</p>
            
            <p>Approach every code review as an opportunity to learn something new, teach something valuable, or strengthen team cohesion. The bugs you catch are just a bonus.</p>
        `
    }
};

// Open modal function
function openPostModal(card, index) {
    const post = postContent[index];
    if (!post) return;
    
    // Lock body scroll by fixing position
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    // Populate modal content
    modalBody.innerHTML = `
        <time>${post.date}</time>
        <h1>${post.title}</h1>
        ${post.content}
    `;
    
    // Show modal with animation
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    
    // Force reflow to ensure transition works
    modal.offsetHeight;
    
    // Focus management for accessibility
    modalClose.focus();
}

// Close modal function
function closeModal() {
    // Get the scroll position from the body's top style
    const scrollY = document.body.style.top;
    
    // Remove modal classes
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    
    // Restore body scroll
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restore scroll position
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

// Event listeners for closing modal
modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', closeModal);

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
    }
});

// Prevent modal content clicks from closing modal
modal.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
});