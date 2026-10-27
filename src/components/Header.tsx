import React from 'react';
import { VisualizerMode } from '../types/cityGraph';
import { GitCompare, Sparkles, Navigation, Layers, GraduationCap } from 'lucide-react';

interface HeaderProps {
  mode: VisualizerMode;
  onModeChange: (newMode: VisualizerMode) => void;
  isModifiedDuringSearch: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Practical Subject */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white flex-shrink-0">
            <Navigation className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Jaipur Smart Route Navigator: A* vs Dijkstra
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                <GraduationCap className="w-3 h-3 text-indigo-400" />
                B.Tech CSE Practical
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Department of Computer Science & Engineering &bull; Manipal University Jaipur
            </p>
          </div>
        </div>

        {/* Right: Algorithm Selector (3 Options) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => onModeChange('astar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'astar'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>1. A* Search</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('dijkstra')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'dijkstra'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-sm shadow-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-300" />
            <span>2. Dijkstra</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('compare')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'compare'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-amber-200" />
            <span>3. Compare A* vs Dijkstra</span>
          </button>
        </div>
      </div>
    </header>
  );
};
