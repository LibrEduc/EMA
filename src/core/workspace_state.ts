/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Workspace serialization helpers.
 */

/** Coerces invalid block coordinates before save/load. */
export function sanitizeSerializedWorkspaceState(state: unknown): void {
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
      }
      return;
    }
    if (!node || typeof node !== "object") {
      return;
    }
    const rec = node as Record<string, unknown>;
    if ("x" in rec) {
      const x = Number(rec.x);
      rec.x = Number.isFinite(x) ? x : 0;
    }
    if ("y" in rec) {
      const y = Number(rec.y);
      rec.y = Number.isFinite(y) ? y : 0;
    }
    for (const value of Object.values(rec)) {
      walk(value);
    }
  };
  walk(state);
}
