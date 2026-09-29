/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Workspace serialization helpers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { NOT_IN_PROGRAM_DISABLED_REASON } from "../program_structure_enforcer";

/**
 * Coerces invalid block coordinates before save/load.
 * @param state - Serialized state object.
 */
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
    // Derived UI state — must not survive remount / autosave when the enforcer is off.
    if (Array.isArray(rec.disabledReasons)) {
      const reasons = rec.disabledReasons.filter(
        (reason) => reason !== NOT_IN_PROGRAM_DISABLED_REASON,
      );
      if (reasons.length === 0) {
        delete rec.disabledReasons;
      } else {
        rec.disabledReasons = reasons;
      }
    }
    for (const value of Object.values(rec)) {
      walk(value);
    }
  };
  walk(state);
}
