// --- Page Setup and Navigation ---

function setTrueViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Run it on load and on resize
window.addEventListener('resize', setTrueViewportHeight);
window.addEventListener('orientationchange', setTrueViewportHeight);
setTrueViewportHeight();

// Fade in background image on load
const bgImage = document.querySelector('.bg-image');
setTimeout(() => {
    bgImage.style.opacity = '1';
}, 100);

// Menu options click handler
const menuOptions = document.querySelectorAll('.menu-option');
menuOptions.forEach(option => {
    option.addEventListener('click', function() {
        const targetPage = this.getAttribute('data-page');
        navigateToPage(targetPage);
    });
});

// Back buttons click handler
const backButtons = document.querySelectorAll('.back-button');
backButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetPage = this.getAttribute('data-page');
        navigateToPage(targetPage);
    });
});

// Optimized navigation function with glitch transition
function navigateToPage(pageId) {
    const glitchTransition = document.querySelector('.glitch-transition');
    const glitchScan = document.querySelector('.glitch-scan');
    
    const isGoingBack = pageId === 'landing';
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isGoingBack) {
        glitchTransition.classList.add('active', 'backward');
        glitchScan.style.animation = 'scanline-up 0.6s linear';
        glitchTransition.style.backgroundColor = isMobile ? '#0a0a0a' : '#0a0a1a';
    } else {
        glitchTransition.classList.add('active', 'forward');
        glitchScan.style.animation = 'scanline-down 0.6s linear';
        glitchTransition.style.backgroundColor = isMobile ? '#0a0a0a' : '#0a1a0a';
    }
    
    const transitionTime = isMobile ? 300 : 400;
    
    setTimeout(() => {
        const pages = document.querySelectorAll('.page-section');
        pages.forEach(page => page.classList.remove('active'));
        
        const targetElement = document.getElementById(pageId);
        if (targetElement) {
            targetElement.classList.add('active');
            window.scrollTo(0, 0);
        }
        
        setTimeout(() => {
            glitchTransition.classList.remove('active', 'forward', 'backward');
            glitchScan.style.animation = '';
            glitchTransition.style.backgroundColor = '#0a0a0a';
        }, transitionTime);
    }, transitionTime);
}

// --- Efficient Audio Player Logic ---

const player = document.getElementById('mainPlayer');
const chapterElements = document.querySelectorAll('.chapter-item');
let chapterData = [];

// 1. Process chapter data ONCE on load
function setupChapters() {
    chapterData = [];
    chapterElements.forEach(el => {
        const startTime = parseInt(el.dataset.start, 10);
        if (!isNaN(startTime)) {
            chapterData.push({
                start: startTime,
                element: el
            });
        }
    });
}

// 2. Efficiently update the 'current-chapter' class
function updateCurrentChapter(currentTime) {
    let currentChapter = null;

    for (const chapter of chapterData) {
        if (currentTime >= chapter.start) {
            currentChapter = chapter;
        } else {
            break;
        }
    }
    
    chapterElements.forEach(el => {
        if (currentChapter && el === currentChapter.element) {
            el.classList.add('current-chapter');
        } else {
            el.classList.remove('current-chapter');
        }
    });
}

// Setup click events for each chapter
chapterElements.forEach(el => {
    el.addEventListener('click', () => {
        const startTime = parseInt(el.dataset.start, 10);
        if (!isNaN(startTime)) {
            player.currentTime = startTime;
            player.play();
        }
    });
});

// Add event listeners to the player
player.addEventListener('loadedmetadata', setupChapters);
player.addEventListener('timeupdate', () => updateCurrentChapter(player.currentTime));

// Initial setup in case metadata is already loaded
if (player.readyState >= 1) {
    setupChapters();
}