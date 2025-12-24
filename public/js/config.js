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
        scale: 0.05
    },
    "gold-mine": {
        sprite: "gold-mine", 
        width: 150, 
        height: 150, 
        offset: { x: -75, y: -75 },
        hitboxSize: { w: 150, h: 150 },
        scale: 0.05
    },
    "tower": {
        sprite: "wall", 
        width: 100, 
        height: 100,
        offset: { x: -50, y: -50 },
        hitboxSize: { w: 100, h: 100 },
        scale: 0.15
    },
    "door": {
        sprite: "door",
        width: 100, 
        height: 20,
        offset: { x: -50, y: -10 }, 
        hitboxSize: { w: 100, h: 20 },
        scale: 0.05
    }
};
export const BUTTON_MAPPING = {
    1: "wall",       
    2: "gold-mine",  
    3: "tower",      
    4: "door"
};