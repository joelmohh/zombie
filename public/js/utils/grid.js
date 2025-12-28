import { GRID_SIZE } from "./config.js";

const occupied = new Set();

function cellKey(cx, cy) {
    return `${cx},${cy}`;
}

function rectCells(center, width, height) {
    const halfW = width / 2;
    const halfH = height / 2;

    const minCx = Math.floor((center.x - halfW) / GRID_SIZE);
    const maxCx = Math.floor((center.x + halfW - 1) / GRID_SIZE);
    const minCy = Math.floor((center.y - halfH) / GRID_SIZE);
    const maxCy = Math.floor((center.y + halfH - 1) / GRID_SIZE);

    const cells = [];
    for (let cx = minCx; cx <= maxCx; cx++) {
        for (let cy = minCy; cy <= maxCy; cy++) {
            cells.push({ cx, cy });
        }
    }
    return cells;
}

export function snapToGrid(pos) {
    return {
        x: Math.floor(pos.x / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2),
        y: Math.floor(pos.y / GRID_SIZE) * GRID_SIZE + (GRID_SIZE / 2),
    };
}

export function isAreaFree(center, width, height) {
    const cells = rectCells(center, width, height);
    for (const { cx, cy } of cells) {
        if (occupied.has(cellKey(cx, cy))) return false;
    }
    return true;
}

export function occupyArea(center, width, height) {
    const cells = rectCells(center, width, height);
    for (const { cx, cy } of cells) {
        occupied.add(cellKey(cx, cy));
    }
    return cells;
}

export function freeCells(cells) {
    for (const { cx, cy } of cells) {
        occupied.delete(cellKey(cx, cy));
    }
}

export function isRectWithinBounds(center, width, height, mapSize, padding) {
    const halfW = width / 2;
    const halfH = height / 2;
    const minX = center.x - halfW;
    const maxX = center.x + halfW;
    const minY = center.y - halfH;
    const maxY = center.y + halfH;

    if (minX < padding) return false;
    if (minY < padding) return false;
    if (maxX > mapSize - padding) return false;
    if (maxY > mapSize - padding) return false;

    return true;
}
