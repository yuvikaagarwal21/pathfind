import React, { useState } from 'react';
import { ASTAR_CITY_PYTHON_CODE, DIJKSTRA_CITY_PYTHON_CODE } from '../data/cityPythonCode';
import { Code2, Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { AlgorithmType } from '../types/cityGraph';

interface CityPythonCodePanelProps {
  initialAlgorithm?: AlgorithmType;
}

export const CityPythonCodePanel: React.FC<CityPythonCodePanelProps> = ({
  initialAlgorithm = 'astar',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>(initialAlgorithm);
  const [copied, setCopied] = useState(false);

  const activeCode =
    selectedAlgo === 'astar' ? ASTAR_CITY_PYTHON_CODE : DIJKSTRA_CITY_PYTHON_CODE;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              Python City Graph Implementation (CSE Practical Reference)
            </span>
            <span className="text-[11px] text-slate-400">
              Runnable Python 3 code operating on city road adjacency dictionaries
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>{isOpen ? 'Collapse Code' : 'View Python Code'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-950 p-3 sm:p-4 flex flex-col gap-3">
          {/* Sub-selector and Copy Button */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAlgo('astar')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedAlgo === 'astar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. City Graph A* (Python)
              </button>
              <button
                type="button"
                onClick={() => setSelectedAlgo('dijkstra')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedAlgo === 'dijkstra'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. City Graph Dijkstra (Python)
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Python Script</span>
                </>
              )}
            </button>
          </div>

          {/* Code block */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-slate-500" />
                <span>
                  {selectedAlgo === 'astar'
                    ? 'astar_city_navigation.py'
                    : 'dijkstra_city_navigation.py'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Python 3.10+ (heapq &amp; math)</span>
            </div>
            <pre className="p-3 sm:p-4 text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed scrollbar-thin">
              <code>{activeCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
