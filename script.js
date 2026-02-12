// Game Configuration
const WINNING_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // All numbers win!
const TOTAL_CARDS = 8;

// Game State
let gameState = {
    scratchedCards: 0,
    isGameActive: true,
    userData: null
};

// Sound Effects & Music
const sounds = {
    scratch: null,
    win: null
};

let audioContext = null;
let musicOscillator = null;
let musicGain = null;
let isMusicPlaying = false;
let lastSoundTime = 0;

// DOM Elements
const scratchGrid = document.getElementById('scratchGrid');
const resetButton = document.getElementById('resetButton');
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseButton = document.getElementById('modalCloseButton');
const prizeNumberSpan = document.getElementById('prizeNumber');
const confettiContainer = document.getElementById('confettiContainer');
const registrationModal = document.getElementById('registrationModal');
const registrationForm = document.getElementById('registrationForm');
const winnerNameElement = document.getElementById('winnerName');
const musicToggle = document.getElementById('musicToggle');
const shareButton = document.getElementById('shareButton');

// Initialize sounds and background music
function initSounds() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Scratch sound
    sounds.scratch = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 100;
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    // Win sound (fanfare)
    sounds.win = () => {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, index * 100);
        });
    };

    // Start background music
    startBackgroundMusic();
}

// Background Music (casino-style loop)
function startBackgroundMusic() {
    if (isMusicPlaying) return;

    musicGain = audioContext.createGain();
    musicGain.connect(audioContext.destination);
    musicGain.gain.value = 0.1;

    playMusicLoop();
    isMusicPlaying = true;
}

function playMusicLoop() {
    if (!isMusicPlaying) return;

    const notes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C, D, E, F, G
    let noteIndex = 0;

    function playNote() {
        if (!isMusicPlaying) return;

        musicOscillator = audioContext.createOscillator();
        musicOscillator.connect(musicGain);
        musicOscillator.frequency.value = notes[noteIndex];
        musicOscillator.type = 'sine';

        musicOscillator.start(audioContext.currentTime);
        musicOscillator.stop(audioContext.currentTime + 0.3);

        noteIndex = (noteIndex + 1) % notes.length;
        setTimeout(playNote, 400);
    }

    playNote();
}

function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;
    musicToggle.classList.toggle('muted');
    musicToggle.textContent = isMusicPlaying ? '🔊' : '🔇';

    if (isMusicPlaying) {
        musicGain.gain.value = 0.1;
        playMusicLoop();
    } else {
        if (musicOscillator) {
            musicOscillator.stop();
        }
        musicGain.gain.value = 0;
    }
}

// Check for existing user on load
function checkExistingUser() {
    const savedUser = localStorage.getItem('raspadita_user');
    const savedPrize = localStorage.getItem('raspadita_prize');

    if (savedUser) {
        gameState.userData = { name: savedUser };
        registrationModal.classList.remove('active');

        // If user already played, show their previous prize
        if (savedPrize) {
            initSounds();
            showPreviousPrize(parseInt(savedPrize));
            return true;
        }

        // User exists but hasn't played yet
        initSounds();
        initGame();
        return true;
    }
    return false;
}

// Show previous prize for returning users
function showPreviousPrize(prizeNumber) {
    setTimeout(() => {
        prizeNumberSpan.textContent = prizeNumber;
        winnerNameElement.textContent = `¡${gameState.userData.name}!`;

        const modalTitle = document.querySelector('#modalOverlay .modal-title');
        modalTitle.textContent = '🎉 YA JUGASTE 🎉';

        modalOverlay.classList.add('active');
        createConfetti();
        createEnhancedParticles();
    }, 500);
}

// Handle registration form
registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(registrationForm);
    const userName = formData.get('userName').trim();

    if (userName) {
        localStorage.setItem('raspadita_user', userName);
        gameState.userData = { name: userName };

        registrationModal.classList.remove('active');
        initSounds();
        initGame();
    }
});

// Initialize Game
function initGame() {
    const savedPrize = localStorage.getItem('raspadita_prize');
    if (savedPrize) {
        showPreviousPrize(parseInt(savedPrize));
        return;
    }

    scratchGrid.innerHTML = '';
    gameState.scratchedCards = 0;
    gameState.isGameActive = true;

    const numbers = generateRandomNumbers();

    // Create scratch cards
    numbers.forEach((number, index) => {
        createScratchCard(number, index);
    });
}

// Generate random numbers
function generateRandomNumbers() {
    const numbers = [];
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const randomIndex = Math.floor(Math.random() * WINNING_NUMBERS.length);
        numbers.push(WINNING_NUMBERS[randomIndex]);
    }
    return numbers;
}

// Create scratch card with manual scratching
function createScratchCard(number, index) {
    const card = document.createElement('div');
    card.className = 'scratch-card';
    card.dataset.number = number;
    card.dataset.scratched = 'false';

    const potBackground = document.createElement('div');
    potBackground.className = 'pot-background';
    potBackground.innerHTML = '<div class="pot-icon">🍯</div>';

    const hiddenNumber = document.createElement('div');
    hiddenNumber.className = 'hidden-number';
    hiddenNumber.textContent = number;

    const canvas = document.createElement('canvas');
    canvas.className = 'scratch-overlay';
    card.appendChild(potBackground);
    card.appendChild(hiddenNumber);
    card.appendChild(canvas);

    scratchGrid.appendChild(card);

    setupScratchCard(canvas, card, number);
}

// Setup scratch functionality
function setupScratchCard(canvas, card, number) {
    const ctx = canvas.getContext('2d');

    // Wait for the next frame to ensure the element is fully rendered
    setTimeout(() => {
        const rect = canvas.getBoundingClientRect();

        // Set canvas dimensions with device pixel ratio for better quality
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Scale the context to match device pixel ratio
        ctx.scale(dpr, dpr);

        // Draw scratch overlay
        const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#D2691E');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);
    }, 0);

    let isScratching = false;

    const scratch = (e) => {
        if (!gameState.isGameActive) return;
        if (card.dataset.scratched === 'true') return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        // Play scratch sound (throttled)
        const now = Date.now();
        if (sounds.scratch && now - lastSoundTime > 50) {
            sounds.scratch();
            lastSoundTime = now;
        }

        // Erase scratch area (using CSS coordinates, not canvas coordinates)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Check if enough is scratched
        checkScratchProgress(ctx, canvas, card, number);
    };

    canvas.addEventListener('mousedown', () => isScratching = true);
    canvas.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mousemove', (e) => {
        if (isScratching) scratch(e);
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isScratching = true;
    });
    canvas.addEventListener('touchend', () => isScratching = false);
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isScratching) scratch(e);
    });
}

// Check scratch progress
function checkScratchProgress(ctx, canvas, card, number) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 128) transparentPixels++;
    }

    const scratchedPercentage = (transparentPixels / (pixels.length / 4)) * 100;

    if (scratchedPercentage > 50 && card.dataset.scratched === 'false') {
        card.dataset.scratched = 'true';
        card.classList.add('scratched');
        canvas.style.display = 'none';

        gameState.scratchedCards++;

        // User scratched one card - they win!
        if (gameState.scratchedCards === 1) {
            gameState.isGameActive = false;
            setTimeout(() => {
                showWinModal(number);
            }, 500);
        }
    }
}

// Show win modal with enhanced effects
function showWinModal(number) {
    localStorage.setItem('raspadita_prize', number.toString());

    if (sounds.win) {
        sounds.win();
    }

    prizeNumberSpan.textContent = number;
    winnerNameElement.textContent = `¡${gameState.userData.name}!`;

    const modalTitle = document.querySelector('#modalOverlay .modal-title');
    modalTitle.textContent = '🎉 ¡FELICITACIONES! 🎉';

    modalCloseButton.textContent = 'CERRAR';

    modalOverlay.classList.add('active');

    createConfetti();
    createEnhancedParticles();
    celebrateWin();
}

// Enhanced Particle Effects
function createEnhancedParticles() {
    // Coins falling
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'particle coin-particle';
            coin.textContent = '🪙';
            coin.style.left = Math.random() * 100 + '%';
            coin.style.top = '-50px';
            document.body.appendChild(coin);

            setTimeout(() => coin.remove(), 2000);
        }, i * 100);
    }

    // Stars twinkling
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'particle star-particle';
            star.textContent = '✨';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.position = 'fixed';
            star.style.zIndex = '1002';
            document.body.appendChild(star);

            setTimeout(() => star.remove(), 1500);
        }, i * 150);
    }

    // Golden rays
    for (let i = 0; i < 8; i++) {
        const ray = document.createElement('div');
        ray.className = 'particle ray-particle';
        ray.style.left = '50%';
        ray.style.top = '50%';
        ray.style.transform = `rotate(${i * 45}deg)`;
        ray.style.position = 'fixed';
        ray.style.zIndex = '999';
        document.body.appendChild(ray);

        setTimeout(() => ray.remove(), 1000);
    }
}

// Original confetti function
function createConfetti() {
    confettiContainer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF'][Math.floor(Math.random() * 5)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confettiContainer.appendChild(confetti);
        }, i * 30);
    }
}

// Celebration animation
function celebrateWin() {
    const prizeIcon = document.querySelector('.prize-icon');
    if (prizeIcon) {
        prizeIcon.style.animation = 'prizeRotate 0.5s ease-in-out 3';
    }
}

// WhatsApp Share Function
function shareOnWhatsApp() {
    const userName = gameState.userData.name;
    const prizeNumber = localStorage.getItem('raspadita_prize');
    const message = `🎉 ¡Gané un Bono del 100% en Raspadita Ganadora! 🍀\n\nMi número ganador: ${prizeNumber}\n\n`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Close modal
function closeModal() {
    modalOverlay.classList.remove('active');
}

// Event Listeners
resetButton.addEventListener('click', () => {
    const savedPrize = localStorage.getItem('raspadita_prize');
    if (savedPrize) {
        showPreviousPrize(parseInt(savedPrize));
    } else {
        initGame();
    }
});

modalCloseButton.addEventListener('click', closeModal);
musicToggle.addEventListener('click', toggleMusic);
shareButton.addEventListener('click', shareOnWhatsApp);

// Shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize on page load
window.addEventListener('load', () => {
    checkExistingUser();
});
