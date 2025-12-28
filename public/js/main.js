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

import { MAP_SIZE, ZOOM_LEVEL, SPEED, BUILDING_TYPES, WORLD_PADDING } from './config.js';
import { snapToGrid, isAreaFree, occupyArea, freeCells, isRectWithinBounds } from './grid.js';
import { loadAllSprites } from './assets.js';
import { updateLeaderboard } from './leaderboard.js';
import { initDefense, applyWeaponTint, getWeaponUpgradeCost, getWeaponDamage, getLevelColor, potionCatalog, weaponState, MAX_BUILDING_LEVEL } from './defense.js';
import { initEnemySystem, damageZombie } from './enemy.js';
import { getResource } from './world.js';
import { showToast, ToastType } from './toast.js';

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

player.add([sprite("hands"), scale(1.5), pos(250, -200), anchor("left"), z(9)]);
player.add([sprite("hands"), scale(1.5), pos(-250, -200), anchor("right"), z(9)]);

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

// Potion inventory
const potionInventory = {
    health: 0,
    shield: 0
};

function updatePotionUI() {
    const healthSlot = document.getElementById("potion-health");
    const shieldSlot = document.getElementById("potion-shield");
    
    if (healthSlot) {
        if (potionInventory.health > 0) {
            healthSlot.setAttribute('data-type', 'Health');
            healthSlot.setAttribute('data-count', potionInventory.health);
            healthSlot.style.display = 'flex';
        } else {
            healthSlot.style.display = 'none';
        }
    }
    
    if (shieldSlot) {
        if (potionInventory.shield > 0) {
            shieldSlot.setAttribute('data-type', 'Shield');
            shieldSlot.setAttribute('data-count', potionInventory.shield);
            shieldSlot.style.display = 'flex';
        } else {
            shieldSlot.style.display = 'none';
        }
    }
}

const slots = document.querySelectorAll('.inventory .slot');
slots.forEach(slot => {
    slot.addEventListener('click', () => {
        currentBuilding = null;

        slots.forEach(s => s.style.border = '2px solid white');
        slot.style.border = '2px solid yellow';
        setTimeout(() => document.getElementById("game").focus(), 10);

        const itemType = slot.getAttribute('data-item');
        const potionType = slot.getAttribute('data-potion');

        // Handle potions
        if (potionType) {
            if (potionInventory[potionType] > 0) {
                usePotion(potionType);
            } else {
                showToast("No potions available", 2000, ToastType.WARNING);
            }
            slot.style.border = '2px solid white';
            return;
        }

        if (equippedWeapon) {
            destroy(equippedWeapon);
            equippedWeapon = null;
        }

        if (!itemType) return;

        if (itemType === 'sword') {
            equippedWeapon = player.add([sprite("swordLevel1"), pos(-500, -500), anchor("left"), scale(1), rotate(45), "weapon", "sword"]);
        } else if (itemType === "axe") {
            equippedWeapon = player.add([sprite("axeLevel1"), pos(-500, -500), anchor("left"), scale(1), rotate(45), "weapon", "axe"]);
        } else if (itemType === "bow") {
            equippedWeapon = player.add([sprite("bowLevel1"), pos(-500, -700), anchor("left"), scale(1), rotate(45), "weapon", "bow"]);
        }


        if (equippedWeapon && weaponState[itemType]) {
            equippedWeapon.weaponType = itemType;
            applyWeaponTint(equippedWeapon, weaponState[itemType].level);
        }
    })
})

function usePotion(potionType) {
    if (potionInventory[potionType] <= 0) return;
    
    if (potionType === "health") {
        const heal = potionCatalog.health.heal;
        player.hp = Math.min(player.hp + heal, player.maxHp);
        showFloatingText(`+${heal} Health`, rgb(100, 255, 100));
    } else if (potionType === "shield") {
        player.maxShield = potionCatalog.shield.shield;
        player.shield = player.maxShield;
        showFloatingText(`+${potionCatalog.shield.shield} Shield`, rgb(100, 150, 255));
    }
    
    potionInventory[potionType]--;
    updatePotionUI();
    updateHealth();
    document.getElementById("game").focus();
}

function getEquippedWeaponType() {
    if (!equippedWeapon) return null;
    if (equippedWeapon.weaponType) return equippedWeapon.weaponType;
    if (equippedWeapon.is("sword")) return "sword";
    if (equippedWeapon.is("axe")) return "axe";
    if (equippedWeapon.is("bow")) return "bow";
    return null;
}

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

export function refreshResourceUI() {
    const goldEl = document.getElementById('gold-amount');
    const woodEl = document.getElementById('wood-amount');
    const stoneEl = document.getElementById('stone-amount');

    if (goldEl) goldEl.innerText = player.gold;
    if (woodEl) woodEl.innerText = player.wood;
    if (stoneEl) stoneEl.innerText = player.stone;
}

function hasResources(cost = { wood: 0, stone: 0, gold: 0 }) {
    const wood = cost.wood || 0;
    const stone = cost.stone || 0;
    const gold = cost.gold || 0;
    return player.wood >= wood && player.stone >= stone && player.gold >= gold;
}

function spendResources(cost = { wood: 0, stone: 0, gold: 0 }) {
    player.wood -= cost.wood || 0;
    player.stone -= cost.stone || 0;
    player.gold -= cost.gold || 0;
    refreshResourceUI();
}

function showFloatingText(message, colorValue = rgb(255, 255, 255)) {
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

function applyStructureColor(structure) {
    const level = structure.upgradeLevel || 1;
    const colorInfo = getLevelColor(level);
    structure.color = colorInfo.tint;
    const turret = structure.get("turret")[0];
    if (turret) {
        turret.color = colorInfo.tint;
    }
}

function computeStructureHealth(baseHealth, level) {
    return Math.round(baseHealth * (1 + 0.35 * (level - 1)));
}

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
        const baseSprite = hasTurret ? "backBuildingLevel1" : conf.sprite;

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

            // Update sprite if building type changed
            if (placementGhost.sprite !== baseSprite) {
                destroy(placementGhost);
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
                placementGhost.scaleTo = baseScale;
            }
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
        showToast('You need to build the Gold Mine first!', 3000, ToastType.WARNING);
        return;
    }

    const cost = structure.cost || { wood: 0, stone: 0, gold: 0 };
    if (!hasResources(cost)) {
        showToast(`Insufficient resources: ${cost.wood || 0} wood / ${cost.stone || 0} stone`, 3000, ToastType.ERROR);
        return;
    }
    refreshResourceUI();

    spendResources(cost);

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
            baseHealth: structure.health,
            buildingId: type,
            structureType: type,
            cost: structure.cost,
            upgradeLevel: 1,
            baseScale: baseScale
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
    applyStructureColor(building);
}

// Key Bindings
const constructionSlots = document.querySelectorAll('.construction-action');

const formatCost = (cost = { wood: 0, stone: 0, gold: 0 }) => `Wood: ${cost.wood || 0} | Stone: ${cost.stone || 0}`;

constructionSlots.forEach(slot => {
    const type = slot.getAttribute('data-id');
    const conf = BUILDING_TYPES[type];
    if (conf) {
        slot.setAttribute('data-tooltip', `${type} - ${formatCost(conf.cost)}`);
    }
});

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

    const equippedType = getEquippedWeaponType();

    if (isAttacking || !equippedWeapon) return;

    // Bow Logic
    if (equippedWeapon.is("bow")) {
        if (!canShoot) return;
        canShoot = false;
        wait(FIRE_RATE, () => canShoot = true);

        const arrowDamage = getWeaponDamage("bow");
        const arrowTint = getLevelColor(weaponState.bow.level).tint;

        const mouseWorld = toWorld(mousePos());
        const direction = mouseWorld.sub(player.pos).unit();
        const spawnPos = player.pos.add(direction.scale(80));

        const arrow = add([
            sprite("sword"),
            pos(spawnPos),
            anchor("center"),
            rotate(direction.angle()),
            scale(0.04),
            color(arrowTint),
            area(),
            move(direction, 1000),
            offscreen({ destroy: true }),
            "arrow",
            z(5)
        ]);

        arrow.onCollide("tree", () => destroy(arrow));
        arrow.onCollide("rock", () => destroy(arrow));
        arrow.onCollide("wall", () => destroy(arrow));
        arrow.onCollide("zombie", (z) => {
            damageZombie(z, arrowDamage);
            destroy(arrow);
        });
        return;
    }

    // Melee Logic
    isAttacking = true;
    const weaponDamageValue = getWeaponDamage(equippedType);

    const angle = (player.angle - 90) * (Math.PI / 180);

    let weaponReach = 70;
    if (equippedType === "sword") weaponReach = 120;
    if (equippedType === "axe") weaponReach = 110;

    const tipX = player.pos.x + Math.cos(angle) * weaponReach;
    const tipY = player.pos.y + Math.sin(angle) * weaponReach;
    const hitPos = vec2(tipX, tipY);
    const hitbox = add([
        circle(40),
        pos(hitPos),
        area(),
        opacity(0),
        "hit"
    ]);

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

    hitbox.onCollide("zombie", (z) => {
        if (weaponDamageValue > 0) {
            damageZombie(z, weaponDamageValue);
        }
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

function getStructureUpgradeCost(structureType, currentLevel) {
    const config = BUILDING_TYPES[structureType];
    if (!config) return { gold: 0, wood: 0, stone: 0 };
    
    const baseCost = config.cost || { wood: 0, stone: 0 };
    const levelMultiplier = 1 + (currentLevel * 0.3);
    
    return {
        gold: Math.round(20 * levelMultiplier),
        wood: Math.round((baseCost.wood || 0) * levelMultiplier),
        stone: Math.round((baseCost.stone || 0) * levelMultiplier)
    };
}

function getStructureName(structureType) {
    const names = {
        "wall": "Wall",
        "door": "Door",
        "gold-mine": "Gold Mine",
        "gold-miner": "Gold Miner",
        "tower_archer": "Archer Tower",
        "tower_cannon": "Cannon Tower",
        "tower_bomber": "Bomber Tower",
        "tower_magic": "Magic Tower"
    };
    return names[structureType] || "Structure";
}

function updateStructureMenu() {
    if (!selectedStructure) return;
    
    const currentLevel = selectedStructure.upgradeLevel || 1;
    const structureType = selectedStructure.structureType;
    const cost = getStructureUpgradeCost(structureType, currentLevel);
    const colorInfo = getLevelColor(currentLevel);
    
    document.getElementById("structure-name").textContent = getStructureName(structureType);
    document.getElementById("structure-level").textContent = currentLevel;
    document.getElementById("structure-level").style.color = colorInfo.hex;
    document.getElementById("structure-health").textContent = `${Math.round(selectedStructure.hp)}/${Math.round(selectedStructure.maxHp)}`;
    document.getElementById("upgrade-cost-gold").textContent = cost.gold;
    document.getElementById("upgrade-cost-wood").textContent = cost.wood;
    document.getElementById("upgrade-cost-stone").textContent = cost.stone;
    
    const upgradeBtn = document.getElementById("upgrade-btn");
    if (currentLevel >= MAX_BUILDING_LEVEL) {
        upgradeBtn.textContent = "MAX LEVEL";
        upgradeBtn.disabled = true;
        upgradeBtn.style.opacity = "0.5";
    } else {
        upgradeBtn.textContent = "UPGRADE";
        upgradeBtn.disabled = false;
        upgradeBtn.style.opacity = "1";
    }
}

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
            
            updateStructureMenu();

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
        const currentLevel = selectedStructure.upgradeLevel || 1;
        if (currentLevel >= MAX_BUILDING_LEVEL) {
            showFloatingText("Maximum level reached", rgb(255, 215, 0));
            structureMenu.style.display = "none";
            document.getElementById("game").focus();
            return;
        }

        const cost = getStructureUpgradeCost(selectedStructure.structureType, currentLevel);
        
        // Check if player has enough resources
        if (player.gold < cost.gold || player.wood < cost.wood || player.stone < cost.stone) {
            showFloatingText("Not enough resources", rgb(255, 100, 100));
            return;
        }

        // Deduct resources
        player.gold -= cost.gold;
        player.wood -= cost.wood;
        player.stone -= cost.stone;
        
        refreshResourceUI();

        const nextLevel = currentLevel + 1;
        selectedStructure.upgradeLevel = nextLevel;

        const baseHealth = selectedStructure.baseHealth || selectedStructure.maxHp || 200;
        selectedStructure.maxHp = computeStructureHealth(baseHealth, nextLevel);
        selectedStructure.hp = selectedStructure.maxHp;

        applyStructureColor(selectedStructure);
        updateBuildingHealthBar(selectedStructure);
        
        const colorInfo = getLevelColor(nextLevel);
        showToast(`Upgraded to level ${nextLevel} - ${colorInfo.name}`, 2000, ToastType.SUCCESS);
        
        updateStructureMenu();

        structureMenu.style.display = "none";
        document.getElementById("game").focus();
    }
});

const weaponLabels = {
    sword: "Sword",
    axe: "Axe",
    bow: "Bow"
};

function renderShopUI() {
    document.querySelectorAll('.shop-item[data-weapon]').forEach(btn => {
        const type = btn.getAttribute('data-weapon');
        const state = weaponState[type];
        if (!state) return;

        const colorInfo = getLevelColor(state.level);
        const levelEl = btn.querySelector('[data-role="level"]');
        const costEl = btn.querySelector('[data-role="cost"]');

        if (levelEl) levelEl.textContent = `Level ${state.level} · ${colorInfo.name}`;
        if (costEl) {
            if (state.level >= MAX_BUILDING_LEVEL) {
                costEl.textContent = "Maximum level reached";
            } else {
                costEl.textContent = `Next cost: ${getWeaponUpgradeCost(type)} gold`;
            }
        }

        btn.style.borderColor = colorInfo.hex;
    });

    document.querySelectorAll('.shop-item.potion').forEach(btn => {
        const potionKey = btn.getAttribute('data-potion');
        const potion = potionCatalog[potionKey];
        const costEl = btn.querySelector('[data-role="cost"]');
        if (potion && costEl) {
            costEl.textContent = `Cost: ${potion.cost} gold`;
        }
    });
}

function purchaseWeaponUpgrade(type) {
    const state = weaponState[type];
    if (!state) return;
    if (state.level >= MAX_BUILDING_LEVEL) {
        showFloatingText("Weapon at maximum level", getLevelColor(state.level).tint);
        return;
    }

    const cost = getWeaponUpgradeCost(type);
    if (player.gold < cost) {
        showToast("Insufficient gold", 2000, ToastType.ERROR);
        return;
    }

    player.gold -= cost;
    refreshResourceUI();
    state.level += 1;

    if (equippedWeapon && getEquippedWeaponType() === type) {
        applyWeaponTint(equippedWeapon, state.level);
    }

    renderShopUI();
    showFloatingText(`${weaponLabels[type]} level ${state.level}`, getLevelColor(state.level).tint);
}

function consumePotion(type) {
    const potion = potionCatalog[type];
    if (!potion) return;

    if (player.gold < potion.cost) {
        showToast("Insufficient gold", 2000, ToastType.ERROR);
        return;
    }

    player.gold -= potion.cost;
    refreshResourceUI();
    potionInventory[type]++;
    updatePotionUI();

    const potionName = type === "health" ? "Health Potion" : "Shield Potion";
    showFloatingText(`Purchased: ${potionName}`, rgb(100, 200, 100));
    showToast(`+1 ${potionName}`, 1500, ToastType.SUCCESS);

    updateHealth();
}

renderShopUI();

document.querySelectorAll('.shop-item[data-weapon]').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-weapon');
        purchaseWeaponUpgrade(type);
    });
});

document.querySelectorAll('.shop-item.potion').forEach(btn => {
    btn.addEventListener('click', () => {
        const potionKey = btn.getAttribute('data-potion');
        consumePotion(potionKey);
    });
});

let i = 0;
while (i < 10000){
    getResource('gold', 0, false);
    getResource('wood', 0, false);
    getResource('stone', 0, false);
    i++;
}
