import kaplay from 'https://unpkg.com/kaplay@4000.0.0-alpha.24/dist/kaplay.mjs';

kaplay({
    background: [255, 255, 255],
    debug: true,
    pixelDensity: Math.min(devicePixelRatio, 2),
    crisp: true,
    canvas: document.getElementById('game'),
    touchToMouse: true
})

// GAME SETTINGS
const MAP_SIZE = 10000;
const GRID_SIZE = 50;
const ZOOM_LEVEL = 0.6;
const SPEED = 500;

let attackOffset = 0;

// Load Sprites
loadSprite("player", "player.svg")
loadSprite("sword", "1.svg")
loadSprite("axe", "2.svg")
loadSprite("bow", "3.svg")
loadSprite("hands", "hands.svg")
loadSprite("tree", "tree.svg")
loadSprite("stone", "stone.svg")
loadSprite("wall", "brick.svg");

/*
/  SCENARY SETUP
*/

add([
    rect(MAP_SIZE, MAP_SIZE),
    pos(0, 0),
    color(34, 139, 34),
    z(-100),
    "ground"
])

const THICKNESS = 0;
const walls = [
    { pos: vec2(0, -THICKNESS), size: vec2(MAP_SIZE, THICKNESS) },
    { pos: vec2(0, MAP_SIZE), size: vec2(MAP_SIZE, THICKNESS) },
    { pos: vec2(-THICKNESS, 0), size: vec2(THICKNESS, MAP_SIZE) },
    { pos: vec2(MAP_SIZE, 0), size: vec2(THICKNESS, MAP_SIZE) },
];
walls.forEach(w => {
    add([
        rect(w.size.x, w.size.y),
        pos(w.pos),
        area(),
        body({ isStatic: true }),
    ]);
});

// Grid Drawing
function drawGrid() {
    return {
        id: "grid",
        draw() {
            const cam = getCamPos();
            const currentZoom = getCamScale().x;
            const realWidth = width() / currentZoom;
            const realHeight = height() / currentZoom;

            const startX = Math.floor((cam.x - realWidth / 2) / GRID_SIZE) * GRID_SIZE;
            const endX = cam.x + realWidth / 2;
            const startY = Math.floor((cam.y - realHeight / 2) / GRID_SIZE) * GRID_SIZE;
            const endY = cam.y + realHeight / 2;

            for (let x = startX; x < endX; x += GRID_SIZE) {
                if (x >= 0 && x <= MAP_SIZE) {
                    drawLine({ p1: vec2(x, Math.max(0, cam.y - realHeight / 2)), p2: vec2(x, Math.min(MAP_SIZE, cam.y + realHeight / 2)), color: rgb(0, 0, 0), opacity: 0.1, width: 2 });
                }
            }
            for (let y = startY; y < endY; y += GRID_SIZE) {
                if (y >= 0 && y <= MAP_SIZE) {
                    drawLine({ p1: vec2(Math.max(0, cam.x - realWidth / 2), y), p2: vec2(Math.min(MAP_SIZE, cam.x + realWidth / 2), y), color: rgb(0, 0, 0), opacity: 0.1, width: 2 });
                }
            }
        }
    }
}
add([drawGrid(), z(-90)]);

document.getElementById("game").focus();
window.addEventListener("mousedown", (e) => {
    if (document.activeElement !== document.getElementById("game")) {
        document.getElementById("game").focus();
    }
});

/*
/  PLAYER SETUP
*/

const player = add([
    sprite("player"),
    scale(0.1),
    pos(center()),
    color(255, 255, 0),
    anchor("center"),
    rotate(0),
    area({ shape: new Circle(vec2(0), 455) }),
    body(),
    "player",
    z(10)
]);

player.add([sprite("hands"), pos(250, -300), anchor("left"), z(9)]);
player.add([sprite("hands"), pos(-250, -300), anchor("right"), z(9)]);

setCamScale(ZOOM_LEVEL);

// UPDATE LOOP
onUpdate(() => {
    setCamPos(player.pos);
    const mouseWorld = toWorld(mousePos());
    const direction = mouseWorld.sub(player.pos)
    player.angle = direction.angle() + 90 + attackOffset;

    updateMiniMap()
    updateHealth()

    if (player.pos.x < 0) player.pos.x = 0;
    if (player.pos.y < 0) player.pos.y = 0;
    if (player.pos.x > MAP_SIZE) player.pos.x = MAP_SIZE;
    if (player.pos.y > MAP_SIZE) player.pos.y = MAP_SIZE;
})

onKeyDown('w', () => player.move(0, -SPEED));
onKeyDown('s', () => player.move(0, SPEED));
onKeyDown('a', () => player.move(-SPEED, 0));
onKeyDown('d', () => player.move(SPEED, 0));

// INVENTORY
let equippedWeapon = null;
const slots = document.querySelectorAll('.slot');
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

let healthValue = 100;
let shieldValue = 100;

function updateHealth() {
    const hBar = document.getElementById('health-bar-fill');
    const hText = document.getElementById('health-text');
    const sBar = document.getElementById('shield-bar-fill');
    const sText = document.getElementById('shield-text');
    if (hBar) { hBar.style.width = `${healthValue}%`; hText.textContent = `Health: ${healthValue}%`; }
    if (sBar) { sBar.style.width = `${shieldValue}%`; sText.textContent = `Shield: ${shieldValue}%`; }
}

function updateMiniMap() {
    const mini = document.getElementById('minimap-player');
    const pX = (player.pos.x / MAP_SIZE) * 100;
    const pY = (player.pos.y / MAP_SIZE) * 100;
    mini.style.left = `${Math.max(0, Math.min(100, pX))}%`;
    mini.style.top = `${Math.max(0, Math.min(100, pY))}%`;
}

// --- CONSTRUCTION CONFIG ---
const BUILDING_TYPES = {
    "wall": {
        sprite: "wall",
        width: 100,
        height: 20,
        scale: 0.05,
        areaShape: new Rect(vec2(0), 100, 20)
    },
    "gold-mine": {
        sprite: "wall", 
        width: GRID_SIZE * 3, 
        height: GRID_SIZE * 3, 
        scale: 0.2, 
        areaShape: new Rect(vec2(-(GRID_SIZE * 3) / 2, -(GRID_SIZE * 3) / 2), GRID_SIZE * 3, GRID_SIZE * 3)
    }
};

let currentBuilding = null;
let placementGhost = null;

// Ghost Logic & Auto Attack Loop
onUpdate(() => {
    if (currentBuilding) {
        const conf = BUILDING_TYPES[currentBuilding];
        const mouseWorld = toWorld(mousePos());

        let snapX, snapY;
        if (currentBuilding === "gold-mine") {
            snapX = Math.floor(mouseWorld.x / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
            snapY = Math.floor(mouseWorld.y / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
        } else {
            snapX = Math.floor(mouseWorld.x / GRID_SIZE) * GRID_SIZE + (conf.width / 2 / 2);
            snapY = Math.floor(mouseWorld.y / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
        }

        if (!placementGhost) {
            placementGhost = add([
                sprite(conf.sprite),
                pos(snapX, snapY),
                opacity(0.5),
                anchor("center"),
                scale(conf.scale),
                z(50),
                "ghost"
            ]);
        } else {
            placementGhost.pos = vec2(snapX, snapY);
            placementGhost.use(sprite(conf.sprite));
            placementGhost.use(scale(conf.scale));
        }
    } else {
        if (placementGhost) {
            destroy(placementGhost);
            placementGhost = null;
        }
    }

    if (isAutoAttacking) {
        performAttack();
    }
});

// Leaderboard
const leaderboardList = document.getElementById('leaderboard-list');
const playersData = [
    { name: 'Alice', score: 1500 },
    { name: 'Bob', score: 1200 },
    { name: 'Charlie', score: 900 },
    { name: 'Diana', score: 800 },
    { name: 'Eve', score: 600 },
];
function updateLeaderboard() {
    leaderboardList.innerHTML = "";
    playersData.forEach((p, i) => {
        const li = document.createElement('li');
        li.innerText = `${i + 1}. ${p.name} - ${p.score} pts`;
        leaderboardList.appendChild(li);
    });
}
updateLeaderboard();


function buildStructure(type, position) {
    const structure = BUILDING_TYPES[type];
    if (!structure) return;

    add([
        sprite(structure.sprite),
        pos(position),
        area({ shape: structure.areaShape }),
        body({ isStatic: true }),
        anchor("center"),
        scale(structure.scale),
        z(-5),
        type,
        "structure",
        "wall"
    ]);
}

// Key Bindings
onKeyPress("b", () => {
    if (currentBuilding) {
        currentBuilding = null;
        console.log("Modo: ARMAS");
    } else {
        currentBuilding = "wall";
        equippedWeapon = null;
        if (equippedWeapon) destroy(equippedWeapon);
        console.log("Modo: CONSTRUÇÃO WALL");
    }
});

onKeyPress("c", () => {
    if (currentBuilding) {
        currentBuilding = null;
        console.log("Modo: ARMAS");
    } else {
        currentBuilding = "gold-mine";
        equippedWeapon = null;
        if (equippedWeapon) destroy(equippedWeapon);
        console.log("Modo: CONSTRUÇÃO MINE");
    }
});

// ATTACK & INTERACTION LOGIC
let isAttacking = false;
let canShoot = true;
const FIRE_RATE = 0.5;
let isAutoAttacking = false;

function performAttack() {
    // Modo Construção
    if (currentBuilding) {
        const conf = BUILDING_TYPES[currentBuilding];
        const mouseWorld = toWorld(mousePos());

        let snapX, snapY;
        if (currentBuilding === "gold-mine") {
            snapX = Math.floor(mouseWorld.x / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
            snapY = Math.floor(mouseWorld.y / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
        } else {
            snapX = Math.floor(mouseWorld.x / GRID_SIZE) * GRID_SIZE + (conf.width / 2 / 2);
            snapY = Math.floor(mouseWorld.y / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2);
        }

        buildStructure(currentBuilding, vec2(snapX, snapY));
        return;
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
        // Removido colisão player
        return;
    }

    // Melee Logic
    isAttacking = true;
    const mouseWorld = toWorld(mousePos());
    const direction = mouseWorld.sub(player.pos).unit();
    const hitPos = player.pos.add(direction.scale(50));

    const hitbox = add([circle(40), pos(hitPos), area(), opacity(0), "hit"]);

    hitbox.onCollide("tree", (t) => {
        if (equippedWeapon.is("axe")) getResource("wood");
        const originalX = t.pos.x;
        tween(originalX, originalX + 5, 0.05, (v) => t.pos.x = v)
            .then(() => tween(originalX + 5, originalX - 5, 0.05, (v) => t.pos.x = v))
            .then(() => tween(originalX - 5, originalX, 0.05, (v) => t.pos.x = v));
    });
    hitbox.onCollide("rock", (r) => {
        if (equippedWeapon.is("axe")) getResource("stone");
        const originalX = r.pos.x;
        tween(originalX, originalX + 5, 0.05, (v) => r.pos.x = v)
            .then(() => tween(originalX + 5, originalX - 5, 0.05, (v) => r.pos.x = v))
            .then(() => tween(originalX - 5, originalX, 0.05, (v) => r.pos.x = v));
    });
    hitbox.onCollide("player", (p) => {
        if (p !== player && equippedWeapon.is("sword")) damage(p);
    });

    wait(0.1, () => destroy(hitbox));

    tween(0, -40, 0.1, (val) => attackOffset = val, easings.easeOutQuad)
        .then(() => tween(-40, 0, 0.2, (val) => attackOffset = val, easings.easeInQuad))
        .then(() => isAttacking = false);
}

onMousePress(() => performAttack());

onKeyPress("space", () => {
    isAutoAttacking = !isAutoAttacking;
});

// WORLD GENERATION
const WORLD_SEED = 12345;
const TOTAL_TREES = 40;
const TOTAL_ROCKS = 40;
const WORLD_OBJECTS = [];

let currentSeed = WORLD_SEED;
function seededRandom() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
}

for (let i = 0; i < TOTAL_TREES; i++) {
    WORLD_OBJECTS.push({ x: seededRandom() * MAP_SIZE, y: seededRandom() * MAP_SIZE, type: "tree", id: null });
}
for (let i = 0; i < TOTAL_ROCKS; i++) {
    WORLD_OBJECTS.push({ x: seededRandom() * MAP_SIZE, y: seededRandom() * MAP_SIZE, type: "rock", id: null });
}

// Interaction Functions
function getResource(type) {
    add([
        text(`+1 ${type}`, { size: 24 }),
        pos(player.pos.x, player.pos.y - 50),
        color(255, 255, 255),
        z(100),
        opacity(1),
        lifespan(1, { fade: 0.5 }),
        move(vec2(0, -50), 50)
    ]);
}

function damage(target) {
    console.log("Dano causado!");
    target.color = rgb(255, 0, 0);
    wait(0.1, () => target.color = rgb(255, 255, 255));
}

// World Rendering Update
onUpdate(() => {
    const cam = getCamPos();
    const vpWidth = width() / getCamScale().x;
    const vpHeight = height() / getCamScale().x;
    const renderDist = Math.max(vpWidth, vpHeight) / 2 + 200;

    WORLD_OBJECTS.forEach(obj => {
        const objPos = vec2(obj.x, obj.y);
        const dist = objPos.dist(player.pos);

        // Safe Zone Check
        if (objPos.dist(center()) < 300) return;

        if (dist < renderDist && !obj.id) {
            if (obj.type === "tree") {
                obj.id = add([
                    sprite("tree"),
                    pos(obj.x, obj.y),
                    color(20, 100, 20),
                    area({ shape: new Circle(vec2(0), 1000) }),
                    body({ isStatic: true }),
                    anchor("center"),
                    scale(0.1),
                    z(-10),
                    "tree"
                ]);
            } else if (obj.type === "rock") {
                obj.id = add([
                    sprite("stone"),
                    pos(obj.x, obj.y),
                    color(120, 120, 120),
                    area({ shape: new Circle(vec2(0), 1200) }),
                    body({ isStatic: true }),
                    anchor("center"),
                    scale(0.09),
                    z(-10),
                    "rock"
                ]);
            }
        } else if (dist >= renderDist && obj.id) {
            destroy(obj.id);
            obj.id = null;
        }
    });
});