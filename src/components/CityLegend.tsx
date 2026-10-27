import React from 'react';
import { Play, Target, Sparkles, Eye, Compass, Waypoints, Car } from 'lucide-react';

export const CityLegend: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300">
      {/* Search State Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Waypoints className="w-3.5 h-3.5 text-indigo-400" />
          Search State:
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-[9px] shadow-sm shadow-emerald-500/40">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span>Start (MUJ)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-[9px] shadow-sm shadow-rose-500/40">
              <Target className="w-2.5 h-2.5" />
            </div>
            <span>Destination</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-400 ring-2 ring-amber-300 flex items-center justify-center text-slate-950 animate-pulse">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
            <span>Currently Expanding</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center">
              <Eye className="w-2.5 h-2.5 text-cyan-300" />
            </div>
            <span>Frontier (Open Set)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-700 flex items-center justify-center">
              <Compass className="w-2.5 h-2.5 text-indigo-400" />
            </div>
            <span>Explored (Closed Set)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-5 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
            <span className="font-semibold text-amber-300">Optimal Route</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center text-slate-950">
              <Car className="w-3 h-3 fill-current" />
            </div>
            <span className="text-amber-200">Animated Vehicle</span>
          </div>
        </div>
      </div>

      {/* Jaipur Landmark Categories */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-[11px] text-slate-400">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
          Landmark Categories:
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Heritage &amp; Forts</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Museums &amp; Culture</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Shopping &amp; Bazaars</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
            <span>Parks &amp; Nature</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Temples</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>Transport Hubs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
