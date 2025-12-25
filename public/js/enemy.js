import { applyDamage } from "./world.js"; 

const ZOMBIE_SPEED = 50;
const ZOMBIE_DMG = Math.floor(10 + Math.random() * 10);
const ATTACK_SPEED = 1.0; 
const ATTACK_RANGE = 80;  
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
            const goldMine = findNearestGoldMine(z.pos);
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
    add([
        circle(20),
        color(100, 255, 100), 
        anchor("center"),
        area(),
        body(), 
        pos(position),
        "zombie",
        { hp: 100, maxHp: 100 }
    ]);
}