import React, { useState, useCallback, useMemo } from 'react';
import { GridPosition, EditTool, AlgorithmType } from '../types/pathfinder';
import { GRID_ROWS, GRID_COLS, keyOf, parseKey } from '../algorithms/pathfinderEngine';
import { Play, Target, Eye, Sparkles } from 'lucide-react';

interface GridVisualizerProps {
  algorithmType: AlgorithmType;
  start: GridPosition;
  goal: GridPosition;
  walls: Set<string>;
  frontierKeys: string[];
  exploredKeys: string[];
  activeCell: GridPosition | null;
  inspectingNeighbor: GridPosition | null;
  path: GridPosition[];
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  parentMap: Record<string, GridPosition>;
  activeTool: EditTool;
  onToggleWall: (r: number, c: number, shouldAdd: boolean) => void;
  onMoveStart: (pos: GridPosition) => void;
  onMoveGoal: (pos: GridPosition) => void;
  isReadOnly?: boolean;
  label?: string;
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({
  algorithmType,
  start,
  goal,
  walls,
  frontierKeys,
  exploredKeys,
  activeCell,
  inspectingNeighbor,
  path,
  gScores,
  hScores,
  fScores,
  parentMap,
  activeTool,
  onToggleWall,
  onMoveStart,
  onMoveGoal,
  isReadOnly = false,
  label,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragAction, setDragAction] = useState<'add_wall' | 'remove_wall' | 'move_start' | 'move_goal' | null>(null);
  const [hoveredCell, setHoveredCell] = useState<GridPosition | null>(null);
  const [showScoresOnCells, setShowScoresOnCells] = useState(false);

  // Fast lookups for rendering
  const frontierSet = useMemo(() => new Set(frontierKeys), [frontierKeys]);
  const exploredSet = useMemo(() => new Set(exploredKeys), [exploredKeys]);
  const pathSet = useMemo(() => {
    const s = new Set<string>();
    path.forEach((p) => s.add(keyOf(p.r, p.c)));
    return s;
  }, [path]);

  const startKey = keyOf(start.r, start.c);
  const goalKey = keyOf(goal.r, goal.c);

  const handleCellMouseDown = useCallback(
    (r: number, c: number) => {
      if (isReadOnly) return;
      setIsMouseDown(true);
      const k = keyOf(r, c);

      // Check if clicking start or goal directly
      if (r === start.r && c === start.c) {
        setDragAction('move_start');
        return;
      }
      if (r === goal.r && c === goal.c) {
        setDragAction('move_goal');
        return;
      }

      // Check active tool
      if (activeTool === 'start') {
        if (!walls.has(k) && !(r === goal.r && c === goal.c)) {
          onMoveStart({ r, c });
        }
        return;
      }
      if (activeTool === 'goal') {
        if (!walls.has(k) && !(r === start.r && c === start.c)) {
          onMoveGoal({ r, c });
        }
        return;
      }
      if (activeTool === 'erase') {
        setDragAction('remove_wall');
        if (walls.has(k)) {
          onToggleWall(r, c, false);
        }
        return;
      }

      // Default: Wall Tool
      if (walls.has(k)) {
        setDragAction('remove_wall');
        onToggleWall(r, c, false);
      } else {
        setDragAction('add_wall');
        onToggleWall(r, c, true);
      }
    },
    [isReadOnly, start, goal, activeTool, walls, onMoveStart, onMoveGoal, onToggleWall]
  );

  const handleCellMouseEnter = useCallback(
    (r: number, c: number) => {
      setHoveredCell({ r, c });
      if (!isMouseDown || isReadOnly) return;

      const k = keyOf(r, c);

      if (dragAction === 'move_start') {
        if (k !== goalKey && !walls.has(k)) {
          onMoveStart({ r, c });
        }
        return;
      }
      if (dragAction === 'move_goal') {
        if (k !== startKey && !walls.has(k)) {
          onMoveGoal({ r, c });
        }
        return;
      }
      if (dragAction === 'add_wall') {
        if (k !== startKey && k !== goalKey && !walls.has(k)) {
          onToggleWall(r, c, true);
        }
        return;
      }
      if (dragAction === 'remove_wall') {
        if (walls.has(k)) {
          onToggleWall(r, c, false);
        }
        return;
      }
    },
    [isMouseDown, isReadOnly, dragAction, goalKey, startKey, walls, onMoveStart, onMoveGoal, onToggleWall]
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    setDragAction(null);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isReadOnly) return;
      const touch = e.touches[0];
      if (!touch) return;
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const cell = target?.closest('[data-row]') as HTMLElement | null;
      if (cell) {
        const r = Number(cell.dataset.row);
        const c = Number(cell.dataset.col);
        if (!isNaN(r) && !isNaN(c)) {
          handleCellMouseEnter(r, c);
        }
      }
    },
    [isReadOnly, handleCellMouseEnter]
  );

  // Compute inspected cell details for tooltip/indicator
  const inspectedData = useMemo(() => {
    if (!hoveredCell) return null;
    const k = keyOf(hoveredCell.r, hoveredCell.c);
    const isStart = hoveredCell.r === start.r && hoveredCell.c === start.c;
    const isGoal = hoveredCell.r === goal.r && hoveredCell.c === goal.c;
    const isWall = walls.has(k);
    const inPath = pathSet.has(k);
    const inExplored = exploredSet.has(k);
    const inFrontier = frontierSet.has(k);
    const isActive = activeCell?.r === hoveredCell.r && activeCell?.c === hoveredCell.c;

    let status = 'Unvisited';
    if (isStart) status = 'Start Point';
    else if (isGoal) status = 'Goal Point';
    else if (isWall) status = 'Wall / Obstacle';
    else if (inPath) status = 'Shortest Path';
    else if (isActive) status = 'Currently Expanding';
    else if (inFrontier) status = 'Frontier (Open Set)';
    else if (inExplored) status = 'Explored (Closed Set)';

    return {
      pos: hoveredCell,
      status,
      g: gScores[k] !== undefined ? gScores[k] : null,
      h: hScores[k] !== undefined ? hScores[k] : null,
      f: fScores[k] !== undefined ? fScores[k] : null,
      parent: parentMap[k] ? parentMap[k] : null,
    };
  }, [hoveredCell, start, goal, walls, pathSet, exploredSet, frontierSet, activeCell, gScores, hScores, fScores, parentMap]);

  return (
    <div
      className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl"
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setHoveredCell(null);
      }}
    >
      {/* Top Bar with label and score toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {label && (
            <span className="font-bold text-slate-200 tracking-wide flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${algorithmType === 'astar' ? 'bg-indigo-400' : 'bg-cyan-400'}`} />
              {label}
            </span>
          )}
          <span className="text-[11px] text-slate-500 font-mono">
            Grid: {GRID_ROWS} &times; {GRID_COLS} (4-Way Movement)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={showScoresOnCells}
              onChange={(e) => setShowScoresOnCells(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 w-3 h-3 cursor-pointer"
            />
            <span>Show Cell Values</span>
          </label>
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div
        className="p-2 sm:p-3 overflow-x-auto flex justify-center bg-slate-950/70 select-none touch-none"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <div
          className="inline-grid gap-[1px] bg-slate-800/90 p-[2px] rounded-lg shadow-inner border border-slate-800"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(14px, 24px))`,
            gridTemplateRows: `repeat(${GRID_ROWS}, minmax(14px, 24px))`,
          }}
        >
          {Array.from({ length: GRID_ROWS }).map((_, r) =>
            Array.from({ length: GRID_COLS }).map((_, c) => {
              const k = keyOf(r, c);
              const isStart = r === start.r && c === start.c;
              const isGoal = r === goal.r && c === goal.c;
              const isWall = walls.has(k);
              const isPath = pathSet.has(k);
              const isActive = activeCell?.r === r && activeCell?.c === c;
              const isInspecting = inspectingNeighbor?.r === r && inspectingNeighbor?.c === c;
              const inFrontier = frontierSet.has(k);
              const inExplored = exploredSet.has(k);

              // Cell Color & Styling Resolution
              let cellBg = 'bg-slate-900/90 hover:bg-slate-800/70';
              let cellBorder = 'border-transparent';
              let textContent = null;

              if (isWall) {
                cellBg = 'bg-slate-700 border-slate-600 shadow-inner';
              } else if (isStart) {
                cellBg = 'bg-emerald-500 shadow-md shadow-emerald-500/50 text-slate-950 font-bold';
              } else if (isGoal) {
                cellBg = 'bg-rose-500 shadow-md shadow-rose-500/50 text-white font-bold';
              } else if (isPath) {
                cellBg = 'bg-gradient-to-br from-amber-400 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-400/50 animate-pulse';
              } else if (isActive) {
                cellBg = 'bg-amber-300 ring-2 ring-amber-200 text-slate-950 font-black animate-bounce';
              } else if (isInspecting) {
                cellBg = 'bg-cyan-400 text-slate-950 font-bold ring-2 ring-cyan-200';
              } else if (inFrontier) {
                cellBg = 'bg-cyan-950/80 border border-cyan-400/80 text-cyan-200';
              } else if (inExplored) {
                cellBg = 'bg-indigo-950/70 border border-indigo-700/40 text-indigo-300';
              }

              // Optional overlay text: F score for A*, G score for Dijkstra
              if (showScoresOnCells && !isWall && !isStart && !isGoal) {
                if (algorithmType === 'astar' && fScores[k] !== undefined) {
                  textContent = fScores[k];
                } else if (gScores[k] !== undefined) {
                  textContent = gScores[k];
                }
              }

              return (
                <div
                  key={k}
                  data-row={r}
                  data-col={c}
                  onMouseDown={() => handleCellMouseDown(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  onTouchStart={(e) => {
                    handleCellMouseDown(r, c);
                  }}
                  className={`relative flex items-center justify-center rounded-[3px] text-[8px] sm:text-[9px] font-mono select-none cursor-pointer transition-colors duration-75 aspect-square ${cellBg} ${cellBorder}`}
                  title={`(${r}, ${c})`}
                >
                  {isStart ? (
                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5 text-slate-950" />
                  ) : isGoal ? (
                    <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  ) : isPath ? (
                    <span className="text-[10px] leading-none">★</span>
                  ) : textContent !== null ? (
                    <span className="opacity-90 scale-90 leading-none">{textContent}</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cell Inspector Hover Footer */}
      <div className="px-3 py-1.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 min-h-[30px]">
        {inspectedData ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-slate-200">
              Cell: <strong className="text-white">({inspectedData.pos.r}, {inspectedData.pos.c})</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
              {inspectedData.status}
            </span>
            {inspectedData.g !== null && (
              <span className="font-mono text-slate-300">
                g(n): <strong className="text-indigo-400">{inspectedData.g}</strong>
              </span>
            )}
            {algorithmType === 'astar' && inspectedData.h !== null && (
              <span className="font-mono text-slate-300">
                h(n): <strong className="text-cyan-400">{inspectedData.h}</strong>
              </span>
            )}
            {algorithmType === 'astar' && inspectedData.f !== null && (
              <span className="font-mono text-slate-300">
                f(n): <strong className="text-amber-400">{inspectedData.f}</strong>
              </span>
            )}
            {inspectedData.parent && (
              <span className="font-mono text-slate-400">
                parent: ({inspectedData.parent.r}, {inspectedData.parent.c})
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-500 italic">
            Hover over any cell to inspect its coordinates, g(n), h(n), and f(n) scores.
          </span>
        )}
      </div>
    </div>
  );
};
