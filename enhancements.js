// Additional DOM elements for new features
const previewText = document.getElementById('previewText');
const progressIndicator = document.getElementById('progressIndicator');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Progress tracking
let currentProgress = 0;

// Motivational messages
const motivationalMessages = [
    '¡Qué suerte! 🍀',
    '¡Increíble! ✨',
    '¡Sos un ganador! 🏆',
    '¡Fantástico! 🎉',
    '¡Impresionante! 💫',
    '¡Maravilloso! 🌟',
    '¡Espectacular! 🎊'
];

// Create golden dust particles
function createGoldenDust(x, y) {
    for (let i = 0; i < 3; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust-particle';

        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        const dustX = Math.cos(angle) * distance;
        const dustY = Math.sin(angle) * distance;

        dust.style.left = x + 'px';
        dust.style.top = y + 'px';
        dust.style.setProperty('--dust-x', dustX + 'px');
        dust.style.setProperty('--dust-y', dustY + 'px');

        document.body.appendChild(dust);

        setTimeout(() => dust.remove(), 1000);
    }
}

// Update progress indicator
function updateProgress(percentage) {
    if (progressFill && percentage > currentProgress) {
        currentProgress = percentage;
        progressFill.style.width = percentage + '%';

        if (percentage < 30) {
            progressText.textContent = 'Raspá para descubrir tu premio';
        } else if (percentage < 50) {
            progressText.textContent = '¡Sigue raspando! 💫';
        } else {
            progressText.textContent = '¡Casi lo tienes! ✨';
        }
    }
}

// Get random motivational message
function getRandomMessage() {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

// Initialize UI elements
function initializeUIElements() {
    if (previewText) previewText.style.display = 'block';
    if (progressIndicator) {
        progressIndicator.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Raspá para descubrir tu premio';
    }
    currentProgress = 0;
}

// Hide UI elements after scratch
function hideUIElements() {
    if (previewText) previewText.style.display = 'none';
    if (progressIndicator) progressIndicator.style.display = 'none';
}

console.log('✨ Enhanced features loaded!');
