import { player } from '../game/player.js';

export function updateHealth() {
    const healthText = document.getElementById('health-text');
    const healthBarFill = document.getElementById('health-bar-fill');
    const shieldText = document.getElementById('shield-text');
    const shieldBarFill = document.getElementById('shield-bar-fill');
    const healthPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    const shieldPercent = player.maxShield > 0 ? Math.max(0, Math.min(100, (player.shield / player.maxShield) * 100)) : 0;

    if (healthText) {
        healthText.textContent = `Health: ${healthPercent.toFixed(0)}%`;
    }
    if (healthBarFill) {
        healthBarFill.style.width = `${healthPercent}%`;
    }
    if (shieldText) {
        shieldText.textContent = `Shield: ${shieldPercent.toFixed(0)}%`;
    }
    if (shieldBarFill) {
        shieldBarFill.style.width = `${shieldPercent}%`;
        const container = shieldBarFill.parentElement;
        if (container) {
            container.style.opacity = player.shield > 0 ? 1 : 0.35;
        }
    }
}

export function updateBuildingHealthBar(target) {
    if (target.hp === undefined || target.maxHp === undefined) return;

    const existingBars = [
        ...target.get("building-health-bar-bg"),
        ...target.get("building-health-bar-fill")
    ];
    existingBars.forEach((b) => destroy(b));

    // Don't show health bar if at full health
    if (target.hp >= target.maxHp) return;

    const baseWidth = target.width || 100;
    const barWidth = Math.max(100, baseWidth * 1.2);
    const barHeight = 30;
    const scaleY = target.scale?.y || 1;
    const yOffset = -((target.height || 100) * scaleY) / 2 - 35;

    target.add([
        rect(barWidth, barHeight),
        pos(0, yOffset),
        anchor("center"),
        color(0, 0, 0),
        z(100),
        "building-health-bar-bg"
    ]);

    const fillWidth = Math.max(0, (target.hp / target.maxHp) * (barWidth - 8));
    const healthPercent = target.hp / target.maxHp;
    let barColor = rgb(0, 200, 0); // Green
    if (healthPercent < 0.3) barColor = rgb(200, 0, 0); // Red
    else if (healthPercent < 0.6) barColor = rgb(255, 165, 0); // Orange

    target.add([
        rect(fillWidth, barHeight - 8),
        pos(-barWidth / 2 + 4, yOffset),
        anchor("left"),
        color(barColor),
        z(101),
        "building-health-bar-fill"
    ]);
}

export function updateMiniMap() {
    const mini = document.getElementById('minimap-player');
    const pX = (player.pos.x / 10000) * 100; // MAP_SIZE = 10000
    const pY = (player.pos.y / 10000) * 100;
    mini.style.left = `${Math.max(0, Math.min(100, pX))}%`;
    mini.style.top = `${Math.max(0, Math.min(100, pY))}%`;
}
