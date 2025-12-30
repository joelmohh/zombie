export let isGameOver = false;

export function triggerGameOver(reason) {
    if (isGameOver) return;
    
    isGameOver = true;
    
    showGameOverScreen(reason);
}

function showGameOverScreen(reason) {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over-screen';
    gameOverDiv.innerHTML = `
        <div class="game-over-content">
            <h1 class="game-over-title">GAME OVER</h1>
            <p class="game-over-reason">${reason}</p>
            <button class="game-over-restart" onclick="window.location.reload()">RESTART GAME</button>
        </div>
    `;
    
    document.body.appendChild(gameOverDiv);
    
    setTimeout(() => {
        gameOverDiv.classList.add('show');
    }, 100);
}

export function handlePlayerDeath(player) {
    const structures = get("structure");
    structures.forEach(structure => {
        destroy(structure);
    });
    
    const zombies = get("zombie");
    zombies.forEach(zombie => {
        destroy(zombie);
    });
    triggerGameOver("You died! All your structures have been destroyed.");
}

export function handleGoldMineDestroyed() {
    const structures = get("structure");
    structures.forEach(structure => {
        destroy(structure);
    });
    
    const zombies = get("zombie");
    zombies.forEach(zombie => {
        destroy(zombie);
    });
    
    triggerGameOver("Your Gold Mine was destroyed! All structures have been lost.");
}

export function checkGoldMineStatus() {
    const goldMines = get("gold-mine");
    if (goldMines.length === 0) {
        const hadGoldMine = localStorage.getItem('hadGoldMine');
        if (hadGoldMine === 'true') {
            handleGoldMineDestroyed();
        }
    } else {
        localStorage.setItem('hadGoldMine', 'true');
    }
}

export function resetGameOverState() {
    isGameOver = false;
    localStorage.removeItem('hadGoldMine');
}
