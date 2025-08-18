// --- New Content Loading Logic ---

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadBioContent);

async function loadBioContent() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const bioContainer = document.getElementById('bioContent');
        if (bioContainer) {
            bioContainer.innerHTML = ''; // Clear existing content

            // Create and append The Band section
            bioContainer.appendChild(createBioBlock(data.band));

            // Create and append The Discovery section
            bioContainer.appendChild(createBioBlock(data.theDiscovery));

            // Create and append The Enigma section
            bioContainer.appendChild(createBioBlock(data.theEnigma));
        }
    } catch (error) {
        console.error('Error loading bio content:', error);
    }
}

function createBioBlock(contentData) {
    const bioBlock = document.createElement('div');
    bioBlock.classList.add('bio-block');

    const title = document.createElement('h2');
    title.textContent = contentData.title;
    bioBlock.appendChild(title);

    contentData.paragraphs.forEach(pText => {
        const paragraph = document.createElement('p');
        paragraph.textContent = pText;
        bioBlock.appendChild(paragraph);
    });

    if (contentData.image) {
        const img = document.createElement('img');
        img.src = contentData.image;
        img.alt = `Image for ${contentData.title}`;
        // You'll need to add a class to your CSS to style this image
        img.classList.add('bio-image'); 
        bioBlock.appendChild(img);
    }

    return bioBlock;
}

async function loadInterlakeMuseumContent() {
    try {
        const response = await fetch('participate_content.json');
        if (!response.ok) {
            throw new Error('Could not load participate content.');
        }
        const data = await response.json();
        const interlakeData = data.interlake;

        // Hide the options and show the content
        document.getElementById('participate-options').style.display = 'none';
        const museumContent = document.getElementById('interlake-museum-content');
        museumContent.style.display = 'block';

        // Populate the title
        document.getElementById('museum-title').textContent = interlakeData.title;

        // Create and populate the text container
        const museumTextContainer = document.createElement('div');
        museumTextContainer.classList.add('museum-text-container');
        interlakeData.paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            museumTextContainer.appendChild(p);
        });

        // Create and populate the images container
        const museumImagesContainer = document.createElement('div');
        museumImagesContainer.classList.add('museum-images');
        interlakeData.images.forEach(imageSrc => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = interlakeData.title + ' artifact';
            museumImagesContainer.appendChild(img);
        });

        // Append the text container first, then the images container
        museumContent.appendChild(museumTextContainer);
        museumContent.appendChild(museumImagesContainer);

    } catch (error) {
        console.error('Error loading museum content:', error);
    }
}

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

        // Check if the back button is on the "participate" page
        const parentPage = this.closest('.page-section');
        if (parentPage && parentPage.id === 'participate') {
            // Reset the content on the "participate" page
            document.getElementById('participate-options').style.display = 'block';
            document.getElementById('interlake-museum-content').style.display = 'none';
        }

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

// --- PARTICIPATE PAGE CONTENT LOADER ---

const divisionOptions = document.querySelectorAll('.division-option');

divisionOptions.forEach(option => {
    option.addEventListener('click', function() {
        const divisionId = this.getAttribute('data-division');
        if (divisionId === 'interlake') {
            loadInterlakeMuseumContent();
        } else if (divisionId === 'yakta') {
            window.location.href = 'https://lichtung1.github.io/LMG/';
        }
    });
});



