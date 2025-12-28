import { applyDamage } from "./world.js"; 
import { isAreaFree } from "./grid.js"; 
import { MAP_SIZE, GRID_SIZE, WORLD_PADDING } from "./config.js";

const ZOMBIE_SPEED = 50;
const ZOMBIE_DMG = 10;
const ATTACK_SPEED = 1.0; 
const ATTACK_RANGE = 80;  

export function initEnemySystem() {
    loop(5, () => {
        const mainBase = get("gold-mine")[0];
        if (mainBase) {
            spawnHorde(mainBase.pos);
        }
    });

    onUpdate("zombie", (z) => {
        if (z.attackTimer === undefined) z.attackTimer = 0;
        if (z.attackTimer > 0) z.attackTimer -= dt();

        const nearbyTarget = findTargetInRange(z.pos, ATTACK_RANGE);

        if (nearbyTarget) {
            if (z.attackTimer <= 0) {
                performAttack(z, nearbyTarget);
                z.attackTimer = ATTACK_SPEED;
            }
        } else {
            const goldMine = get("gold-mine")[0];
            const player = get("player")[0];
            
            let moveTarget = null;
            if (goldMine) {
                moveTarget = goldMine.pos;
            } else if (player) {
                moveTarget = player.pos;
            }

            if (moveTarget) {
                const dir = moveTarget.sub(z.pos).unit();
                z.move(dir.scale(ZOMBIE_SPEED));
            }
        }
    });
}

function spawnHorde(basePos) {
    const quantity = 3; 
    const spawnRadius = 1000;

    for (let i = 0; i < quantity; i++) {
        let spawned = false;
        let attempts = 0;

        while (!spawned && attempts < 20) {
            attempts++;
            
            const angle = rand(0, 360);
            const dist = rand(500, spawnRadius); 
            const offset = vec2(Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180)).scale(dist);
            const spawnPos = basePos.add(offset);

            if (spawnPos.x < WORLD_PADDING || spawnPos.x > MAP_SIZE - WORLD_PADDING ||
                spawnPos.y < WORLD_PADDING || spawnPos.y > MAP_SIZE - WORLD_PADDING) {
                continue;
            }

            if (!isNearStructure(spawnPos, 100)) {
                spawnZombie(spawnPos);
                spawned = true;
            }
        }
    }
}

function isNearStructure(pos, minDist) {
    const structures = get("structure");
    for (const s of structures) {
        if (pos.dist(s.pos) < minDist) {
            return true;
        }
    }
    return false;
}

function findTargetInRange(pos, range) {
    const player = get("player")[0];
    if (player && pos.dist(player.pos) <= range) {
        return player;
    }

    const structures = get("structure");
    let nearest = null;
    let minDist = range;

    for (const s of structures) {
        const d = pos.dist(s.pos);
        
        const effectiveRange = range + (s.width ? s.width * s.scale.x / 2 : 20);

        if (d <= effectiveRange) {
            if (d < minDist) {
                minDist = d;
                nearest = s;
            }
        }
    }
    return nearest;
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

function performAttack(zombie, target) {
    const originalPos = zombie.pos.clone();
    const dir = target.pos.sub(zombie.pos).unit();
    
    const bumpPos = originalPos.add(dir.scale(10));
    zombie.pos = bumpPos;
    setTimeout(() => {
        if (zombie.exists()) zombie.pos = originalPos;
    }, 100);

    applyDamage(target, ZOMBIE_DMG);
}

export function spawnZombie(position) {
    const safePos = findSafeSpawn(position);

    add([
        circle(20),
        color(150, 50, 50), 
        anchor("center"),
        area(),
        body(), 
        pos(safePos),
        "zombie",
        { hp: 100, maxHp: 100 }
    ]);
}

function findSafeSpawn(desiredPos) {
    const radius = 30;
    const attempts = 30;

    for (let i = 0; i < attempts; i++) {
        const offset = vec2(rand(-300, 300), rand(-300, 300));
        const candidate = vec2(
            clampValue(desiredPos.x + offset.x, WORLD_PADDING + 50, MAP_SIZE - WORLD_PADDING - 50),
            clampValue(desiredPos.y + offset.y, WORLD_PADDING + 50, MAP_SIZE - WORLD_PADDING - 50)
        );

        if (!isOnStructure(candidate, radius + 20)) {
            return candidate;
        }
    }

    const fallback = vec2(
        rand(WORLD_PADDING + 100, MAP_SIZE - WORLD_PADDING - 100),
        rand(WORLD_PADDING + 100, MAP_SIZE - WORLD_PADDING - 100)
    );
    
    return !isOnStructure(fallback, radius) ? fallback : desiredPos;
}

function isOnStructure(pos, radius) {
    const structures = get("structure");
    const safetyMargin = 30;

    for (const s of structures) {
        const sx = s.pos.x;
        const sy = s.pos.y;
        const scaleX = s.scale?.x || 1;
        const scaleY = s.scale?.y || 1;
        const halfW = ((s.width || 50) * scaleX) / 2 + safetyMargin;
        const halfH = ((s.height || 50) * scaleY) / 2 + safetyMargin;

        const overlapsX = Math.abs(pos.x - sx) <= halfW + radius;
        const overlapsY = Math.abs(pos.y - sy) <= halfH + radius;

        if (overlapsX && overlapsY) return true;
    }

    return false;
}

function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function damageZombie(zombie, dmg) {
    if (zombie.hp) {
        zombie.hp -= dmg;
        zombie.color = rgb(255, 100, 100);
        wait(0.1, () => zombie.color = rgb(150, 50, 50));

        if (zombie.hp <= 0) {
            destroy(zombie);
        }
    } else {
        destroy(zombie);
    }
}