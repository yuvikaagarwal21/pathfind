import React, { useState } from 'react';
import { AlgorithmType, CityNode } from '../types/cityGraph';
import {
  ChevronDown,
  ChevronUp,
  Calculator,
  HelpCircle,
  Compass,
  Target,
  ShieldCheck,
} from 'lucide-react';

interface CityScoreDetailsProps {
  algorithm: AlgorithmType;
  activeNode: CityNode | null;
  destinationNode: CityNode | null;
  gScore: number | null;
  hScore: number | null;
  fScore: number | null;
}

export const CityScoreDetails: React.FC<CityScoreDetailsProps> = ({
  algorithm,
  activeNode,
  destinationNode,
  gScore,
  hScore,
  fScore,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            Why was this location selected? (Evaluation Function Breakdown)
          </span>
          {activeNode && (
            <span className="font-semibold text-xs text-indigo-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              {activeNode.name}
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
          {activeNode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Cost g(n) */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-mono font-bold text-indigo-400">g(n)</span>
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg font-bold text-slate-100 font-mono">
                  {gScore !== null ? `${gScore} km` : '—'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Actual shortest road distance accumulated from the start location.
                </div>
              </div>

              {/* Heuristic h(n) */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-mono font-bold text-cyan-400">h(n)</span>
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-slate-100 font-mono">
                  {algorithm === 'astar'
                    ? hScore !== null
                      ? `${hScore} km`
                      : '—'
                    : '0 (Unused)'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {algorithm === 'astar'
                    ? `Admissible Euclidean distance: straight-line vector to ${destinationNode?.name}.`
                    : "Dijkstra's algorithm is uninformed and does not utilize a heuristic."}
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
                    ? `${fScore} km (${gScore} + ${hScore})`
                    : `${gScore !== null ? `${gScore} km` : '—'}`}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {algorithm === 'astar'
                    ? 'A* extracts the minimum f(n) location from the frontier priority queue.'
                    : 'Dijkstra extracts the minimum accumulated distance g(n).'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 italic">
              No location is currently active. Advance or run the algorithm to view the score details of the active location.
            </div>
          )}

          {/* Admissibility & Consistency Mathematical Guarantee */}
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-200 leading-relaxed flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mathematical Optimality Proof (Manipal University Jaipur CSE Curriculum):</span>
            </div>
            {algorithm === 'astar' ? (
              <p>
                In this city graph, h(n) is the straight-line Euclidean distance &radic;((x₁ &minus; x₂)&sup2; + (y₁ &minus; y₂)&sup2;) / 28. Because real roads can never be shorter than the straight-line Euclidean distance between their endpoints, h(n) &le; h*(n) (it is strictly <strong>admissible</strong> and never overestimates). By the triangle inequality, h(u) &le; c(u, v) + h(v), proving it is also <strong>monotonically consistent</strong>. Therefore, A* is mathematically guaranteed to find an optimal shortest route.
              </p>
            ) : (
              <p>
                Dijkstra explores radially in all directions by order of known road distance $g(n)$. Because all road weights are positive ($w &gt; 0$), once a node is popped from the priority queue and placed in the explored set, its shortest distance is permanently optimal.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
