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
    loadSpriteAtlas('https://joelmohh.github.io/zombie/public/assets/weapon/weaponSprites.png', 'https://joelmohh.github.io/zombie/public/assets/weapon/weaponSpritesMap.json');
    loadSpriteAtlas('https://joelmohh.github.io/zombie/public/assets/resources/resourcesSprites.png', 'https://joelmohh.github.io/zombie/public/assets/resources/resourcesSpriteMap.json');
    loadSpriteAtlas('https://joelmohh.github.io/zombie/public/assets/buildings/buildingsSprites.png', 'https://joelmohh.github.io/zombie/public/assets/buildings/buildingsSpriteMap.json');


    /* All sprites, commented because they are too heavy to load all at once
    // Player and Hands
    loadSafeSprite("player", "https://joelmohh.github.io/zombie//public/assets/resources/player.svg");
    loadSafeSprite("hands", "https://joelmohh.github.io/zombie//public/assets/resources/hands.svg");

    // Weapons - Axe 
    loadSafeSprite('axeLevel1', 'https://joelmohh.github.io/zombie//public/assets/weapon/axeLevel1.svg');
    loadSafeSprite('axeLevel2', 'https://joelmohh.github.io/zombie//public/assets/weapon/axeLevel2.svg');
    loadSafeSprite('axeLevel3', 'https://joelmohh.github.io/zombie//public/assets/weapon/axeLevel3.svg');
    loadSafeSprite('axeLevel4', 'https://joelmohh.github.io/zombie//public/assets/weapon/axeLevel4.svg');
    loadSafeSprite('axeLevel5', 'https://joelmohh.github.io/zombie//public/assets/weapon/axeLevel5.svg');
    loadSafeSprite('axeLevel6', 'https://joelmohh.github.io/zombie//public/assets/weapon/axeLevel6.svg');
    loadSafeSprite('axeLevel7', 'https://joelmohh.github.io/zombie//public/assets/weapon/axeLevel7.svg');
    // Weapons - Sword
    loadSafeSprite('swordLevel1', 'https://joelmohh.github.io/zombie//public/assets/weapon/swordLevel1.svg');
    loadSafeSprite('swordLevel2', 'https://joelmohh.github.io/zombie//public/assets/weapon/swordLevel2.svg');
    loadSafeSprite('swordLevel3', 'https://joelmohh.github.io/zombie//public/assets/weapon/swordLevel3.svg');
    loadSafeSprite('swordLevel4', 'https://joelmohh.github.io/zombie//public/assets/weapon/swordLevel4.svg');
    loadSafeSprite('swordLevel5', 'https://joelmohh.github.io/zombie//public/assets/weapon/swordLevel5.svg');
    loadSafeSprite('swordLevel6', 'https://joelmohh.github.io/zombie//public/assets/weapon/swordLevel6.svg');
    loadSafeSprite('swordLevel7', 'https://joelmohh.github.io/zombie//public/assets/weapon/swordLevel7.svg');
    // Weapons - Bow
    loadSafeSprite('bowLevel1', 'https://joelmohh.github.io/zombie//public/assets/weapon/bowLevel1.svg');
    loadSafeSprite('bowLevel2', 'https://joelmohh.github.io/zombie//public/assets/weapon/bowLevel2.svg');
    loadSafeSprite('bowLevel3', 'https://joelmohh.github.io/zombie//public/assets/weapon/bowLevel3.svg');
    loadSafeSprite('bowLevel4', 'https://joelmohh.github.io/zombie//public/assets/weapon/bowLevel4.svg');
    loadSafeSprite('bowLevel5', 'https://joelmohh.github.io/zombie//public/assets/weapon/bowLevel5.svg');
    loadSafeSprite('bowLevel6', 'https://joelmohh.github.io/zombie//public/assets/weapon/bowLevel6.svg');
    loadSafeSprite('bowLevel7', 'https://joelmohh.github.io/zombie//public/assets/weapon/bowLevel7.svg');
    // Weapons - Bomb
    loadSafeSprite('bombLevel1', 'https://joelmohh.github.io/zombie//public/assets/weapon/bombLevel1.svg');
    loadSafeSprite('bombLevel2', 'https://joelmohh.github.io/zombie//public/assets/weapon/bombLevel2.svg');
    loadSafeSprite('bombLevel3', 'https://joelmohh.github.io/zombie//public/assets/weapon/bombLevel3.svg');
    loadSafeSprite('bombLevel4', 'https://joelmohh.github.io/zombie//public/assets/weapon/bombLevel4.svg');
    loadSafeSprite('bombLevel5', 'https://joelmohh.github.io/zombie//public/assets/weapon/bombLevel5.svg');
    loadSafeSprite('bombLevel6', 'https://joelmohh.github.io/zombie//public/assets/weapon/bombLevel6.svg');
    loadSafeSprite('bombLevel7', 'https://joelmohh.github.io/zombie//public/assets/weapon/bombLevel7.svg');

    // Resources
    loadSafeSprite("tree", "https://joelmohh.github.io/zombie//public/assets/resources/tree.svg");
    loadSafeSprite("stone", "https://joelmohh.github.io/zombie//public/assets/resources/stone.svg");

    // Buildings - Wall
    loadSafeSprite('wallLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/wallLevel1.svg');
    loadSafeSprite('wallLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/wallLevel2.svg');
    loadSafeSprite('wallLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/wallLevel3.svg');
    loadSafeSprite('wallLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/wallLevel4.svg');
    loadSafeSprite('wallLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/wallLevel5.svg');
    loadSafeSprite('wallLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/wallLevel6.svg');
    loadSafeSprite('wallLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/wallLevel7.svg');
    // Buildings - Gold Mine
    loadSafeSprite('goldMineLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMineLevel1.svg');
    loadSafeSprite('goldMineLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMineLevel2.svg');
    loadSafeSprite('goldMineLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMineLevel3.svg');
    loadSafeSprite('goldMineLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMineLevel4.svg');
    loadSafeSprite('goldMineLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMineLevel5.svg');
    loadSafeSprite('goldMineLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMineLevel6.svg');
    loadSafeSprite('goldMineLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMineLevel7.svg');
    // Buildings - Gold Miner
    loadSafeSprite('goldMinerLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMinerLevel1.svg');
    loadSafeSprite('goldMinerLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMinerLevel2.svg');
    loadSafeSprite('goldMinerLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMinerLevel3.svg');
    loadSafeSprite('goldMinerLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMinerLevel4.svg');
    loadSafeSprite('goldMinerLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMinerLevel5.svg');
    loadSafeSprite('goldMinerLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMinerLevel6.svg');
    loadSafeSprite('goldMinerLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/goldMinerLevel7.svg');
    // Buildings - Back
    loadSafeSprite('backBuildingLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/backBuildingLevel1.svg');
    loadSafeSprite('backBuildingLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/backBuildingLevel2.svg');
    loadSafeSprite('backBuildingLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/backBuildingLevel3.svg');
    loadSafeSprite('backBuildingLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/backBuildingLevel4.svg');
    loadSafeSprite('backBuildingLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/backBuildingLevel5.svg');
    loadSafeSprite('backBuildingLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/backBuildingLevel6.svg');
    loadSafeSprite('backBuildingLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/backBuildingLevel7.svg');
    // Buildings - Arrow Tower 
    loadSafeSprite('arrowTowerLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/arrowTowerLevel1.svg');
    loadSafeSprite('arrowTowerLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/arrowTowerLevel2.svg');
    loadSafeSprite('arrowTowerLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/arrowTowerLevel3.svg');
    loadSafeSprite('arrowTowerLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/arrowTowerLevel4.svg');
    loadSafeSprite('arrowTowerLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/arrowTowerLevel5.svg');
    loadSafeSprite('arrowTowerLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/arrowTowerLevel6.svg');
    loadSafeSprite('arrowTowerLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/arrowTowerLevel7.svg');
    // Building - Bomber Tower
    loadSafeSprite('bombTowerLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/bombTowerLevel1.svg');
    loadSafeSprite('bombTowerLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/bombTowerLevel2.svg');
    loadSafeSprite('bombTowerLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/bombTowerLevel3.svg');
    loadSafeSprite('bombTowerLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/bombTowerLevel4.svg');
    loadSafeSprite('bombTowerLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/bombTowerLevel5.svg');
    loadSafeSprite('bombTowerLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/bombTowerLevel6.svg');
    loadSafeSprite('bombTowerLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/bombTowerLevel7.svg');
    // Building - Cannon Tower
    loadSafeSprite('cannonTowerLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/cannonTowerLevel1.svg');
    loadSafeSprite('cannonTowerLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/cannonTowerLevel2.svg');
    loadSafeSprite('cannonTowerLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/cannonTowerLevel3.svg');
    loadSafeSprite('cannonTowerLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/cannonTowerLevel4.svg');
    loadSafeSprite('cannonTowerLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/cannonTowerLevel5.svg');
    loadSafeSprite('cannonTowerLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/cannonTowerLevel6.svg');
    loadSafeSprite('cannonTowerLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/cannonTowerLevel7.svg');
    // Building - Shotgun Tower
    loadSafeSprite('shotgunTowerLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/shotgunTowerLevel1.svg');
    loadSafeSprite('shotgunTowerLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/shotgunTowerLevel2.svg');
    loadSafeSprite('shotgunTowerLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/shotgunTowerLevel3.svg');
    loadSafeSprite('shotgunTowerLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/shotgunTowerLevel4.svg');
    loadSafeSprite('shotgunTowerLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/shotgunTowerLevel5.svg');
    loadSafeSprite('shotgunTowerLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/shotgunTowerLevel6.svg');
    loadSafeSprite('shotgunTowerLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/shotgunTowerLevel7.svg');
    // Building - Door
    loadSafeSprite('doorLevel1', 'https://joelmohh.github.io/zombie//public/assets/buildings/doorLevel1.svg');
    loadSafeSprite('doorLevel2', 'https://joelmohh.github.io/zombie//public/assets/buildings/doorLevel2.svg');
    loadSafeSprite('doorLevel3', 'https://joelmohh.github.io/zombie//public/assets/buildings/doorLevel3.svg');
    loadSafeSprite('doorLevel4', 'https://joelmohh.github.io/zombie//public/assets/buildings/doorLevel4.svg');
    loadSafeSprite('doorLevel5', 'https://joelmohh.github.io/zombie//public/assets/buildings/doorLevel5.svg');
    loadSafeSprite('doorLevel6', 'https://joelmohh.github.io/zombie//public/assets/buildings/doorLevel6.svg');
    loadSafeSprite('doorLevel7', 'https://joelmohh.github.io/zombie//public/assets/buildings/doorLevel7.svg');

    // Potions
    loadSafeSprite("healthPotion", "https://joelmohh.github.io/zombie//public/assets/weapon/healthPotion.svg");
    loadSafeSprite("shieldPotion", "https://joelmohh.github.io/zombie//public/assets/weapon/shieldPotion.svg");
    */
}