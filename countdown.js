// Countdown Timer - Ends January 31, 2026 at 1:00 AM
const endDate = new Date('2026-01-31T01:00:00-03:00'); // Argentina timezone

function updateCountdown() {
    const now = new Date();
    const timeLeft = endDate - now;

    const countdownTimer = document.getElementById('countdownTimer');
    const countdownBanner = document.getElementById('countdownBanner');

    if (!countdownTimer || !countdownBanner) return;

    if (timeLeft <= 0) {
        // Promotion expired
        countdownTimer.textContent = '¡Promoción finalizada!';
        countdownBanner.classList.add('countdown-expired');
        return;
    }

    // Calculate time components
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Format display
    let displayText = '';

    if (days > 0) {
        displayText = `Termina en: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
        displayText = `Termina en: ${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        displayText = `¡ÚLTIMOS MINUTOS! ${minutes}m ${seconds}s`;
    } else {
        displayText = `¡ÚLTIMOS SEGUNDOS! ${seconds}s`;
    }

    countdownTimer.textContent = displayText;

    // Update more frequently in the last minute
    const updateInterval = minutes === 0 ? 100 : 1000;
    setTimeout(updateCountdown, updateInterval);
}

// Start countdown when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCountdown);
} else {
    updateCountdown();
}

console.log('⏰ Countdown timer initialized - Ends: Jan 31, 2026 at 1:00 AM');
