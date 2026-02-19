// ==================== GAME LOGIC ====================

let selectedBetType = 'number';
let selectedBetValue = '0';
let isSpinning = false;

// Roulette wheel colors
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// ==================== INITIALIZE ==================== 

document.addEventListener('DOMContentLoaded', function() {
    drawRouletteWheel();
    setupEventListeners();
    updateBalance();
    
    // Update balance every 5 seconds
    setInterval(updateBalance, 5000);
});

// ==================== DRAW ROULETTE WHEEL ====================

function drawRouletteWheel() {
    const canvas = document.getElementById('rouletteWheel');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const sliceAngle = (Math.PI * 2) / 37;
    
    for (let i = 0; i <= 36; i++) {
        const angle = i * sliceAngle - Math.PI / 2;
        const nextAngle = angle + sliceAngle;
        
        // Determine color
        let color;
        if (i === 0) {
            color = '#00a854'; // Green for 0
        } else if (RED_NUMBERS.includes(i)) {
            color = '#d9534f'; // Red
        } else {
            color = '#000'; // Black
        }
        
        // Draw slice
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(radius, radius, radius - 5, angle, nextAngle);
        ctx.lineTo(radius, radius);
        ctx.fill();
        ctx.stroke();
        
        // Draw number
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textAngle = angle + sliceAngle / 2;
        const textRadius = radius - 35;
        const x = radius + Math.cos(textAngle) * textRadius;
        const y = radius + Math.sin(textAngle) * textRadius;
        ctx.fillText(i, x, y);
    }
    
    // Draw center circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(radius, radius, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pointer at top
    ctx.fillStyle = '#d9534f';
    ctx.beginPath();
    ctx.moveTo(radius - 10, 0);
    ctx.lineTo(radius + 10, 0);
    ctx.lineTo(radius, 20);
    ctx.closePath();
    ctx.fill();
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Bet type buttons
    document.querySelectorAll('.bet-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedBetType = this.dataset.type;
            updateBettingOptions();
        });
    });
    
    // Number buttons
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (selectedBetType === 'number') {
                document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedBetValue = this.dataset.value;
            }
        });
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (selectedBetType === 'color') {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedBetValue = this.dataset.value;
            }
        });
    });
    
    // Place bet button
    document.getElementById('placeBetBtn').addEventListener('click', placeBet);
    
    // Spin button
    document.getElementById('spinBtn').addEventListener('click', spinWheel);
}

function updateBettingOptions() {
    const numberOptions = document.getElementById('numberOptions');
    const colorOptions = document.getElementById('colorOptions');
    
    if (selectedBetType === 'number') {
        numberOptions.style.display = 'grid';
        colorOptions.style.display = 'none';
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
    } else if (selectedBetType === 'color') {
        numberOptions.style.display = 'none';
        colorOptions.style.display = 'flex';
        colorOptions.style.gap = '1rem';
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    } else {
        numberOptions.style.display = 'none';
        colorOptions.style.display = 'none';
    }
}

// ==================== PLACE BET ====================

async function placeBet() {
    const betAmount = parseFloat(document.getElementById('betAmount').value);
    const balance = parseFloat(document.getElementById('balance').textContent);
    
    // Validate
    if (isNaN(betAmount) || betAmount <= 0) {
        showError('Voer een geldig inzetbedrag in');
        return;
    }
    
    if (betAmount > balance) {
        showError('Onvoldoende tegoed');
        return;
    }
    
    if (selectedBetType === 'number' || selectedBetType === 'color') {
        if (!selectedBetValue || selectedBetValue === '') {
            showError('Selecteer een inzet');
            return;
        }
    }
    
    // Store bet info
    window.currentBet = {
        amount: betAmount,
        type: selectedBetType,
        value: selectedBetValue
    };
    
    document.getElementById('spinBtn').disabled = false;
    showSuccess('Inzet geplaatst! Klik op SPIN om te spelen.');
}

// ==================== SPIN WHEEL ====================

async function spinWheel() {
    if (isSpinning) return;
    if (!window.currentBet) {
        showError('Plaats eerst een inzet');
        return;
    }
    
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    
    // Animate wheel spin
    const canvas = document.getElementById('rouletteWheel');
    let rotation = 0;
    const spinDuration = 3000; // 3 seconds
    const startTime = Date.now();
    
    const spinAnimation = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Ease out curve for spinning
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        rotation = easeProgress * 360 * 5; // 5 full rotations
        
        canvas.style.transform = `rotate(${rotation}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(spinAnimation);
        } else {
            // Spin finished, send bet to server
            submitBet();
        }
    };
    
    spinAnimation();
}

// ==================== SUBMIT BET ====================

async function submitBet() {
    try {
        const response = await fetch('/api/spin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bet_amount: window.currentBet.amount,
                bet_type: window.currentBet.type,
                bet_value: window.currentBet.value
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayResult(data);
            updateBalance();
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Fout bij het versturen: ' + error);
    }
    
    isSpinning = false;
    document.getElementById('spinBtn').disabled = false;
}

// ==================== DISPLAY RESULT ====================

function displayResult(data) {
    const resultDiv = document.getElementById('gameResult');
    const titleElement = document.getElementById('resultTitle');
    const numberElement = document.getElementById('resultNumber');
    const payoutElement = document.getElementById('resultPayout');
    
    if (data.result === 'win') {
        titleElement.textContent = '🎉 JE HEBT GEWONNEN!';
        titleElement.style.color = '#27ae60';
    } else {
        titleElement.textContent = '😢 Helaas verloren';
        titleElement.style.color = '#e74c3c';
    }
    
    numberElement.textContent = `Winning nummer: ${data.winning_number}`;
    payoutElement.textContent = `${data.message}`;
    
    resultDiv.style.display = 'block';
    
    // Reset bet
    window.currentBet = null;
    document.getElementById('betAmount').value = 10;
}

// ==================== UPDATE BALANCE ====================

async function updateBalance() {
    try {
        const response = await fetch('/api/balance');
        const data = await response.json();
        
        document.getElementById('balance').textContent = data.balance.toFixed(2);
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

// ==================== NOTIFICATIONS ====================

function showError(message) {
    showNotification(message, 'danger');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '80px';
    alert.style.left = '50%';
    alert.style.transform = 'translateX(-50%)';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 4000);
}
