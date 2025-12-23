import kaplay from 'https://unpkg.com/kaplay@4000.0.0-alpha.24/dist/kaplay.mjs';

kaplay({
    background: [255, 255, 255],
    debug: true,
    pixelDensity: Math.min(devicePixelRatio, 2),
    crisp: true,
    canvas: document.getElementById('game')
})

// GAME SETTINGS
const MAP_SIZE = 10000;
const GRID_SIZE = 50;
const ZOOM_LEVEL = 0.6;

const SPEED = 500

let attackOffset = 0;

// Load Sprites
loadSprite("player", "player.svg")
loadSprite("sword", "1.svg")
loadSprite("axe", "2.svg")
loadSprite("arrow", "3.svg")
loadSprite("hands", "hands.svg")

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

// Grid Drawing (white lines)
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

            // only lines in the FOV
            for (let x = startX; x < endX; x += GRID_SIZE) {
                if (x >= 0 && x <= MAP_SIZE) {
                    drawLine({
                        p1: vec2(x, Math.max(0, cam.y - realHeight / 2)),
                        p2: vec2(x, Math.min(MAP_SIZE, cam.y + realHeight / 2)),
                        color: rgb(0, 0, 0),
                        opacity: 0.1,
                        width: 2
                    });
                }
            }
            for (let y = startY; y < endY; y += GRID_SIZE) {
                if (y >= 0 && y <= MAP_SIZE) {
                    drawLine({
                        p1: vec2(Math.max(0, cam.x - realWidth / 2), y),
                        p2: vec2(Math.min(MAP_SIZE, cam.x + realWidth / 2), y),
                        color: rgb(0, 0, 0),
                        opacity: 0.1,
                        width: 2
                    });
                }
            }
        }
    }
}
add([drawGrid(), z(-90)]);
document.getElementById("game").focus();
window.addEventListener("mousedown", () => {
    // Se não clicou em um botão ou input, foca no jogo
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

player.add([
    sprite("hands"),
    pos(250, -300),
    anchor("left"),
    z(9)
])

player.add([
    sprite("hands"),
    pos(-250, -300),
    anchor("right"),
    z(9)
])

// Camera setup
setCamScale(ZOOM_LEVEL);

// Follow player
onUpdate(() => {
    setCamPos(player.pos);

    const mouseWorld = toWorld(mousePos());
    const direction = mouseWorld.sub(player.pos)
    player.angle = direction.angle() + 90 + attackOffset;

    updateMiniMap()

    updateHealth()

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
        slots.forEach(s => s.style.border = '2px solid white');
        slot.style.border = '2px solid yellow';

        const itemType = slot.getAttribute('data-item');

        if (equippedWeapon) {
            destroy(equippedWeapon);
            equippedWeapon = null;
        }

        if (!itemType) return;

        if (itemType === 'sword') {
            equippedWeapon = player.add([
                sprite("sword"),
                pos(-500, -500),
                anchor("left"),
                scale(1),
                rotate(0),
                "weapon"
            ]);
        } else if (itemType === "axe") {
            equippedWeapon = player.add([
                sprite("axe"),
                pos(-500, -500),
                anchor("left"),
                scale(1),
                rotate(0),
                "weapon"
            ]);
        } else if (itemType === "arrow") {
            equippedWeapon = player.add([
                sprite("arrow"),
                pos(-500, -700),
                anchor("left"),
                scale(1),
                rotate(0),
                "weapon", "arrow"
            ]);
        }
    })
})

let healthValue = 100;
let shieldValue = 100;

function updateHealth() {
    const healthBar = document.getElementById('health-bar-fill');
    const healthText = document.getElementById('health-text');
    const shieldBar = document.getElementById('shield-bar-fill');
    const shieldText = document.getElementById('shield-text');

    healthBar.style.width = `${healthValue}%`;
    healthBar.style.backgroundColor = `rgb(${255 - (healthValue * 2.55)}, ${healthValue * 2.55}, 0)`;
    healthText.textContent = `Health: ${healthValue}%`;

    shieldBar.style.width = `${shieldValue}%`;
    shieldText.textContent = `Shield: ${shieldValue}%`;
}

function updateMiniMap() {
    const miniPlayer = document.getElementById('minimap-player');

    const pX = (player.pos.x / MAP_SIZE) * 100;
    const pY = (player.pos.y / MAP_SIZE) * 100;

    const clampX = Math.max(0, Math.min(100, pX));
    const clampY = Math.max(0, Math.min(100, pY));

    miniPlayer.style.left = `${clampX}%`;
    miniPlayer.style.top = `${clampY}%`;
}

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

// ATACK LOGIC

let isAttacking = false;
let canShoot = true;
const FIRE_RATE = 0.5;

onMousePress(() => {
    if (!isAttacking || !equippedWeapon) return;

    if (equippedWeapon.is("arrow")) {
        if (!canShoot) return;
        canShoot = false;

        wait(FIRE_RATE, () => camShoot = true);

        const mouseWorld = toWorld(mousePos());
        const direction = mouseWorld.sub(player.pos).unit();
        const spawnPos = player.pos.add(direction.scale(60));

        const arrow = add([
            sprite("sword"),
            pos(spawnPos),
            anchor("center"),
            rotate(direction.angle() - 30),
            scale(0.04),
            area(),
            move(direction, 1000),
            offscreen({ destroy: true }),
            "arrow",
            z(5)
        ]);

        arrow.onCollide("tree", () => destroy(arrow));
        arrow.onCollide("rock", () => destroy(arrow));
        arrow.onCollide("player", () => destroy(arrow));
        return;
    }

    isAttacking = true;
    tween(0, -40, 0.1, (val) => attackOffset = val, easings.easeOutQuad)
        .then(() => {
            tween(-40, 0, 0.2, (val) => attackOffset = val, easings.easeInQuad)
                .then(() => isAttacking = false);
        });
})

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

onUpdate(() => {
    const cam = getCamPos();
    const vpWidth = width() / getCamScale().x;
    const vpHeight = height() / getCamScale().x;
    const renderDist = Math.max(vpWidth, vpHeight) / 2 + 200;

    WORLD_OBJECTS.forEach(obj => {
        const dist = vec2(obj.x, obj.y).dist(player.pos);

        if (dist < renderDist && !obj.id) {
            if (obj.type === "tree") {
                obj.id = add([
                    circle(40),
                    pos(obj.x, obj.y),
                    color(20, 100, 20),
                    area(),
                    body({ isStatic: true }),
                    anchor("center"),
                    scale(3),
                    z(-10),
                    "tree"
                ]);
            } else if (obj.type === "rock") {
                obj.id = add([
                    circle(40),
                    pos(obj.x, obj.y),
                    color(120, 120, 120),
                    area(),
                    body({ isStatic: true }),
                    anchor("center"),
                    scale(3),
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