/**
 * Pathfinding Visualizer: A* vs Dijkstra
 * Data types and interfaces
 */

export interface GridPosition {
  r: number;
  c: number;
}

export type CellType = 'empty' | 'wall' | 'start' | 'goal';

export type AlgorithmType = 'astar' | 'dijkstra';

export type VisualizerMode = 'astar' | 'dijkstra' | 'compare';

export type EditTool = 'wall' | 'erase' | 'start' | 'goal';

export type SearchStatus = 'idle' | 'running' | 'paused' | 'success' | 'failure';

export type EventType =
  | 'start'
  | 'select_node'
  | 'check_neighbor'
  | 'update_neighbor'
  | 'neighbor_closed'
  | 'neighbor_wall'
  | 'goal_reached'
  | 'reconstruct_step'
  | 'complete'
  | 'no_path';

export interface AlgorithmEvent {
  stepNumber: number;
  type: EventType;
  heading: string;
  explanation: string;
  whatNext: string;
  current?: GridPosition;
  neighbor?: GridPosition;
  f?: number;
  g?: number;
  h?: number;
  prevCost?: number;
  newCost?: number;
}

export interface AlgorithmSnapshot {
  stepIndex: number;
  event: AlgorithmEvent;
  activeCell: GridPosition | null;
  inspectingNeighbor: GridPosition | null;
  // Represented as serialized strings "r,c" for O(1) set operations and efficient state snapshots
  frontierKeys: string[];
  exploredKeys: string[];
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  parentMap: Record<string, GridPosition>;
  path: GridPosition[];
  status: SearchStatus;
  nodesExpanded: number;
  cellsExplored: number;
  pathCost: number | null;
  pathLength: number | null;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  found: boolean;
  path: GridPosition[];
  totalCost: number | null;
  pathLength: number | null;
  nodesExpanded: number;
  cellsExplored: number;
  status: SearchStatus;
}
