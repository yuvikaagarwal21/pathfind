/**
 * Complete, verified, and runnable Python 3 implementations of
 * A* Search and Dijkstra's Algorithm for grid pathfinding.
 * Designed for B.Tech CSE Algorithmic Implementation Practical.
 */

export const ASTAR_PYTHON_CODE = `"""
=============================================================================
A* SEARCH ALGORITHM (4-Directional Grid Pathfinding)
Course: B.Tech CSE - Design & Analysis of Algorithms / AI Practical
Department of Computer Science & Engineering, Manipal University Jaipur
=============================================================================
Evaluation function: f(n) = g(n) + h(n)
- g(n): Actual accumulated path cost from start to node n.
- h(n): Admissible Manhattan distance heuristic |r - r_goal| + |c - c_goal|.
- Unit movement cost: 1 per step (Up, Down, Left, Right).
=============================================================================
"""

import heapq
from typing import List, Tuple, Set, Optional, Dict

Coordinate = Tuple[int, int]


def manhattan_distance(a: Coordinate, b: Coordinate) -> int:
    """Calculates the Manhattan (L1) distance heuristic between two cells."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def astar_search(
    rows: int,
    cols: int,
    start: Coordinate,
    goal: Coordinate,
    walls: Set[Coordinate]
) -> Tuple[Optional[List[Coordinate]], int, int, int]:
    """
    Executes A* search on a 2D grid.
    
    Returns:
        (path, total_cost, nodes_expanded, cells_explored)
        path: List of (r, c) tuples from start to goal, or None if unreachable.
        total_cost: Sum of edge costs along the shortest path.
        nodes_expanded: Count of nodes popped from the priority queue.
        cells_explored: Total distinct cells placed in the closed set.
    """
    # Boundary and start==goal verification
    if start == goal:
        return [start], 0, 1, 1

    # Priority queue stores tuples: (f_score, h_score, order, current_node)
    # Using h_score as a secondary tie-breaker prioritizes nodes closer to goal.
    pq = []
    order = 0

    g_score: Dict[Coordinate, int] = {start: 0}
    parent: Dict[Coordinate, Coordinate] = {}
    explored: Set[Coordinate] = set()

    h_start = manhattan_distance(start, goal)
    heapq.heappush(pq, (h_start, h_start, order, start))
    order += 1

    # 4-Directional movements: Up, Down, Left, Right (unit cost = 1)
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    nodes_expanded = 0

    while pq:
        f_curr, h_curr, _, current = heapq.heappop(pq)

        # Skip stale priority queue entries if already expanded
        if current in explored:
            continue

        explored.add(current)
        nodes_expanded += 1

        # Check if the goal cell is reached
        if current == goal:
            # Reconstruct shortest path by following parent pointers
            path = []
            curr: Optional[Coordinate] = goal
            while curr is not None:
                path.append(curr)
                curr = parent.get(curr)
            path.reverse()
            total_cost = g_score[goal]
            return path, total_cost, nodes_expanded, len(explored)

        # Explore adjacent 4-directional neighbors
        r, c = current
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            neighbor = (nr, nc)

            # Check bounds and obstacle collision
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if neighbor in walls or neighbor in explored:
                continue

            tentative_g = g_score[current] + 1

            # Relax edge if a strictly shorter path to the neighbor is discovered
            if tentative_g < g_score.get(neighbor, float('inf')):
                g_score[neighbor] = tentative_g
                h_neighbor = manhattan_distance(neighbor, goal)
                f_neighbor = tentative_g + h_neighbor
                parent[neighbor] = current

                heapq.heappush(pq, (f_neighbor, h_neighbor, order, neighbor))
                order += 1

    # Goal is unreachable (blocked by walls)
    return None, -1, nodes_expanded, len(explored)


# --- Demonstration Test Runner ---
if __name__ == "__main__":
    grid_rows, grid_cols = 20, 30
    start_pos = (10, 3)
    goal_pos = (10, 26)

    # Empty grid test (theoretical minimum Manhattan distance = 23)
    path, cost, expanded, explored = astar_search(
        grid_rows, grid_cols, start_pos, goal_pos, walls=set()
    )
    print(f"[A* Empty Grid] Path found: {path is not None}")
    print(f"Path Length: {len(path) - 1} steps | Total Cost: {cost}")
    print(f"Nodes Expanded: {expanded} | Explored: {explored}")
`;

export const DIJKSTRA_PYTHON_CODE = `"""
=============================================================================
DIJKSTRA'S ALGORITHM (4-Directional Grid Shortest Path)
Course: B.Tech CSE - Design & Analysis of Algorithms / AI Practical
Department of Computer Science & Engineering, Manipal University Jaipur
=============================================================================
Evaluation function: f(n) = g(n)
- g(n): Actual shortest distance from start node.
- No heuristic is used (pure uniform-cost radial expansion).
- Guaranteed shortest path on non-negative weighted graphs/grids.
=============================================================================
"""

import heapq
from typing import List, Tuple, Set, Optional, Dict

Coordinate = Tuple[int, int]


def dijkstra_search(
    rows: int,
    cols: int,
    start: Coordinate,
    goal: Coordinate,
    walls: Set[Coordinate]
) -> Tuple[Optional[List[Coordinate]], int, int, int]:
    """
    Executes Dijkstra's algorithm on a 2D grid.
    
    Returns:
        (path, total_cost, nodes_expanded, cells_explored)
        path: List of (r, c) tuples from start to goal, or None if unreachable.
        total_cost: Sum of edge costs along the shortest path.
        nodes_expanded: Count of nodes popped from the priority queue.
        cells_explored: Total distinct cells placed in the closed set.
    """
    # Boundary and start==goal verification
    if start == goal:
        return [start], 0, 1, 1

    # Priority queue stores tuples: (distance_g, order, current_node)
    pq = []
    order = 0

    dist: Dict[Coordinate, int] = {start: 0}
    parent: Dict[Coordinate, Coordinate] = {}
    explored: Set[Coordinate] = set()

    heapq.heappush(pq, (0, order, start))
    order += 1

    # 4-Directional movements: Up, Down, Left, Right (unit cost = 1)
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    nodes_expanded = 0

    while pq:
        current_dist, _, current = heapq.heappop(pq)

        # Skip stale entries if cell has already been permanently relaxed
        if current in explored:
            continue

        explored.add(current)
        nodes_expanded += 1

        # Check if the goal cell is reached
        if current == goal:
            # Reconstruct shortest path by following parent pointers
            path = []
            curr: Optional[Coordinate] = goal
            while curr is not None:
                path.append(curr)
                curr = parent.get(curr)
            path.reverse()
            total_cost = dist[goal]
            return path, total_cost, nodes_expanded, len(explored)

        # Explore adjacent 4-directional neighbors
        r, c = current
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            neighbor = (nr, nc)

            # Check bounds and obstacle collision
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if neighbor in walls or neighbor in explored:
                continue

            tentative_dist = current_dist + 1

            # Relax edge if a shorter route to the neighbor is found
            if tentative_dist < dist.get(neighbor, float('inf')):
                dist[neighbor] = tentative_dist
                parent[neighbor] = current

                heapq.heappush(pq, (tentative_dist, order, neighbor))
                order += 1

    # Goal is unreachable
    return None, -1, nodes_expanded, len(explored)


# --- Demonstration Test Runner ---
if __name__ == "__main__":
    grid_rows, grid_cols = 20, 30
    start_pos = (10, 3)
    goal_pos = (10, 26)

    # Empty grid test (shortest distance = 23)
    path, cost, expanded, explored = dijkstra_search(
        grid_rows, grid_cols, start_pos, goal_pos, walls=set()
    )
    print(f"[Dijkstra Empty Grid] Path found: {path is not None}")
    print(f"Path Length: {len(path) - 1} steps | Total Cost: {cost}")
    print(f"Nodes Expanded: {expanded} | Explored: {explored}")
`;
