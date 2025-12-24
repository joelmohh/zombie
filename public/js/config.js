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
        hitboxSize: { w: 100, h: 20 }
    },
    "gold-mine": {
        sprite: "wall",
        width: 150, 
        height: 150, 
        offset: { x: -75, y: -75 },
        hitboxSize: { w: 150, h: 150 }
    }
};

export const BUTTON_MAPPING = {
    1: "wall",       
    2: "gold-mine",  
    3: "tower",      
};