import { ZOOM_LEVEL, SPEED, MAP_SIZE } from '../utils/config.js';
import { updateHealth, updateMiniMap, updateBuildingHealthBar } from '../ui/healthbars.js';
import { refreshResourceUI } from '../ui/resources.js';

export let player = null;
export let attackOffset = 0;

export function getAttackOffset() {
    return attackOffset;
}

export function setAttackOffset(value) {
    attackOffset = value;
}

export function initPlayer() {
    player = add([
        sprite("player"),
        scale(0.05),
        pos(center()),
        color(255, 255, 0),
        anchor("center"),
        rotate(0),
        area({ shape: new Circle(vec2(0), 900), collisionIgnore: ["door"] }),
        {
            hp: 100,
            maxHp: 100,
            shield: 0,
            maxShield: 0,
            gold: 0,
            wood: 0,
            stone: 0,
            goldTimer: 0,
            woodTimer: 0,
            stoneTimer: 0
        },
        body(),
        "player",
        z(10)
    ]);

    refreshResourceUI();

    player.add([sprite("hands"), scale(1), pos(800, -300), anchor("center"), z(9)]);
    player.add([sprite("hands"), scale(1), pos(-800, -300), anchor("center"), z(9)]);

    setCamScale(ZOOM_LEVEL);
    updateHealth();

    return player;
}

export function updatePlayerMovement() {
    const currentCam = getCamPos();
    if (currentCam.dist(player.pos) > 1) {
        setCamPos(player.pos);
    }

    updateMiniMap();

    if (player.pos.x < 0) player.pos.x = 0;
    if (player.pos.y < 0) player.pos.y = 0;
    if (player.pos.x > MAP_SIZE) player.pos.x = MAP_SIZE;
    if (player.pos.y > MAP_SIZE) player.pos.y = MAP_SIZE;

    if (player.goldTimer > 0) player.goldTimer -= dt();
    if (player.woodTimer > 0) player.woodTimer -= dt();
    if (player.stoneTimer > 0) player.stoneTimer -= dt();

    // Regenerate building health slowly
    get("structure").forEach(building => {
        if (building.hp < building.maxHp) {
            building.hp = Math.min(building.maxHp, building.hp + (building.maxHp * 0.01 * dt()));
            updateBuildingHealthBar(building);
        }
    });
}

export function setupPlayerControls() {
    onKeyDown('w', () => player.move(0, -SPEED));
    onKeyDown('s', () => player.move(0, SPEED));
    onKeyDown('a', () => player.move(-SPEED, 0));
    onKeyDown('d', () => player.move(SPEED, 0));
}
