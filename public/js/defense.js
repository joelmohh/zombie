import { BUILDING_TYPES } from "./config.js";

export function initDefense() {
    const towerTypes = ["tower_archer", "tower_cannon", "tower_bomber", "tower_magic"];

    towerTypes.forEach(type => {
        onUpdate(type, (tower) => {
            if (tower.timer === undefined) tower.timer = 0;
            const config = BUILDING_TYPES[type];
            const target = findNearestEnemy(tower.pos, config.range);

            if (target) {
                const angleToZombie = target.pos.sub(tower.pos).angle();
                tower.angle = angleToZombie; 

                tower.timer -= dt();
                if (tower.timer <= 0) {
                    shoot(tower, type, target.pos, config);
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

function shoot(tower, type, targetPos, config) {
    const spawnPos = tower.pos.add(vec2(40, 0).rotate(tower.angle));
    const angle = tower.angle;

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
        sprite(config.bulletSprite || "sword"), 
        pos(posValue),
        anchor("center"),
        scale(0.5),
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
        const radius = bullet.pType === "bomb" ? 150 : 80; 
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
        if (pos.dist(z.pos) <= radius) {
            damageZombie(z, damage);
        }
    });
}

function damageZombie(zombie, dmg) {
    if (zombie.hp) {
        zombie.hp -= dmg;
        zombie.color = rgb(255, 0, 0);
        wait(0.1, () => zombie.color = rgb(255, 255, 255));

        if (zombie.hp <= 0) {
            destroy(zombie);
        }
    } else {
        destroy(zombie);
    }
}