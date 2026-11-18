"""Trace the line drawing into ordered polylines for the 3D liner-notes portrait.

Usage (needs pillow, numpy, scikit-image):
    python scripts/trace-drawing.py src/assets/juan-drawing.jpg src/components/Portfolio/portrait-line.json

Output: {"aspect": width / height, "paths": [[x0, y0, x1, y1, ...], ...]}
Coordinates are integers in thousandths of the image height, origin at the
top-left. Paths are ordered so each one starts near where the previous one
ended, which lets the client treat them as a single line.
"""

import json
import sys

import numpy as np
from PIL import Image
from skimage.measure import approximate_polygon
from skimage.morphology import dilation, disk, remove_small_objects, skeletonize

WORK_HEIGHT = 2000  # Tracing resolution; plenty for a ~500px tall render.
INK_THRESHOLD = 200
MIN_PATH_PX = 14
SIMPLIFY_TOLERANCE = 1.1
MERGE_GAP_PX = 3

NEIGHBOURS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def load_skeleton(path):
    image = Image.open(path).convert("L")
    scale = WORK_HEIGHT / image.height
    image = image.resize((round(image.width * scale), WORK_HEIGHT), Image.LANCZOS)
    ink = np.asarray(image) < INK_THRESHOLD
    ink = dilation(ink, disk(2))  # Close hairline gaps before thinning.
    ink = remove_small_objects(ink, max_size=11)
    return skeletonize(ink), image.width, image.height


def neighbours(skeleton, y, x):
    h, w = skeleton.shape
    for dy, dx in NEIGHBOURS:
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and skeleton[ny, nx]:
            yield ny, nx


def trace_paths(skeleton):
    """Split the skeleton into polylines that run between ends and junctions.

    Returns (path, is_spur) pairs; a spur has at least one free end.
    """
    pixels = list(zip(*np.nonzero(skeleton)))
    degree = {p: sum(1 for _ in neighbours(skeleton, *p)) for p in pixels}
    visited_edges = set()
    paths = []

    def walk(start, nxt):
        path = [start, nxt]
        visited_edges.add((start, nxt))
        visited_edges.add((nxt, start))
        prev, cur = start, nxt
        while degree[cur] == 2:
            step = next((n for n in neighbours(skeleton, *cur) if n != prev and (cur, n) not in visited_edges), None)
            if step is None:
                break
            visited_edges.add((cur, step))
            visited_edges.add((step, cur))
            path.append(step)
            prev, cur = cur, step
        return path

    nodes = [p for p in pixels if degree[p] != 2]
    for node in nodes:
        for n in neighbours(skeleton, *node):
            if (node, n) not in visited_edges:
                path = walk(node, n)
                paths.append((path, degree[path[0]] == 1 or degree[path[-1]] == 1))

    # Closed loops have no nodes; start them anywhere.
    for p in pixels:
        for n in neighbours(skeleton, *p):
            if (p, n) not in visited_edges:
                paths.append((walk(p, n), False))
    return paths


def path_length(path):
    a = np.asarray(path, dtype=float)
    return float(np.sum(np.hypot(*np.diff(a, axis=0).T))) if len(a) > 1 else 0.0


def order_paths(paths):
    """Greedy nearest-endpoint chaining, starting at the top of the hair."""
    starts = np.array([p[0] for p in paths], dtype=float)
    ends = np.array([p[-1] for p in paths], dtype=float)
    used = np.zeros(len(paths), dtype=bool)

    first = int(np.argmin(np.minimum(starts[:, 0], ends[:, 0])))
    used[first] = True
    current = paths[first] if starts[first, 0] <= ends[first, 0] else paths[first][::-1]
    ordered = [current]
    for _ in range(len(paths) - 1):
        tail = np.asarray(current[-1], dtype=float)
        d_start = np.hypot(*(starts - tail).T)
        d_end = np.hypot(*(ends - tail).T)
        d_start[used] = np.inf
        d_end[used] = np.inf
        i_start, i_end = int(np.argmin(d_start)), int(np.argmin(d_end))
        if d_start[i_start] <= d_end[i_end]:
            i, current = i_start, paths[i_start]
        else:
            i, current = i_end, paths[i_end][::-1]
        used[i] = True
        ordered.append(current)
    return ordered


def merge_touching(paths, gap=MERGE_GAP_PX):
    """Join consecutive paths whose ends touch, so the line runs unbroken."""
    merged = [list(paths[0])]
    for path in paths[1:]:
        tail, head = merged[-1][-1], path[0]
        if np.hypot(tail[0] - head[0], tail[1] - head[1]) <= gap:
            merged[-1].extend(path[1:] if tuple(tail) == tuple(head) else path)
        else:
            merged.append(list(path))
    return merged


def main(src, dst):
    skeleton, width, height = load_skeleton(src)
    # Short spurs are thinning noise; short links between junctions keep lines joined.
    raw = [p for p, spur in trace_paths(skeleton) if len(p) >= 2 and (not spur or path_length(p) >= MIN_PATH_PX)]
    chained = merge_touching(order_paths(raw))
    ordered = [approximate_polygon(np.asarray(p, dtype=float), SIMPLIFY_TOLERANCE) for p in chained]
    ordered = [p for p in ordered if len(p) >= 2]

    unit = 1000 / height
    out = []
    for path in ordered:
        flat = []
        for y, x in path:
            flat += [round(x * unit), round(y * unit)]
        out.append(flat)

    with open(dst, "w") as f:
        json.dump({"aspect": round(width / height, 4), "paths": out}, f, separators=(",", ":"))
    points = sum(len(p) // 2 for p in out)
    print(f"{len(out)} paths, {points} points -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
