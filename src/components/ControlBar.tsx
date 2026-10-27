import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Zap,
  PenTool,
  Eraser,
  MapPin,
  Flag,
  Trash2,
  Gauge,
  ListFilter,
} from 'lucide-react';
import { EditTool } from '../types/pathfinder';
import { PRESET_OPTIONS } from '../algorithms/presets';

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onJumpToStep: (step: number) => void;
  onJumpToEnd: () => void;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  activeTool: EditTool;
  onToolChange: (tool: EditTool) => void;
  onClearWalls: () => void;
  onSelectPreset: (presetId: string) => void;
  isSearchComplete: boolean;
  canPrev: boolean;
  canNext: boolean;
}

const SPEED_OPTIONS = [
  { label: '0.25x (Slow)', value: 350 },
  { label: '0.5x', value: 180 },
  { label: '1x (Normal)', value: 80 },
  { label: '2x (Fast)', value: 30 },
  { label: 'Max (4x)', value: 10 },
];

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onReset,
  onJumpToStep,
  onJumpToEnd,
  currentStepIndex,
  totalSteps,
  speed,
  onSpeedChange,
  activeTool,
  onToolChange,
  onClearWalls,
  onSelectPreset,
  isSearchComplete,
  canPrev,
  canNext,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-3">
      {/* Upper row: Playback & Step Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Play / Pause button */}
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={totalSteps <= 1 && isSearchComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
            title={isPlaying ? 'Pause visualizer' : 'Start / resume animated search'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{currentStepIndex > 0 && !isSearchComplete ? 'Resume' : 'Auto Play'}</span>
              </>
            )}
          </button>

          {/* Previous Step (Reversible History) */}
          <button
            type="button"
            onClick={onPrevStep}
            disabled={!canPrev}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              canPrev
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
                : 'bg-slate-900 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-60'
            }`}
            title="Step backward one algorithm event (restores past state, frontier, and scores)"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Step</span>
          </button>

          {/* Next Step */}
          <button
            type="button"
            onClick={onNextStep}
            disabled={!canNext}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              canNext
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/80 shadow-sm shadow-indigo-500/30 active:scale-95'
                : 'bg-slate-900 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-60'
            }`}
            title="Advance exactly one algorithm event (popping node, relaxing neighbor, or path tracing)"
          >
            <span className="hidden sm:inline">Next Step</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Jump to Finish */}
          <button
            type="button"
            onClick={onJumpToEnd}
            disabled={isSearchComplete || totalSteps <= 1}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Fast forward to final result"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Instant Finish</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 transition-colors"
            title="Reset algorithm execution and search state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 font-medium text-[11px]">Speed:</span>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="bg-transparent text-slate-200 font-semibold text-xs focus:outline-none cursor-pointer"
          >
            {SPEED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrubber / Step Progress Slider */}
      <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
          Step <span className="text-indigo-400 font-bold">{currentStepIndex}</span> / {Math.max(0, totalSteps - 1)}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => onJumpToStep(Number(e.target.value))}
          disabled={totalSteps <= 1}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
        />
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
          {totalSteps > 1 ? `${Math.round((currentStepIndex / (totalSteps - 1)) * 100)}%` : '0%'}
        </span>
      </div>

      {/* Lower row: Grid Editing Tools & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-800/80 text-xs">
        {/* Tool modes: Wall, Erase, Move Start, Move Goal */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Grid Edit:</span>

          <button
            type="button"
            onClick={() => onToolChange('wall')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTool === 'wall'
                ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click or drag on grid to draw obstacles/walls"
          >
            <PenTool className="w-3 h-3 text-slate-300" />
            <span>Draw Wall</span>
          </button>

          <button
            type="button"
            onClick={() => onToolChange('erase')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTool === 'erase'
                ? 'bg-rose-950/80 text-rose-200 border-rose-600 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click or drag to remove walls"
          >
            <Eraser className="w-3 h-3 text-rose-400" />
            <span>Erase</span>
          </button>

          <button
            type="button"
            onClick={() => onToolChange('start')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTool === 'start'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click any cell on grid to place Start"
          >
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Set Start</span>
          </button>

          <button
            type="button"
            onClick={() => onToolChange('goal')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTool === 'goal'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click any cell on grid to place Goal"
          >
            <Flag className="w-3 h-3 text-rose-400" />
            <span>Set Goal</span>
          </button>
        </div>

        {/* Presets & Clear Walls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Presets dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onSelectPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                Load Preset Map...
              </option>
              {PRESET_OPTIONS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.label}
                </option>
              ))}
              <option value="random" className="bg-slate-900 text-slate-200">
                Random Obstacles (25%)
              </option>
            </select>
          </div>

          {/* Clear Walls button */}
          <button
            type="button"
            onClick={onClearWalls}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Remove all obstacles from the grid"
          >
            <Trash2 className="w-3 h-3 text-slate-400" />
            <span>Clear Walls</span>
          </button>
        </div>
      </div>
    </div>
  );
};
