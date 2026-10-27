import React from 'react';
import { Play, Target, Shield, Sparkles, Compass, Eye, Waypoints } from 'lucide-react';

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-300">
      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
        <Waypoints className="w-3.5 h-3.5 text-indigo-400" />
        Legend:
      </span>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-[9px] shadow-sm shadow-emerald-500/40">
            <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
          </div>
          <span>Start Cell</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-rose-500 flex items-center justify-center text-white font-bold text-[9px] shadow-sm shadow-rose-500/40">
            <Target className="w-2.5 h-2.5" />
          </div>
          <span>Goal Cell</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-700 border border-slate-600 flex items-center justify-center">
            <Shield className="w-2.5 h-2.5 text-slate-400" />
          </div>
          <span>Wall / Obstacle</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-400 ring-2 ring-amber-300 flex items-center justify-center text-slate-950 animate-pulse">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
          <span>Active (Expanding)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-cyan-950 border border-cyan-400 flex items-center justify-center">
            <Eye className="w-2.5 h-2.5 text-cyan-300" />
          </div>
          <span>Frontier (Open Set)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-indigo-950 border border-indigo-700/80 flex items-center justify-center">
            <Compass className="w-2.5 h-2.5 text-indigo-400" />
          </div>
          <span>Explored (Closed Set)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm shadow-yellow-500/50 flex items-center justify-center text-slate-950 font-bold text-[9px]">
            ★
          </div>
          <span className="font-medium text-amber-300">Shortest Path</span>
        </div>
      </div>
    </div>
  );
};
