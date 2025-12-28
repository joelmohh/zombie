import { player } from '../game/player.js';

export function refreshResourceUI() {
    const goldEl = document.getElementById('gold-amount');
    const woodEl = document.getElementById('wood-amount');
    const stoneEl = document.getElementById('stone-amount');

    if (goldEl) goldEl.innerText = player.gold;
    if (woodEl) woodEl.innerText = player.wood;
    if (stoneEl) stoneEl.innerText = player.stone;
}

export function hasResources(cost = { wood: 0, stone: 0, gold: 0 }) {
    const wood = cost.wood || 0;
    const stone = cost.stone || 0;
    const gold = cost.gold || 0;
    return player.wood >= wood && player.stone >= stone && player.gold >= gold;
}

export function spendResources(cost = { wood: 0, stone: 0, gold: 0 }) {
    player.wood -= cost.wood || 0;
    player.stone -= cost.stone || 0;
    player.gold -= cost.gold || 0;
    refreshResourceUI();
}

export function showFloatingText(message, colorValue = rgb(255, 255, 255)) {
    add([
        text(message, { size: 20 }),
        pos(player.pos.x, player.pos.y - 60),
        color(colorValue),
        z(120),
        opacity(1),
        lifespan(1, { fade: 0.5 }),
        move(vec2(0, -1), 50)
    ]);
}
