import { MAP_SIZE, THICKNESS, GRID_SIZE, WORLD_PADDING } from "./config.js";
import { player, updateHealth, updateBuildingHealthBar } from "./main.js";

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

export function getResource(type, time = 0) {
    const timerProp = `${type}Timer`;
    if (player[timerProp] === undefined) player[timerProp] = 0;
    if (player[timerProp] > 0) return;
    if (player[type] !== undefined) {
        player[type] += 1;
        player[timerProp] = time;
    }
    const displayElement = document.getElementById(`${type}-amount`);
    if (displayElement) {
        displayElement.innerText = player[type];
    }

    if (type !== "gold") {
        add([
            text(`+1 ${type}`, { size: 24 }),
            pos(player.pos.x, player.pos.y - 50),
            color(255, 255, 255),
            z(100),
            opacity(1),
            lifespan(1, { fade: 0.5 }),
            move(vec2(0, -1), 50) 
        ]);
    }
}

export function damage(target) {
    target.color = rgb(255, 0, 0);
    wait(0.1, () => target.color = rgb(255, 255, 255));
}

document.addEventListener("DOMContentLoaded", () => {

    onUpdate(() => {
        const cam = getCamPos();
        const vpWidth = width() / getCamScale().x;
        const vpHeight = height() / getCamScale().x;
        const renderDist = Math.max(vpWidth, vpHeight) / 2 + 200;

        WORLD_OBJECTS.forEach(obj => {
            const objPos = vec2(obj.x, obj.y);
            const dist = objPos.dist(player.pos);

            if (objPos.dist(center()) < 300) return;

            if (dist < renderDist && !obj.id) {
                if (obj.type === "tree") {
                    obj.id = add([
                        sprite("tree"),
                        pos(obj.x, obj.y),
                        area({ shape: new Circle(vec2(0), 1000) }),
                        body({ isStatic: true }),
                        anchor("center"),
                        scale(0.1),
                        z(0),
                        "tree"
                    ]);
                } else if (obj.type === "rock") {
                    obj.id = add([
                        sprite("stone"),
                        pos(obj.x, obj.y),
                        area({ shape: new Circle(vec2(0), 1200) }),
                        body({ isStatic: true }),
                        anchor("center"),
                        scale(0.09),
                        z(0),
                        "rock"
                    ]);
                }
            } else if (dist >= renderDist && obj.id) {
                destroy(obj.id);
                obj.id = null;
            }
        });
    });

    add([
        rect(MAP_SIZE, MAP_SIZE),
        pos(0, 0),
        color(34, 139, 34),
        z(-100),
        "ground"
    ])

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
    updateHealth();

});
export function applyDamage(target, amount) {
    if (!target.hp) return;

    if (target.is("player")) {
        updateHealth();
        if (target.hp <= 0) {
            shake(20);
            target.hp = target.maxHp;
            target.pos = vec2(1000, 1000);
            updateHealth();
        }
    } else if (target.is("structure")) {
        if (target.hp <= 0) {
            destroy(target);
            return;
        }
        updateBuildingHealthBar(target);
    }

    target.hp -= amount;
    target.color = rgb(255, 100, 100);

    setTimeout(() => {
        if (target.exists()) target.color = rgb(255, 255, 255);
    }, 100);


}

document.addEventListener("DOMContentLoaded", () => {
    function addBorderGuide(position, size) {
        add([
            rect(size.x, size.y),
            pos(position),
            color(255, 0, 0),
            opacity(0),
            area(),
            z(5),
            "border-guide"
        ]);
    }

    addBorderGuide(vec2(0, 0), vec2(MAP_SIZE, WORLD_PADDING));
    addBorderGuide(vec2(0, MAP_SIZE - WORLD_PADDING), vec2(MAP_SIZE, WORLD_PADDING));
    addBorderGuide(vec2(0, WORLD_PADDING), vec2(WORLD_PADDING, MAP_SIZE - (WORLD_PADDING * 2)));
    addBorderGuide(vec2(MAP_SIZE - WORLD_PADDING, WORLD_PADDING), vec2(WORLD_PADDING, MAP_SIZE - (WORLD_PADDING * 2)));

});