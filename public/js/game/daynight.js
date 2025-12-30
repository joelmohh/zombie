// Day/Night cycle system
// Day: 60 seconds
// Night: 60 seconds
// Zombies only spawn at night

const DAY_DURATION = 60; 
const NIGHT_DURATION = 60; 
const TOTAL_CYCLE_DURATION = DAY_DURATION + NIGHT_DURATION;

export let currentTime = 0; // 0-120 seconds
export let isNight = false;
export let currentWave = 0;
export let zombiesThisWave = 0;

let timeAccumulator = 0;

export function initDayNightSystem() {
    currentTime = 0;
    isNight = false;
    currentWave = 0;
    zombiesThisWave = 0;
    
    updateDayNightUI();
}

export function updateDayNightCycle(dt) {
    timeAccumulator += dt;
    currentTime += dt;
    
    if (currentTime >= TOTAL_CYCLE_DURATION) {
        currentTime = 0;
    }
    
    const wasNight = isNight;
    
    isNight = currentTime >= DAY_DURATION;
    
    if (isNight && !wasNight) {
        onNightStart();
    }
    
    if (!isNight && wasNight) {
        onDayStart();
    }
    
    updateDayNightUI();
}

function onNightStart() {
    currentWave++;
    zombiesThisWave = 0;
    console.log(`Night ${currentWave} has begun!`);
    
    if(localStorage.getItem('hadGoldMine') == 'true') {
        import('../ui/toast.js').then(module => {
            module.showToast(`🌙 Night ${currentWave} - Zombies are coming!`, 3000, module.ToastType.WARNING);
        });
    }else{
        return
    }
    
}

function onDayStart() {
    console.log(`Day ${currentWave + 1} has begun!`);
    
    import('../ui/toast.js').then(module => {
        module.showToast(`☀️ Day ${currentWave + 1} - Time to prepare!`, 3000, module.ToastType.SUCCESS);
    });
}

function updateDayNightUI() {
    const indicator = document.getElementById('day-night-indicator');
    if (!indicator) return;
    
    const timeInCurrentPhase = isNight ? currentTime - DAY_DURATION : currentTime;
    const phaseProgress = isNight ? 
        (timeInCurrentPhase / NIGHT_DURATION) * 100 : 
        (timeInCurrentPhase / DAY_DURATION) * 100;
    
    const timeRemaining = isNight ? 
        Math.ceil(NIGHT_DURATION - timeInCurrentPhase) : 
        Math.ceil(DAY_DURATION - timeInCurrentPhase);
    
    const icon = isNight ? '🌙' : '☀️';
    const label = isNight ? `NIGHT ${currentWave}` : `DAY ${currentWave + 1}`;
    const phaseClass = isNight ? 'night' : 'day';
    
    indicator.innerHTML = `
        <div class="day-night-info">
            <span class="day-night-label">${icon} ${label}</span>
            <span class="day-night-timer">${timeRemaining}s</span>
        </div>
        <div class="day-night-progress-bg">
            <div class="day-night-progress-fill ${phaseClass}" style="width: ${phaseProgress}%"></div>
        </div>
    `;
}

export function canSpawnZombies() {
    return isNight;
}

export function incrementZombieCount() {
    zombiesThisWave++;
}

export function getWaveMultiplier() {
    // Increase difficulty with each wave
    return 1 + (currentWave * 0.15);
}
