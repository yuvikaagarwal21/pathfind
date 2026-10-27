import React, { useState } from 'react';
import { AlgorithmType, GridPosition } from '../types/pathfinder';
import { ChevronDown, ChevronUp, Calculator, HelpCircle, Compass, Target } from 'lucide-react';

interface ScoreDetailsPanelProps {
  algorithm: AlgorithmType;
  activeCell: GridPosition | null;
  gScore: number | null;
  hScore: number | null;
  fScore: number | null;
  goal: GridPosition;
}

export const ScoreDetailsPanel: React.FC<ScoreDetailsPanelProps> = ({
  algorithm,
  activeCell,
  gScore,
  hScore,
  fScore,
  goal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            Why was this cell selected?
          </span>
          {activeCell && (
            <span className="font-mono text-xs text-indigo-300 font-semibold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
              ({activeCell.r}, {activeCell.c})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? 'Collapse' : 'Show Mathematical Breakdown'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-300 flex flex-col gap-3">
          {activeCell ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Cost g(n) */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-mono font-bold text-indigo-400">g(n)</span>
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg font-bold text-slate-100 font-mono">
                  {gScore !== null ? gScore : '—'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Actual shortest distance traveled from the start cell.
                </div>
              </div>

              {/* Heuristic h(n) */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-mono font-bold text-cyan-400">h(n)</span>
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-slate-100 font-mono">
                  {algorithm === 'astar' ? (hScore !== null ? hScore : '—') : '0 (Unused)'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {algorithm === 'astar'
                    ? `Manhattan heuristic: |${activeCell.r} - ${goal.r}| + |${activeCell.c} - ${goal.c}| = ${hScore}`
                    : "Dijkstra's algorithm does not use a heuristic to guide search."}
                </div>
              </div>

              {/* Priority Score f(n) */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-mono font-bold text-amber-400">
                    {algorithm === 'astar' ? 'f(n) = g(n) + h(n)' : 'Priority = g(n)'}
                  </span>
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-amber-400 font-mono">
                  {algorithm === 'astar'
                    ? `${fScore} (${gScore} + ${hScore})`
                    : `${gScore !== null ? gScore : '—'}`}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {algorithm === 'astar'
                    ? 'A* extracts the minimum f(n) node from the frontier queue.'
                    : 'Dijkstra extracts the minimum accumulated g(n) node.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 italic">
              No node is currently active. Advance or run the algorithm to view the score details of the active node.
            </div>
          )}

          {/* Educational Note */}
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-200 leading-relaxed">
            <strong className="text-indigo-300">Algorithmic Principle:</strong>{' '}
            {algorithm === 'astar' ? (
              <span>
                Because the Manhattan distance is <em>admissible</em> (never overestimates the true cost on a 4-way unit grid) and <em>consistent</em>, A* evaluates nodes with the lowest estimated total cost first, steering the search beam directly toward the goal without expanding irrelevant cells in the opposite direction.
              </span>
            ) : (
              <span>
                Dijkstra expands cells strictly in order of their true distance from the start, spreading outward radially like an expanding circular wavefront. While guaranteed to find the shortest path, it explores equally in all directions because it lacks knowledge of the goal's location.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
