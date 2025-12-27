import kaplay from 'https://unpkg.com/kaplay@4000.0.0-alpha.24/dist/kaplay.mjs';

kaplay({
    background: [255, 255, 255],
    debug: true,
    pixelDensity: Math.min(devicePixelRatio, 2),
    crisp: true,
    canvas: document.getElementById('game'),
    touchToMouse: true
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
        e.preventDefault();
    } else if (e.key === 'Escape') {
        if (currentBuilding) {
            currentBuilding = null;

            document.querySelectorAll('.construction-action').forEach(s => {
                s.style.border = '2px solid white';
            });

            return
        }
        if (equippedWeapon) {
            destroy(equippedWeapon);
            equippedWeapon = null;

            document.querySelectorAll('.inventory .slot').forEach(s => {
                s.style.border = '2px solid white';
            });
        }
    }
});

import { MAP_SIZE, ZOOM_LEVEL, GRID_SIZE, SPEED, BUILDING_TYPES, WORLD_PADDING } from './config.js';
import { snapToGrid, isAreaFree, occupyArea, freeCells, isRectWithinBounds } from './grid.js';
import { loadAllSprites } from './assets.js';
import { updateLeaderboard } from './leaderboard.js';
import { initDefense } from './defense.js';
import { initEnemySystem, spawnZombie } from './enemy.js';
import { getResource } from './world.js';

loadAllSprites()
updateLeaderboard();
initDefense();
initEnemySystem();

let attackOffset = 0;


// Focus on canvas

document.getElementById("game").focus();
window.addEventListener("mousedown", (e) => {
    if (document.activeElement !== document.getElementById("game")) {
        document.getElementById("game").focus();
    }
});

/*
/  PLAYER SETUP
*/

export const player = add([
    sprite("player"),
    scale(0.1),
    pos(center()),
    color(255, 255, 0),
    anchor("center"),
    rotate(0),
    area({ shape: new Circle(vec2(0), 455), collisionIgnore: ["door"] }),
    {
        hp: 100,
        maxHp: 100,
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

player.add([sprite("hands"), pos(250, -300), anchor("left"), z(9)]);
player.add([sprite("hands"), pos(-250, -300), anchor("right"), z(9)]);

setCamScale(ZOOM_LEVEL);

// UPDATE LOOP
onUpdate(() => {
    const currentCam = getCamPos();
    if (currentCam.dist(player.pos) > 1) {
        setCamPos(player.pos);
    }

    const mouseWorld = toWorld(mousePos());
    const direction = mouseWorld.sub(player.pos)
    player.angle = direction.angle() + 90 + attackOffset;

    updateMiniMap()
    //updateHealth()

    if (player.pos.x < 0) player.pos.x = 0;
    if (player.pos.y < 0) player.pos.y = 0;
    if (player.pos.x > MAP_SIZE) player.pos.x = MAP_SIZE;
    if (player.pos.y > MAP_SIZE) player.pos.y = MAP_SIZE;

    if (isAutoAttacking) {
        if (!isAttacking && equippedWeapon) {
            performAttack();
        }
    }

    const isHoveringUI = document.querySelector('.modal:hover') || document.querySelector('.construction-bar:hover') || document.querySelector('.inventory:hover');

    if (!isHoveringUI) {
        const mouseWorld = toWorld(mousePos());
        const direction = mouseWorld.sub(player.pos);
        player.angle = direction.angle() + 90 + attackOffset;
    }
    if (player.goldTimer > 0) player.goldTimer -= dt();
    if (player.woodTimer > 0) player.woodTimer -= dt();
    if (player.stoneTimer > 0) player.stoneTimer -= dt();

})

onKeyDown('w', () => player.move(0, -SPEED));
onKeyDown('s', () => player.move(0, SPEED));
onKeyDown('a', () => player.move(-SPEED, 0));
onKeyDown('d', () => player.move(SPEED, 0));

// INVENTORY
let equippedWeapon = null;
const slots = document.querySelectorAll('.inventory .slot');
slots.forEach(slot => {
    slot.addEventListener('click', () => {
        currentBuilding = null;

        slots.forEach(s => s.style.border = '2px solid white');
        slot.style.border = '2px solid yellow';
        setTimeout(() => document.getElementById("game").focus(), 10);

        const itemType = slot.getAttribute('data-item');

        if (equippedWeapon) {
            destroy(equippedWeapon);
            equippedWeapon = null;
        }

        if (!itemType) return;

        if (itemType === 'sword') {
            equippedWeapon = player.add([sprite("sword"), pos(-500, -500), anchor("left"), scale(1), rotate(0), "weapon", "sword"]);
        } else if (itemType === "axe") {
            equippedWeapon = player.add([sprite("axe"), pos(-500, -500), anchor("left"), scale(1), rotate(0), "weapon", "axe"]);
        } else if (itemType === "bow") {
            equippedWeapon = player.add([sprite("bow"), pos(-500, -700), anchor("left"), scale(1), rotate(0), "weapon", "bow"]);
        }
    })
})


export function updateHealth() {
    const healthText = document.getElementById('health-text');
    const healthBarFill = document.getElementById('health-bar-fill');
    healthText.textContent = `Health: ${Math.floor(player.hp) / player.maxHp * 100}%`;
    if (healthBarFill) {
        healthBarFill.style.width = `${Math.floor((player.hp / player.maxHp) * 100)}%`;
    }
}
export function updateBuildingHealthBar(target) {
    if (target.hp === undefined || target.maxHp === undefined) return;

    const existingBars = [
        ...target.get("building-health-bar-bg"),
        ...target.get("building-health-bar-fill")
    ];
    existingBars.forEach((b) => destroy(b));

    const baseWidth = target.width || 100;
    const barWidth = Math.max(80, baseWidth);
    const barHeight = 14;
    const scaleY = target.scale?.y || 1;
    const yOffset = -((target.height || 100) * scaleY) / 2 - 20;

    target.add([
        rect(barWidth, barHeight),
        pos(0, yOffset),
        anchor("center"),
        color(0, 0, 0),
        z(100),
        "building-health-bar-bg"
    ]);

    const fillWidth = Math.max(0, (target.hp / target.maxHp) * (barWidth - 4));

    target.add([
        rect(fillWidth, barHeight - 4),
        pos(-barWidth / 2 + 2, yOffset),
        anchor("left"),
        color(0, 200, 0),
        z(101),
        "building-health-bar-fill"
    ]);
}

function updateMiniMap() {
    const mini = document.getElementById('minimap-player');
    const pX = (player.pos.x / MAP_SIZE) * 100;
    const pY = (player.pos.y / MAP_SIZE) * 100;
    mini.style.left = `${Math.max(0, Math.min(100, pX))}%`;
    mini.style.top = `${Math.max(0, Math.min(100, pY))}%`;
}

// Minner animation
onUpdate("gold-miner", (m) => {
    const spinner = m.get("turret")[0];

    if (spinner) {
        const animSpeed = 200;
        spinner.angle += animSpeed * dt();

        if (spinner.angle >= 360) spinner.angle -= 360;
    }

    getResource("gold", 0.1);

});


let currentBuilding = null;
let placementGhost = null;
let canBuildHere = false;

// Ghost Logic
onUpdate(() => {
    if (currentBuilding) {
        get('border-guide').forEach(guide => {
            guide.opacity = lerp(guide.opacity, 0.25, dt() * 10);
        });

        const conf = BUILDING_TYPES[currentBuilding];
        const mouseWorld = toWorld(mousePos());
        const snapped = snapToGrid(mouseWorld);
        const idealX = snapped.x;
        const idealY = snapped.y;

        const hasTurret = conf.isDefense;
        const baseScale = hasTurret ? (conf.scale * 3) : conf.scale;
        const baseSprite = hasTurret ? "wall" : conf.sprite;

        if (!placementGhost) {
            placementGhost = add([
                sprite(baseSprite),
                opacity(0.5),
                pos(vec2(idealX, idealY)),
                anchor("center"),
                body({ isStatic: true }),
                scale(baseScale),
                z(100),
                "ghost"
            ]);
            if (hasTurret) {
                placementGhost.add([
                    sprite(conf.sprite),
                    pos(0, 0),
                    anchor("center"),
                    scale(1 / 3),
                    rotate(0),
                    opacity(0.5),
                    z(101),
                    "turret"
                ]);
            }
        } else {
            placementGhost.pos = vec2(idealX, idealY);
            placementGhost.scaleTo = baseScale;
        }

        let isFree = true;
        const mainBase = get("gold-mine")[0];
        if (mainBase) {
            if (vec2(idealX, idealY).dist(mainBase.pos) > 1000) {
                isFree = false;
            }
        } else if (currentBuilding !== "gold-mine") {
            isFree = false;
        }

        if (!isRectWithinBounds({ x: idealX, y: idealY }, conf.width, conf.height, MAP_SIZE, WORLD_PADDING)) {
            isFree = false;
        }

        if (isFree && !isAreaFree({ x: idealX, y: idealY }, conf.width, conf.height)) {
            isFree = false;
        }

        if (isFree) {
            const allObstacles = [
                ...get("tree"), ...get("rock"), ...get("player")
            ];
            for (const obj of allObstacles) {
                const ghostHalfW = conf.width / 2;
                const ghostHalfH = conf.height / 2;
                const dx = Math.abs(idealX - obj.pos.x);
                const dy = Math.abs(idealY - obj.pos.y);
                const objRadius = (obj.area && obj.area.shape && obj.area.shape.radius)
                    ? obj.area.shape.radius * (obj.scale ? obj.scale.x : 1)
                    : 40;
                if (dx < ghostHalfW && dy < ghostHalfH) {
                    isFree = false;
                    break;
                }
                if (vec2(idealX, idealY).dist(obj.pos) < objRadius + Math.max(ghostHalfW, ghostHalfH)) {
                    isFree = false;
                    break;
                }
            }
        }

        canBuildHere = isFree;
        placementGhost.color = isFree ? rgb(255, 255, 255) : rgb(255, 100, 100);

    } else {
        if (placementGhost) {
            destroy(placementGhost);
            placementGhost = null;
        }
        get('border-guide').forEach(guide => {
            guide.opacity = lerp(guide.opacity, 0, dt() * 10);
        });
    }
});
// Building Logic
function buildStructure(type, position) {
    const structure = BUILDING_TYPES[type];
    if (!structure) return;
    if (type !== 'gold-mine' && get('gold-mine').length === 0) {
        alert('Você precisa construir a Gold Mine primeiro!');
        return;
    }

    let opacityValue = 1;

    if (type === "door") {
        // Allow the player to pass through doors
        opacityValue = 0.5;
    }

    const hasTurret = structure.isDefense;
    const baseScale = hasTurret ? (structure.scale * 3) : structure.scale;
    const baseSprite = hasTurret ? "wall" : structure.sprite;

    const building = add([
        sprite(baseSprite),
        opacity(opacityValue),
        pos(position),
        anchor("center"),
        area(type === "door" ? { collisionIgnore: ["player"] } : {}),
        body({ isStatic: true }),
        scale(baseScale),
        z(0),
        type,
        "structure",
        {
            hp: structure.health,
            maxHp: structure.health,
            buildingId: type,
            cost: structure.cost,
            width: structure.width,
            height: structure.height
        },
        offscreen({ hide: true, pause: true, distance: 300 })
    ]);

    if (hasTurret) {
        building.add([
            sprite(structure.sprite),
            pos(0, 0),
            anchor("center"),
            scale(1 / 3),
            rotate(0),
            z(1),
            "turret"
        ]);
    }

    const cells = occupyArea({ x: position.x, y: position.y }, structure.width, structure.height);
    building.gridCells = cells;
    if (building.onDestroy) {
        building.onDestroy(() => freeCells(cells));
    }
}

// Key Bindings
const constructionSlots = document.querySelectorAll('.construction-action');

constructionSlots.forEach(slot => {
    slot.addEventListener('click', () => {
        const type = slot.getAttribute('data-id');

        if (!BUILDING_TYPES[type]) {
            console.warn(`Tipo "${type}" não definido no config.js`);
            return;
        }

        if (currentBuilding === type) {
            currentBuilding = null;
            slot.style.border = '2px solid white';
            return;
        }

        currentBuilding = type;
        console.log("Modo: CONSTRUÇÃO", type);

        document.querySelectorAll('.inventory .slot').forEach(s => s.style.border = '2px solid white');
        constructionSlots.forEach(s => s.style.border = '2px solid white');

        slot.style.border = '2px solid yellow';

        if (equippedWeapon) {
            destroy(equippedWeapon);
            equippedWeapon = null;
        }

        setTimeout(() => document.getElementById("game").focus(), 10);
    });
});

// ATTACK & INTERACTION LOGIC
let isAttacking = false;
let canShoot = true;
const FIRE_RATE = 0.5;
let isAutoAttacking = false;

function performAttack() {
    if (currentBuilding) {
        const config = BUILDING_TYPES[currentBuilding];
        const maxLimit = config.max || Infinity;

        const currentCount = get(currentBuilding).length;

        if (currentCount >= maxLimit) {
            // TODO
            return
        }
        if (placementGhost && canBuildHere) {
            buildStructure(currentBuilding, placementGhost.pos);
        }
    }

    if (isAttacking || !equippedWeapon) return;

    // Bow Logic
    if (equippedWeapon.is("bow")) {
        if (!canShoot) return;
        canShoot = false;
        wait(FIRE_RATE, () => canShoot = true);

        const mouseWorld = toWorld(mousePos());
        const direction = mouseWorld.sub(player.pos).unit();
        const spawnPos = player.pos.add(direction.scale(80));

        const arrow = add([
            sprite("sword"),
            pos(spawnPos),
            anchor("center"),
            rotate(direction.angle()),
            scale(0.04),
            area(),
            move(direction, 1000),
            offscreen({ destroy: true }),
            "arrow",
            z(5)
        ]);

        arrow.onCollide("tree", () => destroy(arrow));
        arrow.onCollide("rock", () => destroy(arrow));
        arrow.onCollide("wall", () => destroy(arrow));
        return;
    }

    // Melee Logic
    isAttacking = true;
    const mouseWorld = toWorld(mousePos());
    const direction = mouseWorld.sub(player.pos).unit();
    const hitPos = player.pos.add(direction.scale(50));

    const hitbox = add([circle(40), pos(hitPos), area(), opacity(0), "hit"]);

    hitbox.onCollide("tree", (t) => {
        if (equippedWeapon.is("axe")) {
            getResource("wood");
            const originalX = t.pos.x;
            tween(originalX, originalX + 5, 0.05, (v) => t.pos.x = v)
                .then(() => tween(originalX + 5, originalX - 5, 0.05, (v) => t.pos.x = v))
                .then(() => tween(originalX - 5, originalX, 0.05, (v) => t.pos.x = v));
        }
    });
    hitbox.onCollide("rock", (r) => {
        if (equippedWeapon.is("axe")) {
            getResource("stone");
            const originalX = r.pos.x;
            tween(originalX, originalX + 5, 0.05, (v) => r.pos.x = v)
                .then(() => tween(originalX + 5, originalX - 5, 0.05, (v) => r.pos.x = v))
                .then(() => tween(originalX - 5, originalX, 0.05, (v) => r.pos.x = v));
        }
    });
    hitbox.onCollide("player", (p) => {
        if (p !== player && equippedWeapon.is("sword")) damage(p);
    });

    wait(0.1, () => destroy(hitbox));

    tween(0, -50, 0.15, (val) => attackOffset = val, easings.easeOutBack)
        .then(() => tween(-50, 0, 0.25, (val) => attackOffset = val, easings.easeInOutSine))
        .then(() => {
            wait(0.3, () => isAttacking = false);
        });
}

onMousePress(() => performAttack());

onKeyPress("space", () => {
    isAutoAttacking = !isAutoAttacking;
});


const structureMenu = document.getElementById("structure-menu");
let selectedStructure = null;

onMousePress("left", () => {
    if (structureMenu) structureMenu.style.display = "none";

    if (equippedWeapon && equippedWeapon.is("axe")) {
        const mPos = toWorld(mousePos());
        const targets = get("structure").filter(s => s.hasPoint(mPos));

        if (targets.length > 0) {
            selectedStructure = targets[0];

            const screenPos = toScreen(selectedStructure.pos);
            structureMenu.style.display = "flex";
            structureMenu.style.left = `${screenPos.x}px`;
            structureMenu.style.top = `${screenPos.y}px`;

            isAttacking = true;
            wait(0.1, () => isAttacking = false);
            return;
        }
    }
});

document.getElementById("delete-btn").addEventListener("click", () => {
    if (selectedStructure) {
        if (selectedStructure.gridCells) {
            freeCells(selectedStructure.gridCells);
        }
        destroy(selectedStructure);
        selectedStructure = null;
        structureMenu.style.display = "none";
        document.getElementById("game").focus();
    }
});

document.getElementById("upgrade-btn").addEventListener("click", () => {
    if (selectedStructure) {
        selectedStructure.maxHp *= 1.5;
        selectedStructure.hp = selectedStructure.maxHp;
        selectedStructure.scale = selectedStructure.scale.scale(1.1);

        structureMenu.style.display = "none";
        document.getElementById("game").focus();
    }
});