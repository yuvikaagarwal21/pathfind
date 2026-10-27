import React from 'react';
import { CityGraphResult, VisualizerMode } from '../types/cityGraph';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Navigation,
} from 'lucide-react';

interface CityResultsPanelProps {
  mode: VisualizerMode;
  astarResult: CityGraphResult | null;
  dijkstraResult: CityGraphResult | null;
  currentResult: CityGraphResult | null;
}

export const CityResultsPanel: React.FC<CityResultsPanelProps> = ({
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
            <span>City Navigation Comparison (A* vs Dijkstra)</span>
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            Compare Mode &bull; Synchronized City Graph
          </span>
        </div>

        {/* Side-by-side comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* A* Result Card */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-indigo-900/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                A* Search (Informed Euclidean Heuristic)
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
                  ? 'Optimal Route Found'
                  : astarResult?.status === 'failure'
                  ? 'No Route Exists'
                  : 'In Progress'}
              </span>
            </div>

            {/* Path sequence */}
            {astarResult?.pathNames && astarResult.pathNames.length > 0 && (
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 overflow-x-auto">
                <Navigation className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="font-semibold text-slate-100 whitespace-nowrap">
                  {astarResult.pathNames.join(' → ')}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Total Travel Cost</div>
                <div className="text-sm font-bold text-slate-100">
                  {astarResult?.totalCost !== null ? `${astarResult?.totalCost} km` : '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Roads Traveled</div>
                <div className="text-sm font-bold text-slate-100">
                  {astarResult?.roadsTraveled ?? '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Locations Expanded</div>
                <div className="text-sm font-bold text-indigo-400">
                  {astarResult?.nodesExpanded ?? '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Explored Locations</div>
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
                Dijkstra's Algorithm (Uninformed Radial Search)
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
                  ? 'Optimal Route Found'
                  : dijkstraResult?.status === 'failure'
                  ? 'No Route Exists'
                  : 'In Progress'}
              </span>
            </div>

            {/* Path sequence */}
            {dijkstraResult?.pathNames && dijkstraResult.pathNames.length > 0 && (
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 overflow-x-auto">
                <Navigation className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="font-semibold text-slate-100 whitespace-nowrap">
                  {dijkstraResult.pathNames.join(' → ')}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Total Travel Cost</div>
                <div className="text-sm font-bold text-slate-100">
                  {dijkstraResult?.totalCost !== null ? `${dijkstraResult?.totalCost} km` : '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Roads Traveled</div>
                <div className="text-sm font-bold text-slate-100">
                  {dijkstraResult?.roadsTraveled ?? '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Locations Expanded</div>
                <div className="text-sm font-bold text-cyan-400">
                  {dijkstraResult?.nodesExpanded ?? '—'}
                </div>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Explored Locations</div>
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
              <span>City Navigation Practical Findings</span>
            </div>
            {astarResult.found && dijkstraResult.found ? (
              <p>
                Both algorithms guaranteed and found the <strong>shortest travel cost ({astarResult.totalCost} km)</strong>.
                Notice that A* expanded <strong>{astarResult.nodesExpanded}</strong> locations vs Dijkstra&apos;s{' '}
                <strong>{dijkstraResult.nodesExpanded}</strong> locations
                {nodeReductionPercent > 0 ? (
                  <>
                    {' '}(an efficiency advantage of <strong>{nodeReductionPercent}% fewer location expansions</strong> due to goal-directed Euclidean vector heuristics).
                  </>
                ) : (
                  '.'
                )}
                <br />
                <em>Note on route selection:</em> If multiple distinct road routes have the identical shortest total distance, the specific road chosen may differ depending on tie-breakers, but both algorithms achieve the exact optimal cost.
              </p>
            ) : !astarResult.found && !dijkstraResult.found ? (
              <p>
                Both algorithms concluded that the destination is <strong>unreachable</strong> from the start location due to disconnected road segments across city sectors.
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // Single Mode
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Navigation Performance Metrics</span>
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
              Optimal Route Found
            </>
          ) : currentResult?.status === 'failure' ? (
            <>
              <XCircle className="w-3 h-3 text-rose-400" />
              Destination Unreachable
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 text-slate-400" />
              In Progress
            </>
          )}
        </span>
      </div>

      {/* Path sequence */}
      {currentResult?.pathNames && currentResult.pathNames.length > 0 && (
        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-1.5 overflow-x-auto">
          <Navigation className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-slate-100 whitespace-nowrap">
            {currentResult.pathNames.join(' → ')}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Total Travel Cost</div>
          <div className="text-base font-bold text-slate-100">
            {currentResult?.totalCost !== null ? `${currentResult?.totalCost} km` : '—'}
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Roads Traveled</div>
          <div className="text-base font-bold text-slate-100">
            {currentResult?.roadsTraveled ?? '—'}
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Locations Expanded</div>
          <div className="text-base font-bold text-indigo-400">
            {currentResult?.nodesExpanded ?? '—'}
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 font-sans">Explored Locations</div>
          <div className="text-base font-bold text-slate-200">
            {currentResult?.cellsExplored ?? '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
