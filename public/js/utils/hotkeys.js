import { BUILDING_TYPES } from './config.js';

export const BUILDING_HOTKEYS = {
    '1': 'wall',
    '2': 'gold-mine',
    '3': 'gold-miner',
    '4': 'tower_archer',
    '5': 'tower_cannon',
    '6': 'tower_magic',
    '7': 'tower_bomber',
    '8': 'door'
};

export function setupBuildingHotkeys(selectBuildingCallback) {
    document.addEventListener('keydown', (e) => {
        const buildingType = BUILDING_HOTKEYS[e.key];
        if (buildingType && BUILDING_TYPES[buildingType]) {
            selectBuildingCallback(buildingType);
        }
    });
}

export function formatCost(cost = { wood: 0, stone: 0, gold: 0 }) {
    return `Wood: ${cost.wood || 0} | Stone: ${cost.stone || 0}`;
}
