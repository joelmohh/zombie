import { applyDamage } from "./world.js"; 
import { isAreaFree } from "../utils/grid.js"; 
import { MAP_SIZE, GRID_SIZE, WORLD_PADDING } from "../utils/config.js";
import { canSpawnZombies, getWaveMultiplier, incrementZombieCount } from "./daynight.js";

const ZOMBIE_SPEED = 50;
const ZOMBIE_DMG = 10;
const ATTACK_SPEED = 1.0; 
const ATTACK_RANGE = 80;  

let spawnTimer = 0;
const SPAWN_INTERVAL = 3; 

export function initEnemySystem() {
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

export function updateEnemySpawning(dt) {
    if (!canSpawnZombies()) {
        return;
    }
    
    spawnTimer += dt;
    
    if (spawnTimer >= SPAWN_INTERVAL) {
        spawnTimer = 0;
        
        const mainBase = get("gold-mine")[0];
        
        if (mainBase && mainBase.pos) {
            spawnWaveZombies(mainBase.pos);
        }
    }
}

function spawnWaveZombies(basePos) {
    const waveMultiplier = getWaveMultiplier();
    const baseQuantity = 5; 
    const quantity = Math.floor(baseQuantity * waveMultiplier);
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
                incrementZombieCount();
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
    let minDist = Infinity;

    for (const s of structures) {
        const d = pos.dist(s.pos);
        
        const isLargeStructure = s.width >= 100;
        
        const structureRadius = isLargeStructure ? (s.width * (s.scale?.x || 0.05)) / 2 : 25;
        
        if (d <= range + structureRadius) {
            if (d < minDist) {
                minDist = d;
                nearest = s;
            }
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

    if (target && target.exists()) {
        applyDamage(target, ZOMBIE_DMG);
    }
}

export function spawnZombie(position) {
    const safePos = findSafeSpawn(position);
    
    const waveMultiplier = getWaveMultiplier();
    const baseHP = 100;
    const maxHp = Math.floor(baseHP * waveMultiplier);

    const zombie = add([
        circle(20),
        color(150, 50, 50), 
        anchor("center"),
        area(),
        body(), 
        pos(safePos),
        "zombie",
        { hp: maxHp, maxHp: maxHp }
    ]);

    zombie.add([
        rect(40, 6),
        pos(0, -30),
        anchor("center"),
        color(0, 0, 0),
        opacity(0),
        z(100),
        "zombie-health-bg"
    ]);

    zombie.add([
        rect(36, 4),
        pos(-18, -30),
        anchor("left"),
        color(255, 50, 50),
        opacity(0),
        z(101),
        "zombie-health-fill"
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

        const healthBg = zombie.get("zombie-health-bg")[0];
        const healthFill = zombie.get("zombie-health-fill")[0];
        
        if (healthBg && healthFill) {
            healthBg.opacity = 1;
            healthFill.opacity = 1;
            const healthPercent = Math.max(0, zombie.hp / zombie.maxHp);
            healthFill.width = 36 * healthPercent;
        }

        if (zombie.hp <= 0) {
            destroy(zombie);
        }
    } else {
        destroy(zombie);
    }
}