# 🔷 GRAPHS — Complete Interview Mastery Guide
> Amazon's #1 favourite topic. Master this = crack the loop.

---

## 📌 TABLE OF CONTENTS
1. [Mental Model & How to NOT Forget](#1-mental-model--how-to-not-forget)
2. [Graph Fundamentals](#2-graph-fundamentals)
3. [Representations](#3-representations)
4. [BFS — Breadth First Search](#4-bfs--breadth-first-search)
5. [DFS — Depth First Search](#5-dfs--depth-first-search)
6. [Cycle Detection](#6-cycle-detection)
7. [Topological Sort](#7-topological-sort)
8. [Union-Find / DSU](#8-union-find--dsu)
9. [Bipartite Check](#9-bipartite-check)
10. [Connected Components](#10-connected-components)
11. [Shortest Path Algorithms](#11-shortest-path-algorithms)
12. [Minimum Spanning Tree](#12-minimum-spanning-tree)
13. [Grid / Matrix as Graph](#13-grid--matrix-as-graph)
14. [Multi-Source BFS](#14-multi-source-bfs)
15. [0-1 BFS](#15-0-1-bfs)
16. [Bridges & Articulation Points (Tarjan's)](#16-bridges--articulation-points-tarjans)
17. [Strongly Connected Components (SCC)](#17-strongly-connected-components-scc)
18. [Advanced Patterns](#18-advanced-patterns)
19. [Amazon Question Bank — Full Set](#19-amazon-question-bank--full-set)
20. [Quick Revision Cheatsheet](#20-quick-revision-cheatsheet)

---

## 1. Mental Model & How to NOT Forget

### 🧠 The Golden Framework — Ask These 3 Questions First
```
1. DIRECTED or UNDIRECTED?
   → Directed  → think: topological sort, SCC, cycle in directed graph
   → Undirected → think: connected components, bridges, bipartite

2. WEIGHTED or UNWEIGHTED?
   → Unweighted   → BFS gives shortest path (each edge = 1)
   → Weighted (+) → Dijkstra
   → Weighted (-) → Bellman-Ford
   → 0/1 weights  → 0-1 BFS (deque)
   → All pairs    → Floyd-Warshall

3. WHAT ARE YOU FINDING?
   → Path exists?           → BFS/DFS/Union-Find
   → Shortest path?         → BFS / Dijkstra / Bellman-Ford
   → All paths?             → DFS + backtrack
   → Order of tasks?        → Topological Sort
   → Groups/clusters?       → Union-Find / DFS connected components
   → Cycle?                 → DFS (color) / Union-Find
   → Minimum cost tree?     → Kruskal / Prim (MST)
```

### 🔁 Memory Technique — The "BRUTE-C" Acronym
```
B → BFS (levels, shortest path unweighted)
R → Representations (adj list, matrix, edge list)
U → Union-Find (grouping, MST)
T → Topological Sort (DAGs, ordering)
E → Edge weights → Dijkstra / Bellman-Ford
C → Cycle detection (directed/undirected separately)
```

### ⚡ Pattern → Algorithm Flashcard
| Signal in Problem | Algorithm |
|---|---|
| "Shortest path", no weights | BFS |
| "Shortest path", positive weights | Dijkstra |
| "Shortest path", negative weights | Bellman-Ford |
| "All pairs shortest path" | Floyd-Warshall |
| "Number of islands", "connected regions" | DFS/BFS on grid |
| "Course prerequisites", "task scheduling" | Topological Sort |
| "Can all courses be completed?" | Topo Sort + Cycle detection |
| "Minimum cost to connect all" | MST (Kruskal/Prim) |
| "Same group?", "Find/Union" | Union-Find |
| "Is graph bipartite?" | BFS/DFS 2-coloring |
| "Critical connections" | Bridges (Tarjan's) |
| "Word ladder", "minimum mutations" | BFS on implicit graph |
| "Clone graph" | BFS/DFS + unordered_map |

---

## 2. Graph Fundamentals

### Terminology (Never Confuse These)
```
Vertex (Node)    → individual element
Edge             → connection between 2 vertices
Degree           → number of edges on a node
                   in-degree (directed) = edges coming IN
                   out-degree (directed) = edges going OUT
Path             → sequence of vertices connected by edges
Cycle            → path that starts and ends at same vertex
DAG              → Directed Acyclic Graph (no cycles)
Tree             → undirected, connected, acyclic graph (n nodes, n-1 edges)
Forest           → multiple trees (disconnected)
Connected Graph  → path exists between every pair of nodes
Strongly Connected (directed) → every node reachable from every other node
Weakly Connected (directed)   → connected if we ignore edge directions
```

### Key Properties to Memorize
```
Undirected Tree:    n nodes, n-1 edges, no cycle, connected
Graph with cycle:   n nodes, n edges minimum (one extra edge = cycle)
Complete Graph Kn:  n(n-1)/2 edges
Bipartite:          2-colorable, no odd-length cycle
```

---

## 3. Representations

### 3.1 Adjacency List ✅ (Most Used)
```cpp
// n nodes, undirected
vector<vector<int>> adj(n);

// Add edge u-v (undirected)
adj[u].push_back(v);
adj[v].push_back(u);

// Weighted version
vector<vector<pair<int, int>>> adj(n);
// adj[u] → list of {neighbor, weight}
adj[u].push_back({v, w});
adj[v].push_back({u, w});

// Space: O(V + E)  ← preferred for sparse graphs
```

### 3.2 Adjacency Matrix
```cpp
vector<vector<int>> mat(n, vector<int>(n, 0));
mat[u][v] = 1;     // directed
mat[v][u] = 1;     // undirected
mat[u][v] = w;     // weighted

// Space: O(V²) ← only for dense graphs or when O(1) edge lookup needed
```

### 3.3 Edge List
```cpp
vector<vector<int>> edges = {{0,1}, {1,2}, {2,3}};
// Used in: Kruskal's MST (sort edges by weight)
```

### 3.4 Building from Problem Input
```cpp
// Common input: vector<vector<int>>& edges = {{u1,v1}, {u2,v2}, ...}
vector<vector<int>> buildAdj(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]); // remove for directed
    }
    return adj;
}
```

---

## 4. BFS — Breadth First Search

### Core Template (MEMORIZE THIS)
```cpp
void bfs(int src, vector<vector<int>>& adj, int n) {
    vector<bool> visited(n, false);
    queue<int> q;

    visited[src] = true;
    q.push(src);

    while (!q.empty()) {
        int node = q.front();
        q.pop();
        // ✅ Process node here

        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
}
```

### BFS with Level Tracking (Critical for "minimum steps/distance")
```cpp
int bfsLevel(int src, int target, vector<vector<int>>& adj, int n) {
    vector<bool> visited(n, false);
    queue<int> q;
    visited[src] = true;
    q.push(src);
    int level = 0;

    while (!q.empty()) {
        int size = q.size(); // ← KEY: snapshot size at this level
        for (int i = 0; i < size; i++) {
            int node = q.front();
            q.pop();
            if (node == target) return level;
            for (int nb : adj[node]) {
                if (!visited[nb]) {
                    visited[nb] = true;
                    q.push(nb);
                }
            }
        }
        level++;
    }
    return -1; // not reachable
}
```

### BFS Distance Array (Shortest distance from src to all nodes)
```cpp
vector<int> bfsDist(int src, vector<vector<int>>& adj, int n) {
    vector<int> dist(n, -1);
    queue<int> q;
    dist[src] = 0;
    q.push(src);

    while (!q.empty()) {
        int node = q.front();
        q.pop();
        for (int nb : adj[node]) {
            if (dist[nb] == -1) {
                dist[nb] = dist[node] + 1;
                q.push(nb);
            }
        }
    }
    return dist;
}
```

### When to Use BFS
```
✅ Shortest path in UNWEIGHTED graph
✅ Level-order traversal
✅ Finding all nodes at distance k
✅ Check if path exists
✅ Bipartite check
✅ Multi-source BFS (start with multiple sources)
✅ Word Ladder, Minimum Knight Moves, Rotting Oranges
```

---

## 5. DFS — Depth First Search

### Recursive Template
```cpp
void dfs(int node, vector<bool>& visited, vector<vector<int>>& adj) {
    visited[node] = true;
    // ✅ Pre-order processing here

    for (int nb : adj[node]) {
        if (!visited[nb]) {
            dfs(nb, visited, adj);
        }
    }
    // ✅ Post-order processing here (useful for topo sort)
}
```

### Iterative DFS (Stack)
```cpp
void dfsIter(int src, vector<vector<int>>& adj, int n) {
    vector<bool> visited(n, false);
    stack<int> s;
    s.push(src);

    while (!s.empty()) {
        int node = s.top();
        s.pop();
        if (visited[node]) continue;
        visited[node] = true;
        // ✅ Process node

        for (int nb : adj[node]) {
            if (!visited[nb]) s.push(nb);
        }
    }
}
```

### DFS Path Finding (All Paths)
```cpp
vector<vector<int>> allPaths;

void dfsAllPaths(int node, int target, vector<vector<int>>& adj,
                  vector<bool>& visited, vector<int>& path) {
    visited[node] = true;
    path.push_back(node);

    if (node == target) {
        allPaths.push_back(path);
    } else {
        for (int nb : adj[node]) {
            if (!visited[nb]) {
                dfsAllPaths(nb, target, adj, visited, path);
            }
        }
    }

    // BACKTRACK
    path.pop_back();
    visited[node] = false;
}
```

### When to Use DFS
```
✅ Cycle detection
✅ Topological sort
✅ Connected components
✅ Flood fill / Number of Islands
✅ All paths enumeration
✅ Tree problems (treated as graph)
✅ SCC (Kosaraju, Tarjan)
✅ Bridges & Articulation Points
```

---

## 6. Cycle Detection

### 6.1 Undirected Graph — DFS
```cpp
// Key insight: if neighbor is visited AND is not the parent → cycle exists
bool hasCycleUndirected(int node, int parent, vector<bool>& vis,
                             vector<vector<int>>& adj) {
    vis[node] = true;
    for (int nb : adj[node]) {
        if (!vis[nb]) {
            if (hasCycleUndirected(nb, node, vis, adj)) return true;
        } else if (nb != parent) {
            return true; // ← back edge to non-parent = cycle
        }
    }
    return false;
}

// Call for all components:
bool detectCycleUndirected(int n, vector<vector<int>>& adj) {
    vector<bool> vis(n, false);
    for (int i = 0; i < n; i++) {
        if (!vis[i] && hasCycleUndirected(i, -1, vis, adj)) return true;
    }
    return false;
}
```

### 6.2 Undirected Graph — Union-Find (Cleaner)
```cpp
bool hasCycleUF(int n, vector<vector<int>>& edges) {
    vector<int> parent(n);
    iota(parent.begin(), parent.end(), 0);

    for (auto& edge : edges) {
        int pu = find(parent, edge[0]);
        int pv = find(parent, edge[1]);
        if (pu == pv) return true; // same component → cycle
        unite(parent, pu, pv);
    }
    return false;
}
```

### 6.3 Directed Graph — DFS with 3 Colors
```cpp
// 0 = WHITE (unvisited)
// 1 = GRAY  (in current DFS path / recursion stack)
// 2 = BLACK (fully processed)
// Back edge to GRAY node = cycle

vector<int> color; // 0 = unvisited, 1 = in stack, 2 = done

bool hasCycleDirected(int node, vector<vector<int>>& adj) {
    color[node] = 1; // mark gray
    for (int nb : adj[node]) {
        if (color[nb] == 1) return true;       // back edge → cycle
        if (color[nb] == 0 && hasCycleDirected(nb, adj)) return true;
    }
    color[node] = 2; // mark black
    return false;
}

bool detectCycleDirected(int n, vector<vector<int>>& adj) {
    color.assign(n, 0);
    for (int i = 0; i < n; i++) {
        if (color[i] == 0 && hasCycleDirected(i, adj)) return true;
    }
    return false;
}
```

### ⚠️ Common Mistake
```
Undirected: use parent tracking (not color array) → simpler
Directed:   MUST use color/inStack array (parent tracking won't work)
```

---

## 7. Topological Sort

> **Only valid for DAGs (Directed Acyclic Graphs)**
> Use when: ordering tasks, prerequisites, build dependencies

### 7.1 Kahn's Algorithm (BFS-based) ✅ Preferred
```cpp
// Uses in-degree count
// Advantage: easy to detect cycles (if result.size() != n → cycle exists)

vector<int> topoSort(int n, vector<vector<int>>& adj) {
    vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : adj[u])
            inDegree[v]++;

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) q.push(i); // start with 0-indegree nodes

    vector<int> result;
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        result.push_back(node);
        for (int nb : adj[node]) {
            inDegree[nb]--;
            if (inDegree[nb] == 0) q.push(nb);
        }
    }

    // If result.size() != n → CYCLE EXISTS (can't complete all nodes)
    return result.size() == n ? result : vector<int>();
}
```

### 7.2 DFS-based Topo Sort
```cpp
// Post-order DFS → reverse gives topological order
stack<int> st;
vector<bool> visited;

void dfsTopoSort(int node, vector<vector<int>>& adj) {
    visited[node] = true;
    for (int nb : adj[node]) {
        if (!visited[nb]) dfsTopoSort(nb, adj);
    }
    st.push(node); // post-order push
}

vector<int> topoSortDFS(int n, vector<vector<int>>& adj) {
    visited.assign(n, false);
    for (int i = 0; i < n; i++)
        if (!visited[i]) dfsTopoSort(i, adj);

    vector<int> result;
    while (!st.empty()) {
        result.push_back(st.top());
        st.pop();
    }
    return result;
}
```

### Real Problem: Course Schedule (LC 207)
```cpp
bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> inDegree(numCourses, 0);

    for (auto& pre : prerequisites) {
        adj[pre[1]].push_back(pre[0]); // pre[1] → pre[0]
        inDegree[pre[0]]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; i++)
        if (inDegree[i] == 0) q.push(i);

    int count = 0;
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        count++;
        for (int nb : adj[node]) {
            if (--inDegree[nb] == 0) q.push(nb);
        }
    }
    return count == numCourses; // all processed → no cycle
}
```

---

## 8. Union-Find / DSU

> **The "Grouping" Swiss Army Knife**
> Fastest for: connected components, cycle detection, MST (Kruskal's)

### Full DSU with Path Compression + Union by Rank
```cpp
class DSU {
public:
    vector<int> parent, rank;
    int components;

    DSU(int n) {
        parent.resize(n);
        rank.assign(n, 0);
        components = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false; // already connected

        // Union by rank
        if (rank[px] < rank[py]) swap(px, py);
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;

        components--;
        return true;
    }

    bool connected(int x, int y) {
        return find(x) == find(y);
    }
};
```

### When to Use DSU vs BFS/DFS
```
DSU  → online queries, incremental edge additions, MST
BFS/DFS → when you also need path, distances, order
Both work for: cycle detection, connected components

DSU time: O(α(n)) per operation ≈ O(1) practically
```

### DSU Problem: Number of Provinces (LC 547)
```cpp
int findCircleNum(vector<vector<int>>& isConnected) {
    int n = isConnected.size();
    DSU dsu(n);
    for (int i = 0; i < n; i++)
        for (int j = i+1; j < n; j++)
            if (isConnected[i][j] == 1)
                dsu.unite(i, j);
    return dsu.components;
}
```

---

## 9. Bipartite Check

> Graph is bipartite if you can color nodes with 2 colors such that no two adjacent nodes share the same color.
> Equivalent to: graph has NO ODD-LENGTH CYCLE

### BFS 2-Coloring
```cpp
bool isBipartite(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> color(n, 0); // 0=uncolored, 1=red, -1=blue

    for (int start = 0; start < n; start++) {
        if (color[start] != 0) continue;

        queue<int> q;
        q.push(start);
        color[start] = 1;

        while (!q.empty()) {
            int node = q.front();
            q.pop();
            for (int nb : graph[node]) {
                if (color[nb] == 0) {
                    color[nb] = -color[node]; // opposite color
                    q.push(nb);
                } else if (color[nb] == color[node]) {
                    return false; // same color on adjacent → not bipartite
                }
            }
        }
    }
    return true;
}
```

---

## 10. Connected Components

### Count Components (Undirected)
```cpp
// DFS approach
int countComponents(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj = buildAdj(n, edges);
    vector<bool> vis(n, false);
    int count = 0;

    for (int i = 0; i < n; i++) {
        if (!vis[i]) {
            dfs(i, vis, adj);
            count++;
        }
    }
    return count;
}

// DSU approach (even simpler)
int countComponentsDSU(int n, vector<vector<int>>& edges) {
    DSU dsu(n);
    for (auto& e : edges) dsu.unite(e[0], e[1]);
    return dsu.components;
}
```

### Largest Component Size
```cpp
int largestComponent(int n, vector<vector<int>>& adj) {
    vector<bool> vis(n, false);
    int maxSize = 0;

    for (int i = 0; i < n; i++) {
        if (!vis[i]) {
            int size = dfsSize(i, vis, adj);
            maxSize = max(maxSize, size);
        }
    }
    return maxSize;
}

int dfsSize(int node, vector<bool>& vis, vector<vector<int>>& adj) {
    vis[node] = true;
    int size = 1;
    for (int nb : adj[node])
        if (!vis[nb]) size += dfsSize(nb, vis, adj);
    return size;
}
```

---

## 11. Shortest Path Algorithms

### 11.1 Dijkstra's Algorithm (Positive Weights) ✅
```cpp
// Uses min-heap (priority_queue)
// Time: O((V + E) log V)

vector<int> dijkstra(int src, int n, vector<vector<pair<int, int>>>& adj) {
    vector<int> dist(n, INT_MAX);
    dist[src] = 0;

    // PQ: {distance, node}
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, node] = pq.top();
        pq.pop();

        if (d > dist[node]) continue; // stale entry — skip

        for (auto& nb : adj[node]) {
            int nextNode = nb.first, weight = nb.second;
            int newDist = dist[node] + weight;

            if (newDist < dist[nextNode]) {
                dist[nextNode] = newDist;
                pq.push({newDist, nextNode});
            }
        }
    }
    return dist;
}
```

### Dijkstra with Path Reconstruction
```cpp
vector<int> dijkstraWithPath(int src, int target, int n, vector<vector<pair<int, int>>>& adj) {
    vector<int> dist(n, INT_MAX);
    vector<int> prev(n, -1); // store parent
    dist[src] = 0;

    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, node] = pq.top();
        pq.pop();
        if (d > dist[node]) continue;

        for (auto& nb : adj[node]) {
            if (dist[node] + nb.second < dist[nb.first]) {
                dist[nb.first] = dist[node] + nb.second;
                prev[nb.first] = node; // track path
                pq.push({dist[nb.first], nb.first});
            }
        }
    }

    // Reconstruct path to target
    vector<int> path;
    for (int at = target; at != -1; at = prev[at]) path.push_back(at);
    reverse(path.begin(), path.end());
    return dist;
}
```

### 11.2 Bellman-Ford (Negative Weights)
```cpp
// Time: O(V * E)
// Use when: negative edges exist, detect negative cycles

vector<int> bellmanFord(int src, int n, vector<vector<int>>& edges) {
    vector<int> dist(n, INT_MAX);
    dist[src] = 0;

    // Relax all edges V-1 times
    for (int i = 0; i < n - 1; i++) {
        for (auto& edge : edges) { // edge: {u, v, weight}
            int u = edge[0], v = edge[1], w = edge[2];
            if (dist[u] != INT_MAX && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }

    // Check for negative cycle (one more pass)
    for (auto& edge : edges) {
        if (dist[edge[0]] != INT_MAX &&
            dist[edge[0]] + edge[2] < dist[edge[1]]) {
            cout << "Negative cycle detected!" << endl;
        }
    }
    return dist;
}
```

### 11.3 Floyd-Warshall (All-Pairs Shortest Path)
```cpp
// Time: O(V³), Space: O(V²)
// Use when: small graph, need all pairs distances

vector<vector<int>> floydWarshall(int n, vector<vector<int>>& edges) {
    vector<vector<int>> dist(n, vector<int>(n, 1e9));
    for (int i = 0; i < n; i++) dist[i][i] = 0;
    for (auto& e : edges) dist[e[0]][e[1]] = min(dist[e[0]][e[1]], e[2]);

    for (int k = 0; k < n; k++)           // intermediate node
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);

    return dist;
}
```

### 11.4 Shortest Path Comparison
```
Algorithm      | Weights       | Time        | Use When
BFS            | Unweighted    | O(V+E)      | Default for unweighted
Dijkstra       | Non-negative  | O((V+E)logV)| Weighted, no neg
Bellman-Ford   | Any           | O(V*E)      | Negative edges
Floyd-Warshall | Any           | O(V³)       | All pairs, small graph
0-1 BFS        | 0 or 1 only   | O(V+E)      | 0/1 weights (deque)
```

---

## 12. Minimum Spanning Tree

> Connects all n nodes with exactly n-1 edges and minimum total weight.

### 12.1 Kruskal's Algorithm (Edge-based, DSU)
```cpp
// Sort edges by weight, greedily add if they connect different components
// Time: O(E log E)

int kruskal(int n, vector<vector<int>>& edges) {
    sort(edges.begin(), edges.end(), [](const vector<int>& a, const vector<int>& b) {
        return a[2] < b[2];
    });
    DSU dsu(n);
    int mstWeight = 0, edgesUsed = 0;

    for (auto& edge : edges) {
        if (dsu.unite(edge[0], edge[1])) { // connects two components
            mstWeight += edge[2];
            edgesUsed++;
            if (edgesUsed == n - 1) break; // MST complete
        }
    }
    return edgesUsed == n - 1 ? mstWeight : -1; // -1 if not connected
}
```

### 12.2 Prim's Algorithm (Node-based, PQ)
```cpp
// Grow MST from a source node, always pick min weight edge
// Time: O((V+E) log V) — better for dense graphs

int prim(int n, vector<vector<pair<int, int>>>& adj) {
    vector<bool> inMST(n, false);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, 0}); // {weight, node}
    int totalWeight = 0;

    while (!pq.empty()) {
        auto [w, node] = pq.top();
        pq.pop();

        if (inMST[node]) continue;
        inMST[node] = true;
        totalWeight += w;

        for (auto& nb : adj[node]) {
            if (!inMST[nb.first]) {
                pq.push({nb.second, nb.first});
            }
        }
    }
    return totalWeight;
}
```

### When to use Kruskal vs Prim
```
Kruskal  → sparse graph (E << V²), edge list given
Prim     → dense graph (E ≈ V²), adj list given
Both     → O(E log V) effectively, choose based on input format
```

---

## 13. Grid / Matrix as Graph

> Grid problems ARE graph problems. Each cell = node, edges = adjacent cells.

### 4-directional vs 8-directional movement
```cpp
// 4-directional (up, down, left, right)
vector<vector<int>> dirs4 = {{0,1}, {0,-1}, {1,0}, {-1,0}};

// 8-directional (also diagonals)
vector<vector<int>> dirs8 = {{0,1},{0,-1},{1,0},{-1,0},{1,1},{1,-1},{-1,1},{-1,-1}};

// Bounds check
bool valid(int r, int c, int rows, int cols) {
    return r >= 0 && r < rows && c >= 0 && c < cols;
}
```

### Number of Islands (BFS version)
```cpp
int numIslands(vector<vector<char>>& grid) {
    if (grid.empty()) return 0;
    int rows = grid.size(), cols = grid[0].size();
    int count = 0;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                bfsIsland(grid, r, c, rows, cols); // sink visited cells
            }
        }
    }
    return count;
}

void bfsIsland(vector<vector<char>>& grid, int r, int c, int rows, int cols) {
    queue<pair<int, int>> q;
    q.push({r, c});
    grid[r][c] = '0'; // mark visited
    vector<vector<int>> dirs = {{0,1},{0,-1},{1,0},{-1,0}};

    while (!q.empty()) {
        auto [currR, currC] = q.front();
        q.pop();
        for (auto& d : dirs) {
            int nr = currR + d[0], nc = currC + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                grid[nr][nc] = '0';
                q.push({nr, nc});
            }
        }
    }
}
```

### Flood Fill
```cpp
vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
    int orig = image[sr][sc];
    if (orig == color) return image;
    dfsFlood(image, sr, sc, orig, color);
    return image;
}

void dfsFlood(vector<vector<int>>& img, int r, int c, int orig, int newColor) {
    if (r < 0 || r >= img.size() || c < 0 || c >= img[0].size()) return;
    if (img[r][c] != orig) return;
    img[r][c] = newColor;
    dfsFlood(img, r+1, c, orig, newColor);
    dfsFlood(img, r-1, c, orig, newColor);
    dfsFlood(img, r, c+1, orig, newColor);
    dfsFlood(img, r, c-1, orig, newColor);
}
```

---

## 14. Multi-Source BFS

> Start BFS from MULTIPLE sources simultaneously.
> Use when: finding min distance from ANY of several starting points.

### Template
```cpp
// Add ALL sources to queue before starting BFS
vector<vector<int>> multiSourceBFS(vector<vector<int>>& grid, vector<pair<int, int>>& sources, int rows, int cols) {
    vector<vector<int>> dist(rows, vector<int>(cols, INT_MAX));

    queue<pair<int, int>> q;
    for (auto& src : sources) {
        dist[src.first][src.second] = 0;
        q.push(src);
    }

    vector<vector<int>> dirs = {{0,1},{0,-1},{1,0},{-1,0}};
    while (!q.empty()) {
        auto [currR, currC] = q.front();
        q.pop();
        for (auto& d : dirs) {
            int nr = currR+d[0], nc = currC+d[1];
            if (nr>=0 && nr<rows && nc>=0 && nc<cols && dist[nr][nc] == INT_MAX) {
                dist[nr][nc] = dist[currR][currC] + 1;
                q.push({nr, nc});
            }
        }
    }
    return dist;
}
```

### Classic Problem: Rotting Oranges (LC 994)
```cpp
int orangesRotting(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    queue<pair<int, int>> q;
    int fresh = 0;

    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) q.push({r, c});
            if (grid[r][c] == 1) fresh++;
        }

    if (fresh == 0) return 0;
    int minutes = 0;
    vector<vector<int>> dirs = {{0,1},{0,-1},{1,0},{-1,0}};

    while (!q.empty()) {
        int size = q.size();
        bool rotted = false;
        for (int i = 0; i < size; i++) {
            auto [currR, currC] = q.front();
            q.pop();
            for (auto& d : dirs) {
                int nr = currR+d[0], nc = currC+d[1];
                if (nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc]==1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    q.push({nr, nc});
                    rotted = true;
                }
            }
        }
        if (rotted) minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
```

---

## 15. 0-1 BFS

> Weights are either 0 or 1. Use DEQUE instead of queue/PQ.
> Faster than Dijkstra: O(V + E) vs O((V+E)logV)

```cpp
// Weight 0 → push to FRONT of deque
// Weight 1 → push to BACK of deque

vector<int> zeroOneBFS(int src, int n, vector<vector<pair<int, int>>>& adj) {
    vector<int> dist(n, INT_MAX);
    dist[src] = 0;

    deque<int> dq;
    dq.push_front(src);

    while (!dq.empty()) {
        int node = dq.front();
        dq.pop_front();
        for (auto& nb : adj[node]) {
            int nextNode = nb.first, w = nb.second;
            if (dist[node] + w < dist[nextNode]) {
                dist[nextNode] = dist[node] + w;
                if (w == 0) dq.push_front(nextNode);  // weight 0 → front
                else        dq.push_back(nextNode);   // weight 1 → back
            }
        }
    }
    return dist;
}
```

---

## 16. Bridges & Articulation Points (Tarjan's)

> **Bridge**: an edge whose removal disconnects the graph
> **Articulation Point**: a vertex whose removal disconnects the graph

### Finding Bridges
```cpp
int timer = 0;
vector<int> disc, low;
vector<bool> vis;
vector<vector<int>> bridges;

void dfs(int node, int parent, vector<vector<int>>& adj) {
    vis[node] = true;
    disc[node] = low[node] = timer++;

    for (int nb : adj[node]) {
        if (!vis[nb]) {
            dfs(nb, node, adj);
            low[node] = min(low[node], low[nb]);

            // Bridge condition: low[nb] > disc[node]
            // No back edge from nb's subtree to node or above
            if (low[nb] > disc[node]) {
                bridges.push_back({node, nb});
            }
        } else if (nb != parent) {
            // Back edge: update low
            low[node] = min(low[node], disc[nb]);
        }
    }
}

vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
    vector<vector<int>> adj(n);
    for (auto& conn : connections) {
        adj[conn[0]].push_back(conn[1]);
        adj[conn[1]].push_back(conn[0]);
    }
    disc.assign(n, -1); low.assign(n, -1); vis.assign(n, false);
    for (int i = 0; i < n; i++) if (!vis[i]) dfs(i, -1, adj);
    return bridges;
}
```

### Key Concepts: disc[] and low[]
```
disc[v] = discovery time of v (when it was first visited)
low[v]  = minimum discovery time reachable from v's subtree
           (via tree edges + at most one back edge)

Bridge condition:   low[child] > disc[parent]
  → child's subtree has NO back edge reaching parent or above
  → removing this edge disconnects them

Articulation Point: low[child] >= disc[node] (note: >= not >)
  AND node is not the root (for root: AP if it has 2+ DFS children)
```

---

## 17. Strongly Connected Components (SCC)

> In a directed graph, SCC = maximal set of vertices where every vertex is reachable from every other.

### Kosaraju's Algorithm (2-Pass DFS)
```cpp
// Pass 1: DFS on original graph, push to stack in post-order
// Pass 2: DFS on REVERSED graph, each DFS = one SCC

vector<int> kosaraju(int n, vector<vector<int>>& adj) {
    // Step 1: DFS on original, get finish order
    vector<bool> vis(n, false);
    stack<int> st;
    for (int i = 0; i < n; i++)
        if (!vis[i]) dfsFinish(i, adj, vis, st);

    // Step 2: Build reversed graph
    vector<vector<int>> radj(n);
    for (int u = 0; u < n; u++)
        for (int v : adj[u]) radj[v].push_back(u);

    // Step 3: DFS on reversed graph in finish-order
    fill(vis.begin(), vis.end(), false);
    vector<int> comp(n);
    int id = 0;
    while (!st.empty()) {
        int node = st.top();
        st.pop();
        if (!vis[node]) {
            dfsAssign(node, radj, vis, comp, id++);
        }
    }
    return comp; // comp[i] = SCC id of node i
}

void dfsFinish(int node, vector<vector<int>>& adj, vector<bool>& vis, stack<int>& st) {
    vis[node] = true;
    for (int nb : adj[node])
        if (!vis[nb]) dfsFinish(nb, adj, vis, st);
    st.push(node); // push after all neighbors processed
}

void dfsAssign(int node, vector<vector<int>>& radj, vector<bool>& vis, vector<int>& comp, int id) {
    vis[node] = true;
    comp[node] = id;
    for (int nb : radj[node])
        if (!vis[nb]) dfsAssign(nb, radj, vis, comp, id);
}
```

---

## 18. Advanced Patterns

### 18.1 Bidirectional BFS (Word Ladder style)
```cpp
// Meet in the middle — dramatically cuts search space
// Use when: large branching factor, need shortest path

int bidirectionalBFS(string begin, string end, unordered_set<string>& wordList) {
    if (wordList.find(end) == wordList.end()) return 0;

    unordered_set<string> beginSet = {begin};
    unordered_set<string> endSet = {end};
    int level = 1;

    while (!beginSet.empty()) {
        // Always expand the SMALLER set
        if (beginSet.size() > endSet.size()) swap(beginSet, endSet);

        unordered_set<string> nextSet;
        for (string word : beginSet) {
            for (int i = 0; i < word.length(); i++) {
                char orig = word[i];
                for (char c = 'a'; c <= 'z'; c++) {
                    word[i] = c;
                    if (endSet.count(word)) return level + 1;
                    if (wordList.count(word)) {
                        nextSet.insert(word);
                        wordList.erase(word);
                    }
                }
                word[i] = orig;
            }
        }
        beginSet = nextSet;
        level++;
    }
    return 0;
}
```

### 18.2 Dijkstra on State Space (Modified)
```cpp
// When state = (node, extra_dimension)
// e.g., "shortest path with at most k stops" — state = [cost, node, stops]

int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
    vector<int> prices(n, INT_MAX);
    prices[src] = 0;

    // BFS approach: iterate k+1 times (cleaner for bounded hops)
    for (int i = 0; i <= k; i++) {
        vector<int> temp = prices;
        for (auto& flight : flights) {
            int u = flight[0], v = flight[1], w = flight[2];
            if (prices[u] != INT_MAX && prices[u] + w < temp[v]) {
                temp[v] = prices[u] + w;
            }
        }
        prices = temp;
    }
    return prices[dst] == INT_MAX ? -1 : prices[dst];
}
```

### 18.3 Graph Coloring / Node State in DFS
```cpp
// States: 0=unvisited, 1=in progress (gray), 2=done (black)
// Used for: cycle detection, deadlock detection, dependency resolution

// Also used in: "Find Eventual Safe States" (LC 802)
vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
    // Returns topological order, empty if cycle
    // (see Kahn's in section 7)
}
```

### 18.4 Clone Graph
```cpp
// DFS with unordered_map to track cloned nodes
unordered_map<Node*, Node*> visited;

Node* cloneGraph(Node* node) {
    if (!node) return nullptr;
    if (visited.count(node)) return visited[node];

    Node* clone = new Node(node->val);
    visited[node] = clone;

    for (Node* nb : node->neighbors) {
        clone->neighbors.push_back(cloneGraph(nb));
    }
    return clone;
}
```

### 18.5 Implicit Graph BFS (Very Common at Amazon)
```cpp
// Graph not given explicitly — generate neighbors on the fly
// Examples: Word Ladder, Open Lock, Minimum Genetic Mutation

// Pattern:
// - State = current configuration (string, vector, etc.)
// - Neighbors = all valid next states (1 mutation away)
// - visited = unordered_set<string> or unordered_set<State>

int minMutations(string start, string end, vector<string>& bank) {
    unordered_set<string> bankSet(bank.begin(), bank.end());
    if (bankSet.find(end) == bankSet.end()) return -1;

    queue<string> q;
    unordered_set<string> visited;
    q.push(start);
    visited.insert(start);
    int steps = 0;

    while (!q.empty()) {
        int size = q.size();
        steps++;
        for (int i = 0; i < size; i++) {
            string curr = q.front();
            q.pop();
            for (int j = 0; j < curr.length(); j++) {
                char orig = curr[j];
                string bases = "ACGT";
                for (char c : bases) {
                    curr[j] = c;
                    if (curr == end) return steps;
                    if (bankSet.count(curr) && !visited.count(curr)) {
                        visited.insert(curr);
                        q.push(curr);
                    }
                }
                curr[j] = orig;
            }
        }
    }
    return -1;
}
```

---

## 19. Amazon Question Bank — Full Set

> Organized by pattern. Difficulty: 🟢 Easy | 🟡 Medium | 🔴 Hard

---

### 🔷 PATTERN 1: BFS Shortest Path / Level Order

| # | Problem | Key Insight |
|---|---------|-------------|
| 🟡 | **Word Ladder** (LC 127) | Implicit BFS, all 1-char mutations |
| 🟡 | **Word Ladder II** (LC 126) | BFS + backtrack, all shortest paths |
| 🟡 | **Minimum Knight Moves** (LC 1197) | 8-dir BFS, watch bounds |
| 🟡 | **Shortest Path in Binary Matrix** (LC 1091) | 8-dir BFS on grid |
| 🟡 | **Open the Lock** (LC 752) | 4-wheel state BFS |
| 🟡 | **Jump Game III** (LC 1306) | BFS/DFS from index |
| 🟡 | **Bus Routes** (LC 815) | BFS on route groups |
| 🔴 | **Word Ladder II** (LC 126) | BFS + DFS backtrack |
| 🟡 | **Minimum Genetic Mutation** (LC 433) | Implicit BFS |
| 🟡 | **Nearest Exit from Entrance in Maze** (LC 1926) | Multi-source BFS |

---

### 🔷 PATTERN 2: Grid / Matrix DFS + BFS

| # | Problem | Key Insight |
|---|---------|-------------|
| 🟡 | **Number of Islands** (LC 200) | DFS/BFS flood fill |
| 🟡 | **Max Area of Island** (LC 695) | DFS returns size |
| 🟡 | **Flood Fill** (LC 733) | DFS color replace |
| 🟡 | **Surrounded Regions** (LC 130) | BFS from border first |
| 🟡 | **Pacific Atlantic Water Flow** (LC 417) | Reverse BFS from borders |
| 🟡 | **Number of Enclaves** (LC 1020) | BFS from edges, count remaining |
| 🔴 | **Number of Distinct Islands** (LC 694) | DFS + path encoding |
| 🟡 | **As Far from Land as Possible** (LC 1162) | Multi-source BFS |
| 🟡 | **Shortest Bridge** (LC 934) | DFS + multi-source BFS |
| 🔴 | **Swim in Rising Water** (LC 778) | Dijkstra on grid |
| 🟡 | **Walls and Gates** (LC 286) | Multi-source BFS |
| 🟡 | **Rotting Oranges** (LC 994) | Multi-source BFS |

---

### 🔷 PATTERN 3: Topological Sort + DAG

| # | Problem | Key Insight |
|---|---------|-------------|
| 🟡 | **Course Schedule** (LC 207) | Topo sort, detect cycle |
| 🟡 | **Course Schedule II** (LC 210) | Kahn's, return order |
| 🟡 | **Alien Dictionary** (LC 269) | Build order from comparisons |
| 🟡 | **Sequence Reconstruction** (LC 444) | Unique topo sort |
| 🟡 | **Parallel Courses** (LC 1136) | Longest path in DAG |
| 🔴 | **Course Schedule IV** (LC 1462) | Transitive reachability |
| 🟡 | **Minimum Height Trees** (LC 310) | Trim leaves repeatedly |
| 🟡 | **Sort Items by Groups** (LC 1203) | Two-level topo sort |
| 🟡 | **Find All Possible Recipes** (LC 2115) | Topo with ingredient deps |
| 🟡 | **Build a Matrix with Conditions** (LC 2392) | Topo in 2D |

---

### 🔷 PATTERN 4: Union-Find (DSU)

| # | Problem | Key Insight |
|---|---------|-------------|
| 🟡 | **Number of Provinces** (LC 547) | Basic DSU |
| 🟡 | **Redundant Connection** (LC 684) | First edge forming cycle |
| 🟡 | **Graph Valid Tree** (LC 261) | n-1 edges + no cycle |
| 🟡 | **Accounts Merge** (LC 721) | Union emails by account |
| 🟡 | **Number of Operations to Disconnect** (LC 1568) | Bridges + DSU |
| 🔴 | **Redundant Connection II** (LC 685) | Directed, complex cases |
| 🟡 | **Most Stones Removed** (LC 947) | Union rows/cols |
| 🟡 | **Satisfiability of Equality Equations** (LC 990) | Union equality, check inequality |
| 🔴 | **Minimum Cost to Connect All Points** (LC 1584) | Kruskal on coordinates |
| 🟡 | **Regions Cut by Slashes** (LC 959) | DSU on 3x3 grid expansion |

---

### 🔷 PATTERN 5: Dijkstra / Weighted Shortest Path

| # | Problem | Key Insight |
|---|---------|-------------|
| 🟡 | **Network Delay Time** (LC 743) | Dijkstra, max of all dists |
| 🟡 | **Path with Maximum Probability** (LC 1514) | Dijkstra, maximize prob |
| 🟡 | **Cheapest Flights Within K Stops** (LC 787) | Bellman-Ford k+1 iters |
| 🔴 | **Find the City With Smallest # Neighbors** (LC 1334) | Floyd-Warshall |
| 🔴 | **Minimum Cost to Reach Destination** (LC 787) | Dijkstra with state |
| 🔴 | **Swim in Rising Water** (LC 778) | Dijkstra, min max-edge |
| 🟡 | **Path With Minimum Effort** (LC 1631) | Dijkstra on grid |
| 🔴 | **Minimum Weighted Subgraph with Required Paths** (LC 2203) | Dijkstra from 3 sources |
| 🟡 | **The Maze** (LC 490) | BFS rolling ball |
| 🟡 | **The Maze II** (LC 505) | Dijkstra rolling ball |

---

### 🔷 PATTERN 6: Cycle Detection

| # | Problem | Key Insight |
|---|---------|-------------|
| 🟡 | **Course Schedule** (LC 207) | Directed cycle → can't finish |
| 🟡 | **Find Eventual Safe States** (LC 802) | Reverse graph + topo / DFS color |
| 🟡 | **Redundant Connection** (LC 684) | Undirected cycle with DSU |
| 🟡 | **Detect Cycle in Directed Graph** | 3-color DFS |
| 🟡 | **Detect Cycle in Undirected Graph** | DFS + parent |
| 🟡 | **Graph Valid Tree** (LC 261) | Tree = connected + no cycle |

---

### 🔷 PATTERN 7: Connected Components + Advanced Graph

| # | Problem | Key Insight |
|---|---------|-------------|
| 🟡 | **Number of Connected Components** (LC 323) | DFS or DSU |
| 🟡 | **Critical Connections** (LC 1192) | Bridges (Tarjan's) |
| 🟡 | **Reconstruct Itinerary** (LC 332) | Eulerian path (Hierholzer) |
| 🟡 | **Clone Graph** (LC 133) | DFS + unordered_map |
| 🔴 | **Number of Good Paths** (LC 2421) | DSU + sort |
| 🔴 | **Maximize the Number of Target Nodes** (LC 3372) | BFS per tree |
| 🟡 | **Check if Path Exists** (LC 1971) | BFS/DFS/DSU |
| 🟡 | **All Paths From Source to Target** (LC 797) | DFS backtrack on DAG |
| 🔴 | **Remove Max Number of Edges to Keep Graph Connected** (LC 1579) | Greedy DSU |
| 🟡 | **Count Unreachable Pairs of Nodes** (LC 2316) | Component sizes → math |

---

### 🔷 PATTERN 8: Hard / Amazon OA Favourites

| # | Problem | Key Insight |
|---|---------|-------------|
| 🔴 | **Alien Dictionary** (LC 269) | Topo sort from char order |
| 🔴 | **Critical Connections in Network** (LC 1192) | Bridges |
| 🔴 | **Minimum Cost to Connect All Points** (LC 1584) | Kruskal/Prim |
| 🔴 | **Bus Routes** (LC 815) | BFS on route graph |
| 🔴 | **Shortest Path to Get All Keys** (LC 864) | BFS with bitmask state |
| 🔴 | **Minimum Number of Days to Disconnect Island** (LC 1568) | Articulation points |
| 🔴 | **Graph with Smallest Max Distance** | Modified BFS |
| 🔴 | **Find if Path Exists in Graph** | Trivial, but DSU or BFS |
| 🔴 | **Restore Array from Adjacent Pairs** (LC 1743) | Build adj list, DFS |
| 🔴 | **Making a Large Island** (LC 827) | Flood fill + component ID |

---

## 20. Quick Revision Cheatsheet

```
╔══════════════════════════════════════════════════════════════════╗
║                    GRAPH ALGORITHM SELECTOR                      ║
╠══════════════════════════════════════════════════════════════════╣
║  Problem Type           → Use This                               ║
║ ─────────────────────────────────────────────────────────────── ║
║  Shortest (unweighted)  → BFS                                    ║
║  Shortest (pos weight)  → Dijkstra (PQ)                          ║
║  Shortest (neg weight)  → Bellman-Ford                           ║
║  Shortest (0/1 weight)  → 0-1 BFS (deque)                       ║
║  All pairs shortest     → Floyd-Warshall                         ║
║  Task ordering          → Topological Sort (Kahn's)              ║
║  Cycle in directed      → DFS 3-color                            ║
║  Cycle in undirected    → DFS+parent OR DSU                      ║
║  Connect all min cost   → MST (Kruskal/Prim)                     ║
║  Groups/Components      → DSU or BFS/DFS components              ║
║  Grid traversal         → BFS/DFS with dirs[][]                  ║
║  Multi-start            → Multi-source BFS                       ║
║  Bipartite              → BFS 2-coloring                         ║
║  Critical edges         → Bridges (Tarjan's)                     ║
║  Strongly connected     → Kosaraju's (2-pass DFS)                ║
╚══════════════════════════════════════════════════════════════════╝
```

### 🚀 The 5 Most Important Templates (Practice Daily)
```
1. BFS with distance array          → covers 40% of problems
2. DFS with visited (cycle detect)  → covers 30%
3. Dijkstra                         → covers 15%
4. Kahn's Topological Sort          → covers 10%
5. DSU (Union-Find)                 → covers 5% but very fast to code
```

### 🧠 Before Coding — 60 Second Checklist
```
□ Directed or undirected?
□ Weighted? (yes → Dijkstra/BF, no → BFS)
□ Can have cycles? (if yes and directed → detect before topo sort)
□ Need shortest path? (BFS/Dijkstra) or just reachability? (BFS/DFS/DSU)
□ Grid? (treat as graph, use dirs array)
□ Multiple components? (loop all nodes, not just node 0)
□ Multiple sources? (multi-source BFS)
□ State space graph? (node = configuration, not just integer)
```

### 🔴 Common Mistakes to AVOID
```
1. Forgetting to handle disconnected graphs → always loop ALL nodes
2. Using Dijkstra with negative weights → use Bellman-Ford instead
3. Using parent-tracking for cycle in directed graph → WRONG, use 3-color
4. Not marking visited BEFORE adding to queue → causes duplicates
5. Using wrong direction for topo sort → edge goes prerequisite → course
6. Forgetting stale entry check in Dijkstra → if (d > dist[node]) continue;
7. Off-by-one in level counting for BFS → track levels carefully
8. Not considering all connected components → wrap DFS/BFS in outer loop
```

---

*Last updated: 2026 | Amazon SDE Interview Focus | All code in C++*
