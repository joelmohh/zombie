// Load Sprites
function loadSafeSprite(name, url) {
    loadSprite(name, url, {
        sliceX: 1,
        sliceY: 1,
        anims: {
            idle: { from: 0, to: 0 }
        }
    });
}

export function loadAllSprites() {
    loadSafeSprite("player", "/public/assets/player.svg");
    loadSafeSprite("sword", "/public/assets/1.svg");
    loadSafeSprite("axe", "/public/assets/2.svg");
    loadSafeSprite("bow", "/public/assets/3.svg");
    loadSafeSprite("hands", "/public/assets/hands.svg");
    loadSafeSprite("tree", "/public/assets/tree.svg");
    loadSafeSprite("stone", "/public/assets/stone.svg");
    loadSafeSprite("wall", "/public/assets/brick.png");
    loadSafeSprite("tower", "/public/assets/brick.png");
    loadSafeSprite("cursor", "./public/assets/cursor.png");
}