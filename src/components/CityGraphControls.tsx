import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CityNode, GraphEditMode, CityLocationCategory } from '../types/cityGraph';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Zap,
  Gauge,
  MapPin,
  Flag,
  PlusCircle,
  Network,
  Trash2,
  DollarSign,
  Move,
  RotateCw,
  Search,
  Filter,
  Check,
  ChevronDown,
} from 'lucide-react';

interface CityGraphControlsProps {
  nodes: CityNode[];
  startId: string;
  destinationId: string;
  onSelectStart: (id: string) => void;
  onSelectDestination: (id: string) => void;
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
  editMode: GraphEditMode;
  onEditModeChange: (mode: GraphEditMode) => void;
  onResetNetwork: () => void;
  onLoadPreset: (presetId: string) => void;
  isSearchComplete: boolean;
  canPrev: boolean;
  canNext: boolean;
}

const SPEED_OPTIONS = [
  { label: '0.25x (Slow)', value: 500 },
  { label: '0.5x', value: 250 },
  { label: '1x (Normal)', value: 120 },
  { label: '2x (Fast)', value: 45 },
  { label: 'Max (Instant)', value: 15 },
];

const CATEGORY_LABELS: Record<CityLocationCategory, string> = {
  heritage: 'Heritage & Forts',
  museum: 'Museums & Culture',
  shopping: 'Shopping & Entertainment',
  park: 'Parks & Nature',
  temple: 'Temples & Pilgrimage',
  transit: 'Transport Hubs',
  junction: 'Road Junctions',
};

export const CityGraphControls: React.FC<CityGraphControlsProps> = ({
  nodes,
  startId,
  destinationId,
  onSelectStart,
  onSelectDestination,
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
  editMode,
  onEditModeChange,
  onResetNetwork,
  onLoadPreset,
  isSearchComplete,
  canPrev,
  canNext,
}) => {
  // Destination Search Modal/Dropdown State
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Change Start Dropdown State
  const [isChangeStartOpen, setIsChangeStartOpen] = useState(false);

  const destDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        destDropdownRef.current &&
        !destDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDestDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startNode = useMemo(() => nodes.find((n) => n.id === startId), [nodes, startId]);
  const destNode = useMemo(() => nodes.find((n) => n.id === destinationId), [nodes, destinationId]);

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    return nodes.filter((n) => {
      // Exclude internal junctions from default destination list unless explicitly searched
      if (n.category === 'junction' && !destSearchQuery) return false;
      const matchesSearch =
        n.name.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
        (n.zone && n.zone.toLowerCase().includes(destSearchQuery.toLowerCase())) ||
        (n.description && n.description.toLowerCase().includes(destSearchQuery.toLowerCase()));

      const matchesCat =
        selectedCategoryFilter === 'all' || n.category === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [nodes, destSearchQuery, selectedCategoryFilter]);

  // Group destinations by category
  const groupedDestinations = useMemo(() => {
    const groups: Partial<Record<CityLocationCategory, CityNode[]>> = {};
    filteredDestinations.forEach((n) => {
      if (!groups[n.category]) {
        groups[n.category] = [];
      }
      groups[n.category]!.push(n);
    });
    return groups;
  }, [filteredDestinations]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-3">
      {/* Upper Bar: Start & Destination Selectors + Primary Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Start & Searchable Destination Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Start Location (Default MUJ with explicit change modal) */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs relative">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-medium text-[11px]">Start:</span>
            <span className="text-emerald-300 font-bold text-xs max-w-[180px] sm:max-w-[210px] truncate" title={startNode?.name}>
              {startNode?.name || 'MUJ, Dehmi Kalan'}
            </span>
            <button
              type="button"
              onClick={() => setIsChangeStartOpen(!isChangeStartOpen)}
              className="text-[10px] text-slate-400 hover:text-indigo-300 underline ml-1 cursor-pointer"
            >
              Change
            </button>

            {/* Change Start Dropdown */}
            {isChangeStartOpen && (
              <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 max-h-60 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-300 px-2 py-1 border-b border-slate-800">
                  Select Starting Point:
                </div>
                {nodes
                  .filter((n) => n.category !== 'junction')
                  .map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        onSelectStart(n.id);
                        setIsChangeStartOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between hover:bg-slate-800 ${
                        n.id === startId ? 'bg-emerald-950/80 text-emerald-300 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{n.name}</span>
                      {n.id === startId && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Searchable Destination Dropdown */}
          <div ref={destDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDestDropdownOpen(!isDestDropdownOpen)}
              className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-xs transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span className="text-slate-400 font-medium text-[11px]">Destination:</span>
              <span className="text-rose-300 font-bold text-xs max-w-[170px] sm:max-w-[220px] truncate" title={destNode?.name}>
                {destNode?.name || 'Amber Fort'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Searchable Dropdown Popup */}
            {isDestDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 z-50 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2.5 flex flex-col gap-2 max-h-[420px] overflow-hidden">
                {/* Search Bar Input */}
                <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={destSearchQuery}
                    onChange={(e) => setDestSearchQuery(e.target.value)}
                    placeholder="Search landmark, fort, temple, museum..."
                    className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({nodes.length})
                  </button>
                  {(
                    ['heritage', 'museum', 'shopping', 'park', 'temple', 'transit'] as CityLocationCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${
                        selectedCategoryFilter === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>

                {/* Scrollable Results List Grouped by Category */}
                <div className="flex-1 overflow-y-auto max-h-[280px] flex flex-col gap-2 pr-1">
                  {Object.entries(groupedDestinations).length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      No landmarks matching &ldquo;{destSearchQuery}&rdquo;
                    </div>
                  ) : (
                    Object.entries(groupedDestinations).map(([category, catNodes]) => (
                      <div key={category} className="flex flex-col gap-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 bg-slate-900/60 rounded">
                          {CATEGORY_LABELS[category as CityLocationCategory]} ({catNodes.length})
                        </div>
                        {catNodes.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              onSelectDestination(n.id);
                              setIsDestDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                              n.id === destinationId
                                ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-800/50'
                                : 'text-slate-200'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-slate-100">{n.name}</div>
                              {n.zone && <div className="text-[10px] text-slate-500">{n.zone}</div>}
                            </div>
                            {n.id === destinationId && (
                              <Check className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={totalSteps <= 1 && isSearchComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
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

          <button
            type="button"
            onClick={onPrevStep}
            disabled={!canPrev}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              canPrev
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title="Step backward one algorithm event (reversible execution history)"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            type="button"
            onClick={onNextStep}
            disabled={!canNext}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              canNext
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-500/30 active:scale-95'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title="Advance one algorithm event"
          >
            <span className="hidden sm:inline">Next</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onJumpToEnd}
            disabled={isSearchComplete || totalSteps <= 1}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-50"
            title="Fast forward to final shortest route"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Finish</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700"
            title="Reset route search"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
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
      </div>

      {/* Step Scrubber */}
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

      {/* Lower Bar: City Network Editing Toolbar & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Jaipur Network Editor:</span>

          <button
            type="button"
            onClick={() => onEditModeChange('select')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              editMode === 'select'
                ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Drag locations to reposition or click map to set destination"
          >
            <Move className="w-3 h-3 text-slate-300" />
            <span>Move / Select</span>
          </button>

          <button
            type="button"
            onClick={() => onEditModeChange('add_edge')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              editMode === 'add_edge'
                ? 'bg-indigo-950 text-indigo-200 border-indigo-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click two locations sequentially to connect them with a road"
          >
            <Network className="w-3 h-3 text-indigo-400" />
            <span>Connect Road</span>
          </button>

          <button
            type="button"
            onClick={() => onEditModeChange('edit_weight')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              editMode === 'edit_weight'
                ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click any road badge to change its travel distance"
          >
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span>Edit Road Distance</span>
          </button>

          <button
            type="button"
            onClick={() => onEditModeChange('add_node')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              editMode === 'add_node'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click anywhere on the map to add a new custom landmark"
          >
            <PlusCircle className="w-3 h-3 text-emerald-400" />
            <span>Add Landmark</span>
          </button>

          <button
            type="button"
            onClick={() => onEditModeChange('delete')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              editMode === 'delete'
                ? 'bg-rose-950 text-rose-200 border-rose-600 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click any landmark or road to remove it"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Delete Element</span>
          </button>
        </div>

        {/* Presets Selector & Reset Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onLoadPreset(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-950 text-slate-300 px-2 py-1.5 rounded-lg border border-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="" disabled>
              Load Jaipur Route Tour...
            </option>
            <option value="default">Default: MUJ to Amber Fort (Full Network)</option>
            <option value="airport_to_amber">Airport to Amber Fort Express</option>
            <option value="pink_city_tour">Pink City Heritage &amp; Bazaars</option>
            <option value="bypass">South Highway &amp; Ring Bypass</option>
            <option value="unreachable">Simulated Disconnected Road (Unreachable Test)</option>
          </select>

          <button
            type="button"
            onClick={onResetNetwork}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Reset to default Jaipur network layout"
          >
            <RotateCw className="w-3 h-3 text-indigo-400" />
            <span>Reset Network</span>
          </button>
        </div>
      </div>
    </div>
  );
};
