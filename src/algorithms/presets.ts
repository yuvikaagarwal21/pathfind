/**
 * Pre-configured maze and obstacle presets
 */

import { GridPosition } from '../types/pathfinder';
import { keyOf, GRID_ROWS, GRID_COLS } from './pathfinderEngine';

export interface PresetMap {
  id: string;
  name: string;
  description: string;
  walls: Set<string>;
  start: GridPosition;
  goal: GridPosition;
}

export const PRESET_DEFAULT_ID = 'default_practical';

export function getDefaultObstacles(): Set<string> {
  const walls = new Set<string>();

  // A vertical barrier with gaps at rows 4-6 and rows 14-16
  // Placed at columns 14 and 15
  for (let r = 0; r < GRID_ROWS; r++) {
    // Leave passages at top (rows 3, 4) and bottom (rows 15, 16)
    if ((r >= 0 && r <= 2) || (r >= 7 && r <= 13) || (r >= 17 && r < GRID_ROWS)) {
      walls.add(keyOf(r, 15));
    }
  }

  // A couple of staggered inner baffle walls to create interesting detour
  walls.add(keyOf(7, 14));
  walls.add(keyOf(13, 14));
  walls.add(keyOf(7, 16));
  walls.add(keyOf(13, 16));

  return walls;
}

export function getUTrapObstacles(): Set<string> {
  const walls = new Set<string>();
  // Concave U-trap pointing towards the start:
  // Vertical back wall at col 18 (rows 6 to 14)
  for (let r = 6; r <= 14; r++) {
    walls.add(keyOf(r, 18));
  }
  // Top arm extending towards start: row 6, cols 8 to 18
  for (let c = 8; c <= 18; c++) {
    walls.add(keyOf(6, c));
  }
  // Bottom arm extending towards start: row 14, cols 8 to 18
  for (let c = 8; c <= 18; c++) {
    walls.add(keyOf(14, c));
  }
  return walls;
}

export function getCentralGapObstacles(): Set<string> {
  const walls = new Set<string>();
  // Wall down column 15 with a 3-cell gap right in the middle
  for (let r = 0; r < GRID_ROWS; r++) {
    if (r < 9 || r > 11) {
      walls.add(keyOf(r, 15));
    }
  }
  return walls;
}

export function getDoubleSlitObstacles(): Set<string> {
  const walls = new Set<string>();
  // Two walls with staggered openings
  for (let r = 0; r < GRID_ROWS; r++) {
    if (r !== 5 && r !== 6) {
      walls.add(keyOf(r, 10));
    }
    if (r !== 13 && r !== 14) {
      walls.add(keyOf(r, 20));
    }
  }
  return walls;
}

export function generateRandomObstacles(
  density: number = 0.25,
  start: GridPosition,
  goal: GridPosition
): Set<string> {
  const walls = new Set<string>();
  const startKey = keyOf(start.r, start.c);
  const goalKey = keyOf(goal.r, goal.c);

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const k = keyOf(r, c);
      if (k === startKey || k === goalKey) continue;
      // Do not block direct neighbor of start or goal initially to ensure high chance of path
      if (Math.abs(r - start.r) <= 1 && Math.abs(c - start.c) <= 1) continue;
      if (Math.abs(r - goal.r) <= 1 && Math.abs(c - goal.c) <= 1) continue;

      if (Math.random() < density) {
        walls.add(k);
      }
    }
  }

  return walls;
}

export const PRESET_OPTIONS = [
  { id: 'default_practical', label: 'Default Practical Obstacle', desc: 'Central barrier with dual bypasses' },
  { id: 'u_trap', label: 'U-Trap (Concave Barrier)', desc: 'Tests A* heuristic trap & backtracking vs Dijkstra' },
  { id: 'central_gap', label: 'Central Wall with Gap', desc: 'Single funnel point in column 15' },
  { id: 'double_slit', label: 'Staggered Dual Slits', desc: 'Forces diagonal zig-zag detour' },
  { id: 'empty', label: 'Empty Grid (Benchmark 23 Moves)', desc: 'Validates theoretical Manhattan minimum of 23' },
];
