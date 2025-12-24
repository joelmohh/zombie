export const MAP_SIZE = 10000;
export const GRID_SIZE = 50;
export const ZOOM_LEVEL = 0.6;
export const SPEED = 500;
export const THICKNESS = 0;

export const BUILDING_TYPES = {
    "wall": {
        sprite: "wall",
        width: 100, 
        height: 20,
        offset: { x: -50, y: -10 }, 
        hitboxSize: { w: 100, h: 20 },
        scale: 0.05,
        health: 200,
        max: 100
    },
    "gold-mine": {
        sprite: "gold-mine", 
        width: 150, 
        height: 150, 
        offset: { x: -75, y: -75 },
        hitboxSize: { w: 150, h: 150 },
        scale: 0.05,
        health: 500,
        max: 1
    },
    "door":{
        sprite: "door",
        width: 100, 
        height: 20,
        offset: { x: -50, y: -10 }, 
        hitboxSize: { w: 100, h: 20 },
        scale: 0.05,
        health: 200,
        max: 100
    },
    "tower_archer": {
        sprite: "wall", 
        width: 100, height: 100,
        offset: { x: -50, y: -50 },
        hitboxSize: { w: 100, h: 100 },
        scale: 0.15,
        health: 200,
        range: 400,          
        fireRate: 0.8,       
        damage: 50,
        type: "single",      
        bulletSprite: "sword" 
    },
    "tower_cannon": {
        sprite: "wall",
        width: 100, height: 100,
        offset: { x: -50, y: -50 },
        hitboxSize: { w: 100, h: 100 },
        scale: 0.15,
        health: 400,
        range: 350,
        fireRate: 2.0,       
        damage: 50,
        type: "explosive",   
        bulletSprite: "stone" 
    },
    "tower_bomber": {
        sprite: "wall",
        width: 100, height: 100,
        offset: { x: -50, y: -50 },
        hitboxSize: { w: 100, h: 100 },
        scale: 0.15,
        health: 300,
        range: 500,          
        fireRate: 3.0,       
        damage: 100,
        type: "bomb",        
        bulletSprite: "stone"
    },
    "tower_magic": {
        sprite: "wall",
        width: 100, height: 100,
        offset: { x: -50, y: -50 },
        hitboxSize: { w: 100, h: 100 },
        scale: 0.15,
        health: 250,
        range: 250,          
        fireRate: 1.5,
        damage: 10,          
        type: "shotgun",     
        bulletSprite: "sword" 
    }
};

export const BUTTON_MAPPING = {
    1: "wall",
    2: "gold-mine",
    3: "tower_archer",
    4: "tower_cannon",
    5: "tower_magic", 
    6: "tower_bomber" 
};