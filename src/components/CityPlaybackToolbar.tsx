import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Zap,
  Gauge,
} from 'lucide-react';

interface CityPlaybackToolbarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onJumpToEnd: () => void;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onJumpToStep: (step: number) => void;
  isSearchComplete: boolean;
  canPrev: boolean;
  canNext: boolean;
}

const SPEED_OPTIONS = [
  { label: '0.25x Slow', value: 500 },
  { label: '0.5x', value: 250 },
  { label: '1x Normal', value: 120 },
  { label: '2x Fast', value: 50 },
  { label: 'Instant', value: 15 },
];

export const CityPlaybackToolbar: React.FC<CityPlaybackToolbarProps> = ({
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onReset,
  onJumpToEnd,
  currentStepIndex,
  totalSteps,
  speed,
  onSpeedChange,
  onJumpToStep,
  isSearchComplete,
  canPrev,
  canNext,
}) => {
  const maxStep = Math.max(0, totalSteps - 1);
  const progressPercent = maxStep > 0 ? (currentStepIndex / maxStep) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-3">
      {/* Title & Speed */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Execution Controls
        </span>
        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span>Speed:</span>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {SPEED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Button Toolbar */}
      <div className="grid grid-cols-5 gap-1.5">
        {/* Play/Pause Button (Primary Action) */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-colors shadow-sm cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
          title={isPlaying ? 'Pause search execution' : 'Run / Resume automated pathfinding'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStepIndex > 0 && !isSearchComplete ? 'Resume' : 'Run Search'}</span>
            </>
          )}
        </button>

        {/* Step Prev */}
        <button
          type="button"
          onClick={onPrevStep}
          disabled={!canPrev}
          className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            canPrev
              ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-50'
          }`}
          title="Step backward one algorithm event (reversible search history)"
        >
          <SkipBack className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Step Next */}
        <button
          type="button"
          onClick={onNextStep}
          disabled={!canNext}
          className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            canNext
              ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700 hover:text-white'
              : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-50'
          }`}
          title="Step forward one algorithm event"
        >
          <span className="hidden sm:inline">Next</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors cursor-pointer"
          title="Reset search state to start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Instant Finish button */}
      <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
        <button
          type="button"
          onClick={onJumpToEnd}
          disabled={isSearchComplete || totalSteps <= 1}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer"
          title="Instant calculate to final optimal route"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Jump to Final Route</span>
        </button>

        <span className="font-mono text-[11px] text-slate-400">
          Step <strong className="text-slate-200">{currentStepIndex}</strong> of{' '}
          <strong className="text-slate-200">{maxStep}</strong>
        </span>
      </div>

      {/* Scrubber slider */}
      <div className="flex flex-col gap-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={maxStep}
            value={currentStepIndex}
            onChange={(e) => onJumpToStep(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>
        <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-150 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
