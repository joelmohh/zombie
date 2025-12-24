
import { MAP_SIZE } from "./config.js";

export function initEnemySystem() {
    onUpdate("zombie", (z) => {
        const target = findNearestGoldMine(z.pos);

        if (target) {
            const dir = target.pos.sub(z.pos).unit();
            z.move(dir.scale(100));
        } else {
            const player = get("player")[0];
            if (player) {
                const dir = player.pos.sub(z.pos).unit();
                z.move(dir.scale(100));
            }
        }
    });
}

export function spawnZombie(position) {
    const posToSpawn = position || vec2(rand(0, MAP_SIZE), rand(0, MAP_SIZE));

    add([
        circle(20),         
        color(0, 255, 0),   
        anchor("center"),
        area(),
        body(),
        pos(posToSpawn),
        "zombie",            
        { 
            hp: 100,         
            maxHp: 100 
        } 
    ]);
}

function findNearestGoldMine(zombiePos) {
    const mines = get("gold-mine"); 
    if (mines.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const mine of mines) {
        const d = zombiePos.dist(mine.pos);
        if (d < minDist) {
            minDist = d;
            nearest = mine;
        }
    }
    return nearest;
}