/**
 * Pathfinding Visualizer: A* and Dijkstra Core Engine
 * 
 * Implements genuine A* Search and Dijkstra's Algorithm with:
 * - 4-directional movement (Up, Down, Left, Right) with unit cost (1)
 * - Admissible Manhattan heuristic for A*: |r - r_goal| + |c - c_goal|
 * - True distance-based Dijkstra with f(n) = g(n) (no heuristic)
 * - Priority queue selection with deterministic tie-breaking
 * - Complete snapshot generation for flawless forward & backward stepping
 */

import {
  GridPosition,
  AlgorithmType,
  AlgorithmSnapshot,
  AlgorithmEvent,
  AlgorithmResult,
  SearchStatus,
} from '../types/pathfinder';

export const GRID_ROWS = 20;
export const GRID_COLS = 30;

export const DEFAULT_START: GridPosition = { r: 10, c: 3 };
export const DEFAULT_GOAL: GridPosition = { r: 10, c: 26 };

export const keyOf = (r: number, c: number): string => `${r},${c}`;
export const parseKey = (key: string): GridPosition => {
  const [r, c] = key.split(',').map(Number);
  return { r, c };
};

export const manhattanDistance = (a: GridPosition, b: GridPosition): number => {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
};

// 4-directional neighbors: Up, Right, Down, Left
const DIRECTIONS = [
  { dr: -1, dc: 0, name: 'Up' },
  { dr: 0, dc: 1, name: 'Right' },
  { dr: 1, dc: 0, name: 'Down' },
  { dr: 0, dc: -1, name: 'Left' },
];

export interface RunOptions {
  algorithm: AlgorithmType;
  rows: number;
  cols: number;
  start: GridPosition;
  goal: GridPosition;
  walls: Set<string>;
}

interface PQItem {
  key: string;
  pos: GridPosition;
  f: number;
  g: number;
  h: number;
  order: number;
}

export function generateAlgorithmSnapshots(options: RunOptions): {
  snapshots: AlgorithmSnapshot[];
  result: AlgorithmResult;
} {
  const { algorithm, rows, cols, start, goal, walls } = options;
  const snapshots: AlgorithmSnapshot[] = [];
  const startKey = keyOf(start.r, start.c);
  const goalKey = keyOf(goal.r, goal.c);

  // Search state collections
  const frontierKeysSet = new Set<string>();
  const exploredKeysSet = new Set<string>();
  const gScores: Record<string, number> = {};
  const hScores: Record<string, number> = {};
  const fScores: Record<string, number> = {};
  const parentMap: Record<string, GridPosition> = {};

  let nodesExpanded = 0;
  let orderCounter = 0;

  // Initialize start node
  const startH = algorithm === 'astar' ? manhattanDistance(start, goal) : 0;
  gScores[startKey] = 0;
  hScores[startKey] = startH;
  fScores[startKey] = startH; // For Dijkstra startH is 0, so f(start) = 0
  frontierKeysSet.add(startKey);

  // Priority queue representation
  const pq: PQItem[] = [
    {
      key: startKey,
      pos: { ...start },
      f: fScores[startKey],
      g: 0,
      h: startH,
      order: orderCounter++,
    },
  ];

  const takeSnapshot = (
    event: AlgorithmEvent,
    activeCell: GridPosition | null,
    inspectingNeighbor: GridPosition | null,
    status: SearchStatus,
    currentPath: GridPosition[] = [],
    pathCost: number | null = null,
    pathLength: number | null = null
  ) => {
    snapshots.push({
      stepIndex: snapshots.length,
      event,
      activeCell: activeCell ? { ...activeCell } : null,
      inspectingNeighbor: inspectingNeighbor ? { ...inspectingNeighbor } : null,
      frontierKeys: Array.from(frontierKeysSet),
      exploredKeys: Array.from(exploredKeysSet),
      gScores: { ...gScores },
      hScores: { ...hScores },
      fScores: { ...fScores },
      parentMap: { ...parentMap },
      path: [...currentPath],
      status,
      nodesExpanded,
      cellsExplored: exploredKeysSet.size,
      pathCost,
      pathLength,
    });
  };

  // Initial Snapshot
  takeSnapshot(
    {
      stepNumber: 0,
      type: 'start',
      heading: 'Search Initialized',
      explanation:
        algorithm === 'astar'
          ? `A* Search begins at start (${start.r}, ${start.c}) with g=0 and Manhattan heuristic h=${startH}. Total f = g + h = ${startH}.`
          : `Dijkstra begins at start (${start.r}, ${start.c}) with known distance g=0. Dijkstra uses pure distance priority with no heuristic.`,
      whatNext:
        'The algorithm will pop the frontier node with the lowest priority score.',
      current: start,
      g: 0,
      h: startH,
      f: startH,
    },
    start,
    null,
    'running'
  );

  // Edge case: Start equals Goal
  if (start.r === goal.r && start.c === goal.c) {
    nodesExpanded = 1;
    exploredKeysSet.add(startKey);
    takeSnapshot(
      {
        stepNumber: snapshots.length,
        type: 'complete',
        heading: 'Start is the Goal',
        explanation: `Start and goal are identical at (${start.r}, ${start.c}). Path is trivial with 0 moves.`,
        whatNext: 'Search completed successfully.',
        current: start,
        g: 0,
        h: 0,
        f: 0,
      },
      start,
      null,
      'success',
      [start],
      0,
      0
    );

    return {
      snapshots,
      result: {
        algorithm,
        found: true,
        path: [start],
        totalCost: 0,
        pathLength: 0,
        nodesExpanded: 1,
        cellsExplored: 1,
        status: 'success',
      },
    };
  }

  let goalReached = false;
  let finalPath: GridPosition[] = [];

  // Main Priority Loop
  while (pq.length > 0) {
    // Sort / Pick minimum priority node
    // For A*: primary sort is f-score ascending. Tie-breaker 1: smaller h-score (closer to goal). Tie-breaker 2: FIFO order.
    // For Dijkstra: primary sort is g-score ascending. Tie-breaker: FIFO order.
    pq.sort((a, b) => {
      if (algorithm === 'astar') {
        if (a.f !== b.f) return a.f - b.f;
        if (a.h !== b.h) return a.h - b.h;
        return a.order - b.order;
      } else {
        if (a.g !== b.g) return a.g - b.g;
        return a.order - b.order;
      }
    });

    const currentItem = pq.shift()!;
    const currentPos = currentItem.pos;
    const currentKey = currentItem.key;

    // If cell was already explored via a cheaper route, skip stale queue entries
    if (exploredKeysSet.has(currentKey)) {
      continue;
    }

    // Expand current node
    nodesExpanded++;
    frontierKeysSet.delete(currentKey);
    exploredKeysSet.add(currentKey);

    const currentG = gScores[currentKey];
    const currentH = hScores[currentKey] ?? 0;
    const currentF = fScores[currentKey];

    // Snapshot: Node Selection
    takeSnapshot(
      {
        stepNumber: snapshots.length,
        type: 'select_node',
        heading:
          algorithm === 'astar'
            ? `A* selects cell (${currentPos.r}, ${currentPos.c})`
            : `Dijkstra selects cell (${currentPos.r}, ${currentPos.c})`,
        explanation:
          algorithm === 'astar'
            ? `A* expands (${currentPos.r}, ${currentPos.c}) with lowest f(n) = ${currentF} (g=${currentG} from start, h=${currentH} heuristic to goal).`
            : `Dijkstra expands (${currentPos.r}, ${currentPos.c}) with smallest accumulated distance g(n) = ${currentG}. It does not use a heuristic.`,
        whatNext: `The algorithm will inspect all 4 adjacent neighbors (Up, Right, Down, Left).`,
        current: currentPos,
        g: currentG,
        h: currentH,
        f: currentF,
      },
      currentPos,
      null,
      'running'
    );

    // Goal Check upon popping
    if (currentPos.r === goal.r && currentPos.c === goal.c) {
      goalReached = true;

      // Reconstruct Path
      const reconstructed: GridPosition[] = [];
      let traceKey: string | undefined = goalKey;
      while (traceKey) {
        const pos = parseKey(traceKey);
        reconstructed.unshift(pos);
        const parentPos: GridPosition | undefined = parentMap[traceKey];
        traceKey = parentPos ? keyOf(parentPos.r, parentPos.c) : undefined;
      }

      finalPath = reconstructed;
      const totalCost = currentG;
      const stepCount = reconstructed.length - 1; // number of moves

      takeSnapshot(
        {
          stepNumber: snapshots.length,
          type: 'goal_reached',
          heading: 'Goal Cell Reached!',
          explanation: `The goal (${goal.r}, ${goal.c}) was extracted from the priority queue with optimal cost g = ${totalCost}. Path reconstruction initiated.`,
          whatNext: 'Backtracking from the goal to the start using recorded parent pointers.',
          current: goal,
          g: currentG,
          h: 0,
          f: currentF,
        },
        goal,
        null,
        'running'
      );

      // Backtracking animation steps
      const animatedPath: GridPosition[] = [];
      for (let i = 0; i < reconstructed.length; i++) {
        animatedPath.push(reconstructed[i]);
        const isLast = i === reconstructed.length - 1;
        takeSnapshot(
          {
            stepNumber: snapshots.length,
            type: isLast ? 'complete' : 'reconstruct_step',
            heading: isLast ? 'Shortest Path Reconstructed' : `Tracing Path: Step ${i + 1}`,
            explanation: isLast
              ? `Optimal shortest path confirmed: ${stepCount} steps with total path cost ${totalCost}.`
              : `Traversing path from start (${start.r}, ${start.c}) toward goal via (${reconstructed[i].r}, ${reconstructed[i].c}).`,
            whatNext: isLast ? 'Search finished with guaranteed optimality.' : 'Continuing path reconstruction...',
            current: reconstructed[i],
            g: gScores[keyOf(reconstructed[i].r, reconstructed[i].c)],
            h: hScores[keyOf(reconstructed[i].r, reconstructed[i].c)],
            f: fScores[keyOf(reconstructed[i].r, reconstructed[i].c)],
          },
          reconstructed[i],
          null,
          isLast ? 'success' : 'running',
          [...animatedPath],
          totalCost,
          stepCount
        );
      }

      break;
    }

    // Explore 4 neighbors
    for (const dir of DIRECTIONS) {
      const nr = currentPos.r + dir.dr;
      const nc = currentPos.c + dir.dc;
      const neighborPos: GridPosition = { r: nr, c: nc };
      const neighborKey = keyOf(nr, nc);

      // Check grid boundaries
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        continue;
      }

      // Check if wall
      if (walls.has(neighborKey)) {
        takeSnapshot(
          {
            stepNumber: snapshots.length,
            type: 'neighbor_wall',
            heading: `Checking ${dir.name} Neighbor (${nr}, ${nc})`,
            explanation: `Cell (${nr}, ${nc}) is an obstacle (wall). Movement is blocked, skipping.`,
            whatNext: 'Inspecting remaining neighbors...',
            current: currentPos,
            neighbor: neighborPos,
            g: currentG,
          },
          currentPos,
          neighborPos,
          'running'
        );
        continue;
      }

      // Check if already in closed set (explored)
      if (exploredKeysSet.has(neighborKey)) {
        takeSnapshot(
          {
            stepNumber: snapshots.length,
            type: 'neighbor_closed',
            heading: `Checking ${dir.name} Neighbor (${nr}, ${nc})`,
            explanation: `Cell (${nr}, ${nc}) is already in the closed/explored set with an optimal known cost of ${gScores[neighborKey]}. Skipping.`,
            whatNext: 'Inspecting remaining neighbors...',
            current: currentPos,
            neighbor: neighborPos,
            g: gScores[neighborKey],
          },
          currentPos,
          neighborPos,
          'running'
        );
        continue;
      }

      // Unit movement cost = 1
      const tentativeG = currentG + 1;
      const currentNeighborG = gScores[neighborKey];
      const isCheaper = currentNeighborG === undefined || tentativeG < currentNeighborG;

      if (isCheaper) {
        const prevCost = currentNeighborG;
        const neighborH = algorithm === 'astar' ? manhattanDistance(neighborPos, goal) : 0;
        const tentativeF = tentativeG + neighborH;

        gScores[neighborKey] = tentativeG;
        hScores[neighborKey] = neighborH;
        fScores[neighborKey] = tentativeF;
        parentMap[neighborKey] = { ...currentPos };

        frontierKeysSet.add(neighborKey);

        pq.push({
          key: neighborKey,
          pos: neighborPos,
          f: tentativeF,
          g: tentativeG,
          h: neighborH,
          order: orderCounter++,
        });

        takeSnapshot(
          {
            stepNumber: snapshots.length,
            type: 'update_neighbor',
            heading:
              prevCost === undefined
                ? `Discovered Neighbor (${nr}, ${nc})`
                : `Cheaper Route Found to (${nr}, ${nc})`,
            explanation:
              prevCost === undefined
                ? algorithm === 'astar'
                  ? `Discovered (${nr}, ${nc}): g = ${tentativeG}, h = ${neighborH}, f = ${tentativeF}. Added to frontier open set with parent (${currentPos.r}, ${currentPos.c}).`
                  : `Discovered (${nr}, ${nc}): distance g = ${tentativeG}. Added to frontier with parent (${currentPos.r}, ${currentPos.c}).`
                : `Found a shorter path to (${nr}, ${nc})! New g = ${tentativeG} < previous ${prevCost}. Updated parent to (${currentPos.r}, ${currentPos.c}).`,
            whatNext: 'Continuing neighbor inspection or popping next minimum frontier cell.',
            current: currentPos,
            neighbor: neighborPos,
            g: tentativeG,
            h: neighborH,
            f: tentativeF,
            prevCost,
            newCost: tentativeG,
          },
          currentPos,
          neighborPos,
          'running'
        );
      }
    }
  }

  // If priority queue exhausted without reaching goal
  if (!goalReached) {
    takeSnapshot(
      {
        stepNumber: snapshots.length,
        type: 'no_path',
        heading: 'No Path Exists to Goal',
        explanation: `The frontier open set is empty. All reachable cells (${exploredKeysSet.size}) have been explored, but goal (${goal.r}, ${goal.c}) remains unreachable due to obstacles.`,
        whatNext: 'Search terminated unsuccessfully.',
        current: undefined,
      },
      null,
      null,
      'failure',
      [],
      null,
      null
    );

    return {
      snapshots,
      result: {
        algorithm,
        found: false,
        path: [],
        totalCost: null,
        pathLength: null,
        nodesExpanded,
        cellsExplored: exploredKeysSet.size,
        status: 'failure',
      },
    };
  }

  const finalResult: AlgorithmResult = {
    algorithm,
    found: true,
    path: finalPath,
    totalCost: finalPath.length > 0 ? finalPath.length - 1 : 0,
    pathLength: finalPath.length > 0 ? finalPath.length - 1 : 0,
    nodesExpanded,
    cellsExplored: exploredKeysSet.size,
    status: 'success',
  };

  return {
    snapshots,
    result: finalResult,
  };
}
