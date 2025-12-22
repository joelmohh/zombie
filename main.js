import kaplay from 'https://unpkg.com/kaplay@4000.0.0-alpha.24/dist/kaplay.mjs';

kaplay({
    background: [255, 255, 255],
    debug: true,
    pixelDensity: Math.min(devicePixelRatio, 2),
    crisp: false
})

const MAP_SIZE = 10000;
const GRID_SIZE = 50;
const ZOOM_LEVEL = 0.6;

loadSprite("player", "player.svg");
loadSprite("sword", "1.svg");
loadSprite("axe", "2.svg");

add([
    rect(MAP_SIZE, MAP_SIZE),
    pos(0, 0),
    color(34, 139, 34),
    z(-100),
    "ground"
])

function addBorderWalls() {
    const thickness = 100;

    add([
        rect(MAP_SIZE, thickness),
        pos(0, -thickness),
        area(),
        body({ isStatic: true }),
    ]);
    add([
        rect(MAP_SIZE, thickness),
        pos(0, MAP_SIZE),
        area(),
        body({ isStatic: true }),
    ]);
    add([
        rect(thickness, MAP_SIZE),
        pos(-thickness, 0),
        area(),
        body({ isStatic: true }),
    ]);
    add([
        rect(thickness, MAP_SIZE),
        pos(MAP_SIZE, 0),
        area(),
        body({ isStatic: true }),
    ]);
}
addBorderWalls();

function drawGrid() {
    return {
        id: "grid",
        draw() {
            const cam = camPos();
            const currentZoom = camScale().x;

            const realWidth = width() / currentZoom;
            const realHeight = height() / currentZoom;

            const startX = Math.floor((cam.x - realWidth / 2) / GRID_SIZE) * GRID_SIZE;
            const endX = cam.x + realWidth / 2;

            const startY = Math.floor((cam.y - realHeight / 2) / GRID_SIZE) * GRID_SIZE;
            const endY = cam.y + realHeight / 2;

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
]);

camScale(ZOOM_LEVEL);

let attackOffset = 0;

onUpdate(() => {
    camPos(player.pos);

    const mouseWorld = toWorld(mousePos());
    const direction = mouseWorld.sub(player.pos);
    player.angle = direction.angle() + 90 + attackOffset;
})

const SPEED = 500;

onKeyDown("w", () => {
    player.move(0, -SPEED);
});
onKeyDown("s", () => {
    player.move(0, SPEED);
});
onKeyDown("a", () => {
    player.move(-SPEED, 0);
});
onKeyDown("d", () => {
    player.move(SPEED, 0);
});

const MINI_SIZE = 150;
const MINI_MARGIN = 20;
const MINI_SCALE = MINI_SIZE / MAP_SIZE;
const MINI_X = width() - MINI_SIZE - MINI_MARGIN;
const MINI_Y = height() - MINI_SIZE - MINI_MARGIN;

const minimapBg = add([
    rect(MINI_SIZE, MINI_SIZE),
    pos(MINI_X, MINI_Y),
    color(0, 0, 0),
    opacity(0.6),
    outline(2, [255, 255, 255]),
    fixed(),
    z(100)
]);

const miniPlayer = add([
    circle(3),
    color(255, 255, 0),
    fixed(),
    z(101),
    pos(0, 0)
]);

onUpdate(() => {
    const miniX = minimapBg.pos.x + (player.pos.x * MINI_SCALE);
    const miniY = minimapBg.pos.y + (player.pos.y * MINI_SCALE);

    miniPlayer.pos = vec2(miniX, miniY);
});

const PARTY_SLOT_SIZE = (MINI_SIZE - 15) / 4;
const PARTY_Y = MINI_Y - PARTY_SLOT_SIZE - 5;

for (let i = 0; i < 4; i++) {
    add([
        rect(PARTY_SLOT_SIZE, PARTY_SLOT_SIZE),
        pos(MINI_X + (i * (PARTY_SLOT_SIZE + 5)), PARTY_Y),
        color(0, 0, 0),
        opacity(0.3),
        outline(2, [255, 255, 255]),
        fixed(),
        z(100)
    ])
}

function createMapBtn(label, index, colorBg) {
    const btnWidth = 47;
    const btnHeight = 47;
    const gap = 5;

    const startX = MINI_X;
    const startY = PARTY_Y - btnHeight - 5;

    const btn = add([
        rect(btnWidth, btnHeight),
        pos(startX + (index * (btnWidth + gap)), startY),
        color(colorBg),
        outline(2, [255, 255, 255]),
        area(),
        fixed(),
        z(100),
        anchor("topleft"),
    ]);

    add([
        text(label, { size: 10, font: "monospace" }),
        pos(startX + (index * (btnWidth + gap)) + btnWidth / 2, startY + btnHeight / 2),
        anchor("center"),
        fixed(),
        color(255, 255, 255),
        z(101)
    ]);

    btn.onHover(() => btn.opacity = 0.8);
    btn.onHoverEnd(() => btn.opacity = 1);
}

createMapBtn("LOJA", 0, [210, 180, 0]);
createMapBtn("TUTOR", 1, [0, 100, 200]);
createMapBtn("PARTY", 2, [120, 0, 200]);

// ===============
// == Inventory ==
// ===============

add([
    rect(460, 90),
    fixed(),
    pos(440, height() - 110),
    color(50, 50, 50),
    outline(2, [255, 255, 255]),
    z(100),
    opacity(0.6)
])

let equippedWeapon = null;

for (let i = 0; i < 5; i++) {
    const slot = add([
        rect(80, 80),
        fixed(),
        pos(450 + i * 90, height() - 105),
        color(100, 100, 100),
        outline(2, [255, 255, 255]),
        z(101),
        opacity(0.8),
        area(),
        "inventory_slot"
    ])

    slot.onClick(() => {
        slot.color = rgb(150, 150, 150);
        wait(0.1, () => slot.color = rgb(100, 100, 100));
        if (equippedWeapon) {
            destroy(equippedWeapon);
            equippedWeapon = null;
        }

        if (i === 0) {
            equippedWeapon = player.add([
                sprite("sword"),
                pos(-500, -500),
                anchor("left"),
                scale(1),
                rotate(0),
                "weapon"
            ]);
        } else if (i === 1) {
            equippedWeapon = player.add([
                sprite("axe"),
                pos(-500, -500),
                anchor("left"),
                scale(1),
                rotate(0),
                "weapon"
            ]);
        }
    })

    slot.onHover(() => slot.opacity = 1);
    slot.onHoverEnd(() => slot.opacity = 0.8);
}

// ================
// == Health bar ==
// ================

let healthvalue = 100;
let healthBarSize;

if (healthvalue === 100) { healthBarSize = 99 } else { healthBarSize = healthvalue }

add([
    rect(300, 30),
    fixed(),
    pos(20, height() - 50),
    outline(2, [255, 255, 255]),
    z(100),
    opacity(0.8)
])
add([
    rect(3 * healthBarSize, 26),
    fixed(),
    pos(22, height() - 48),
    color(255 - (healthvalue * 2.55), healthvalue * 2.55, 0),
    z(101)
])
add([
    text(`Health: ${healthvalue}%`),
    fixed(),
    scale(0.6),
    pos(30, height() - 45),
    color(255, 255, 255),
    z(101)
])

// ================
// == Shield bar ==
// ================

let shieldValue = 100;
let shieldBarSize;

if (shieldValue === 100) { shieldBarSize = 99 } else { shieldBarSize = shieldValue }

add([
    rect(300, 30),
    fixed(),
    pos(20, height() - 90),
    outline(2, [255, 255, 255]),
    z(100),
    opacity(0.8)
])
add([
    rect(3 * shieldBarSize, 26),
    fixed(),
    pos(22, height() - 88),
    color(0, 150, 255),
    z(101)
])
add([
    text(`Shield: ${shieldValue}%`),
    fixed(),
    scale(0.6),
    pos(30, height() - 85),
    color(255, 255, 255),
    z(101)
])

// =================
// == Leaderboard ==
// =================

add([
    rect(350, 250),
    fixed(),
    pos(width() - 370, 20),
    color(0, 0, 0),
    outline(2, [255, 255, 255]),
    z(100),
    opacity(0.6)
])
add([
    text("Leaderboard", { size: 24, font: "monospace" }),
    fixed(),
    pos(width() - 270, 30),
    color(255, 255, 255),
    color(200, 0, 0),
    z(101)
])

const leaderbord = {
    players: [
        { name: "Player1" },
        { name: "Player2" },
        { name: "Player3" },
        { name: "Player4" },
        { name: "Player5" },
        { name: "Player6" },
        { name: "Player7" },
        { name: "Player8" },
        { name: "Player9" },
        { name: "Player10" }
    ]
}
for (let i = 0; i < 10; i++) {
    add([
        text(`${i + 1}. ${leaderbord.players[i].name} - ${Math.floor(Math.random() * 1000)} pts`, { size: 18, font: "monospace" }),
        fixed(),
        pos(width() - 350, 60 + i * 18),
        color(255, 255, 255),
        z(101)
    ])
}

// ==================
// == Attack logic ==
// ==================

let isAttacking = false;

onMousePress(() => {
    if (isAttacking || !equippedWeapon) return;
    
    isAttacking = true;
    
    tween(
        0, -40, 0.1, 
        (val) => attackOffset = val, 
        easings.easeOutQuad
    ).then(() => {
        tween(
            -40, 0, 0.2, 
            (val) => attackOffset = val, 
            easings.easeInQuad
        ).then(() => {
            isAttacking = false;
        })
    })
});

// ====================
// == World Generation ==
// ====================

const WORLD_SEED = 12345; 
const TOTAL_TREES = 20; 
const TOTAL_ROCKS = 20; 
const WORLD_OBJECTS = [];

let currentSeed = WORLD_SEED;
function seededRandom() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
}

for (let i = 0; i < TOTAL_TREES; i++) {
    WORLD_OBJECTS.push({
        x: seededRandom() * MAP_SIZE,
        y: seededRandom() * MAP_SIZE,
        type: "tree",
        id: null
    });
}

for (let i = 0; i < TOTAL_ROCKS; i++) {
    WORLD_OBJECTS.push({
        x: seededRandom() * MAP_SIZE,
        y: seededRandom() * MAP_SIZE,
        type: "rock",
        id: null
    });
}

onUpdate(() => {
    const cam = getCamPos(); 
    const vpWidth = width() / camScale().x;
    const vpHeight = height() / camScale().x;
    const renderDist = Math.max(vpWidth, vpHeight) / 2 + 200;

    WORLD_OBJECTS.forEach(obj => {
        const dist = vec2(obj.x, obj.y).dist(player.pos);

        if (dist < renderDist && !obj.id) {
            if (obj.type === "tree") {
                obj.id = add([
                    circle(20),
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
                    circle(20),
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