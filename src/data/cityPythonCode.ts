/**
 * Runnable Python 3 implementations for City Graph Navigation
 * operating on the general graph network.
 */

export const ASTAR_CITY_PYTHON_CODE = `"""
=============================================================================
CITY GRAPH A* SEARCH ALGORITHM (Road Network Navigation)
Course: B.Tech CSE - Design & Analysis of Algorithms Practical
Department of Computer Science & Engineering, Manipal University Jaipur
=============================================================================
Evaluation function: f(n) = g(n) + h(n)
- g(n): Actual road travel cost from starting location.
- h(n): Admissible Euclidean straight-line distance to destination.
- Consistency guarantee: h(u) <= c(u, v) + h(v) satisfies triangle inequality.
=============================================================================
"""

import math
import heapq
from typing import Dict, List, Tuple, Optional, Set

# Node coordinates (x, y) on city map
CityCoordinates = Dict[str, Tuple[float, float]]

# Graph adjacency: node_id -> List of (neighbor_id, road_weight)
CityGraph = Dict[str, List[Tuple[str, float]]]


def euclidean_heuristic(
    current: str,
    destination: str,
    coords: CityCoordinates,
    scale: float = 28.0
) -> float:
    """Calculates admissible straight-line distance scaled to road kilometers."""
    if current not in coords or destination not in coords:
        return 0.0
    x1, y1 = coords[current]
    x2, y2 = coords[destination]
    distance = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    return round(distance / scale, 1)


def astar_city_search(
    graph: CityGraph,
    coords: CityCoordinates,
    start: str,
    destination: str
) -> Tuple[Optional[List[str]], float, int, int]:
    """
    Finds the shortest road route between start and destination using A*.

    Returns:
        (path, total_cost, nodes_expanded, locations_explored)
    """
    if start == destination:
        return [start], 0.0, 1, 1

    # Priority queue: (f_score, h_score, order, current_location)
    pq = []
    order = 0

    g_score: Dict[str, float] = {start: 0.0}
    parent: Dict[str, str] = {}
    explored: Set[str] = set()

    h_start = euclidean_heuristic(start, destination, coords)
    heapq.heappush(pq, (h_start, h_start, order, start))
    order += 1

    nodes_expanded = 0

    while pq:
        f_curr, h_curr, _, current = heapq.heappop(pq)

        if current in explored:
            continue

        explored.add(current)
        nodes_expanded += 1

        # Destination check upon popping from priority queue
        if current == destination:
            # Reconstruct route
            path = []
            curr: Optional[str] = destination
            while curr is not None:
                path.append(curr)
                curr = parent.get(curr)
            path.reverse()
            return path, g_score[destination], nodes_expanded, len(explored)

        # Inspect all connecting roads
        for neighbor, weight in graph.get(current, []):
            if neighbor in explored:
                continue

            tentative_g = g_score[current] + weight

            # Relax edge if a shorter road connection is found
            if tentative_g < g_score.get(neighbor, float('inf')):
                g_score[neighbor] = tentative_g
                h_neighbor = euclidean_heuristic(neighbor, destination, coords)
                f_neighbor = tentative_g + h_neighbor
                parent[neighbor] = current

                heapq.heappush(pq, (f_neighbor, h_neighbor, order, neighbor))
                order += 1

    return None, float('inf'), nodes_expanded, len(explored)


# --- Demonstration Runner (MUJ to Amber Fort) ---
if __name__ == "__main__":
    # Key Jaipur Landmark Coordinates
    city_coords = {
        'muj': (110, 740),              # Manipal University Jaipur, Dehmi Kalan
        'bhankrota_jct': (280, 660),    # 200 Ft Bypass Junction
        'akshardham': (360, 550),       # Vaishali Nagar
        'civil_lines_jct': (460, 520),  # Queens Road
        'jaipur_junction': (560, 470),  # Central Railway Terminus
        'sindhi_camp': (620, 440),      # Bus Terminal
        'mi_road': (640, 490),          # Commercial Spine
        'city_palace': (720, 370),      # Walled City
        'hawa_mahal': (790, 380),       # Palace of Winds
        'jal_mahal': (750, 230),        # Man Sagar Lake
        'amber_fort': (750, 120),       # UNESCO World Heritage Fort
    }

    # Road Network (Undirected Graph)
    city_graph = {
        'muj': [('bhankrota_jct', 15)],
        'bhankrota_jct': [('muj', 15), ('akshardham', 6)],
        'akshardham': [('bhankrota_jct', 6), ('civil_lines_jct', 5)],
        'civil_lines_jct': [('akshardham', 5), ('jaipur_junction', 4)],
        'jaipur_junction': [('civil_lines_jct', 4), ('sindhi_camp', 2), ('mi_road', 3)],
        'sindhi_camp': [('jaipur_junction', 2), ('mi_road', 2)],
        'mi_road': [('jaipur_junction', 3), ('sindhi_camp', 2), ('city_palace', 3)],
        'city_palace': [('mi_road', 3), ('hawa_mahal', 1), ('jal_mahal', 4)],
        'hawa_mahal': [('city_palace', 1), ('jal_mahal', 4)],
        'jal_mahal': [('city_palace', 4), ('hawa_mahal', 4), ('amber_fort', 5)],
        'amber_fort': [('jal_mahal', 5)],
    }

    route, cost, expanded, explored = astar_city_search(
        city_graph, city_coords, 'muj', 'amber_fort'
    )
    print("A* Shortest Route from MUJ to Amber Fort:", " -> ".join(route))
    print(f"Total Travel Distance: {cost} km | Locations Expanded: {expanded}")
`;

export const DIJKSTRA_CITY_PYTHON_CODE = `"""
=============================================================================
CITY GRAPH DIJKSTRA'S ALGORITHM (Road Network Navigation)
Course: B.Tech CSE - Design & Analysis of Algorithms Practical
Department of Computer Science & Engineering, Manipal University Jaipur
=============================================================================
Evaluation function: f(n) = g(n)
- g(n): Actual shortest accumulated road travel cost.
- Uninformed radial search: Does not use geographic heuristics.
- Guaranteed shortest path on all non-negative road weights.
=============================================================================
"""

import heapq
from typing import Dict, List, Tuple, Optional, Set

# Graph adjacency: node_id -> List of (neighbor_id, road_weight)
CityGraph = Dict[str, List[Tuple[str, float]]]


def dijkstra_city_search(
    graph: CityGraph,
    start: str,
    destination: str
) -> Tuple[Optional[List[str]], float, int, int]:
    """
    Finds the shortest road route using Dijkstra's algorithm.

    Returns:
        (path, total_cost, nodes_expanded, locations_explored)
    """
    if start == destination:
        return [start], 0.0, 1, 1

    # Priority queue: (accumulated_distance_g, order, current_location)
    pq = []
    order = 0

    dist: Dict[str, float] = {start: 0.0}
    parent: Dict[str, str] = {}
    explored: Set[str] = set()

    heapq.heappush(pq, (0.0, order, start))
    order += 1

    nodes_expanded = 0

    while pq:
        curr_dist, _, current = heapq.heappop(pq)

        if current in explored:
            continue

        explored.add(current)
        nodes_expanded += 1

        # Destination check upon popping
        if current == destination:
            path = []
            curr: Optional[str] = destination
            while curr is not None:
                path.append(curr)
                curr = parent.get(curr)
            path.reverse()
            return path, dist[destination], nodes_expanded, len(explored)

        # Inspect all connecting roads
        for neighbor, weight in graph.get(current, []):
            if neighbor in explored:
                continue

            tentative_dist = curr_dist + weight

            # Relax edge if a shorter connection is found
            if tentative_dist < dist.get(neighbor, float('inf')):
                dist[neighbor] = tentative_dist
                parent[neighbor] = current

                heapq.heappush(pq, (tentative_dist, order, neighbor))
                order += 1

    return None, float('inf'), nodes_expanded, len(explored)


# --- Demonstration Runner (MUJ to Amber Fort) ---
if __name__ == "__main__":
    city_graph = {
        'muj': [('bhankrota_jct', 15)],
        'bhankrota_jct': [('muj', 15), ('akshardham', 6)],
        'akshardham': [('bhankrota_jct', 6), ('civil_lines_jct', 5)],
        'civil_lines_jct': [('akshardham', 5), ('jaipur_junction', 4)],
        'jaipur_junction': [('civil_lines_jct', 4), ('sindhi_camp', 2), ('mi_road', 3)],
        'sindhi_camp': [('jaipur_junction', 2), ('mi_road', 2)],
        'mi_road': [('jaipur_junction', 3), ('sindhi_camp', 2), ('city_palace', 3)],
        'city_palace': [('mi_road', 3), ('hawa_mahal', 1), ('jal_mahal', 4)],
        'hawa_mahal': [('city_palace', 1), ('jal_mahal', 4)],
        'jal_mahal': [('city_palace', 4), ('hawa_mahal', 4), ('amber_fort', 5)],
        'amber_fort': [('jal_mahal', 5)],
    }

    route, cost, expanded, explored = dijkstra_city_search(
        city_graph, 'muj', 'amber_fort'
    )
    print("Dijkstra Shortest Route from MUJ to Amber Fort:", " -> ".join(route))
    print(f"Total Travel Distance: {cost} km | Locations Expanded: {expanded}")
`;
