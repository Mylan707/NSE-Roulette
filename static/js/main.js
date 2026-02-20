// ==================== GAME STATE ====================

let gameState = {
    bets: [], // Array of {type, value, amount}
    isSpinning: false,
    selectedCell: null
};

// Roulette wheel colors
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Chip colors based on bet amount
const CHIP_COLORS = {
    low: '#ff6b6b',      // 1-10
    medium: '#4ecdc4',   // 11-50
    high: '#ffe66d',     // 51-100
    veryHigh: '#95e1d3'  // 100+
};

function getChipColor(amount) {
    if (amount <= 10) return CHIP_COLORS.low;
    if (amount <= 50) return CHIP_COLORS.medium;
    if (amount <= 100) return CHIP_COLORS.high;
    return CHIP_COLORS.veryHigh;
}

// ==================== INITIALIZE ====================

document.addEventListener('DOMContentLoaded', function() {
    const wheelCanvas = document.getElementById('rouletteWheel');
    if (wheelCanvas) {
        drawRouletteWheel();
        generateNumbersCells();
        setupEventListeners();
        updateBalance();
        updateChipPreview();
        
        // Update balance every 5 seconds
        setInterval(updateBalance, 5000);
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    const searchFilter = document.getElementById('searchFilter');
    if (searchFilter) {
        searchFilter.addEventListener('keyup', handleSearchFilter);
    }
});


// ==================== DRAW ROULETTE WHEEL ====================

function drawRouletteWheel() {
    const canvas = document.getElementById('rouletteWheel');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const radius = Math.min(canvas.width, canvas.height) / 2;
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
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textAngle = angle + sliceAngle / 2;
        const textRadius = radius - 30;
        const x = radius + Math.cos(textAngle) * textRadius;
        const y = radius + Math.sin(textAngle) * textRadius;
        ctx.fillText(i, x, y);
    }
    
    // Draw center circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(radius, radius, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pointer at top
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(radius - 8, 0);
    ctx.lineTo(radius + 8, 0);
    ctx.lineTo(radius, 15);
    ctx.closePath();
    ctx.fill();
}

// ==================== GENERATE NUMBER CELLS ====================

function generateNumbersCells() {
    const grid = document.getElementById('numbersGrid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 36; i++) {
        const cell = document.createElement('div');
        cell.className = 'table-cell';
        cell.setAttribute('data-type', 'number');
        cell.setAttribute('data-number', i);
        cell.textContent = i;
        
        // Color code based on red/black
        if (RED_NUMBERS.includes(i)) {
            cell.style.borderColor = '#d9534f';
        } else {
            cell.style.borderColor = '#222';
        }
        
        grid.appendChild(cell);
    }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Table cell clicks
    document.querySelectorAll('.table-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            handleTableCellClick(this);
        });
    });
    
    // Spin button
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.addEventListener('click', spinWheel);
    }
    
    // Clear bets button
    const clearBetsBtn = document.getElementById('clearBetsBtn');
    if (clearBetsBtn) {
        clearBetsBtn.addEventListener('click', clearAllBets);
    }
    
    // Bet amount input - update chip preview
    document.getElementById('betAmount').addEventListener('change', updateChipPreview);
}

function updateChipPreview() {
    const amount = parseFloat(document.getElementById('betAmount').value) || 0;
    const preview = document.getElementById('chipColorDisplay');
    preview.style.backgroundColor = getChipColor(amount);
}

function handleTableCellClick(cell) {
    if (gameState.isSpinning) return;
    
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
    
    // Get bet info
    let betType = cell.getAttribute('data-type');
    let betValue = cell.getAttribute('data-number') || 
                   cell.getAttribute('data-value') || 
                   cell.getAttribute('data-type');
    
    // Determine the correct bet value for odd/even/high/low
    if (betType === 'even' || betType === 'odd' || betType === 'low' || betType === 'high') {
        betValue = betType;
    } else if (betType === 'number') {
        betValue = cell.getAttribute('data-number');
    }
    
    // Create bet object
    const bet = {
        type: betType,
        value: betValue,
        amount: betAmount,
        id: Date.now() // Unique ID for removing bets
    };
    
    // Add to bets array
    gameState.bets.push(bet);
    
    // Visual feedback
    cell.classList.add('active');
    // Place chip visually on the table cell
    placeChipOnCell(cell, bet);
    
    // Update display
    updateBetsDisplay();
    updateSpinButton();
    
    showSuccess(`€${betAmount.toFixed(2)} ingezet op ${getCellLabel(betType, betValue)}`);
}

// Create a visual chip on the given table cell for a bet
function placeChipOnCell(cell, bet) {
    if (!cell) return;
    // ensure cell is positioned relative
    if (getComputedStyle(cell).position === 'static') {
        cell.style.position = 'relative';
    }

    const existing = cell.querySelectorAll('.chip');
    const offset = existing.length * 6; // stack offset

    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.dataset.betId = bet.id;
    chip.style.position = 'absolute';
    chip.style.width = '20px';
    chip.style.height = '20px';
    chip.style.borderRadius = '50%';
    chip.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    chip.style.right = (6 + offset) + 'px';
    chip.style.bottom = (6 + offset) + 'px';
    chip.style.background = getChipColor(bet.amount);
    chip.style.border = '2px solid #fff';
    chip.title = `${getCellLabel(bet.type, bet.value)} — €${bet.amount.toFixed(2)}`;

    cell.appendChild(chip);
}

function getCellLabel(type, value) {
    const labels = {
        'number': `getal ${value}`,
        'color': value,
        'red': 'rood',
        'black': 'zwart',
        'odd': 'oneven',
        'even': 'even',
        'high': '19-36 (hoog)',
        'low': '1-18 (laag)'
    };
    return labels[value] || labels[type] || value;
}

function updateBetsDisplay() {
    const betsDisplay = document.getElementById('betsDisplay');
    betsDisplay.innerHTML = '';
    
    gameState.bets.forEach(bet => {
        const betItem = document.createElement('div');
        betItem.className = 'bet-item';
        
        const chipColor = getChipColor(bet.amount);
        const chipStyle = `background: ${chipColor}; width: 20px; height: 20px; border-radius: 50%; display: inline-block; margin-right: 8px;`;
        
        betItem.innerHTML = `
            <div class="bet-item-info">
                <span style="${chipStyle}"></span>
                <span>${getCellLabel(bet.type, bet.value)}</span><br>
                <span class="bet-item-amount">€${bet.amount.toFixed(2)}</span>
            </div>
            <button class="bet-remove" onclick="removeBet(${bet.id})">✕</button>
        `;
        
        betsDisplay.appendChild(betItem);
    });
}

function removeBet(betId) {
    gameState.bets = gameState.bets.filter(b => b.id !== betId);
    
    // Remove active class from cells
    document.querySelectorAll(`.chip[data-bet-id="${betId}"]`).forEach(c => c.remove());
    // If no chips left in a cell, remove active class
    document.querySelectorAll('.table-cell').forEach(cell => {
        if (!cell.querySelector('.chip')) cell.classList.remove('active');
    });
    
    updateBetsDisplay();
    updateSpinButton();
}

function clearAllBets() {
    gameState.bets = [];
    // remove all chips and active classes
    document.querySelectorAll('.chip').forEach(c => c.remove());
    document.querySelectorAll('.table-cell').forEach(cell => cell.classList.remove('active'));
    updateBetsDisplay();
    updateSpinButton();
}

function updateSpinButton() {
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = gameState.bets.length === 0;
}

// ==================== SPIN WHEEL ====================

async function spinWheel() {
    if (gameState.isSpinning || gameState.bets.length === 0) return;
    
    gameState.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    
    // Determine which number will win (multiple rotations + random end)
    const endDegree = Math.random() * 360;
    const totalRotation = 1080 + endDegree;  // 3 full spins + random
    
    // Calculate winning number based on final rotation
    const degreesPerNumber = 360 / 37;
    const normalizedDegrees = totalRotation % 360;
    // Use slice center to determine which wedge the ball will land on
    const winningNumber = Math.floor((normalizedDegrees + degreesPerNumber / 2) / degreesPerNumber) % 37;
    
    // Animate ball
    const ballPath = document.getElementById('ballPath');
    const ball = document.getElementById('rouletteBall');
    
    // Set CSS custom property for final rotation
    ballPath.style.setProperty('--final-rotation', totalRotation + 'deg');
    
    // Calculate the angle of the winning number
    const winningAngle = (winningNumber * degreesPerNumber - 90) % 360;
    
    // Add spinning class (animation happens via CSS)
    ballPath.classList.add('spinning');
    
    // Wait for animation to complete (5000ms = 5s)
    setTimeout(() => {
        ballPath.classList.remove('spinning');
        // Keep the final rotation position
        ballPath.style.transform = `rotate(${totalRotation}deg)`;
        
        // Move ball to the exact winning number position (animate inward onto the slice center)
        const canvas = document.getElementById('rouletteWheel');
        const canvasRect = canvas.getBoundingClientRect();
        const parentRect = canvas.offsetParent.getBoundingClientRect();
        const canvasLeft = canvasRect.left - parentRect.left;
        const canvasTop = canvasRect.top - parentRect.top;

        const wheelRadius = Math.min(canvas.width, canvas.height) / 2; // 150
        const textRadius = wheelRadius - 30; // same as drawRouletteWheel textRadius

        // Compute wedge center angle (use slice center)
        const sliceDeg = degreesPerNumber;
        const wedgeCenterDeg = ((winningNumber + 0.5) * sliceDeg) - 90;
        const angleRad = wedgeCenterDeg * Math.PI / 180;

        // Final position where the number text is drawn on canvas
        const finalX = canvasLeft + wheelRadius + Math.cos(angleRad) * textRadius;
        const finalY = canvasTop + wheelRadius + Math.sin(angleRad) * textRadius;

        // Position ball absolutely inside the wheel-container and animate to final coords
        const wheelContainer = document.querySelector('.wheel-container');
        const containerRect = wheelContainer.getBoundingClientRect();
        const relLeft = finalX - containerRect.left;
        const relTop = finalY - containerRect.top;

        ball.style.position = 'absolute';
        ball.style.transition = 'all 900ms cubic-bezier(0.22, 0.61, 0.36, 1)';
        // start from current (ballPath) position; ensure visible
        ball.style.display = '';

        // small delay to allow transition setup
        requestAnimationFrame(() => {
            ball.style.left = relLeft + 'px';
            ball.style.top = relTop + 'px';
            ball.style.transform = 'translate(-50%, -50%)';
        });

        // after transition ends, finalize and submit
        const onEnd = () => {
            ball.removeEventListener('transitionend', onEnd);
            // move ball out of the rotating path into the wheel container so it stays visible
            wheelContainer.appendChild(ball);
            // ensure absolute positioning relative to wheel container
            ball.style.left = relLeft + 'px';
            ball.style.top = relTop + 'px';
            ball.style.transform = 'translate(-50%, -50%)';
            // hide the rotating path (ball is now outside it)
            ballPath.style.display = 'none';
            // submit results
            submitBets(winningNumber);
        };
        ball.addEventListener('transitionend', onEnd);
    // Animate ball: ensure ball is inside the rotating path at start
    const ballPath = document.getElementById('ballPath');
    const ball = document.getElementById('rouletteBall');
    const wheelContainer = document.querySelector('.wheel-container');

    // If ball was reparented previously, move it back into the rotating path
    if (ball.parentNode !== ballPath) {
        ballPath.appendChild(ball);
    }

    // Reset ball inline styles for spin
    ball.style.transition = '';
    ball.style.left = '50%';
    ball.style.top = '-10px';
    ball.style.transform = 'translateX(-50%)';
    ball.style.display = '';
    ballPath.style.display = '';
    ballPath.style.transform = 'rotate(0deg)';

    // Set CSS custom property for final rotation (for the rotating path)
    ballPath.style.setProperty('--final-rotation', totalRotation + 'deg');

    // Add spinning class (animation happens via CSS on the path)
    ballPath.classList.add('spinning');

    // After the path rotation finishes, animate the ball to the outer edge above the winning number
    const spinDurationMs = 5000;
    setTimeout(() => {
        // stop spinning animation and keep final rotation
        ballPath.classList.remove('spinning');
        ballPath.style.transform = `rotate(${totalRotation}deg)`;

        // Compute final landing position near outer rim (just inside white track) above the wedge center
        const canvas = document.getElementById('rouletteWheel');
        const canvasRect = canvas.getBoundingClientRect();
        const containerRect = wheelContainer.getBoundingClientRect();
        const canvasLeft = canvasRect.left - containerRect.left;
        const canvasTop = canvasRect.top - containerRect.top;

        const wheelRadius = Math.min(canvas.width, canvas.height) / 2;
        // Position the ball closer to the outside edge (but inside the white track)
        const landingRadius = wheelRadius - 14; // slightly inside the rim

        // Use wedge center angle for accurate placement
        const sliceDeg = degreesPerNumber;
        const wedgeCenterDeg = ((winningNumber + 0.5) * sliceDeg) - 90;
        const angleRad = wedgeCenterDeg * Math.PI / 180;

        const finalX = canvasLeft + wheelRadius + Math.cos(angleRad) * landingRadius;
        const finalY = canvasTop + wheelRadius + Math.sin(angleRad) * landingRadius;

        // Reparent the ball to wheelContainer so it sits above the canvas and is not affected by path
        wheelContainer.appendChild(ball);
        ball.style.position = 'absolute';
        // place ball at the current visual position (start) then transition to final
        const startRect = ball.getBoundingClientRect();
        const startLeft = startRect.left - containerRect.left + startRect.width / 2;
        const startTop = startRect.top - containerRect.top + startRect.height / 2;
        ball.style.left = startLeft + 'px';
        ball.style.top = startTop + 'px';
        ball.style.transform = 'translate(-50%, -50%)';

        // animate into final rim position
        requestAnimationFrame(() => {
            ball.style.transition = 'all 900ms cubic-bezier(0.22, 0.61, 0.36, 1)';
            ball.style.left = finalX + 'px';
            ball.style.top = finalY + 'px';
            ball.style.transform = 'translate(-50%, -50%)';
        });

        // After transition ends, keep ball visible until next spin
        const onEnd = () => {
            ball.removeEventListener('transitionend', onEnd);
            // hide rotating path but leave ball visible
            ballPath.style.display = 'none';
            // do not call submitBets here; we'll call it after animation completes
            submitBets(winningNumber);
        };
        ball.addEventListener('transitionend', onEnd);
    }, spinDurationMs);
        
        gameState.bets.forEach(bet => {
            const payout = calculatePayout(bet.type, bet.value, serverWinningNumber, bet.amount);
            if (payout > 0) {
                results.push(`✓ ${getCellLabel(bet.type, bet.value)}: +€${payout.toFixed(2)}`);
            } else {
                results.push(`✗ ${getCellLabel(bet.type, bet.value)}: -€${bet.amount.toFixed(2)}`);
            }
        });
        
        // Update balance
        await updateBalance();
        
        // Display results
        displayResults(serverWinningNumber, totalWinnings, totalLosses, results);
        
        // Clear bets
        clearAllBets();
        
    } catch (error) {
        showError('Fout bij het versturen: ' + error);
    }
    
    gameState.isSpinning = false;
    document.getElementById('spinBtn').disabled = true;
}

function calculatePayout(betType, betValue, winningNumber, betAmount) {
    const isRed = RED_NUMBERS.includes(winningNumber);
    const isBlack = winningNumber !== 0 && !isRed;
    
    if (betType === 'number') {
        return winningNumber === parseInt(betValue) ? betAmount * 36 : 0;
    } else if (betType === 'red') {
        return isRed ? betAmount * 2 : 0;
    } else if (betType === 'black') {
        return isBlack ? betAmount * 2 : 0;
    } else if (betType === 'odd') {
        return winningNumber % 2 === 1 ? betAmount * 2 : 0;
    } else if (betType === 'even') {
        return winningNumber % 2 === 0 && winningNumber !== 0 ? betAmount * 2 : 0;
    } else if (betType === 'high') {
        return winningNumber >= 19 && winningNumber <= 36 ? betAmount * 2 : 0;
    } else if (betType === 'low') {
        return winningNumber >= 1 && winningNumber <= 18 ? betAmount * 2 : 0;
    }
    return 0;
}

function displayResults(winningNumber, totalWinnings, totalLosses, results) {
    const resultDiv = document.getElementById('gameResult');
    const titleElement = document.getElementById('resultTitle');
    const numberElement = document.getElementById('resultNumber');
    const payoutElement = document.getElementById('resultPayout');
    
    const isWin = totalWinnings > 0;
    
    if (isWin) {
        titleElement.textContent = '🎉 JE HEBT GEWONNEN!';
        titleElement.style.color = '#27ae60';
    } else {
        titleElement.textContent = '😢 Helaas verloren';
        titleElement.style.color = '#e74c3c';
    }
    
    numberElement.innerHTML = `<strong>Winning nummer: ${winningNumber}</strong><br><br>` + 
                               results.join('<br>');
    payoutElement.textContent = `Totaal winst: €${totalWinnings.toFixed(2)} | Verlies: €${totalLosses.toFixed(2)}`;
    
    resultDiv.style.display = 'block';
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

// ==================== ACCOUNT PAGE ====================

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('Wachtwoorden komen niet overeen', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/update-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(data.message, 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showNotification(data.error, 'danger');
        }
    } catch (error) {
        showNotification('Fout opgetreden: ' + error, 'danger');
    }
}

// ==================== HISTORY PAGE ====================

function handleSearchFilter(e) {
    const filter = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.games-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
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
