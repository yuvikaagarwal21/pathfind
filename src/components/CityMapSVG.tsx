import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  CityNode,
  CityEdge,
  AlgorithmType,
  GraphEditMode,
  CityLocationCategory,
} from '../types/cityGraph';
import {
  MAP_VIEWBOX_WIDTH,
  MAP_VIEWBOX_HEIGHT,
  calculateEuclideanHeuristic,
} from '../algorithms/cityGraphEngine';
import {
  GraduationCap,
  Train,
  Bus,
  Compass,
  Plane,
  Crown,
  Shield,
  Castle,
  Waves,
  Landmark,
  Trees,
  Gem,
  Palette,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Store,
  Film,
  Building2,
  Church,
  Waypoints,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Car,
} from 'lucide-react';

interface CityMapSVGProps {
  nodes: CityNode[];
  edges: CityEdge[];
  startId: string;
  destinationId: string;
  activeNodeId: string | null;
  inspectingNodeId: string | null;
  inspectingEdgeId: string | null;
  frontierNodeIds: string[];
  exploredNodeIds: string[];
  pathNodeIds: string[];
  pathEdgeIds: string[];
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  algorithmType: AlgorithmType;
  editMode: GraphEditMode;
  onSelectStart: (id: string) => void;
  onSelectDestination: (id: string) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onAddEdge: (sourceId: string, targetId: string, weight: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateEdgeWeight: (id: string, weight: number) => void;
  onAddNodeAtPosition: (x: number, y: number) => void;
  isReadOnly?: boolean;
  label?: string;
  activeSearchStep?: number;
}

export const CityMapSVG: React.FC<CityMapSVGProps> = ({
  nodes,
  edges,
  startId,
  destinationId,
  activeNodeId,
  inspectingNodeId,
  inspectingEdgeId,
  frontierNodeIds,
  exploredNodeIds,
  pathNodeIds,
  pathEdgeIds,
  gScores,
  hScores,
  fScores,
  algorithmType,
  editMode,
  onSelectStart,
  onSelectDestination,
  onUpdateNodePosition,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge,
  onUpdateEdgeWeight,
  onAddNodeAtPosition,
  isReadOnly = false,
  label,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Pan and Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPanPos, setStartPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging node
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Edge creation state
  const [edgeSourceNodeId, setEdgeSourceNodeId] = useState<string | null>(null);

  // Hover states
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Node Map
  const nodeMap = useMemo(() => {
    const map = new Map<string, CityNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const frontierSet = useMemo(() => new Set(frontierNodeIds), [frontierNodeIds]);
  const exploredSet = useMemo(() => new Set(exploredNodeIds), [exploredNodeIds]);
  const pathNodeSet = useMemo(() => new Set(pathNodeIds), [pathNodeIds]);
  const pathEdgeSet = useMemo(() => new Set(pathEdgeIds), [pathEdgeIds]);

  // Transform coordinates
  const getSVGCoordinates = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const normX = (clientX - rect.left) / rect.width;
      const normY = (clientY - rect.top) / rect.height;

      const rawX = normX * MAP_VIEWBOX_WIDTH;
      const rawY = normY * MAP_VIEWBOX_HEIGHT;

      const centeredX = rawX - MAP_VIEWBOX_WIDTH / 2;
      const centeredY = rawY - MAP_VIEWBOX_HEIGHT / 2;

      const unscaledX = (centeredX - pan.x) / zoom + MAP_VIEWBOX_WIDTH / 2;
      const unscaledY = (centeredY - pan.y) / zoom + MAP_VIEWBOX_HEIGHT / 2;

      return {
        x: Math.round(unscaledX),
        y: Math.round(unscaledY),
      };
    },
    [zoom, pan]
  );

  const handleZoomIn = () => setZoom((prev) => Math.min(2.2, prev + 0.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.7, prev - 0.2));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (isReadOnly) return;

    if (editMode === 'delete') {
      onDeleteNode(nodeId);
      return;
    }

    if (editMode === 'add_edge') {
      if (!edgeSourceNodeId) {
        setEdgeSourceNodeId(nodeId);
      } else if (edgeSourceNodeId !== nodeId) {
        const sourceNode = nodeMap.get(edgeSourceNodeId);
        const targetNode = nodeMap.get(nodeId);
        const defaultWeight =
          sourceNode && targetNode ? calculateEuclideanHeuristic(sourceNode, targetNode) : 5;
        const userWeightStr = window.prompt(
          `Road distance (km) between ${sourceNode?.name} & ${targetNode?.name}:`,
          defaultWeight.toString()
        );
        const weight = Math.max(1, parseInt(userWeightStr || `${defaultWeight}`, 10) || defaultWeight);
        onAddEdge(edgeSourceNodeId, nodeId, weight);
        setEdgeSourceNodeId(null);
      }
      return;
    }

    const coords = getSVGCoordinates(e.clientX, e.clientY);
    const node = nodeMap.get(nodeId);
    if (coords && node) {
      setDraggingNodeId(nodeId);
      setDragOffset({ x: coords.x - node.x, y: coords.y - node.y });
    }
  };

  const handleMouseDownOnCanvas = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingNodeId) {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNodeId && !isReadOnly) {
        const coords = getSVGCoordinates(e.clientX, e.clientY);
        if (coords) {
          const clampedX = Math.max(25, Math.min(MAP_VIEWBOX_WIDTH - 25, coords.x - dragOffset.x));
          const clampedY = Math.max(25, Math.min(MAP_VIEWBOX_HEIGHT - 25, coords.y - dragOffset.y));
          onUpdateNodePosition(draggingNodeId, clampedX, clampedY);
        }
      } else if (isPanning) {
        setPan({
          x: e.clientX - startPanPos.x,
          y: e.clientY - startPanPos.y,
        });
      }
    },
    [draggingNodeId, isReadOnly, isPanning, getSVGCoordinates, dragOffset, startPanPos, onUpdateNodePosition]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNodeId(null);
    setIsPanning(false);
  }, []);

  const handleMapClick = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    if (editMode === 'add_node') {
      const coords = getSVGCoordinates(e.clientX, e.clientY);
      if (coords) {
        onAddNodeAtPosition(coords.x, coords.y);
      }
    } else if (editMode === 'add_edge' && edgeSourceNodeId) {
      setEdgeSourceNodeId(null);
    }
  };

  const renderNodeIcon = (iconName: string) => {
    const props = { className: 'w-3 h-3 text-white' };
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap {...props} />;
      case 'Train':
        return <Train {...props} />;
      case 'Bus':
        return <Bus {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Plane':
        return <Plane {...props} />;
      case 'Crown':
        return <Crown {...props} />;
      case 'Shield':
        return <Shield {...props} />;
      case 'Castle':
        return <Castle {...props} />;
      case 'Waves':
        return <Waves {...props} />;
      case 'Landmark':
        return <Landmark {...props} />;
      case 'Trees':
        return <Trees {...props} />;
      case 'Gem':
        return <Gem {...props} />;
      case 'Palette':
        return <Palette {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'ShoppingBag':
        return <ShoppingBag {...props} />;
      case 'Store':
        return <Store {...props} />;
      case 'Film':
        return <Film {...props} />;
      case 'Building2':
        return <Building2 {...props} />;
      case 'Church':
        return <Church {...props} />;
      default:
        return <Waypoints {...props} />;
    }
  };

  const getCategoryColor = (category: CityLocationCategory) => {
    switch (category) {
      case 'heritage':
        return '#d97706'; // Warm Amber/Sandstone
      case 'museum':
        return '#7c3aed'; // Deep Violet
      case 'shopping':
        return '#059669'; // Emerald
      case 'park':
        return '#65a30d'; // Olive Lime
      case 'temple':
        return '#ea580c'; // Terracotta Saffron
      case 'transit':
        return '#0284c7'; // Clear Sky Blue
      case 'junction':
        return '#475569'; // Muted Slate
      default:
        return '#475569';
    }
  };

  // Smooth Vehicle Positioning on Path
  const vehiclePosition = useMemo(() => {
    if (pathNodeIds.length === 0) return null;
    const currentIndex = pathNodeIds.length - 1;
    const targetNode = nodeMap.get(pathNodeIds[currentIndex]);
    if (!targetNode) return null;

    let angle = 0;
    if (currentIndex > 0) {
      const prevNode = nodeMap.get(pathNodeIds[currentIndex - 1]);
      if (prevNode) {
        angle = (Math.atan2(targetNode.y - prevNode.y, targetNode.x - prevNode.x) * 180) / Math.PI;
      }
    }

    return { x: targetNode.x, y: targetNode.y, angle };
  }, [pathNodeIds, nodeMap]);

  const hasActivePath = pathEdgeIds.length > 0;
  const hoveredNode = hoveredNodeId ? nodeMap.get(hoveredNodeId) : null;
  const hoveredEdge = hoveredEdgeId ? edges.find((e) => e.id === hoveredEdgeId) : null;

  return (
    <div
      className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Bar with Map Label & Zoom Controls */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {label && (
            <span className="font-semibold text-slate-200 tracking-wide flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  algorithmType === 'astar' ? 'bg-indigo-400' : 'bg-cyan-400'
                }`}
              />
              {label}
            </span>
          )}
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            ({nodes.length} Locations &bull; {edges.length} Corridors)
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1 select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-0.5"
            title="Fit / Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div
        className="relative w-full overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDownOnCanvas}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`}
          className="w-full h-auto max-h-[580px] touch-none"
          onClick={handleMapClick}
        >
          {/* Pan & Zoom Transform Container */}
          <g
            transform={`translate(${MAP_VIEWBOX_WIDTH / 2 + pan.x}, ${
              MAP_VIEWBOX_HEIGHT / 2 + pan.y
            }) scale(${zoom}) translate(${-MAP_VIEWBOX_WIDTH / 2}, ${-MAP_VIEWBOX_HEIGHT / 2})`}
          >
            {/* Subtle Regional Landmarks */}
            {/* Man Sagar Lake (Around Jal Mahal) */}
            <ellipse
              cx="670"
              cy="175"
              rx="60"
              ry="32"
              fill="rgba(14, 165, 233, 0.08)"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1"
            />
            <text x="670" y="185" textAnchor="middle" fill="rgba(56, 189, 248, 0.35)" fontSize="9" fontStyle="italic">
              Man Sagar Lake
            </text>

            {/* Pink City Walled Enclosure */}
            <rect
              x="500"
              y="225"
              width="170"
              height="115"
              rx="8"
              fill="rgba(244, 63, 94, 0.03)"
              stroke="rgba(244, 63, 94, 0.2)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text x="506" y="238" fill="rgba(244, 63, 94, 0.4)" fontSize="8.5" fontWeight="600">
              Pink City
            </text>

            {/* Ajmer Expressway NH-48 Corridor Marker */}
            <text x="95" y="525" fill="rgba(148, 163, 184, 0.3)" fontSize="9" fontStyle="italic">
              NH-48 Ajmer Rd &rarr;
            </text>

            {/* EDGES (ROADS) */}
            {edges.map((edge) => {
              const source = nodeMap.get(edge.source);
              const target = nodeMap.get(edge.target);
              if (!source || !target) return null;

              const isPathEdge = pathEdgeSet.has(edge.id);
              const isInspectingEdge = inspectingEdgeId === edge.id;
              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2;

              // Calm road styling with dimming for unrelated roads
              let roadStroke = '#334155';
              let strokeWidth = 3;
              let opacity = hasActivePath && !isPathEdge ? 0.35 : 0.85;

              if (isPathEdge) {
                roadStroke = '#f59e0b'; // Warm Amber Gold
                strokeWidth = 5;
                opacity = 1;
              } else if (isInspectingEdge) {
                roadStroke = '#06b6d4'; // Cyan
                strokeWidth = 4.5;
                opacity = 1;
              }

              return (
                <g
                  key={edge.id}
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editMode === 'delete') {
                      onDeleteEdge(edge.id);
                    } else if (editMode === 'edit_weight') {
                      const newWStr = window.prompt(
                        `Road distance (km):`,
                        `${edge.weight}`
                      );
                      if (newWStr) {
                        const newW = parseInt(newWStr, 10);
                        if (!isNaN(newW) && newW > 0) {
                          onUpdateEdgeWeight(edge.id, newW);
                        }
                      }
                    }
                  }}
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity }}
                >
                  {/* Road Line */}
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={roadStroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />

                  {/* Distance Pill Badge */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-14"
                      y="-7"
                      width="28"
                      height="14"
                      rx="3"
                      fill={isPathEdge ? '#b45309' : '#0f172a'}
                      stroke={isPathEdge ? '#f59e0b' : '#334155'}
                      strokeWidth={1}
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={isPathEdge ? '#ffffff' : '#94a3b8'}
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {edge.weight}k
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Pending road creation preview */}
            {edgeSourceNodeId && (
              (() => {
                const src = nodeMap.get(edgeSourceNodeId);
                if (!src) return null;
                return (
                  <circle
                    cx={src.x}
                    cy={src.y}
                    r={24}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-spin"
                  />
                );
              })()
            )}

            {/* NODES (JAIPUR LOCATIONS) */}
            {nodes.map((node) => {
              const isStart = node.id === startId;
              const isDestination = node.id === destinationId;
              const isActive = node.id === activeNodeId;
              const isInspecting = node.id === inspectingNodeId;
              const inFrontier = frontierSet.has(node.id);
              const inExplored = exploredSet.has(node.id);
              const inPath = pathNodeSet.has(node.id);

              const categoryColor = getCategoryColor(node.category);
              const isJunction = node.category === 'junction';
              const pinRadius = isJunction ? 10 : isStart || isDestination ? 18 : 15;

              // Node outline ring
              let ringColor = '#334155';
              let ringWidth = 1.5;

              if (isStart) {
                ringColor = '#10b981'; // Emerald
                ringWidth = 3;
              } else if (isDestination) {
                ringColor = '#f43f5e'; // Rose / Terracotta
                ringWidth = 3;
              } else if (inPath) {
                ringColor = '#f59e0b'; // Gold
                ringWidth = 2.5;
              } else if (isActive) {
                ringColor = '#fbbf24'; // Yellow
                ringWidth = 2.5;
              } else if (isInspecting) {
                ringColor = '#06b6d4'; // Cyan
                ringWidth = 2;
              } else if (inFrontier) {
                ringColor = '#0284c7'; // Blue
                ringWidth = 2;
              } else if (inExplored) {
                ringColor = '#6366f1'; // Indigo
                ringWidth = 1.5;
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editMode === 'select') {
                      if (node.id !== startId && node.id !== destinationId) {
                        onSelectDestination(node.id);
                      } else if (node.id === destinationId && node.id !== startId) {
                        onSelectStart(node.id);
                      }
                    }
                  }}
                  className="cursor-pointer group"
                >
                  {/* Subtle Pulse for Active or Path */}
                  {(isActive || inPath) && (
                    <circle
                      cx="0"
                      cy="0"
                      r={pinRadius + 5}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="1.5"
                      strokeDasharray={isActive ? '3 3' : 'none'}
                      opacity="0.5"
                    />
                  )}

                  {/* Pin Base Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={pinRadius}
                    fill="#0f172a"
                    stroke={ringColor}
                    strokeWidth={ringWidth}
                    className="transition-transform group-hover:scale-105"
                  />

                  {/* Inner Category Disc */}
                  <circle
                    cx="0"
                    cy="0"
                    r={pinRadius - 4}
                    fill={categoryColor}
                    fillOpacity="0.9"
                  />

                  {/* Icon */}
                  {!isJunction && (
                    <foreignObject x="-6" y="-6" width="12" height="12">
                      <div className="flex items-center justify-center w-full h-full pointer-events-none scale-75">
                        {renderNodeIcon(node.iconName)}
                      </div>
                    </foreignObject>
                  )}

                  {/* START / DESTINATION Role Pill */}
                  {isStart ? (
                    <g transform="translate(0, -25)">
                      <rect
                        x="-24"
                        y="-7"
                        width="48"
                        height="14"
                        rx="7"
                        fill="#065f46"
                        stroke="#10b981"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#a7f3d0"
                        fontSize="8"
                        fontWeight="700"
                        letterSpacing="0.5"
                      >
                        START
                      </text>
                    </g>
                  ) : isDestination ? (
                    <g transform="translate(0, -25)">
                      <rect
                        x="-30"
                        y="-7"
                        width="60"
                        height="14"
                        rx="7"
                        fill="#881337"
                        stroke="#f43f5e"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#fecdd3"
                        fontSize="7.5"
                        fontWeight="700"
                        letterSpacing="0.5"
                      >
                        DESTINATION
                      </text>
                    </g>
                  ) : null}

                  {/* Clear Node Label Pill (ZERO OVERLAP) */}
                  <g transform={`translate(0, ${pinRadius + 6})`}>
                    <rect
                      x={-(node.name.length * 3.1 + 7)}
                      y="-6"
                      width={node.name.length * 6.2 + 14}
                      height="15"
                      rx="3"
                      fill="rgba(15, 23, 42, 0.92)"
                      stroke={
                        isStart
                          ? '#10b981'
                          : isDestination
                          ? '#f43f5e'
                          : inPath
                          ? '#f59e0b'
                          : 'rgba(51, 65, 85, 0.7)'
                      }
                      strokeWidth={isStart || isDestination || inPath ? 1.2 : 0.8}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={
                        isStart
                          ? '#a7f3d0'
                          : isDestination
                          ? '#fecdd3'
                          : inPath
                          ? '#fef08a'
                          : '#e2e8f0'
                      }
                      fontSize="8.5"
                      fontWeight={isStart || isDestination || inPath ? '700' : '500'}
                      fontFamily="sans-serif"
                    >
                      {node.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Smooth Animated Vehicle (Taxi / Cab) */}
            {vehiclePosition && (
              <g
                transform={`translate(${vehiclePosition.x}, ${vehiclePosition.y}) rotate(${vehiclePosition.angle})`}
                className="pointer-events-none transition-all duration-300"
              >
                <ellipse cx="0" cy="0" rx="14" ry="8" fill="rgba(0, 0, 0, 0.5)" />
                {/* Headlight cone */}
                <path d="M 10,-3 L 26,-10 L 26,10 L 10,3 Z" fill="rgba(254, 240, 138, 0.2)" />
                {/* Cab body */}
                <rect x="-11" y="-7" width="22" height="14" rx="3.5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
                <foreignObject x="-6" y="-6" width="12" height="12">
                  <div className="flex items-center justify-center w-full h-full text-slate-950 font-bold scale-75">
                    <Car className="w-3.5 h-3.5 fill-current" />
                  </div>
                </foreignObject>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Subtle Hover Info Footer */}
      <div className="px-3.5 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 min-h-[34px] flex-wrap gap-2">
        {hoveredNode ? (
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(hoveredNode.category) }}
              />
              {hoveredNode.name}
            </span>
            <span className="font-mono text-slate-300 text-[11px]">
              Distance g(n):{' '}
              <strong className="text-indigo-400">
                {gScores[hoveredNode.id] !== undefined ? `${gScores[hoveredNode.id]} km` : 'Unreached'}
              </strong>
            </span>
            {algorithmType === 'astar' && hScores[hoveredNode.id] !== undefined && (
              <span className="font-mono text-slate-300 text-[11px]">
                Heuristic h(n):{' '}
                <strong className="text-cyan-400">{hScores[hoveredNode.id]} km</strong>
              </span>
            )}
            {algorithmType === 'astar' && fScores[hoveredNode.id] !== undefined && (
              <span className="font-mono text-slate-300 text-[11px]">
                Total f(n): <strong className="text-amber-400">{fScores[hoveredNode.id]} km</strong>
              </span>
            )}
          </div>
        ) : hoveredEdge ? (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-medium text-slate-300">{hoveredEdge.label || 'Road'}</span>
            <span className="font-mono text-indigo-400 font-bold">{hoveredEdge.weight} km</span>
            <span className="text-slate-500">
              ({nodeMap.get(hoveredEdge.source)?.name} &harr; {nodeMap.get(hoveredEdge.target)?.name})
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px] italic">
            Click any location to set as destination. Drag to pan, or use + / - to zoom.
          </span>
        )}
      </div>
    </div>
  );
};
