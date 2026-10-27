import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CityNode, CityLocationCategory } from '../types/cityGraph';
import {
  MapPin,
  Flag,
  Search,
  Check,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface CityDestinationSelectorProps {
  nodes: CityNode[];
  startId: string;
  destinationId: string;
  onSelectStart: (id: string) => void;
  onSelectDestination: (id: string) => void;
  onLoadPreset: (presetId: string) => void;
}

const CATEGORY_LABELS: Record<CityLocationCategory, string> = {
  heritage: 'Heritage & Forts',
  museum: 'Museums & Culture',
  shopping: 'Shopping & Bazaars',
  park: 'Parks & Nature',
  temple: 'Temples',
  transit: 'Transport Hubs',
  junction: 'Junctions',
};

export const CityDestinationSelector: React.FC<CityDestinationSelectorProps> = ({
  nodes,
  startId,
  destinationId,
  onSelectStart,
  onSelectDestination,
  onLoadPreset,
}) => {
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const [isChangeStartOpen, setIsChangeStartOpen] = useState(false);
  const destDropdownRef = useRef<HTMLDivElement | null>(null);

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

  const filteredDestinations = useMemo(() => {
    return nodes.filter((n) => {
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
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
      {/* Pickers */}
      <div className="flex items-center gap-2 flex-wrap flex-1">
        {/* Start Location (Default MUJ) */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 relative">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-400 text-[11px] font-medium">Start:</span>
          <span className="text-emerald-300 font-bold max-w-[150px] sm:max-w-[190px] truncate" title={startNode?.name}>
            {startNode?.name || 'MUJ, Dehmi Kalan'}
          </span>
          <button
            type="button"
            onClick={() => setIsChangeStartOpen(!isChangeStartOpen)}
            className="text-[10px] text-slate-400 hover:text-indigo-300 underline ml-1 cursor-pointer"
          >
            Change
          </button>

          {isChangeStartOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 max-h-56 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1">
                Select Starting Location:
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
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between hover:bg-slate-800 ${
                      n.id === startId ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{n.name}</span>
                    {n.id === startId && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Searchable Destination Dropdown */}
        <div ref={destDropdownRef} className="relative flex-1 min-w-[220px]">
          <button
            type="button"
            onClick={() => setIsDestDropdownOpen(!isDestDropdownOpen)}
            className="w-full flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 text-xs transition-colors"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Flag className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span className="text-slate-400 text-[11px] font-medium">Destination:</span>
              <span className="text-rose-300 font-bold truncate">
                {destNode?.name || 'Amber Fort'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
          </button>

          {/* Search Dropdown Popup */}
          {isDestDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2.5 flex flex-col gap-2 max-h-[380px] overflow-hidden">
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

              {/* Grouped Landmark List */}
              <div className="flex-1 overflow-y-auto max-h-[250px] flex flex-col gap-2 pr-1">
                {Object.entries(groupedDestinations).length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs italic">
                    No landmarks matching &ldquo;{destSearchQuery}&rdquo;
                  </div>
                ) : (
                  Object.entries(groupedDestinations).map(([category, catNodes]) => (
                    <div key={category} className="flex flex-col gap-0.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-900/60 rounded">
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
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

      {/* Preset Tour Quick Selector */}
      <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-xs">
        <Compass className="w-3.5 h-3.5 text-indigo-400" />
        <select
          onChange={(e) => {
            if (e.target.value) {
              onLoadPreset(e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
          className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
        >
          <option value="" disabled>
            Quick Preset Tour...
          </option>
          <option value="default">Default: MUJ to Amber Fort</option>
          <option value="airport_to_amber">Airport to Amber Express</option>
          <option value="pink_city_tour">Pink City Heritage Tour</option>
          <option value="bypass">South Ring Bypass</option>
        </select>
      </div>
    </div>
  );
};
