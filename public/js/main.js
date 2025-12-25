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
    }else if (e.key === 'Escape') {
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

import { MAP_SIZE, ZOOM_LEVEL, GRID_SIZE, SPEED, THICKNESS, BUILDING_TYPES } from './config.js';
import { loadAllSprites } from './assets.js';
import { updateLeaderboard } from './leaderboard.js';
import { initDefense } from './defense.js';
import { initEnemySystem, spawnZombie } from './enemy.js';

loadAllSprites()
updateLeaderboard();
initDefense();
initEnemySystem();

document.addEventListener('DOMContentLoaded', () => {
    // mouse click to spawn zombie for testing REMOVE LATER
    document.getElementById("game").addEventListener('click', () => {
        const randomOffset = vec2(rand(-300, 300), rand(-300, 300));
        const spawnPos = player.pos.add(randomOffset);
        
        spawnZombie(spawnPos);
        
        document.getElementById("game").focus();
    });
})

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
        maxHp: 100
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

let healthValue = 1;
let shieldValue = 100;

export function updateHealth() {
    const healthText = document.getElementById('health-text');
    const healthBarFill = document.getElementById('health-bar-fill');
    healthText.textContent = `Health: ${Math.floor(player.hp) / player.maxHp * 100}%`;
    if (healthBarFill) {
        healthBarFill.style.width = `${Math.floor((player.hp / player.maxHp) * 100)}%`;
    }
}
export function updateBuildingHealthBar(target) {
    if(!target.hp) return;

    target.add([
        rect(600, 80),
        pos(0, -target.height * target.scale.y / 2 - 10),
        anchor("center"),
        color(0, 0, 0),
        z(100),
        "building-health-bar-bg"
    ])
}

function updateMiniMap() {
    const mini = document.getElementById('minimap-player');
    const pX = (player.pos.x / MAP_SIZE) * 100;
    const pY = (player.pos.y / MAP_SIZE) * 100;
    mini.style.left = `${Math.max(0, Math.min(100, pX))}%`;
    mini.style.top = `${Math.max(0, Math.min(100, pY))}%`;
}


let currentBuilding = null;
let placementGhost = null;
let canBuildHere = false;

// Ghost Logic
onUpdate(() => {
    if (currentBuilding) {
        const conf = BUILDING_TYPES[currentBuilding];
        const mouseWorld = toWorld(mousePos());
        let idealX = Math.floor(mouseWorld.x / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
        let idealY = Math.floor(mouseWorld.y / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
        
        if (!placementGhost) {
            placementGhost = add([
                sprite(conf.sprite),
                pos(idealX, idealY),
                opacity(0.5),
                anchor("center"),
                scale(conf.scale),
                area({ shape: conf.areaShape }), 
                z(50), 
                "ghost"
            ]);
        } else {
            placementGhost.use(sprite(conf.sprite));
            placementGhost.use(scale(conf.scale));
            placementGhost.use(area({ shape: conf.areaShape }));
        }

        const offsets = [
            vec2(0, 0),
            vec2(GRID_SIZE, 0), vec2(-GRID_SIZE, 0), vec2(0, GRID_SIZE), vec2(0, -GRID_SIZE),
            vec2(GRID_SIZE, GRID_SIZE), vec2(GRID_SIZE, -GRID_SIZE), vec2(-GRID_SIZE, GRID_SIZE), vec2(-GRID_SIZE, -GRID_SIZE)
        ];

        let finalPos = vec2(idealX, idealY);
        let foundSafeSpot = false;

        const allObstacles = [
            ...get("tree"), ...get("rock"), ...get("player"), 
            ...get("wall"), ...get("gold-mine"), ...get("tower"), ...get("door")
        ];

        for (const offset of offsets) {
            const testPos = vec2(idealX + offset.x, idealY + offset.y);
            let isFree = true;

            for (const obj of allObstacles) {
                if (obj.is("tree") || obj.is("rock") || obj.is("player")) {
                    const ghostRadius = (conf.width * conf.scale) / 2;
                    const objRadius = (obj.area && obj.area.shape && obj.area.shape.radius) 
                                      ? obj.area.shape.radius * obj.scale.x 
                                      : 40; 

                    if (testPos.dist(obj.pos) < (objRadius + ghostRadius)) {
                        isFree = false;
                        break;
                    }
                } 
                else {
                    const isStructureA = currentBuilding === "wall" || currentBuilding === "door";
                    const isStructureB = obj.is("wall") || obj.is("door");

                    if (isStructureA && isStructureB) {
                        if (testPos.dist(obj.pos) < 40) {
                            isFree = false;
                            break;
                        }
                    } 
                    else {
                        
                        let objConf = { width: 50, height: 50 }; 
                        if (obj.is("wall")) objConf = BUILDING_TYPES["wall"];
                        else if (obj.is("gold-mine")) objConf = BUILDING_TYPES["gold-mine"];
                        else if (obj.is("tower")) objConf = BUILDING_TYPES["tower"];
                        else if (obj.is("door")) objConf = BUILDING_TYPES["door"];

                        const overlapX = (conf.width + objConf.width) / 2;
                        const overlapY = (conf.height + objConf.height) / 2;

                        if (Math.abs(testPos.x - obj.pos.x) < overlapX && 
                            Math.abs(testPos.y - obj.pos.y) < overlapY) {
                            isFree = false;
                            break;
                        }
                    }                    
                }
            }

            if (isFree) {
                finalPos = testPos;
                foundSafeSpot = true;
                break; 
            }
        }

        placementGhost.pos = finalPos; 
        canBuildHere = foundSafeSpot;

        if (foundSafeSpot) {
            placementGhost.color = rgb(255, 255, 255);
        } else {
            placementGhost.pos = vec2(idealX, idealY);
            placementGhost.color = rgb(255, 100, 100);
        }

    } else {
        if (placementGhost) {
            destroy(placementGhost);
            placementGhost = null;
        }
    }
});
// Building Logic
function buildStructure(type, position) {
    const structure = BUILDING_TYPES[type];
    if (!structure) return;

    const areaConfig = { shape: structure.areaShape };
    let opacityValue = 1

    if (type === "door") {
       areaConfig.collisionIgnore = ["player"];
       opacityValue = 0.5;
    }

    add([
        sprite(structure.sprite),
        opacity(opacityValue),
        pos(position),
        area(areaConfig),
        body({ isStatic: true }),
        anchor("center"),
        scale(structure.scale),
        z(0),
        type,
        structure.commontype,
        { 
            hp: structure.health,       
            maxHp: structure.health     
        },
        offscreen({ hide: true, pause: true, distance: 300 })
    ]);
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



