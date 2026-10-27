/**
 * City Graph Navigation Visualizer: Jaipur Smart Route Navigator
 * Types and interfaces for the interactive Jaipur city graph map.
 */

export type CityLocationCategory =
  | 'heritage'
  | 'museum'
  | 'shopping'
  | 'park'
  | 'temple'
  | 'transit'
  | 'junction';

export interface CityNode {
  id: string;
  name: string;
  x: number; // SVG coordinates
  y: number; // SVG coordinates
  category: CityLocationCategory;
  iconName: string;
  zone?: string; // e.g. "Amer & Hills", "Pink City (Walled City)", "South Jaipur / Airport", "West / Ajmer Road"
  description?: string;
  isCore?: boolean; // When true, rendered on the clean default city map
}

export interface CityEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  weight: number; // positive travel cost / distance in km
  label?: string; // road / expressway name
}

export type AlgorithmType = 'astar' | 'dijkstra';
export type VisualizerMode = 'astar' | 'dijkstra' | 'compare';
export type GraphEditMode = 'select' | 'add_node' | 'add_edge' | 'delete' | 'edit_weight';
export type SearchStatus = 'idle' | 'running' | 'paused' | 'success' | 'failure';

export type CityEventType =
  | 'start'
  | 'select_node'
  | 'inspect_road'
  | 'update_route'
  | 'road_already_explored'
  | 'destination_reached'
  | 'reconstruct_step'
  | 'complete'
  | 'no_route';

export interface CityGraphEvent {
  stepNumber: number;
  type: CityEventType;
  heading: string;
  explanation: string;
  whatNext: string;
  currentNodeId?: string;
  neighborNodeId?: string;
  edgeId?: string;
  g?: number;
  h?: number;
  f?: number;
  prevCost?: number;
  newCost?: number;
}

export interface CityGraphSnapshot {
  stepIndex: number;
  event: CityGraphEvent;
  activeNodeId: string | null;
  inspectingNodeId: string | null;
  inspectingEdgeId: string | null;
  frontierNodeIds: string[];
  exploredNodeIds: string[];
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  parentMap: Record<string, string>; // child nodeId -> parent nodeId
  pathNodeIds: string[]; // sequence of node ids in current path
  pathEdgeIds: string[]; // sequence of edge ids in current path
  status: SearchStatus;
  nodesExpanded: number;
  cellsExplored: number;
  pathCost: number | null;
  pathLength: number | null;
}

export interface CityGraphResult {
  algorithm: AlgorithmType;
  found: boolean;
  pathNodeIds: string[];
  pathEdgeIds: string[];
  pathNames: string[];
  totalCost: number | null;
  roadsTraveled: number | null;
  nodesExpanded: number;
  cellsExplored: number;
  status: SearchStatus;
}
