/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Workspace serialization helpers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
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
