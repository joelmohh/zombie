import { BUILDING_TYPES, LEVEL_COLORS } from "./config.js";
import { damageZombie } from "./enemy.js";

export function initDefense() {
    const towerTypes = ["tower_archer", "tower_cannon", "tower_bomber", "tower_magic"];

    towerTypes.forEach(type => {
        onUpdate(type, (tower) => {
            if (tower.timer === undefined) tower.timer = 0;
            const config = BUILDING_TYPES[type];
            const target = findNearestEnemy(tower.pos, config.range);

            if (target) {
                const angleToZombie = target.pos.sub(tower.pos).angle();
                const turret = tower.get("turret")[0];
                if (turret) {
                    turret.angle = angleToZombie; 
                } else {
                    tower.angle = angleToZombie; 
                }

                tower.timer -= dt();
                if (tower.timer <= 0) {
                    const shootAngle = turret ? turret.angle : tower.angle;
                    
                    shoot(tower, type, target.pos, config, shootAngle);
                    tower.timer = config.fireRate;
                }
            }
        });
    });

    onCollide("projectile", "zombie", (bullet, zombie) => {
        handleBulletHit(bullet, zombie);
    });
}

function findNearestEnemy(pos, range) {
    let nearest = null;
    let minDist = range;
    const zombies = get("zombie"); 

    for (const z of zombies) {
        const d = pos.dist(z.pos);
        if (d < minDist) {
            nearest = z;
            minDist = d;
        }
    }
    return nearest;
}

function shoot(tower, type, targetPos, config, explicitAngle) {
    const angle = explicitAngle !== undefined ? explicitAngle : tower.angle;

    const spawnPos = tower.pos.add(vec2(40, 0).rotate(angle));
    
    if (config.type === "shotgun") {
        createProjectile(spawnPos, angle, config);
        createProjectile(spawnPos, angle - 15, config);
        createProjectile(spawnPos, angle + 15, config);
    } 
    else {
        createProjectile(spawnPos, angle, config);
    }
}

function createProjectile(posValue, angle, config) {
    let speed = 600;
    if (config.type === "explosive") speed = 400; 
    if (config.type === "bomb") speed = 300;      

    add([
        sprite(config.bulletSprite || "swordLevel1"), 
        pos(posValue),
        anchor("center"),
        scale(0.05),
        rotate(angle),
        area(),
        move(angle, speed),
        offscreen({ destroy: true }),
        "projectile", 
        { 
            damage: config.damage, 
            pType: config.type, 
            owner: "player"     
        }
    ]);
}

function handleBulletHit(bullet, zombie) {
    if (bullet.pType === "explosive" || bullet.pType === "bomb") {
        const radius = bullet.pType === "bomb" ? 100 : 80; 
        createExplosion(bullet.pos, radius, bullet.damage);
    } else {
        damageZombie(zombie, bullet.damage);
    }
    
    destroy(bullet);
}

function createExplosion(posValue, radius, damage) {
    add([
        circle(radius),
        color(255, 100, 50),
        opacity(0.6),
        pos(posValue),
        anchor("center"),
        lifespan(0.15),
    ]);

    get("zombie").forEach(z => {
        if (posValue.dist(z.pos) <= radius) {
            damageZombie(z, damage);
        }
    });
}

export const MAX_BUILDING_LEVEL = 5;

export const weaponState = {
    sword: { level: 1, baseDamage: 24 },
    axe: { level: 1, baseDamage: 18 },
    bow: { level: 1, baseDamage: 16 }
};

export const potionCatalog = {
    health: { cost: 45, heal: 60 },
    shield: { cost: 55, shield: 80 }
};

export function getLevelColor(level) {
    return LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)] || LEVEL_COLORS[1];
}

export function getWeaponDamage(type) {
    const data = weaponState[type];
    if (!data) return 0;
    const multiplier = 1 + 0.2 * (data.level - 1);
    return Math.round(data.baseDamage * multiplier);
}

export function getWeaponUpgradeCost(type) {
    const state = weaponState[type];
    if (!state) return 0;
    return 30 + state.level * 25;
}

export function applyWeaponTint(weapon, level) {
    if (!weapon) return;
    weapon.color = getLevelColor(level).tint;
}