import React from 'react';
import { AlgorithmEvent, AlgorithmType } from '../types/pathfinder';
import { Info, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, Compass } from 'lucide-react';

interface StepExplanationPanelProps {
  algorithm: AlgorithmType;
  event: AlgorithmEvent;
  stepIndex: number;
  totalSteps: number;
}

export const StepExplanationPanel: React.FC<StepExplanationPanelProps> = ({
  algorithm,
  event,
  stepIndex,
  totalSteps,
}) => {
  // Icon based on event type
  const renderIcon = () => {
    switch (event.type) {
      case 'start':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'select_node':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'goal_reached':
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'no_path':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-2">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>{event.heading}</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-950 text-indigo-300 border border-slate-800">
            Step {stepIndex} / {Math.max(0, totalSteps - 1)}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {algorithm === 'astar' ? 'A* Search' : "Dijkstra's Algorithm"}
          </span>
        </div>
      </div>

      {/* Main explanation content */}
      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
        {event.explanation}
      </div>

      {/* What happens next bar */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800/80 text-[11px] text-slate-400">
        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span className="text-slate-300 font-medium">Next:</span>
        <span className="truncate">{event.whatNext}</span>
      </div>
    </div>
  );
};
