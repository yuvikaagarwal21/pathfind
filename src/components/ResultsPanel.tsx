import React from 'react';
import { AlgorithmResult, VisualizerMode } from '../types/pathfinder';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface ResultsPanelProps {
  mode: VisualizerMode;
  astarResult: AlgorithmResult | null;
  dijkstraResult: AlgorithmResult | null;
  currentResult: AlgorithmResult | null;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  mode,
  astarResult,
  dijkstraResult,
  currentResult,
}) => {
  if (mode === 'compare') {
    const bothFinished =
      (astarResult?.status === 'success' || astarResult?.status === 'failure') &&
      (dijkstraResult?.status === 'success' || dijkstraResult?.status === 'failure');

    const nodeReductionPercent =
      astarResult && dijkstraResult && dijkstraResult.nodesExpanded > 0
        ? Math.round(
            ((dijkstraResult.nodesExpanded - astarResult.nodesExpanded) /
              dijkstraResult.nodesExpanded) *
              100
          )
        : 0;

    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Algorithm Performance Comparison</span>
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            Compare Mode (Independent Grid Copies)
          </span>
        </div>

        {/* Side-by-side comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* A* Result Card */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-indigo-900/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                A* Search (Informed)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  astarResult?.status === 'success'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : astarResult?.status === 'failure'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {astarResult?.status === 'success'
                  ? 'Optimal Path Found'
                  : astarResult?.status === 'failure'
                  ? 'No Path Exists'
                  : 'Searching / Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Total Cost</div>
                <div className="text-sm font-bold text-slate-100">
                  {astarResult?.totalCost !== null && astarResult?.totalCost !== undefined
                    ? astarResult.totalCost
                    : '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Path Steps</div>
                <div className="text-sm font-bold text-slate-100">
                  {astarResult?.pathLength !== null && astarResult?.pathLength !== undefined
                    ? astarResult.pathLength
                    : '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Nodes Expanded</div>
                <div className="text-sm font-bold text-indigo-400">
                  {astarResult?.nodesExpanded ?? '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Explored Cells</div>
                <div className="text-sm font-bold text-slate-200">
                  {astarResult?.cellsExplored ?? '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Dijkstra Result Card */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-900/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Dijkstra's Algorithm (Uninformed)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  dijkstraResult?.status === 'success'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : dijkstraResult?.status === 'failure'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {dijkstraResult?.status === 'success'
                  ? 'Optimal Path Found'
                  : dijkstraResult?.status === 'failure'
                  ? 'No Path Exists'
                  : 'Searching / Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Total Cost</div>
                <div className="text-sm font-bold text-slate-100">
                  {dijkstraResult?.totalCost !== null && dijkstraResult?.totalCost !== undefined
                    ? dijkstraResult.totalCost
                    : '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Path Steps</div>
                <div className="text-sm font-bold text-slate-100">
                  {dijkstraResult?.pathLength !== null && dijkstraResult?.pathLength !== undefined
                    ? dijkstraResult.pathLength
                    : '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Nodes Expanded</div>
                <div className="text-sm font-bold text-cyan-400">
                  {dijkstraResult?.nodesExpanded ?? '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Explored Cells</div>
                <div className="text-sm font-bold text-slate-200">
                  {dijkstraResult?.cellsExplored ?? '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparative Conclusion Banner */}
        {bothFinished && astarResult && dijkstraResult && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span>Algorithmic Comparison Findings</span>
            </div>
            {astarResult.found && dijkstraResult.found ? (
              <p>
                Both algorithms guaranteed and found the <strong>optimal shortest path cost ({astarResult.totalCost})</strong>.
                Notice that A* expanded <strong>{astarResult.nodesExpanded}</strong> nodes vs Dijkstra&apos;s{' '}
                <strong>{dijkstraResult.nodesExpanded}</strong> nodes
                {nodeReductionPercent > 0 ? (
                  <>
                    {' '}(an efficiency improvement of <strong>{nodeReductionPercent}% fewer node expansions</strong> thanks to the Manhattan heuristic).
                  </>
                ) : (
                  '.'
                )}
                <br />
                <em>Note on path equivalence:</em> When multiple equally short routes exist, the tie-breaking rules can lead to slight visual variations in the chosen route, but both paths share the identical optimal cost.
              </p>
            ) : !astarResult.found && !dijkstraResult.found ? (
              <p>
                Both algorithms accurately concluded that the goal is <strong>unreachable</strong> due to obstacle boundaries.
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // Single Algorithm Mode
  const isComplete = currentResult?.status === 'success' || currentResult?.status === 'failure';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Execution Statistics</span>
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
            currentResult?.status === 'success'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : currentResult?.status === 'failure'
              ? 'bg-rose-950 text-rose-300 border border-rose-800'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {currentResult?.status === 'success' ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Optimal Path Found
            </>
          ) : currentResult?.status === 'failure' ? (
            <>
              <XCircle className="w-3 h-3 text-rose-400" />
              Goal Unreachable
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 text-slate-400" />
              In Progress
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Total Path Cost</div>
          <div className="text-base font-bold text-slate-100">
            {currentResult?.totalCost !== null && currentResult?.totalCost !== undefined
              ? currentResult.totalCost
              : '—'}
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Path Length (Steps)</div>
          <div className="text-base font-bold text-slate-100">
            {currentResult?.pathLength !== null && currentResult?.pathLength !== undefined
              ? currentResult.pathLength
              : '—'}
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Nodes Expanded</div>
          <div className="text-base font-bold text-indigo-400">
            {currentResult?.nodesExpanded ?? '—'}
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Explored Cells</div>
          <div className="text-base font-bold text-slate-200">
            {currentResult?.cellsExplored ?? '—'}
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 font-sans">Search Status</div>
          <div className="text-xs font-semibold text-slate-300 font-sans capitalize pt-0.5">
            {currentResult?.status ?? 'Idle'}
          </div>
        </div>
      </div>
    </div>
  );
};
