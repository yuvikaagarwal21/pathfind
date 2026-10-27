/**
 * Jaipur Smart Route Navigator: A* vs Dijkstra
 * 
 * B.Tech CSE Algorithmic Implementation Practical
 * Department of Computer Science & Engineering, Manipal University Jaipur
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CityNode,
  CityEdge,
  AlgorithmType,
  VisualizerMode,
  GraphEditMode,
} from './types/cityGraph';
import {
  DEFAULT_CITY_NODES,
  DEFAULT_CITY_EDGES,
  generateCityGraphSnapshots,
  calculateEuclideanHeuristic,
  getVisibleCityGraph,
} from './algorithms/cityGraphEngine';

import { Header } from './components/Header';
import { CityDestinationSelector } from './components/CityDestinationSelector';
import { CityPlaybackToolbar } from './components/CityPlaybackToolbar';
import { CityMapSVG } from './components/CityMapSVG';
import { CityStepExplanation } from './components/CityStepExplanation';
import { CityScoreDetails } from './components/CityScoreDetails';
import { CityResultsPanel } from './components/CityResultsPanel';
import { CityPythonCodePanel } from './components/CityPythonCodePanel';
import { CityLegend } from './components/CityLegend';
import { Sliders, Sparkles, Navigation, Layers } from 'lucide-react';

export default function App() {
  // Algorithm Mode: astar | dijkstra | compare
  const [mode, setMode] = useState<VisualizerMode>('astar');

  // City Graph Network State
  const [nodes, setNodes] = useState<CityNode[]>(DEFAULT_CITY_NODES);
  const [edges, setEdges] = useState<CityEdge[]>(DEFAULT_CITY_EDGES);

  // Selected Start & Destination Locations (Default: MUJ to Amber Fort)
  const [startId, setStartId] = useState<string>('muj');
  const [destinationId, setDestinationId] = useState<string>('amber_fort');

  // Network Editing Tool Mode (default select/navigate)
  const [editMode, setEditMode] = useState<GraphEditMode>('select');

  // Playback & Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(120); // ms per step

  // Step indices
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [compareStepIndex, setCompareStepIndex] = useState<number>(0);
  const [selectedCompareTab, setSelectedCompareTab] = useState<AlgorithmType>('astar');

  const playTimerRef = useRef<number | null>(null);

  // Reset/Invalidate search when graph changes
  const invalidateSearch = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current !== null) {
      window.clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    setCurrentStepIndex(0);
    setCompareStepIndex(0);
  }, []);

  // Compute Search Snapshots for Single Mode
  const singleAlgoType: AlgorithmType = mode === 'compare' ? 'astar' : mode;

  const singleSearchData = useMemo(() => {
    return generateCityGraphSnapshots({
      algorithm: singleAlgoType,
      nodes,
      edges,
      startId,
      destinationId,
    });
  }, [singleAlgoType, nodes, edges, startId, destinationId]);

  // Compute Search Snapshots for Compare Mode
  const astarCompareData = useMemo(() => {
    return generateCityGraphSnapshots({
      algorithm: 'astar',
      nodes,
      edges,
      startId,
      destinationId,
    });
  }, [nodes, edges, startId, destinationId]);

  const dijkstraCompareData = useMemo(() => {
    return generateCityGraphSnapshots({
      algorithm: 'dijkstra',
      nodes,
      edges,
      startId,
      destinationId,
    });
  }, [nodes, edges, startId, destinationId]);

  const compareTotalSteps = useMemo(() => {
    return Math.max(astarCompareData.snapshots.length, dijkstraCompareData.snapshots.length);
  }, [astarCompareData, dijkstraCompareData]);

  // Mode Change
  const handleModeChange = (newMode: VisualizerMode) => {
    invalidateSearch();
    setMode(newMode);
  };

  // Node & Edge Editing Handlers
  const handleSelectStart = useCallback(
    (id: string) => {
      invalidateSearch();
      setStartId(id);
    },
    [invalidateSearch]
  );

  const handleSelectDestination = useCallback(
    (id: string) => {
      invalidateSearch();
      setDestinationId(id);
    },
    [invalidateSearch]
  );

  const handleUpdateNodePosition = useCallback(
    (id: string, x: number, y: number) => {
      invalidateSearch();
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, x, y } : n))
      );
    },
    [invalidateSearch]
  );

  const handleAddEdge = useCallback(
    (sourceId: string, targetId: string, weight: number) => {
      invalidateSearch();
      const exists = edges.some(
        (e) =>
          (e.source === sourceId && e.target === targetId) ||
          (e.source === targetId && e.target === sourceId)
      );
      if (exists) {
        setEdges((prev) =>
          prev.map((e) =>
            (e.source === sourceId && e.target === targetId) ||
            (e.source === targetId && e.target === sourceId)
              ? { ...e, weight }
              : e
          )
        );
      } else {
        const newEdge: CityEdge = {
          id: `edge_${Date.now()}`,
          source: sourceId,
          target: targetId,
          weight,
          label: 'Direct Connector',
        };
        setEdges((prev) => [...prev, newEdge]);
      }
    },
    [edges, invalidateSearch]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      if (nodes.length <= 2) return;
      invalidateSearch();
      const remainingNodes = nodes.filter((n) => n.id !== id);
      setNodes(remainingNodes);
      setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));

      if (startId === id) setStartId(remainingNodes[0].id);
      if (destinationId === id) setDestinationId(remainingNodes[remainingNodes.length - 1].id);
    },
    [nodes, startId, destinationId, invalidateSearch]
  );

  const handleDeleteEdge = useCallback(
    (id: string) => {
      invalidateSearch();
      setEdges((prev) => prev.filter((e) => e.id !== id));
    },
    [invalidateSearch]
  );

  const handleUpdateEdgeWeight = useCallback(
    (id: string, weight: number) => {
      invalidateSearch();
      setEdges((prev) =>
        prev.map((e) => (e.id === id ? { ...e, weight } : e))
      );
    },
    [invalidateSearch]
  );

  const handleAddNodeAtPosition = useCallback(
    (x: number, y: number) => {
      invalidateSearch();
      const newId = `loc_${Date.now()}`;
      const defaultCategories: CityNode['category'][] = [
        'shopping',
        'park',
        'transit',
        'heritage',
      ];
      const randomCategory =
        defaultCategories[Math.floor(Math.random() * defaultCategories.length)];
      const newNode: CityNode = {
        id: newId,
        name: `Jaipur Sector ${nodes.length + 1}`,
        x,
        y,
        category: randomCategory,
        iconName: 'Building2',
      };

      setNodes((prev) => [...prev, newNode]);

      if (nodes.length > 0) {
        let closestNode = nodes[0];
        let minDist = Infinity;
        nodes.forEach((n) => {
          const d = Math.hypot(n.x - x, n.y - y);
          if (d < minDist) {
            minDist = d;
            closestNode = n;
          }
        });
        const autoWeight = calculateEuclideanHeuristic(newNode, closestNode);
        handleAddEdge(closestNode.id, newId, autoWeight);
      }
    },
    [nodes, handleAddEdge, invalidateSearch]
  );

  const handleResetNetwork = useCallback(() => {
    invalidateSearch();
    setNodes(DEFAULT_CITY_NODES);
    setEdges(DEFAULT_CITY_EDGES);
    setStartId('muj');
    setDestinationId('amber_fort');
  }, [invalidateSearch]);

  const handleLoadPreset = useCallback(
    (presetId: string) => {
      invalidateSearch();
      if (presetId === 'default') {
        handleResetNetwork();
      } else if (presetId === 'airport_to_amber') {
        setNodes(DEFAULT_CITY_NODES);
        setEdges(DEFAULT_CITY_EDGES);
        setStartId('airport');
        setDestinationId('amber_fort');
      } else if (presetId === 'pink_city_tour') {
        setNodes(DEFAULT_CITY_NODES);
        setEdges(DEFAULT_CITY_EDGES);
        setStartId('jaipur_junction');
        setDestinationId('hawa_mahal');
      } else if (presetId === 'bypass') {
        setNodes(DEFAULT_CITY_NODES);
        setEdges(DEFAULT_CITY_EDGES);
        setStartId('muj');
        setDestinationId('airport');
      }
    },
    [handleResetNetwork, invalidateSearch]
  );

  // Derive Current Active Snapshots
  const currentTotalSteps =
    mode === 'compare' ? compareTotalSteps : singleSearchData.snapshots.length;

  const effectiveStepIndex = mode === 'compare' ? compareStepIndex : currentStepIndex;

  const safeSingleIndex = Math.min(
    currentStepIndex,
    Math.max(0, singleSearchData.snapshots.length - 1)
  );
  const activeSingleSnapshot = singleSearchData.snapshots[safeSingleIndex] || null;

  const safeAstarCompareIndex = Math.min(
    compareStepIndex,
    Math.max(0, astarCompareData.snapshots.length - 1)
  );
  const safeDijkstraCompareIndex = Math.min(
    compareStepIndex,
    Math.max(0, dijkstraCompareData.snapshots.length - 1)
  );

  const activeAstarCompareSnapshot = astarCompareData.snapshots[safeAstarCompareIndex] || null;
  const activeDijkstraCompareSnapshot = dijkstraCompareData.snapshots[safeDijkstraCompareIndex] || null;

  const activeCompareSnapshot =
    selectedCompareTab === 'astar' ? activeAstarCompareSnapshot : activeDijkstraCompareSnapshot;

  const isSearchComplete =
    mode === 'compare'
      ? compareStepIndex >= compareTotalSteps - 1
      : currentStepIndex >= singleSearchData.snapshots.length - 1;

  // Derive visible city graph (12-15 core nodes + start/dest + path) for clean display
  const singleVisibleGraph = useMemo(() => {
    return getVisibleCityGraph(
      startId,
      destinationId,
      activeSingleSnapshot?.pathNodeIds || [],
      nodes,
      edges
    );
  }, [startId, destinationId, activeSingleSnapshot?.pathNodeIds, nodes, edges]);

  const astarVisibleGraph = useMemo(() => {
    return getVisibleCityGraph(
      startId,
      destinationId,
      activeAstarCompareSnapshot?.pathNodeIds || [],
      nodes,
      edges
    );
  }, [startId, destinationId, activeAstarCompareSnapshot?.pathNodeIds, nodes, edges]);

  const dijkstraVisibleGraph = useMemo(() => {
    return getVisibleCityGraph(
      startId,
      destinationId,
      activeDijkstraCompareSnapshot?.pathNodeIds || [],
      nodes,
      edges
    );
  }, [startId, destinationId, activeDijkstraCompareSnapshot?.pathNodeIds, nodes, edges]);

  // Step Navigation Handlers
  const handleNextStep = useCallback(() => {
    if (mode === 'compare') {
      setCompareStepIndex((prev) => Math.min(prev + 1, compareTotalSteps - 1));
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, singleSearchData.snapshots.length - 1));
    }
  }, [mode, compareTotalSteps, singleSearchData.snapshots.length]);

  const handlePrevStep = useCallback(() => {
    if (mode === 'compare') {
      setCompareStepIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }
  }, [mode]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current !== null) {
      window.clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    if (mode === 'compare') {
      setCompareStepIndex(0);
    } else {
      setCurrentStepIndex(0);
    }
  }, [mode]);

  const handleJumpToStep = useCallback(
    (step: number) => {
      if (mode === 'compare') {
        setCompareStepIndex(Math.max(0, Math.min(step, compareTotalSteps - 1)));
      } else {
        setCurrentStepIndex(Math.max(0, Math.min(step, singleSearchData.snapshots.length - 1)));
      }
    },
    [mode, compareTotalSteps, singleSearchData.snapshots.length]
  );

  const handleJumpToEnd = useCallback(() => {
    setIsPlaying(false);
    if (mode === 'compare') {
      setCompareStepIndex(compareTotalSteps - 1);
    } else {
      setCurrentStepIndex(singleSearchData.snapshots.length - 1);
    }
  }, [mode, compareTotalSteps, singleSearchData.snapshots.length]);

  const handleTogglePlay = useCallback(() => {
    if (isSearchComplete) {
      if (mode === 'compare') {
        setCompareStepIndex(0);
      } else {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [isSearchComplete, mode]);

  // Animation Timer
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current !== null) {
        window.clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }

    playTimerRef.current = window.setInterval(() => {
      if (mode === 'compare') {
        setCompareStepIndex((prev) => {
          if (prev >= compareTotalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      } else {
        setCurrentStepIndex((prev) => {
          if (prev >= singleSearchData.snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }
    }, speed);

    return () => {
      if (playTimerRef.current !== null) {
        window.clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, speed, mode, compareTotalSteps, singleSearchData.snapshots.length]);

  // Active Location Node Resolution for Details Panel
  const nodeMap = useMemo(() => {
    const map = new Map<string, CityNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const currentActiveNodeId =
    mode === 'compare'
      ? activeCompareSnapshot?.activeNodeId
      : activeSingleSnapshot?.activeNodeId;

  const currentActiveNode = currentActiveNodeId ? nodeMap.get(currentActiveNodeId) || null : null;
  const destinationNode = nodeMap.get(destinationId) || null;

  const currentGScore = currentActiveNodeId
    ? (mode === 'compare'
        ? activeCompareSnapshot?.gScores[currentActiveNodeId]
        : activeSingleSnapshot?.gScores[currentActiveNodeId]) ?? null
    : null;

  const currentHScore = currentActiveNodeId
    ? (mode === 'compare'
        ? activeCompareSnapshot?.hScores[currentActiveNodeId]
        : activeSingleSnapshot?.hScores[currentActiveNodeId]) ?? null
    : null;

  const currentFScore = currentActiveNodeId
    ? (mode === 'compare'
        ? activeCompareSnapshot?.fScores[currentActiveNodeId]
        : activeSingleSnapshot?.fScores[currentActiveNodeId]) ?? null
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Header with Mode Switcher */}
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        isModifiedDuringSearch={false}
      />

      {/* Main City Graph Visualizer Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Academic Course Banner */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold">
              B.Tech CSE Algorithmic Implementation &bull; Manipal University Jaipur
            </span>
            <span className="text-slate-500 hidden sm:inline">&bull; Clean City Graph Model</span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono">
            Default: Manipal Univ (MUJ) &rarr; Amber Fort
          </span>
        </div>

        {/* 2-Column Desktop Layout (Map on Left, Side Panel on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Map & Destination Selector (~65% width on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3.5">
            {/* Clean Destination & Start Selector */}
            <CityDestinationSelector
              nodes={nodes}
              startId={startId}
              destinationId={destinationId}
              onSelectStart={handleSelectStart}
              onSelectDestination={handleSelectDestination}
              onLoadPreset={handleLoadPreset}
            />

            {/* City Map Canvas */}
            {mode === 'compare' ? (
              <div className="flex flex-col gap-3">
                {/* Compare sync helper banner */}
                <div className="px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      <strong>Compare Mode:</strong> Synchronized navigation on identical roads.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
                    <span className="text-[11px] text-slate-400">Side Panel Details:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCompareTab('astar')}
                      className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                        selectedCompareTab === 'astar'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      A*
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCompareTab('dijkstra')}
                      className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                        selectedCompareTab === 'dijkstra'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Dijkstra
                    </button>
                  </div>
                </div>

                {/* Side-by-side or stacked city maps */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {/* Left Map: A* Search */}
                  <CityMapSVG
                    nodes={astarVisibleGraph.visibleNodes}
                    edges={astarVisibleGraph.visibleEdges}
                    startId={startId}
                    destinationId={destinationId}
                    activeNodeId={activeAstarCompareSnapshot?.activeNodeId || null}
                    inspectingNodeId={activeAstarCompareSnapshot?.inspectingNodeId || null}
                    inspectingEdgeId={activeAstarCompareSnapshot?.inspectingEdgeId || null}
                    frontierNodeIds={activeAstarCompareSnapshot?.frontierNodeIds || []}
                    exploredNodeIds={activeAstarCompareSnapshot?.exploredNodeIds || []}
                    pathNodeIds={activeAstarCompareSnapshot?.pathNodeIds || []}
                    pathEdgeIds={activeAstarCompareSnapshot?.pathEdgeIds || []}
                    gScores={activeAstarCompareSnapshot?.gScores || {}}
                    hScores={activeAstarCompareSnapshot?.hScores || {}}
                    fScores={activeAstarCompareSnapshot?.fScores || {}}
                    algorithmType="astar"
                    editMode={editMode}
                    onSelectStart={handleSelectStart}
                    onSelectDestination={handleSelectDestination}
                    onUpdateNodePosition={handleUpdateNodePosition}
                    onAddEdge={handleAddEdge}
                    onDeleteNode={handleDeleteNode}
                    onDeleteEdge={handleDeleteEdge}
                    onUpdateEdgeWeight={handleUpdateEdgeWeight}
                    onAddNodeAtPosition={handleAddNodeAtPosition}
                    label="1. A* Search (Informed Euclidean Heuristic)"
                    activeSearchStep={effectiveStepIndex}
                  />

                  {/* Right Map: Dijkstra's Algorithm */}
                  <CityMapSVG
                    nodes={dijkstraVisibleGraph.visibleNodes}
                    edges={dijkstraVisibleGraph.visibleEdges}
                    startId={startId}
                    destinationId={destinationId}
                    activeNodeId={activeDijkstraCompareSnapshot?.activeNodeId || null}
                    inspectingNodeId={activeDijkstraCompareSnapshot?.inspectingNodeId || null}
                    inspectingEdgeId={activeDijkstraCompareSnapshot?.inspectingEdgeId || null}
                    frontierNodeIds={activeDijkstraCompareSnapshot?.frontierNodeIds || []}
                    exploredNodeIds={activeDijkstraCompareSnapshot?.exploredNodeIds || []}
                    pathNodeIds={activeDijkstraCompareSnapshot?.pathNodeIds || []}
                    pathEdgeIds={activeDijkstraCompareSnapshot?.pathEdgeIds || []}
                    gScores={activeDijkstraCompareSnapshot?.gScores || {}}
                    hScores={activeDijkstraCompareSnapshot?.hScores || {}}
                    fScores={activeDijkstraCompareSnapshot?.fScores || {}}
                    algorithmType="dijkstra"
                    editMode={editMode}
                    onSelectStart={handleSelectStart}
                    onSelectDestination={handleSelectDestination}
                    onUpdateNodePosition={handleUpdateNodePosition}
                    onAddEdge={handleAddEdge}
                    onDeleteNode={handleDeleteNode}
                    onDeleteEdge={handleDeleteEdge}
                    onUpdateEdgeWeight={handleUpdateEdgeWeight}
                    onAddNodeAtPosition={handleAddNodeAtPosition}
                    label="2. Dijkstra's Algorithm (Distance Priority)"
                    activeSearchStep={effectiveStepIndex}
                  />
                </div>
              </div>
            ) : (
              /* Single Clean City Map */
              <CityMapSVG
                nodes={singleVisibleGraph.visibleNodes}
                edges={singleVisibleGraph.visibleEdges}
                startId={startId}
                destinationId={destinationId}
                activeNodeId={activeSingleSnapshot?.activeNodeId || null}
                inspectingNodeId={activeSingleSnapshot?.inspectingNodeId || null}
                inspectingEdgeId={activeSingleSnapshot?.inspectingEdgeId || null}
                frontierNodeIds={activeSingleSnapshot?.frontierNodeIds || []}
                exploredNodeIds={activeSingleSnapshot?.exploredNodeIds || []}
                pathNodeIds={activeSingleSnapshot?.pathNodeIds || []}
                pathEdgeIds={activeSingleSnapshot?.pathEdgeIds || []}
                gScores={activeSingleSnapshot?.gScores || {}}
                hScores={activeSingleSnapshot?.hScores || {}}
                fScores={activeSingleSnapshot?.fScores || {}}
                algorithmType={mode}
                editMode={editMode}
                onSelectStart={handleSelectStart}
                onSelectDestination={handleSelectDestination}
                onUpdateNodePosition={handleUpdateNodePosition}
                onAddEdge={handleAddEdge}
                onDeleteNode={handleDeleteNode}
                onDeleteEdge={handleDeleteEdge}
                onUpdateEdgeWeight={handleUpdateEdgeWeight}
                onAddNodeAtPosition={handleAddNodeAtPosition}
                label={
                  mode === 'astar'
                    ? "Jaipur Map: A* Search (Informed Euclidean Heuristic)"
                    : "Jaipur Map: Dijkstra's Algorithm (Distance Priority)"
                }
                activeSearchStep={effectiveStepIndex}
              />
            )}

            {/* City Legend */}
            <CityLegend />
          </div>

          {/* RIGHT COLUMN: Side Panel on Desktop (~35% width), Stacked Below on Mobile */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3.5">
            {/* 1. Compact Execution Controls Toolbar */}
            <CityPlaybackToolbar
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onReset={handleReset}
              onJumpToEnd={handleJumpToEnd}
              currentStepIndex={effectiveStepIndex}
              totalSteps={currentTotalSteps}
              speed={speed}
              onSpeedChange={setSpeed}
              onJumpToStep={handleJumpToStep}
              isSearchComplete={isSearchComplete}
              canPrev={effectiveStepIndex > 0}
              canNext={effectiveStepIndex < currentTotalSteps - 1}
            />

            {/* 2. Step-by-Step Live Explanation (One short, beginner-friendly explanation) */}
            {(mode === 'compare' ? activeCompareSnapshot : activeSingleSnapshot) && (
              <CityStepExplanation
                algorithm={mode === 'compare' ? selectedCompareTab : mode}
                event={
                  (mode === 'compare'
                    ? activeCompareSnapshot?.event
                    : activeSingleSnapshot?.event) || {
                    stepNumber: 0,
                    type: 'start',
                    heading: 'Ready to Navigate',
                    explanation: 'Select any landmark or click Run Search to start.',
                    whatNext: 'Press Run Search or Next Step.',
                  }
                }
                stepIndex={effectiveStepIndex}
                totalSteps={currentTotalSteps}
              />
            )}

            {/* 3. Mathematical Evaluation Breakdown: g(n), h(n), f(n) */}
            <CityScoreDetails
              algorithm={mode === 'compare' ? selectedCompareTab : mode}
              activeNode={currentActiveNode}
              destinationNode={destinationNode}
              gScore={currentGScore}
              hScore={currentHScore}
              fScore={currentFScore}
            />

            {/* 4. Results Panel: Total Distance & Nodes Explored */}
            <CityResultsPanel
              mode={mode}
              astarResult={astarCompareData.result}
              dijkstraResult={dijkstraCompareData.result}
              currentResult={singleSearchData.result}
            />
          </div>
        </div>

        {/* Collapsible Python Code Panel for Practical Exam Reference */}
        <div className="mt-2">
          <CityPythonCodePanel
            initialAlgorithm={mode === 'dijkstra' ? 'dijkstra' : 'astar'}
          />
        </div>
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            B.Tech CSE Practical &bull; Department of Computer Science &amp; Engineering &bull; Manipal University Jaipur
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            Stylized Graph City Navigation &bull; Admissible Euclidean Distance Heuristic
          </span>
        </div>
      </footer>
    </div>
  );
}
